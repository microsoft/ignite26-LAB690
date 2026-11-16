import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RayfinFieldService } from './RayfinFieldService';
import { createBulkCheckpoint, type BulkCheckpoint } from '../BulkOperation';
import type { FieldServiceSeedDataset } from '../interfaces/IFieldService';
import { v5 as uuidv5 } from 'uuid';

const mocks = vi.hoisted(() => ({
  select: vi.fn(),
  update: vi.fn(),
  create: vi.fn(),
  delete: vi.fn(),
  where: vi.fn(),
  first: vi.fn(),
  orderBy: vi.fn(),
  after: vi.fn(),
  execute: vi.fn(),
  executePaginated: vi.fn(),
}));

vi.mock('./RayfinClientService', () => ({
  getRayfinClient: () => ({
    runtimeConfig: { itemId: 'app-id' },
    data: {
      ServicePro: mocks,
      WorkOrder: mocks,
      WorkOrderComment: mocks,
    },
  }),
}));

const wireOrder = {
  id: 'order-1',
  customer: 'Contoso',
  address: '1 Main Street',
  task: 'Paint the door',
  scheduledAt: '2026-05-03T10:00:00.000Z',
  status: 'pending',
  servicePro_id: null,
  servicePro: null,
  note: null,
  createdAt: '2026-04-30T12:00:00.000Z',
  updatedAt: '2026-05-01T12:00:00.000Z',
};

describe('RayfinFieldService SDK 2 results', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    for (const method of ['select', 'where', 'first', 'orderBy', 'after'] as const) {
      mocks[method].mockReturnValue(mocks);
    }
  });

  it('re-reads a full order after a partial update and normalizes wire dates', async () => {
    mocks.update.mockResolvedValue({ id: wireOrder.id, status: 'completed' });
    mocks.execute.mockResolvedValue([{ ...wireOrder, status: 'completed' }]);

    const saved = await new RayfinFieldService().updateWorkOrderStatus(wireOrder.id, 'completed');

    expect(saved).toMatchObject({
      customer: wireOrder.customer,
      task: wireOrder.task,
      status: 'completed',
      servicePro: null,
      note: null,
      scheduledAt: new Date(wireOrder.scheduledAt),
      createdAt: new Date(wireOrder.createdAt),
      updatedAt: new Date(wireOrder.updatedAt),
    });
    expect(mocks.select).toHaveBeenCalledWith(
      expect.arrayContaining(['customer', 'scheduledAt', 'servicePro.name', 'servicePro.skills'])
    );
    expect(mocks.where).toHaveBeenCalledWith({ id: { eq: wireOrder.id } });
  });

  it('clears assignments through the nullable foreign key and re-reads the order', async () => {
    mocks.update.mockResolvedValue({ id: wireOrder.id, servicePro_id: null, status: 'pending' });
    mocks.execute.mockResolvedValue([wireOrder]);

    const saved = await new RayfinFieldService().assignWorkOrder(wireOrder.id, null);

    expect(mocks.update).toHaveBeenCalledWith(
      { id: wireOrder.id },
      { servicePro_id: null, status: 'pending', updatedAt: expect.any(Date) }
    );
    expect(saved.customer).toBe(wireOrder.customer);
    expect(saved.servicePro_id).toBeNull();
  });

  it('does not report a partial mutation as a complete record when the re-read fails', async () => {
    mocks.update.mockResolvedValue({ id: wireOrder.id, status: 'completed' });
    mocks.execute.mockResolvedValue([]);

    await expect(new RayfinFieldService().updateWorkOrderStatus(wireOrder.id, 'completed'))
      .rejects.toThrow('Saved work order could not be read.');
  });

  it('retains pagination and projected relationship fields while converting dates', async () => {
    mocks.executePaginated
      .mockResolvedValueOnce({
        items: [{ ...wireOrder, servicePro: { name: 'Service Pro', skills: 'painting' } }],
        endCursor: 'next-page',
        hasNextPage: true,
      })
      .mockResolvedValueOnce({
        items: [{ ...wireOrder, id: 'order-2' }],
        endCursor: null,
        hasNextPage: false,
      });

    const orders = await new RayfinFieldService().getWorkOrders();

    expect(orders).toHaveLength(2);
    expect(mocks.after).toHaveBeenCalledWith('next-page');
    expect(orders[0].servicePro).toEqual({ name: 'Service Pro', skills: 'painting' });
    expect(orders[1].scheduledAt).toEqual(new Date(wireOrder.scheduledAt));
  });

  it('re-reads an updated profile instead of dropping unchanged fields', async () => {
    mocks.update.mockResolvedValue({ id: 'profile-1', name: 'Updated', skills: 'painting' });
    mocks.execute.mockResolvedValue([{
      id: 'profile-1',
      name: 'Updated',
      skills: 'painting',
      user_id: 'user-1',
      createdAt: wireOrder.createdAt,
      updatedAt: wireOrder.updatedAt,
    }]);

    const profile = await new RayfinFieldService().updateProfile('profile-1', 'Updated', 'painting');

    expect(profile.user_id).toBe('user-1');
    expect(profile.createdAt).toEqual(new Date(wireOrder.createdAt));
  });

  it('normalizes the date returned by comment creation', async () => {
    mocks.create.mockResolvedValue({
      id: 'comment-1',
      userId: 'user-1',
      workOrderId: wireOrder.id,
      content: 'Done',
      createdAt: wireOrder.updatedAt,
    });

    const comment = await new RayfinFieldService().createWorkOrderComment({
      userId: 'user-1',
      workOrderId: wireOrder.id,
      content: ' Done ',
    });

    expect(comment.content).toBe('Done');
    expect(comment.createdAt).toEqual(new Date(wireOrder.updatedAt));
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ content: 'Done' }));
  });

  it('resumes an ambiguous restore without duplicating or overwriting committed profiles', async () => {
    const seed: FieldServiceSeedDataset = {
      generatedAt: '2026-04-30', startDate: '2025-04-30', endDate: '2026-04-30',
      servicePros: Array.from({ length: 12 }, (_, index) => ({
        seedId: String(index), name: `Pro ${index}`, userId: `seed-${index}`, skills: ['painting'],
      })),
      workOrders: [],
    };
    const rows = new Map<string, { id: string; name: string }>();
    mocks.execute.mockImplementation(async () => {
      const row = rows.get(mocks.where.mock.lastCall?.[0].id.eq);
      return row ? [row] : [];
    });
    let timedOut = false;
    mocks.create.mockImplementation(async (row: { id: string; name: string }) => {
      rows.set(row.id, { ...row, name: 'Existing edit' });
      if (!timedOut) {
        timedOut = true;
        throw new Error('Timed out after committing');
      }
    });
    let saved: BulkCheckpoint | undefined;
    const options = {
      onCheckpoint: (next: BulkCheckpoint) => { saved = next; },
      shouldPause: () => (saved?.nextIndex ?? 0) >= 5,
    };
    const service = new RayfinFieldService();
    await expect(service.restoreSeedData(seed, options)).rejects.toThrow('uncertain writes');
    expect(saved?.nextIndex).toBe(0);
    expect(rows.size).toBe(5);
    const result = await service.restoreSeedData(seed, { ...options, checkpoint: saved });
    expect(result.done).toBe(false);
    expect(result.checkpoint.nextIndex).toBe(5);
    expect(mocks.create).toHaveBeenCalledTimes(5);
    expect([...rows.values()].every(row => row.name === 'Existing edit')).toBe(true);
    await expect(service.restoreSeedData({ ...seed, generatedAt: 'changed' }, {
      ...options, checkpoint: saved,
    })).rejects.toThrow('does not match this seed dataset');

    const profiles = vi.spyOn(service, 'getServicePros').mockResolvedValue([]);
    vi.spyOn(service, 'getWorkOrders').mockResolvedValue([]);
    const finalCheckpoint = { ...result.checkpoint, nextIndex: result.checkpoint.targets.length };
    const continueOptions = { ...options, shouldPause: () => false };
    await expect(service.restoreSeedData(seed, { ...continueOptions, checkpoint: finalCheckpoint }))
      .rejects.toThrow('Some sample records are missing');
    expect(saved?.nextIndex).toBe(0);

    profiles.mockResolvedValue(seed.servicePros.map(profile => ({
      id: uuidv5(`lab690:profile:${profile.seedId}`, uuidv5.URL),
      user_id: profile.userId,
      name: profile.name,
      skills: profile.skills.join(', '),
      createdAt: new Date(wireOrder.createdAt),
      updatedAt: new Date(wireOrder.updatedAt),
    })));
    mocks.executePaginated.mockResolvedValue({ items: [], hasNextPage: false, endCursor: null });
    const completed = await service.restoreSeedData(seed, { ...continueOptions, checkpoint: saved });
    expect(completed).toMatchObject({
      done: true, summary: { servicePros: 12, workOrders: 0, comments: 0 },
    });
    expect(mocks.create).toHaveBeenCalledTimes(12);
    expect([...rows.values()].every(row => row.name === 'Existing edit')).toBe(true);
  });

  it('resumes reset after an ambiguous comment deletion and preserves dependency order', async () => {
    const ids = ['comment', 'order', 'profile'].map(key => uuidv5(key, uuidv5.URL));
    const initialId = uuidv5('lab690:initial-work-order', uuidv5.URL);
    const existing = new Set(ids);
    mocks.execute.mockImplementation(async () => {
      const id: string = mocks.where.mock.lastCall?.[0].id.eq;
      return existing.has(id) ? [{ ...wireOrder, id }] : [];
    });
    let failed = false;
    mocks.delete.mockImplementation(async ({ id }: { id: string }) => {
      existing.delete(id);
      if (!failed) { failed = true; throw new Error('Delete response lost'); }
    });
    mocks.create.mockImplementation(async ({ id }: { id: string }) => {
      existing.add(id);
      throw new Error('Initial order response lost');
    });
    let saved = createBulkCheckpoint('reset', 'reset-v1', [
      { entity: 'comments', id: ids[0] },
      { entity: 'workOrders', id: ids[1] },
      { entity: 'servicePros', id: ids[2] },
      { entity: 'initialOrder', id: initialId },
    ]);
    const options = {
      onCheckpoint: (next: BulkCheckpoint) => { saved = next; },
      shouldPause: () => false,
    };
    const service = new RayfinFieldService();
    vi.spyOn(service, 'getDataSummary').mockResolvedValue({ servicePros: 0, workOrders: 1, comments: 0 });
    await expect(service.resetDemoData('RESET wrong-app', { ...options, checkpoint: saved }))
      .rejects.toThrow('confirmation');
    expect(mocks.delete).not.toHaveBeenCalled();
    await expect(service.resetDemoData('RESET app-id', { ...options, checkpoint: saved }))
      .rejects.toThrow('Delete response lost');
    expect(saved.nextIndex).toBe(0);
    expect(mocks.delete).toHaveBeenCalledTimes(1);
    await expect(service.resetDemoData('RESET app-id', { ...options, checkpoint: saved }))
      .rejects.toThrow('Initial order response lost');
    expect(saved.nextIndex).toBe(3);
    const result = await service.resetDemoData('RESET app-id', { ...options, checkpoint: saved });
    expect(result.done).toBe(true);
    expect(mocks.delete.mock.calls.map(([key]) => key.id)).toEqual(ids);
    expect(mocks.create).toHaveBeenCalledOnce();
    expect(existing).toEqual(new Set([initialId]));
  });
});
