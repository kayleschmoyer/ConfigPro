import type { SyncJob } from './types';

export type CronPreset = {
  id: string;
  label: string;
  cron: string;
  description: string;
};

export const cronPresets: CronPreset[] = [
  { id: 'hourly', label: 'Hourly', cron: '0 * * * *', description: 'Top of every hour' },
  { id: 'daily', label: 'Daily', cron: '0 2 * * *', description: '02:00 every day' },
  { id: 'weekly', label: 'Weekly', cron: '0 5 * * 1', description: 'Monday at 05:00' }
];

export function formatCron(cron: string) {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = cron.split(' ');
  return `min ${minute}, hour ${hour}, DOM ${dayOfMonth}, month ${month}, DOW ${dayOfWeek}`;
}

export function jobRuntimeSummary(job: SyncJob) {
  if (!job.lastRun) {
    return 'No run history';
  }
  const duration = Math.round(job.lastRun.durationMs / 1000);
  return `${job.lastRun.result} • ${duration}s • processed ${job.lastRun.processed} • failed ${job.lastRun.failed}`;
}

export function nextRunCountdown(nextRunAt?: string) {
  if (!nextRunAt) {
    return 'Not scheduled';
  }
  const next = new Date(nextRunAt).getTime();
  const now = Date.now();
  const delta = Math.max(0, next - now);
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) {
    return 'Running imminently';
  }
  if (minutes < 60) {
    return `in ${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  return `in ${hours}h`;
}

export function computeBackoffSeries(attempts: number, baseMs = 2000, factor = 2) {
  return Array.from({ length: attempts }, (_, index) => baseMs * factor ** index);
}

export function deriveJobHealth(job: SyncJob) {
  if (job.status === 'ERROR') {
    return 'FAILING';
  }
  if (job.status === 'PAUSED') {
    return 'PAUSED';
  }
  if (job.lastRun?.result === 'PARTIAL') {
    return 'DEGRADED';
  }
  return 'CONNECTED';
}
