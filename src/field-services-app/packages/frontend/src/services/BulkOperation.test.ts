import { afterEach, describe, expect, it, vi } from 'vitest';
import { createBulkCheckpoint, getBulkRetryAfterMs, parseBulkCheckpoint, runBulkSlice, type BulkCheckpoint, type BulkTarget } from './BulkOperation';
import { v5 as uuidv5 } from 'uuid';

const targets = Array.from({ length: 12 }, (_, index) => ({
  entity: 'workOrders' as const,
  id: uuidv5(String(index), uuidv5.URL),
}));

afterEach(() => vi.restoreAllMocks());

describe('resumable browser batches', () => {
  it('starts no further batch at the 20-second deadline and resumes at the saved index', async () => {
    let now = 0;
    vi.spyOn(performance, 'now').mockImplementation(() => now);
    const saved: BulkCheckpoint[] = [];
    const perform = vi.fn(async (_target: BulkTarget) => { now += 4_000; });
    const options = { onCheckpoint: (next: BulkCheckpoint) => saved.push(next), shouldPause: () => false };
    const first = await runBulkSlice(createBulkCheckpoint('seed', 'dataset', targets), perform, options);
    expect(perform).toHaveBeenCalledTimes(5);
    expect(first.nextIndex).toBe(5);
    expect(saved.at(-1)?.nextIndex).toBe(5);
    perform.mockClear();
    const second = await runBulkSlice(first, perform, options);
    expect(perform).toHaveBeenCalledTimes(5);
    expect(perform.mock.calls[0][0]).toEqual(targets[5]);
    expect(second.nextIndex).toBe(10);
  });

  it('does not cross dependency phases in one parallel batch and pauses after confirmed work', async () => {
    const events: string[] = [];
    let paused = false;
    const checkpoint = createBulkCheckpoint('reset', 'reset-v1', [
      { ...targets[0], entity: 'comments' },
      { ...targets[1], entity: 'workOrders' },
    ]);
    const saved = await runBulkSlice(checkpoint, async target => {
      events.push(target.entity);
      paused = true;
    }, { onCheckpoint: () => {}, shouldPause: () => paused });
    expect(events).toEqual(['comments']);
    expect(saved.nextIndex).toBe(1);
  });

  it('retains the first uncertain position despite later successes and waits for all in-flight work', async () => {
    let saved = createBulkCheckpoint('seed', 'dataset', targets);
    const completed: string[] = [];
    const running = runBulkSlice(saved, async target => {
      if (target.id === targets[1].id) throw new Error('request timed out');
      await Promise.resolve();
      completed.push(target.id);
    }, {
      onCheckpoint: next => { saved = next; },
      shouldPause: () => false,
    });
    await expect(running).rejects.toThrow('resume to reconcile uncertain writes');
    await expect(running).rejects.toMatchObject({
      errors: [expect.objectContaining({ message: 'request timed out' })],
    });
    expect(saved.nextIndex).toBe(1);
    expect(completed).toHaveLength(4);
  });

  it('rejects malformed or out-of-range stored cursors before any work', async () => {
    const checkpoint = createBulkCheckpoint('seed', 'dataset', targets);
    expect(() => parseBulkCheckpoint({ ...checkpoint, nextIndex: 13 })).toThrow();
    expect(() => parseBulkCheckpoint({ ...checkpoint, nextIndex: -1 })).toThrow();
    const perform = vi.fn();
    await expect(runBulkSlice({ ...checkpoint, nextIndex: 13 }, perform, {
      onCheckpoint: () => {}, shouldPause: () => false,
    })).rejects.toThrow();
    expect(perform).not.toHaveBeenCalled();
  });

  it.each([
    [new Error('Request timed out after 30000ms'), 0],
    [new DOMException('The operation timed out', 'TimeoutError'), 0],
    [Object.assign(new Error('Upstream timeout'), { status: 408 }), 0],
    [Object.assign(new Error('Upstream timeout'), { status: 504 }), 0],
    [Object.assign(new Error('Capacity busy'), { status: 429, retryAfterSeconds: 7 }), 7000],
    [Object.assign(new Error('Request timed out'), { status: 401 }), null],
    [new Error('Network fetch failed'), null],
    [new AggregateError([new Error('Request timed out'), new Error('Permission denied')]), null],
    [new AggregateError([
      new Error('Request timed out'),
      Object.assign(new Error('Capacity busy'), { status: 429, retryAfterSeconds: 7 }),
    ]), 7000],
  ])('classifies timeout-only failures and preserves server retry delays: %s', (error, delay) => {
    expect(getBulkRetryAfterMs(error)).toBe(delay);
  });
});
