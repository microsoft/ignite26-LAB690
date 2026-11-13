import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  DatabaseIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  SproutIcon,
} from 'lucide-react';

import seedData from '@/data/field-service-seed.json';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import type {
  AdminDataSummary,
  FieldServiceSeedDataset,
} from '@/services/interfaces/IFieldService';
import { useBulkOperation } from '@/hooks/useBulkOperation';
import { ServiceContainer } from '@/services/ServiceContainer';
import { getRayfinClient } from '@/services/rayfin/RayfinClientService';

type AdminAction = 'seed' | 'reset' | null;

const fieldServiceSeed: FieldServiceSeedDataset = {
  ...seedData,
  workOrders: seedData.workOrders.map(order => {
    const status = order.status;
    if (status !== 'pending' && status !== 'assigned' && status !== 'in_progress' &&
        status !== 'completed' && status !== 'needs_followup' && status !== 'cancelled') {
      throw new Error(`Unknown seed status: ${status}`);
    }
    return { ...order, status };
  }),
};

export function AdminPage() {
  const fieldService = ServiceContainer.getInstance().fieldService;
  const [summary, setSummary] = useState<AdminDataSummary | null>(null);
  const bulk = useBulkOperation(fieldService, fieldServiceSeed);
  const { activeAction, checkpoint } = bulk;
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const summaryRequest = useRef(0);
  const [confirmation, setConfirmation] = useState('');
  const { itemId, workspaceId } = getRayfinClient().runtimeConfig ?? {};
  const resetConfirmation = itemId ? `RESET ${itemId}` : '';

  const seedStats = useMemo(
    () => ({
      servicePros: fieldServiceSeed.servicePros.length,
      workOrders: fieldServiceSeed.workOrders.length,
      dateRange: `${fieldServiceSeed.startDate} to ${fieldServiceSeed.endDate}`,
    }),
    []
  );

  const loadSummary = useCallback(async () => {
    const request = ++summaryRequest.current;
    setError(null);
    try {
      const current = await fieldService.getDataSummary();
      if (request === summaryRequest.current) setSummary(current);
    } catch (err) {
      console.error('Failed to load admin data summary:', err);
      if (request === summaryRequest.current) setError(err instanceof Error ? err.message : 'Failed to load DB summary.');
    }
  }, [fieldService]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const runAdminAction = async (action: Exclude<AdminAction, null>) => {
    summaryRequest.current++;
    setSummary(null);
    setError(null);
    setMessage(null);

    const nextSummary = await bulk.run(action, confirmation);
    if (action === 'reset') setConfirmation('');
    if (nextSummary) {
      setSummary(nextSummary);
      setMessage(
        action === 'seed'
          ? `Sample restore complete. Current app totals: ${nextSummary.servicePros} Service Pros and ${nextSummary.workOrders} work orders. Existing records were preserved.`
          : 'Reset complete: all work orders and Service Pro profiles in this app were removed; one unassigned example work order was recreated.'
      );
      setConfirmation('');
    } else {
      await loadSummary();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container mx-auto flex min-h-20 flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
              <DatabaseIcon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Field Services
              </p>
              <h1 className="text-2xl font-bold text-slate-950">Admin data tools</h1>
            </div>
          </div>

          <Button variant="ghost" asChild>
            <Link to="/manager/">
              <ArrowLeftIcon className="h-4 w-4" />
              Back to manager
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto grid gap-6 px-4 py-8">
        <p className="text-sm text-slate-600">
          These demo tools are available to the signed-in lab account, not a separately authorized admin role.
          They affect only this app&apos;s data, not the workspace or capacity.
        </p>
        <dl className="grid gap-2 break-all text-sm text-slate-700">
          <div><dt className="font-semibold">Fabric workspace ID</dt><dd>{workspaceId ?? 'Unavailable'}</dd></div>
          <div><dt className="font-semibold">Fabric app item ID</dt><dd>{itemId ?? 'Unavailable'}</dd></div>
        </dl>
        {(bulk.error || error) && (
          <Alert variant="destructive" role="alert">
            <AlertDescription>{bulk.error || error}</AlertDescription>
          </Alert>
        )}
        {message && (
          <Alert role="status">
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
        {(checkpoint || bulk.invalidCheckpoint || activeAction) && (
          <Alert role="status">
            <AlertDescription>
              <div className="flex w-full flex-col gap-3">
                {checkpoint && <>
                  <p>
                    {checkpoint.action === 'seed' ? 'Restore' : 'Reset'}: {checkpoint.nextIndex} / {checkpoint.targets.length} operations checkpointed.
                    {' '}Resume at {checkpoint.targets[checkpoint.nextIndex]?.entity ?? 'final verification'}.
                    {' '}{activeAction ? 'Running; progress is saved automatically.' : 'Paused; resume when ready.'}
                  </p>
                  <progress aria-label="Bulk operation progress" className="w-full" max={checkpoint.targets.length} value={checkpoint.nextIndex} />
                </>}
                {!checkpoint && activeAction && <p>Preparing {activeAction === 'seed' ? 'restore' : 'reset'}.</p>}
                {bulk.retrying && <p>A request timed out or was throttled. Retrying automatically with backoff; no records are skipped. You can pause while waiting.</p>}
                <p>Browser chunks stop starting new batches after 20 seconds. In-flight requests and final verification can take longer. Saved progress stays in this browser for this app and account.</p>
                <div className="flex flex-wrap gap-3">
                  {activeAction ? (
                    <Button onClick={bulk.pause}>Pause after current batch</Button>
                  ) : <>
                    {checkpoint && <Button
                      disabled={!bulk.ready || (checkpoint.action === 'reset' && confirmation !== resetConfirmation)}
                      onClick={() => void runAdminAction(checkpoint.action)}
                    >Resume {checkpoint.action === 'seed' ? 'restore' : 'reset'}</Button>}
                    <Button variant="outline" onClick={() => void bulk.discard()}>Discard checkpoint</Button>
                  </>}
                </div>
                <p>Discarding progress does not undo changes already made. Resuming a reset requires typing the app confirmation again.</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Current Service Pros</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {summary?.servicePros ?? '...'}
            </p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Current work orders</p>
            <p className="mt-2 text-3xl font-bold text-slate-950">
              {summary?.workOrders ?? '...'}
            </p>
          </div>
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Seed range</p>
            <p className="mt-2 text-lg font-bold text-slate-950">
              {seedStats.dateRange}
            </p>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <SproutIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-950">Restore sample data</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Add missing records from the baseline of {seedStats.servicePros} Service Pro
                  profiles and {seedStats.workOrders} historical work orders.
                  Existing profiles, work orders, and edits are preserved.
                  You can safely retry a partial restore.
                </p>
              </div>
            </div>
            <Button
              className="mt-6"
              disabled={activeAction !== null || !bulk.ready || checkpoint !== null}
              onClick={() => void runAdminAction('seed')}
            >
              {activeAction === 'seed' ? (
                <>
                  <RefreshCwIcon className="h-4 w-4 animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <SproutIcon className="h-4 w-4" />
                  Restore sample data
                </>
              )}
            </Button>
          </article>

          <article className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
                <RotateCcwIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-950">Reset app data</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Permanently delete every work order and Service Pro profile in
                  this app, including your lab work, then recreate one unassigned example job.
                  This is not required for sample restore. Do not reset an app used by anyone else.
                </p>
              </div>
            </div>
            <label className="mt-4 grid gap-2 text-sm text-slate-700">
              Type {resetConfirmation || 'the current app ID (unavailable)'} to confirm
              <input
                value={confirmation}
                onChange={event => setConfirmation(event.target.value)}
                autoComplete="off"
                disabled={activeAction !== null || !itemId}
                className="rounded-xl border border-slate-300 px-4 py-3"
              />
            </label>
            <Button
              className="mt-6"
              disabled={activeAction !== null || !bulk.ready || checkpoint !== null || !resetConfirmation || confirmation !== resetConfirmation}
              variant="destructive"
              onClick={() => void runAdminAction('reset')}
            >
              {activeAction === 'reset' ? (
                <>
                  <RefreshCwIcon className="h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RotateCcwIcon className="h-4 w-4" />
                  Reset app data
                </>
              )}
            </Button>
          </article>
        </section>

      </main>
    </div>
  );
}
