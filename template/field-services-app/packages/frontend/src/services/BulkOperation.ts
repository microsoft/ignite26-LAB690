import { z } from 'zod';

const checkpointSchema = z.object({
  version: z.literal(1),
  action: z.enum(['seed', 'reset']),
  datasetId: z.string().min(1),
  targets: z.array(z.object({
    entity: z.enum(['servicePros', 'workOrders', 'comments', 'initialOrder']),
    id: z.uuid(),
  })).max(100_000),
  nextIndex: z.number().int().nonnegative(),
}).refine(value => value.nextIndex <= value.targets.length, 'Invalid resume position');

export type BulkCheckpoint = z.infer<typeof checkpointSchema>;
export type BulkTarget = BulkCheckpoint['targets'][number];

export interface BulkOptions {
  checkpoint?: BulkCheckpoint;
  onCheckpoint: (checkpoint: BulkCheckpoint) => void;
  shouldPause: () => boolean;
}

export function parseBulkCheckpoint(value: unknown): BulkCheckpoint {
  return checkpointSchema.parse(value);
}

export function createBulkCheckpoint(
  action: BulkCheckpoint['action'],
  datasetId: string,
  targets: BulkTarget[]
): BulkCheckpoint {
  return parseBulkCheckpoint({ version: 1, action, datasetId, targets, nextIndex: 0 });
}

export function getBulkRetryAfterMs(error: unknown): number | null {
  if (error instanceof AggregateError) {
    if (!error.errors.length) return null;
    let delay = 0;
    for (const cause of error.errors) {
      const retryAfter = getBulkRetryAfterMs(cause);
      if (retryAfter === null) return null;
      delay = Math.max(delay, retryAfter);
    }
    return delay;
  }
  if (typeof error === 'object' && error !== null && 'status' in error &&
      typeof error.status === 'number') {
    if (![408, 429, 504].includes(error.status)) return null;
    return 'retryAfterSeconds' in error && typeof error.retryAfterSeconds === 'number' &&
      Number.isFinite(error.retryAfterSeconds) && error.retryAfterSeconds > 0
      ? error.retryAfterSeconds * 1000 : 0;
  }
  // SDK 2 request timeouts have no dedicated error code.
  return (error instanceof DOMException && error.name === 'TimeoutError') ||
    (error instanceof Error && (error.name === 'TimeoutError' ||
      /^Request timed out(?: after \d+ms)?$/i.test(error.message))) ? 0 : null;
}

export async function runBulkSlice(
  checkpoint: BulkCheckpoint,
  perform: (target: BulkTarget) => Promise<void>,
  options: BulkOptions
): Promise<BulkCheckpoint> {
  const started = performance.now();
  let current = parseBulkCheckpoint(checkpoint);
  options.onCheckpoint(current);

  while (current.nextIndex < current.targets.length &&
         performance.now() - started < 20_000 && !options.shouldPause()) {
    const start = current.nextIndex;
    const entity = current.targets[start].entity;
    const batch = current.targets.slice(start, start + 5)
      .filter(target => target.entity === entity);
    const completed = batch.map(() => false);
    const results = await Promise.allSettled(batch.map(async (target, index) => {
      await perform(target);
      completed[index] = true;
      // Only persist the contiguous prefix; uncertain/out-of-order writes are reconciled on resume.
      let nextIndex = start;
      while (completed[nextIndex - start]) nextIndex++;
      if (nextIndex > current.nextIndex) {
        current = { ...current, nextIndex };
        options.onCheckpoint(current);
      }
    }));
    const failures = results.filter(result => result.status === 'rejected');
    if (failures.length) {
      throw new AggregateError(
        failures.map(result => result.reason),
        `${failures.length} data operation(s) failed. Progress was checkpointed; resume to reconcile uncertain writes. ${failures.map(result => String(result.reason)).join('; ')}`
      );
    }
  }
  return current;
}
