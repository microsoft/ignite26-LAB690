import { useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { getBulkRetryAfterMs, parseBulkCheckpoint, type BulkCheckpoint, type BulkOptions } from '@/services/BulkOperation';
import type { BulkResult, FieldServiceSeedDataset, IFieldService } from '@/services/interfaces/IFieldService';
import { getRayfinClient } from '@/services/rayfin/RayfinClientService';

export function useBulkOperation(fieldService: IFieldService, seed: FieldServiceSeedDataset) {
  const { user } = useAuth();
  const { itemId, workspaceId } = getRayfinClient().runtimeConfig ?? {};
  const appKey = JSON.stringify(['lab690-bulk-v1', workspaceId, itemId]);
  const storageKey = JSON.stringify([appKey, user?.id]);
  const [checkpoint, setCheckpoint] = useState<BulkCheckpoint | null>(null);
  const [activeAction, setActiveAction] = useState<'seed' | 'reset' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [invalidCheckpoint, setInvalidCheckpoint] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const control = useRef<{
    paused: boolean; current: boolean; running: boolean; cancelRetry?: () => void;
  }>({ paused: true, current: true, running: false });

  useEffect(() => {
    const current: typeof control.current = { paused: true, current: true, running: false };
    control.current = current;
    setCheckpoint(null);
    setActiveAction(null);
    setReady(false);
    setInvalidCheckpoint(false);
    setError(null);
    setRetrying(false);
    try {
      if (!itemId || !workspaceId || !user?.id) {
        throw new Error('Resumable data tools require a signed-in account and the current Fabric app identity.');
      }
      const stored = localStorage.getItem(storageKey);
      if (stored) setCheckpoint(parseBulkCheckpoint(JSON.parse(stored)));
      setReady(true);
    } catch (err) {
      console.error('Failed to load bulk checkpoint:', err);
      setError(err instanceof Error ? err.message : 'Failed to load saved progress.');
      setInvalidCheckpoint(true);
    }
    return () => { current.paused = true; current.current = false; current.cancelRetry?.(); };
  }, [storageKey, itemId, workspaceId, user?.id]);

  const run = async (action: 'seed' | 'reset', confirmation: string) => {
    const current = control.current;
    if (!ready || current.running) return null;
    current.running = true;
    current.paused = false;
    setActiveAction(action);
    setError(null);
    try {
      if (!navigator.locks) throw new Error('Use a browser supporting Web Locks, such as Microsoft Edge, for resumable data tools.');
      return await navigator.locks.request(appKey, { ifAvailable: true }, async lock => {
        if (!lock) throw new Error('A bulk operation is already running in another tab for this app.');
        if (!current.current) return null;
        // Re-read under the lock so another tab cannot leave us with a stale cursor.
        const stored = localStorage.getItem(storageKey);
        let resumeAt = stored ? parseBulkCheckpoint(JSON.parse(stored)) : undefined;
        if (resumeAt && resumeAt.action !== action) {
          throw new Error('Resume or discard the saved operation before starting another action.');
        }
        let retryDelay = 2_000;
        do {
          const options: BulkOptions = {
            checkpoint: resumeAt,
            shouldPause: () => current.paused,
            onCheckpoint: next => {
              localStorage.setItem(storageKey, JSON.stringify(next));
              resumeAt = next;
              if (current.current) setCheckpoint(next);
            },
          };
          let result: BulkResult;
          try {
            result = action === 'seed'
              ? await fieldService.restoreSeedData(seed, options)
              : await fieldService.resetDemoData(confirmation, options);
          } catch (err) {
            const retryAfter = getBulkRetryAfterMs(err);
            if (retryAfter === null) throw err;
            const delay = Math.max(retryDelay, retryAfter);
            console.warn(`Bulk request timed out or was throttled; retrying from saved progress after ${delay}ms.`, err);
            if (current.paused) return null;
            if (current.current) setRetrying(true);
            await new Promise<void>(resolve => {
              const finish = () => {
                clearTimeout(timer);
                current.cancelRetry = undefined;
                resolve();
              };
              const timer = setTimeout(finish, delay);
              current.cancelRetry = finish;
            });
            if (current.current) setRetrying(false);
            retryDelay = Math.min(retryDelay * 2, 30_000);
            continue;
          }
          retryDelay = 2_000;
          if (result.done) {
            localStorage.removeItem(storageKey);
            if (current.current) setCheckpoint(null);
            return result.summary;
          }
          resumeAt = result.checkpoint;
          await new Promise(resolve => setTimeout(resolve, 0));
        } while (!current.paused);
        return null;
      });
    } catch (err) {
      console.error('Bulk data operation stopped:', err);
      if (current.current) setError(err instanceof Error ? err.message : 'Bulk operation failed. Resume from saved progress.');
      return null;
    } finally {
      current.running = false;
      if (current.current) {
        setActiveAction(null);
        setRetrying(false);
      }
    }
  };

  const discard = async () => {
    try {
      if (!navigator.locks) throw new Error('This browser does not support Web Locks.');
      await navigator.locks.request(appKey, { ifAvailable: true }, lock => {
        if (!lock) throw new Error('Pause the operation in the other tab before discarding its checkpoint.');
        localStorage.removeItem(storageKey);
        setCheckpoint(null);
        setInvalidCheckpoint(false);
        setError(null);
        setReady(Boolean(itemId && workspaceId && user?.id));
      });
    } catch (err) {
      console.error('Failed to discard bulk checkpoint:', err);
      setError(err instanceof Error ? err.message : 'Failed to discard saved progress.');
    }
  };

  return {
    checkpoint, activeAction, error, ready, invalidCheckpoint, retrying, run, discard,
    pause: () => { control.current.paused = true; control.current.cancelRetry?.(); },
  };
}
