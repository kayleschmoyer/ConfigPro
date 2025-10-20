/**
 * Offline queue utilities for coordinating retryable actions when the network is unavailable.
 * The queue persists lightweight metadata and payloads, backing off retries with jitter so
 * that multiple browser tabs or devices avoid stampeding the same API surface when connectivity
 * returns.
 */

export type OfflineActionStatus = 'pending' | 'retrying';

export interface OfflineAction<TPayload = unknown, TMetadata extends Record<string, unknown> = Record<string, unknown>> {
  /** Unique identifier for the action. */
  id: string;
  /** Discriminator so handlers can be registered per action type. */
  type: string;
  /** Arbitrary payload forwarded to the registered handler. */
  payload: TPayload;
  /** Optional metadata (ids, tags, context) that should persist across retries. */
  metadata?: TMetadata;
  /** Number of attempts that have been performed. */
  attempts: number;
  /** Maximum attempts allowed before marking the action as permanently failed. */
  maxAttempts: number;
  /** Timestamp when the action was created. */
  createdAt: number;
  /** Timestamp when the action was last updated (retry, failure, etc.). */
  updatedAt: number;
  /** When defined, the action will not be retried until this timestamp. */
  nextAttemptAt?: number;
  /** Latest error message captured from a failed attempt. */
  lastError?: string;
  /** Indicates whether the action is actively retrying or pending execution. */
  status: OfflineActionStatus;
}

export type OfflineActionHandler<
  TPayload = unknown,
  TMetadata extends Record<string, unknown> = Record<string, unknown>,
> = (
  payload: TPayload,
  action: OfflineAction<TPayload, TMetadata>,
) => Promise<void>;

export interface OfflineQueuePersistence<Action extends OfflineAction = OfflineAction> {
  load(): Promise<Action[]> | Action[];
  save(actions: Action[]): Promise<void> | void;
  clear(): Promise<void> | void;
}

export interface OfflineQueueOptions {
  /** Storage key used by the default localStorage persistence implementation. */
  storageKey?: string;
  /** Default maximum number of attempts per action. */
  maxRetries?: number;
  /** Base delay (in milliseconds) before retrying a failed action. */
  retryDelayMs?: number;
  /** Multiplier applied to the retry delay after each failure for exponential backoff. */
  backoffFactor?: number;
  /** Maximum delay allowed between retries. */
  maxBackoffMs?: number;
  /** Maximum jitter (in milliseconds) added/subtracted from the calculated delay. */
  jitterMs?: number;
  /** Custom function that returns whether the queue should attempt processing actions. */
  isOnline?: () => boolean;
  /** Custom persistence layer (defaults to a localStorage backed implementation). */
  persistence?: OfflineQueuePersistence;
  /** Custom clock used for testing. */
  now?: () => number;
  /** Callback fired whenever the queue contents change. */
  onQueueChange?: (actions: OfflineAction[]) => void;
  /** Callback invoked after an action succeeds. */
  onActionSuccess?: (action: OfflineAction) => void;
  /** Callback invoked when an action permanently fails after exhausting retries. */
  onActionFailure?: (action: OfflineAction, error: unknown) => void;
  /** Callback invoked when an action schedules another retry. */
  onActionRetry?: (action: OfflineAction, error: unknown, nextRetryInMs: number) => void;
}

const DEFAULT_OPTIONS: Required<Pick<OfflineQueueOptions, 'storageKey' | 'maxRetries' | 'retryDelayMs' | 'backoffFactor' | 'maxBackoffMs' | 'jitterMs'>> = {
  storageKey: 'configpro.offlineQueue',
  maxRetries: 5,
  retryDelayMs: 2_000,
  backoffFactor: 2,
  maxBackoffMs: 60_000,
  jitterMs: 250,
};

const QueueEvent = {
  Online: 'online' as const,
};

type Timer = ReturnType<typeof setTimeout> | undefined;

type OfflineActionLike = Partial<OfflineAction> & { type?: string; payload?: unknown };

function errorToMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  try {
    return JSON.stringify(error);
  } catch (serializationError) {
    return String(serializationError);
  }
}

function resolveOnlineStatus(): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.onLine === 'undefined') {
    return true;
  }

  return navigator.onLine;
}

function isLocalStorageAvailable(): boolean {
  try {
    const storage = (typeof window !== 'undefined' && window.localStorage) || undefined;
    if (!storage) {
      return false;
    }

    const testKey = '__configpro_offline_queue__';
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

class LocalStoragePersistence implements OfflineQueuePersistence {
  private readonly key: string;

  constructor(key: string) {
    this.key = key;
  }

  async load(): Promise<OfflineAction[]> {
    if (!isLocalStorageAvailable()) {
      return [];
    }

    const raw = window.localStorage.getItem(this.key);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed as OfflineAction[];
    } catch {
      return [];
    }
  }

  async save(actions: OfflineAction[]): Promise<void> {
    if (!isLocalStorageAvailable()) {
      return;
    }

    window.localStorage.setItem(this.key, JSON.stringify(actions));
  }

  async clear(): Promise<void> {
    if (!isLocalStorageAvailable()) {
      return;
    }

    window.localStorage.removeItem(this.key);
  }
}

export class InMemoryPersistence implements OfflineQueuePersistence {
  private snapshot: OfflineAction[] = [];

  constructor(initialActions: OfflineAction[] = []) {
    this.snapshot = initialActions.map((action) => ({ ...action }));
  }

  async load(): Promise<OfflineAction[]> {
    return this.snapshot.map((action) => ({ ...action }));
  }

  async save(actions: OfflineAction[]): Promise<void> {
    this.snapshot = actions.map((action) => ({ ...action }));
  }

  async clear(): Promise<void> {
    this.snapshot = [];
  }
}

interface TryProcessOptions {
  force?: boolean;
}

export class OfflineQueue {
  private readonly options: Required<Omit<OfflineQueueOptions, 'persistence' | 'now' | 'isOnline' | 'onQueueChange' | 'onActionSuccess' | 'onActionFailure' | 'onActionRetry'>> &
    Pick<OfflineQueueOptions, 'persistence' | 'now' | 'isOnline' | 'onQueueChange' | 'onActionSuccess' | 'onActionFailure' | 'onActionRetry'>;
  private readonly handlers = new Map<string, OfflineActionHandler>();
  private readonly persistence: OfflineQueuePersistence;
  private actions: OfflineAction[] = [];
  private processing = false;
  private timer: Timer;
  private readonly ready: Promise<void>;
  private destroyed = false;

  constructor(options: OfflineQueueOptions = {}) {
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    } as OfflineQueue['options'];

    this.persistence =
      options.persistence ?? (isLocalStorageAvailable() ? new LocalStoragePersistence(this.options.storageKey) : new InMemoryPersistence());

    this.ready = this.restore();

    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener(QueueEvent.Online, this.handleOnline);
    }
  }

  /** Registers a handler for a specific action type. */
  registerHandler<
    TPayload = unknown,
    TMetadata extends Record<string, unknown> = Record<string, unknown>,
  >(
    type: string,
    handler: OfflineActionHandler<TPayload, TMetadata>,
  ): void {
    this.handlers.set(type, handler as OfflineActionHandler);
  }

  /** Removes a previously registered handler for the provided action type. */
  unregisterHandler(type: string): void {
    this.handlers.delete(type);
  }

  /** Returns a shallow copy of the queued actions for diagnostics or UI. */
  getSnapshot(): OfflineAction[] {
    return this.actions.map((action) => ({ ...action }));
  }

  /** Enqueues an action and kicks off processing if possible. */
  async enqueue<
    TPayload = unknown,
    TMetadata extends Record<string, unknown> = Record<string, unknown>,
  >(
    action: Pick<OfflineAction<TPayload, TMetadata>, 'type' | 'payload'> &
      Partial<Pick<OfflineAction<TPayload, TMetadata>, 'metadata' | 'maxAttempts'>> & { id?: string },
  ): Promise<OfflineAction<TPayload, TMetadata>> {
    await this.ready;

    const now = this.now();
    const offlineAction: OfflineAction<TPayload, TMetadata> = {
      id: action.id ?? cryptoRandomId(),
      type: action.type,
      payload: action.payload,
      metadata: action.metadata,
      attempts: 0,
      maxAttempts: Math.max(1, action.maxAttempts ?? this.options.maxRetries),
      createdAt: now,
      updatedAt: now,
      status: 'pending',
    };

    this.actions.push(offlineAction);
    await this.persist();
    this.notifyQueueChange();
    void this.tryProcess();

    return offlineAction;
  }

  /** Attempts to process the queue immediately, ignoring online status checks. */
  async flush(): Promise<void> {
    await this.tryProcess({ force: true });
  }

  /** Clears all actions from the queue and underlying persistence. */
  async clear(): Promise<void> {
    await this.ready;
    this.actions = [];
    await this.persistence.clear();
    this.notifyQueueChange();
    this.clearTimer();
  }

  /** Tears down event listeners and timers. */
  async destroy(): Promise<void> {
    if (this.destroyed) {
      return;
    }

    if (typeof window !== 'undefined' && window.removeEventListener) {
      window.removeEventListener(QueueEvent.Online, this.handleOnline);
    }

    this.clearTimer();
    this.destroyed = true;
  }

  private async restore(): Promise<void> {
    const stored = await this.persistence.load();
    const restored = Array.isArray(stored) ? stored : [];

    this.actions = restored
      .map((action) => this.normalizeAction(action))
      .filter((action): action is OfflineAction => Boolean(action))
      .sort((a, b) => a.createdAt - b.createdAt);

    if (this.actions.length > 0) {
      void this.tryProcess();
    }
  }

  private normalizeAction(action: OfflineActionLike): OfflineAction | undefined {
    if (!action || typeof action.type !== 'string') {
      return undefined;
    }

    const now = this.now();
    const maxAttempts = Math.max(1, action.maxAttempts ?? this.options.maxRetries);

    return {
      id: typeof action.id === 'string' && action.id.length > 0 ? action.id : cryptoRandomId(),
      type: action.type,
      payload: action.payload,
      metadata: (action as OfflineAction).metadata,
      attempts: Math.max(0, action.attempts ?? 0),
      maxAttempts,
      createdAt: action.createdAt ?? now,
      updatedAt: action.updatedAt ?? now,
      nextAttemptAt: action.nextAttemptAt,
      lastError: action.lastError,
      status: action.status === 'retrying' ? 'retrying' : 'pending',
    };
  }

  private async tryProcess(options: TryProcessOptions = {}): Promise<void> {
    await this.ready;

    if (this.processing || this.destroyed) {
      return;
    }

    if (!options.force && !this.isOnline()) {
      return;
    }

    this.processing = true;

    try {
      while (this.actions.length > 0) {
        if (!options.force && !this.isOnline()) {
          break;
        }

        const action = this.actions[0];
        const now = this.now();

        if (action.nextAttemptAt && action.nextAttemptAt > now) {
          this.scheduleNextAttempt(action.nextAttemptAt - now);
          break;
        }

        const handler = this.handlers.get(action.type);
        if (!handler) {
          // No handler registered; drop the action to avoid blocking the queue.
          this.actions.shift();
          await this.persist();
          this.notifyQueueChange();
          continue;
        }

        action.status = 'retrying';
        action.updatedAt = now;
        await this.persist();

        try {
          await handler(action.payload, action);
          this.actions.shift();
          await this.persist();
          this.notifyQueueChange();
          this.options.onActionSuccess?.(action);
        } catch (error) {
          action.attempts += 1;
          action.lastError = errorToMessage(error);
          action.updatedAt = this.now();

          if (action.attempts >= action.maxAttempts) {
            this.actions.shift();
            await this.persist();
            this.notifyQueueChange();
            this.options.onActionFailure?.(action, error);
            continue;
          }

          const delay = this.calculateDelay(action);
          action.nextAttemptAt = this.now() + delay;
          action.status = 'pending';
          await this.persist();
          this.notifyQueueChange();
          this.options.onActionRetry?.(action, error, delay);
          this.scheduleNextAttempt(delay);
          break;
        }
      }
    } finally {
      this.processing = false;
      if (this.actions.length === 0) {
        this.clearTimer();
      }
    }
  }

  private scheduleNextAttempt(delay: number): void {
    if (delay <= 0) {
      void this.tryProcess();
      return;
    }

    this.clearTimer();
    this.timer = setTimeout(() => {
      this.timer = undefined;
      void this.tryProcess();
    }, delay);
  }

  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
  }

  private calculateDelay(action: OfflineAction): number {
    const baseDelay = this.options.retryDelayMs * Math.max(1, Math.pow(this.options.backoffFactor, action.attempts - 1));
    const cappedDelay = Math.min(baseDelay, this.options.maxBackoffMs);
    const jitterRange = this.options.jitterMs;

    if (jitterRange <= 0) {
      return cappedDelay;
    }

    const jitter = Math.floor(Math.random() * (jitterRange * 2 + 1)) - jitterRange;
    return Math.max(0, cappedDelay + jitter);
  }

  private async persist(): Promise<void> {
    await this.persistence.save(this.actions);
  }

  private notifyQueueChange(): void {
    this.options.onQueueChange?.(this.getSnapshot());
  }

  private now(): number {
    return this.options.now?.() ?? Date.now();
  }

  private isOnline(): boolean {
    return this.options.isOnline?.() ?? resolveOnlineStatus();
  }

  private readonly handleOnline = (): void => {
    void this.tryProcess();
  };
}

function cryptoRandomId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const random = Math.random().toString(36).slice(2);
  const timestamp = Date.now().toString(36);
  return `${timestamp}-${random}`;
}

export default OfflineQueue;
