import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { v5 as uuidv5 } from 'uuid';
import { useBulkOperation } from './useBulkOperation';
import { createBulkCheckpoint, type BulkOptions } from '@/services/BulkOperation';
import { RayfinFieldService } from '@/services/rayfin/RayfinFieldService';
import type { FieldServiceSeedDataset } from '@/services/interfaces/IFieldService';

const mocks = vi.hoisted(() => ({
  user: { id: 'user-1' },
  config: { itemId: 'app-1', workspaceId: 'workspace-1' },
  request: vi.fn(),
}));
vi.mock('./AuthContext', () => ({ useAuth: () => ({ user: mocks.user }) }));
vi.mock('@/services/rayfin/RayfinClientService', () => ({
  getRayfinClient: () => ({ runtimeConfig: mocks.config }),
}));

const seed: FieldServiceSeedDataset = {
  generatedAt: '', startDate: '', endDate: '', servicePros: [], workOrders: [],
};
const checkpoint = {
  ...createBulkCheckpoint('seed', 'dataset', [0, 1].map(index => ({
    entity: 'workOrders', id: uuidv5(String(index), uuidv5.URL),
  }))),
  nextIndex: 1,
};
const key = () => JSON.stringify([
  JSON.stringify(['lab690-bulk-v1', mocks.config.workspaceId, mocks.config.itemId]),
  mocks.user.id,
]);

beforeEach(() => {
  localStorage.clear();
  mocks.user.id = 'user-1';
  mocks.config.itemId = 'app-1';
  mocks.request.mockReset().mockImplementation(
    (_key: string, _options: unknown, callback: (lock: object | null) => unknown) => callback({})
  );
  Object.defineProperty(navigator, 'locks', { configurable: true, value: { request: mocks.request } });
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => { vi.useRealTimers(); vi.restoreAllMocks(); });

describe('saved browser bulk progress', () => {
  it('pauses, reloads without auto-running, and resumes from the persisted position', async () => {
    const service = new RayfinFieldService();
    const restore = vi.spyOn(service, 'restoreSeedData');
    const first = renderHook(() => useBulkOperation(service, seed));
    restore.mockImplementationOnce(async (_seed, options) => {
      options.onCheckpoint(checkpoint);
      first.result.current.pause();
      return { done: false, checkpoint };
    });
    await act(async () => { await first.result.current.run('seed', ''); });
    expect(JSON.parse(localStorage.getItem(key()) ?? 'null')).toEqual(checkpoint);
    first.unmount();
    const second = renderHook(() => useBulkOperation(service, seed));
    expect(second.result.current.checkpoint).toEqual(checkpoint);
    expect(restore).toHaveBeenCalledOnce();
    restore.mockResolvedValueOnce({
      done: true, checkpoint, summary: { servicePros: 12, workOrders: 1041, comments: 0 },
    });
    await act(async () => { await second.result.current.run('seed', ''); });
    expect(restore.mock.calls[1][1].checkpoint).toEqual(checkpoint);
    expect(localStorage.getItem(key())).toBeNull();
  });

  it('isolates checkpoints by app and signed-in account', () => {
    localStorage.setItem(key(), JSON.stringify(checkpoint));
    const hook = renderHook(() => useBulkOperation(new RayfinFieldService(), seed));
    expect(hook.result.current.checkpoint).toEqual(checkpoint);
    mocks.user.id = 'user-2';
    hook.rerender();
    expect(hook.result.current.checkpoint).toBeNull();
    mocks.user.id = 'user-1';
    mocks.config.itemId = 'app-2';
    hook.rerender();
    expect(hook.result.current.checkpoint).toBeNull();
  });

  it('blocks competing tabs and reads the latest cursor while holding the lock', async () => {
    const service = new RayfinFieldService();
    const restore = vi.spyOn(service, 'restoreSeedData');
    const hook = renderHook(() => useBulkOperation(service, seed));
    mocks.request.mockImplementationOnce(
      (_key: string, _options: unknown, callback: (lock: null) => unknown) => callback(null)
    );
    await act(async () => { await hook.result.current.run('seed', ''); });
    expect(restore).not.toHaveBeenCalled();
    expect(hook.result.current.error).toContain('another tab');
    localStorage.setItem(key(), JSON.stringify(checkpoint));
    restore.mockResolvedValueOnce({
      done: true, checkpoint, summary: { servicePros: 12, workOrders: 1041, comments: 0 },
    });
    await act(async () => { await hook.result.current.run('seed', ''); });
    expect(restore.mock.calls[0][1].checkpoint).toEqual(checkpoint);
  });

  it('surfaces storage failures before allowing writes and retains progress on invocation failure', async () => {
    const service = new RayfinFieldService();
    const hook = renderHook(() => useBulkOperation(service, seed));
    const write = vi.fn();
    const restore = vi.spyOn(service, 'restoreSeedData').mockImplementation(
      async (_seed: FieldServiceSeedDataset, options: BulkOptions) => {
        options.onCheckpoint(checkpoint);
        write();
        throw new AggregateError([
          new Error('Request timed out after 30000ms'), new Error('Permission denied'),
        ], 'Permission denied');
      }
    );
    const storage = vi.spyOn(localStorage, 'setItem').mockImplementationOnce(() => {
      throw new Error('Storage quota exceeded');
    });
    await act(async () => { await hook.result.current.run('seed', ''); });
    expect(write).not.toHaveBeenCalled();
    expect(hook.result.current.error).toContain('Storage quota exceeded');
    storage.mockRestore();
    await act(async () => { await hook.result.current.run('seed', ''); });
    expect(restore).toHaveBeenCalledTimes(2);
    expect(hook.result.current.error).toContain('Permission denied');
    expect(JSON.parse(localStorage.getItem(key()) ?? 'null')).toEqual(checkpoint);
  });

  it('backs off after timeouts and resumes from progress saved during each failed invocation', async () => {
    vi.useFakeTimers();
    const service = new RayfinFieldService();
    const final = { ...checkpoint, nextIndex: 2 };
    const restore = vi.spyOn(service, 'restoreSeedData')
      .mockImplementationOnce(async (_seed, options) => {
        options.onCheckpoint(checkpoint);
        throw Object.assign(new Error('Request timed out after 30000ms'), { name: 'SdkError' });
      })
      .mockImplementationOnce(async (_seed, options) => {
        options.onCheckpoint(final);
        throw new AggregateError([new Error('Request timed out after 30000ms')]);
      })
      .mockResolvedValueOnce({
        done: true, checkpoint: final, summary: { servicePros: 12, workOrders: 1041, comments: 0 },
      });
    const hook = renderHook(() => useBulkOperation(service, seed));
    await act(async () => { void hook.result.current.run('seed', ''); });
    expect(hook.result.current.retrying).toBe(true);
    expect(hook.result.current.error).toBeNull();
    await act(() => vi.advanceTimersByTimeAsync(1999));
    expect(restore).toHaveBeenCalledTimes(1);
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(restore.mock.calls[1][1].checkpoint).toEqual(checkpoint);
    await act(() => vi.advanceTimersByTimeAsync(3999));
    expect(restore).toHaveBeenCalledTimes(2);
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(restore.mock.calls[2][1].checkpoint).toEqual(final);
    expect(mocks.request).toHaveBeenCalledOnce();
    expect(hook.result.current.activeAction).toBeNull();
    expect(hook.result.current.retrying).toBe(false);
    expect(localStorage.getItem(key())).toBeNull();
  });

  it('honors throttling Retry-After before inventory and retries final verification with the same reset confirmation', async () => {
    vi.useFakeTimers();
    const service = new RayfinFieldService();
    const final = { ...createBulkCheckpoint('reset', 'reset-v1', [{
      entity: 'initialOrder', id: checkpoint.targets[0].id,
    }]), nextIndex: 1 };
    const reset = vi.spyOn(service, 'resetDemoData')
      .mockRejectedValueOnce(Object.assign(new Error('Throttled'), { status: 429, retryAfterSeconds: 5 }))
      .mockImplementationOnce(async (_confirmation, options) => {
        options.onCheckpoint(final);
        throw new Error('Request timed out after 30000ms');
      })
      .mockResolvedValueOnce({
        done: true, checkpoint: final, summary: { servicePros: 0, workOrders: 1, comments: 0 },
      });
    const hook = renderHook(() => useBulkOperation(service, seed));
    await act(async () => { void hook.result.current.run('reset', 'RESET app-1'); });
    expect(hook.result.current.checkpoint).toBeNull();
    expect(hook.result.current.retrying).toBe(true);
    await act(() => vi.advanceTimersByTimeAsync(4999));
    expect(reset).toHaveBeenCalledTimes(1);
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(reset.mock.calls[1][1].checkpoint).toBeUndefined();
    await act(() => vi.advanceTimersByTimeAsync(4000));
    expect(reset.mock.calls[2]).toEqual(['RESET app-1', expect.objectContaining({ checkpoint: final })]);
    expect(hook.result.current.activeAction).toBeNull();
    expect(hook.result.current.error).toBeNull();
    expect(localStorage.getItem(key())).toBeNull();
  });

  it('caps exponential backoff without abandoning a timed-out operation', async () => {
    vi.useFakeTimers();
    const service = new RayfinFieldService();
    const restore = vi.spyOn(service, 'restoreSeedData').mockImplementation(async (_seed, options) => {
      options.onCheckpoint(checkpoint);
      throw new Error('Request timed out after 30000ms');
    });
    const hook = renderHook(() => useBulkOperation(service, seed));
    await act(async () => { void hook.result.current.run('seed', ''); });
    for (const [index, delay] of [2000, 4000, 8000, 16000, 30000, 30000].entries()) {
      await act(() => vi.advanceTimersByTimeAsync(delay - 1));
      expect(restore).toHaveBeenCalledTimes(index + 1);
      await act(() => vi.advanceTimersByTimeAsync(1));
      expect(restore).toHaveBeenCalledTimes(index + 2);
    }
    await act(async () => { hook.result.current.pause(); });
    expect(hook.result.current.activeAction).toBeNull();
    expect(hook.result.current.error).toBeNull();
    expect(hook.result.current.checkpoint).toEqual(checkpoint);
  });

  it.each(['pause', 'unmount'] as const)('interrupts backoff promptly on %s and retains progress', async stop => {
    vi.useFakeTimers();
    const service = new RayfinFieldService();
    const restore = vi.spyOn(service, 'restoreSeedData').mockImplementation(async (_seed, options) => {
      options.onCheckpoint(checkpoint);
      throw new Error('Request timed out after 30000ms');
    });
    const hook = renderHook(() => useBulkOperation(service, seed));
    await act(async () => { void hook.result.current.run('seed', ''); });
    await act(async () => {
      if (stop === 'pause') hook.result.current.pause();
      else hook.unmount();
    });
    expect(vi.getTimerCount()).toBe(0);
    expect(JSON.parse(localStorage.getItem(key()) ?? 'null')).toEqual(checkpoint);
    await act(() => vi.advanceTimersByTimeAsync(60_000));
    expect(restore).toHaveBeenCalledTimes(1);
  });
});
