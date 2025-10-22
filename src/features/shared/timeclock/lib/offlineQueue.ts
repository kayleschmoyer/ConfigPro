import type {
  OfflineEvent,
  OfflineQueueListener,
  OfflineQueueSnapshot,
  Punch,
} from './types';

type StorageLike = Pick<Storage, 'getItem' | 'setItem'>;

type ListenerMap = Map<string, Set<OfflineQueueListener<unknown>>>;

const memoryStore = new Map<string, OfflineEvent<unknown>[]>();
const listeners: ListenerMap = new Map();

const randomId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

const getStorage = (): StorageLike | null => {
  if (typeof window === 'undefined') return null;
  try {
    const { localStorage } = window;
    const testKey = '__offline_queue__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return localStorage;
  } catch (error) {
    console.warn('[offlineQueue] Falling back to memory store', error);
    return null;
  }
};

const storage = getStorage();

const read = <TPayload>(key: string): OfflineEvent<TPayload>[] => {
  if (storage) {
    const raw = storage.getItem(key);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as OfflineEvent<TPayload>[];
      return parsed ?? [];
    } catch {
      return [];
    }
  }
  return (memoryStore.get(key) as OfflineEvent<TPayload>[] | undefined) ?? [];
};

const write = <TPayload>(key: string, events: OfflineEvent<TPayload>[]) => {
  if (storage) {
    storage.setItem(key, JSON.stringify(events));
  } else {
    memoryStore.set(key, events);
  }
};

const notify = <TPayload>(snapshot: OfflineQueueSnapshot<TPayload>) => {
  const queueListeners = listeners.get(snapshot.key);
  if (!queueListeners) return;
  queueListeners.forEach((listener) => {
    (listener as OfflineQueueListener<TPayload>)(snapshot);
  });
};

const encode = (payload: unknown) => {
  const json = JSON.stringify(payload);
  if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
    try {
      return window.btoa(unescape(encodeURIComponent(json)));
    } catch {
      // noop
    }
  }
  let hash = 0;
  for (let index = 0; index < json.length; index += 1) {
    hash = (hash << 5) - hash + json.charCodeAt(index);
    hash |= 0;
  }
  return `sig-${Math.abs(hash)}`;
};

export const createOfflineQueue = <TPayload>(key: string) => {
  const snapshot = (): OfflineQueueSnapshot<TPayload> => ({
    key,
    events: read<TPayload>(key),
  });

  const update = (events: OfflineEvent<TPayload>[]) => {
    write(key, events);
    notify({ key, events });
  };

  const enqueue = (payload: TPayload) => {
    const events = snapshot().events;
    const event: OfflineEvent<TPayload> = {
      id: randomId(),
      payload,
      status: 'queued',
      queuedAt: new Date().toISOString(),
      signature: encode({ payload, key }),
      retries: 0,
    };
    update([...events, event]);
    return event;
  };

  const setStatus = (
    id: string,
    status: OfflineEvent<TPayload>['status'],
    lastError?: string
  ) => {
    const events = snapshot().events.map((event) =>
      event.id === id
        ? {
            ...event,
            status,
            lastError,
            retries: status === 'error' ? (event.retries ?? 0) + 1 : event.retries,
          }
        : event
    );
    update(events);
  };

  const remove = (id: string) => {
    const events = snapshot().events.filter((event) => event.id !== id);
    update(events);
  };

  const flush = async (
    sender: (event: OfflineEvent<TPayload>) => Promise<void>,
    options: { retryDelayMs?: number } = {}
  ) => {
    const { retryDelayMs = 1500 } = options;
    for (const event of snapshot().events) {
      if (event.status === 'synced') continue;
      try {
        await sender(event);
        remove(event.id);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        setStatus(event.id, 'error', message);
        await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
      }
    }
  };

  const subscribe = (listener: OfflineQueueListener<TPayload>) => {
    const queueListeners = listeners.get(key) ?? new Set();
    queueListeners.add(listener as OfflineQueueListener<unknown>);
    listeners.set(key, queueListeners);
    listener(snapshot());
    return () => {
      const next = listeners.get(key);
      next?.delete(listener as OfflineQueueListener<unknown>);
      if (next && next.size === 0) {
        listeners.delete(key);
      }
    };
  };

  return {
    key,
    snapshot,
    enqueue,
    flush,
    subscribe,
    setStatus,
    remove,
  };
};

export const punchQueue = createOfflineQueue<Punch>('configpro.timeclock.punches');
