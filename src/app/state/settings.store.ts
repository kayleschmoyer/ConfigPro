import { useSyncExternalStore } from 'react';

export interface SettingsState {
  /** The active organization identifier */
  orgId: string | null;
  /** The active location identifier scoped to the current organization */
  locationId: string | null;
}

const STORAGE_KEY = 'configpro:settings';
const DEFAULT_STATE: SettingsState = { orgId: null, locationId: null };

const isBrowser = () => typeof window !== 'undefined';

const parseState = (value: unknown): SettingsState => {
  if (!value || typeof value !== 'object') return DEFAULT_STATE;

  const candidate = value as Partial<SettingsState>;
  const orgId = typeof candidate.orgId === 'string' ? candidate.orgId : null;
  const locationId =
    typeof candidate.locationId === 'string' ? candidate.locationId : null;

  return { orgId, locationId };
};

const readFromStorage = (): SettingsState => {
  if (!isBrowser()) return DEFAULT_STATE;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw);
    return parseState(parsed);
  } catch (error) {
    console.warn('ConfigPro: unable to read settings from storage', error);
    return DEFAULT_STATE;
  }
};

const persistState = (next: SettingsState) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch (error) {
    console.warn('ConfigPro: unable to persist settings to storage', error);
  }
};

let state: SettingsState = readFromStorage();
const listeners = new Set<(state: SettingsState) => void>();

const isSameState = (a: SettingsState, b: SettingsState) =>
  a.orgId === b.orgId && a.locationId === b.locationId;

const notify = () => {
  for (const listener of listeners) {
    listener(state);
  }
};

type SetStateOptions = { persist?: boolean };

const commitState = (
  updater: (previous: SettingsState) => SettingsState,
  options?: SetStateOptions
) => {
  const previous = state;
  const next = updater(previous);
  if (isSameState(next, previous)) return;

  state = next;
  if (options?.persist !== false) {
    persistState(state);
  }
  notify();
};

if (isBrowser()) {
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return;
    try {
      const next = event.newValue ? parseState(JSON.parse(event.newValue)) : DEFAULT_STATE;
      commitState(() => next, { persist: false });
    } catch (error) {
      console.warn('ConfigPro: unable to sync settings from storage event', error);
    }
  });
}

export const settingsStore = {
  getState: () => state,
  subscribe: (listener: (next: SettingsState) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setOrg: (orgId: string | null) =>
    commitState((previous) => {
      const nextOrgId = orgId ?? null;
      const nextLocationId =
        previous.orgId === nextOrgId ? previous.locationId : null;
      return {
        orgId: nextOrgId,
        locationId: nextLocationId
      } satisfies SettingsState;
    }),
  setLocation: (locationId: string | null) =>
    commitState((previous) => ({
      orgId: previous.orgId,
      locationId: locationId ?? null
    })),
  clear: () => commitState(() => DEFAULT_STATE)
};

export const useSettingsStore = <T>(selector: (state: SettingsState) => T): T =>
  useSyncExternalStore(
    settingsStore.subscribe,
    () => selector(settingsStore.getState()),
    () => selector(DEFAULT_STATE)
  );

export const getSettingsSnapshot = () => settingsStore.getState();
export const SETTINGS_STORAGE_KEY = STORAGE_KEY;
export const DEFAULT_SETTINGS_STATE = DEFAULT_STATE;
