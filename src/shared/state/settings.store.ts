import { useSyncExternalStore } from 'react';

export type ConfigKey = string;

export type ConfigStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface CachedConfig<T = unknown> {
  value: T;
  fetchedAt: number;
  expiresAt?: number;
}

export interface OrgConfigCache {
  values: Record<ConfigKey, CachedConfig>;
  status: Record<ConfigKey, ConfigStatus>;
  errors: Record<ConfigKey, string | null | undefined>;
}

export interface SettingsState {
  /** Currently scoped organization for downstream settings selectors */
  activeOrgId: string | null;
  /** Per-organization cache for expensive configuration payloads */
  caches: Record<string, OrgConfigCache>;
}

const DEFAULT_STATE: SettingsState = {
  activeOrgId: null,
  caches: {},
};

let state: SettingsState = { ...DEFAULT_STATE };

const listeners = new Set<(state: SettingsState) => void>();

const notify = () => {
  for (const listener of listeners) {
    listener(state);
  }
};

const setState = (updater: (previous: SettingsState) => SettingsState) => {
  const previous = state;
  const next = updater(previous);
  if (next === previous) return;
  state = next;
  notify();
};

const createOrgCache = (): OrgConfigCache => ({
  values: {},
  status: {},
  errors: {},
});

const cloneCache = (cache: OrgConfigCache): OrgConfigCache => ({
  values: { ...cache.values },
  status: { ...cache.status },
  errors: { ...cache.errors },
});

const updateOrgCache = (orgId: string, updater: (cache: OrgConfigCache) => OrgConfigCache) => {
  setState((previous) => {
    const base = previous.caches[orgId] ?? createOrgCache();
    const nextCache = updater(base);
    if (nextCache === base && previous.caches[orgId]) {
      return previous;
    }
    if (nextCache === base && !previous.caches[orgId]) {
      // nothing to persist yet
      return previous;
    }
    return {
      activeOrgId: previous.activeOrgId,
      caches: { ...previous.caches, [orgId]: nextCache },
    } satisfies SettingsState;
  });
};

const ensureOrgId = (orgId: string | null | undefined): orgId is string =>
  typeof orgId === 'string' && orgId.length > 0;

export const settingsStore = {
  getState: () => state,
  subscribe: (listener: (state: SettingsState) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setActiveOrg: (orgId: string | null) =>
    setState((previous) => {
      if (previous.activeOrgId === orgId) return previous;
      if (!ensureOrgId(orgId)) {
        return previous.activeOrgId === null && Object.keys(previous.caches).length === 0
          ? previous
          : { activeOrgId: null, caches: previous.caches };
      }
      if (previous.caches[orgId]) {
        return { activeOrgId: orgId, caches: previous.caches };
      }
      return {
        activeOrgId: orgId,
        caches: { ...previous.caches, [orgId]: createOrgCache() },
      } satisfies SettingsState;
    }),
  cacheConfig: <T>(config: {
    orgId: string;
    key: ConfigKey;
    value: T;
    expiresAt?: number;
  }) => {
    const { orgId, key, value, expiresAt } = config;
    if (!ensureOrgId(orgId)) return;
    updateOrgCache(orgId, (cache) => {
      const existing = cache.values[key];
      if (
        existing &&
        existing.value === value &&
        existing.expiresAt === expiresAt &&
        cache.status[key] === 'ready' &&
        (cache.errors[key] === null || cache.errors[key] === undefined)
      ) {
        return cache;
      }
      const next = cloneCache(cache);
      next.values[key] = { value, fetchedAt: Date.now(), expiresAt } satisfies CachedConfig;
      next.status[key] = 'ready';
      next.errors[key] = null;
      return next;
    });
  },
  markLoading: (orgId: string, key: ConfigKey) => {
    if (!ensureOrgId(orgId)) return;
    updateOrgCache(orgId, (cache) => {
      if (cache.status[key] === 'loading' && cache.errors[key] === undefined) {
        return cache;
      }
      const next = cloneCache(cache);
      next.status[key] = 'loading';
      delete next.errors[key];
      return next;
    });
  },
  setError: (orgId: string, key: ConfigKey, error: string | null) => {
    if (!ensureOrgId(orgId)) return;
    updateOrgCache(orgId, (cache) => {
      if (cache.status[key] === 'error' && cache.errors[key] === error) {
        return cache;
      }
      const next = cloneCache(cache);
      next.status[key] = 'error';
      next.errors[key] = error ?? null;
      return next;
    });
  },
  evictConfig: (orgId: string, key: ConfigKey) => {
    if (!ensureOrgId(orgId)) return;
    updateOrgCache(orgId, (cache) => {
      if (!(key in cache.values) && !(key in cache.status) && !(key in cache.errors)) {
        return cache;
      }
      const next = cloneCache(cache);
      delete next.values[key];
      delete next.status[key];
      delete next.errors[key];
      return next;
    });
  },
  clearOrg: (orgId: string) => {
    if (!ensureOrgId(orgId)) return;
    setState((previous) => {
      if (!previous.caches[orgId]) return previous;
      const nextCaches = { ...previous.caches };
      delete nextCaches[orgId];
      const next: SettingsState = {
        activeOrgId: previous.activeOrgId === orgId ? null : previous.activeOrgId,
        caches: nextCaches,
      };
      return next;
    });
  },
  reset: () => {
    setState((previous) => {
      if (previous === DEFAULT_STATE || (previous.activeOrgId === null && Object.keys(previous.caches).length === 0)) {
        return previous;
      }
      return { ...DEFAULT_STATE } satisfies SettingsState;
    });
  },
};

export const useSettingsStore = <T>(selector: (state: SettingsState) => T): T =>
  useSyncExternalStore(
    settingsStore.subscribe,
    () => selector(settingsStore.getState()),
    () => selector(DEFAULT_STATE),
  );

export const getSettingsSnapshot = () => settingsStore.getState();
export const DEFAULT_SETTINGS_STATE: SettingsState = { ...DEFAULT_STATE };
