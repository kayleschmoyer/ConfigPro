export type SchedulerTaskType = 'timeout' | 'interval' | 'cron';

export type SchedulerCallback = () => void | Promise<void>;

export interface SchedulerTaskOptions {
  readonly id?: string;
  readonly metadata?: Record<string, unknown>;
  readonly runImmediately?: boolean;
}

export interface SchedulerTaskHandle {
  readonly id: string;
  readonly type: SchedulerTaskType;
  readonly metadata?: Record<string, unknown>;
  cancel(): void;
}

export interface SchedulerService {
  setTimeout(callback: SchedulerCallback, delayMs: number, options?: SchedulerTaskOptions): SchedulerTaskHandle;

  setInterval(callback: SchedulerCallback, intervalMs: number, options?: SchedulerTaskOptions): SchedulerTaskHandle;

  scheduleCron(
    expression: string,
    callback: SchedulerCallback,
    options?: SchedulerTaskOptions,
  ): SchedulerTaskHandle;

  cancel(handle: SchedulerTaskHandle): void;

  cancelAll?(type?: SchedulerTaskType): void;
}
