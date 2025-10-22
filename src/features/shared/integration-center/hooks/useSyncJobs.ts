import { useCallback, useMemo, useState } from 'react';
import type { SyncJob } from '../lib/types';
import { cronPresets, deriveJobHealth, jobRuntimeSummary, nextRunCountdown } from '../lib/sync';
import { formatRelative } from '../lib/format';

const initialJobs: SyncJob[] = [
  {
    id: 'job-1',
    connectionId: 'conn-1',
    domain: 'CUSTOMERS',
    schedule: cronPresets[0]!.cron,
    status: 'RUNNING',
    lastRun: {
      at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      durationMs: 4200,
      processed: 1200,
      failed: 4,
      result: 'PARTIAL'
    },
    nextRunAt: new Date(Date.now() + 1000 * 60 * 30).toISOString()
  },
  {
    id: 'job-2',
    connectionId: 'conn-2',
    domain: 'FILES',
    schedule: cronPresets[1]!.cron,
    status: 'PAUSED',
    lastRun: {
      at: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      durationMs: 9500,
      processed: 80,
      failed: 0,
      result: 'SUCCESS'
    }
  }
];

export function useSyncJobs() {
  const [jobs, setJobs] = useState(initialJobs);
  const [activeJobId, setActiveJobId] = useState<string | null>(jobs[0]?.id ?? null);

  const runNow = useCallback((id: string) => {
    setJobs((list) =>
      list.map((job) =>
        job.id === id
          ? {
              ...job,
              status: 'RUNNING',
              lastRun: {
                at: new Date().toISOString(),
                durationMs: 0,
                processed: 0,
                failed: 0,
                result: 'SUCCESS'
              }
            }
          : job
      )
    );
  }, []);

  const updateJob = useCallback((id: string, patch: Partial<SyncJob>) => {
    setJobs((list) => list.map((job) => (job.id === id ? { ...job, ...patch } : job)));
  }, []);

  const togglePause = useCallback((id: string) => {
    setJobs((list) =>
      list.map((job) =>
        job.id === id
          ? {
              ...job,
              status: job.status === 'PAUSED' ? 'IDLE' : 'PAUSED'
            }
          : job
      )
    );
  }, []);

  const summary = useMemo(() => {
    const failing = jobs.filter((job) => job.status === 'ERROR').length;
    const running = jobs.filter((job) => job.status === 'RUNNING').length;
    return { failing, running, total: jobs.length };
  }, [jobs]);

  const enriched = useMemo(
    () =>
      jobs.map((job) => ({
        ...job,
        lastRunRelative: formatRelative(job.lastRun?.at),
        runtimeSummary: jobRuntimeSummary(job),
        nextRunCountdown: nextRunCountdown(job.nextRunAt),
        health: deriveJobHealth(job)
      })),
    [jobs]
  );

  const selected = useMemo(() => enriched.find((job) => job.id === activeJobId) ?? null, [enriched, activeJobId]);

  return {
    jobs: enriched,
    summary,
    runNow,
    updateJob,
    togglePause,
    activeJobId,
    setActiveJobId,
    selected,
    cronPresets
  };
}
