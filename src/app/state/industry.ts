import { useSyncExternalStore } from 'react';

import { IndustryKey } from '../config/industry.presets';

const STORAGE_KEY = 'configpro:industry';
const DEFAULT_INDUSTRY: IndustryKey = 'generic';

const INDUSTRIES: IndustryKey[] = ['retail', 'construction', 'daycare', 'automotive', 'generic'];

const isBrowser = () => typeof window !== 'undefined';

const isIndustryKey = (value: unknown): value is IndustryKey =>
  typeof value === 'string' && (INDUSTRIES as string[]).includes(value);

const readFromStorage = (): IndustryKey => {
  if (!isBrowser()) return DEFAULT_INDUSTRY;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_INDUSTRY;

    const parsed = JSON.parse(stored);
    return isIndustryKey(parsed) ? parsed : DEFAULT_INDUSTRY;
  } catch (error) {
    console.warn('ConfigPro: unable to read industry from storage', error);
    return DEFAULT_INDUSTRY;
  }
};

const persistIndustry = (value: IndustryKey) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch (error) {
    console.warn('ConfigPro: unable to persist industry to storage', error);
  }
};

let currentIndustry: IndustryKey = readFromStorage();
const listeners = new Set<(value: IndustryKey) => void>();

const notify = () => {
  for (const listener of listeners) {
    listener(currentIndustry);
  }
};

const subscribe = (listener: (value: IndustryKey) => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const setIndustry = (next: IndustryKey) => {
  if (next === currentIndustry) return;
  currentIndustry = next;
  persistIndustry(currentIndustry);
  notify();
};

if (isBrowser()) {
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return;
    try {
      const next = event.newValue ? JSON.parse(event.newValue) : DEFAULT_INDUSTRY;
      if (isIndustryKey(next) && next !== currentIndustry) {
        currentIndustry = next;
        notify();
      }
    } catch (error) {
      console.warn('ConfigPro: unable to sync industry from storage event', error);
    }
  });
}

export const useIndustry = () =>
  useSyncExternalStore(
    subscribe,
    () => currentIndustry,
    () => DEFAULT_INDUSTRY,
  );

export const getIndustrySnapshot = () => currentIndustry;
export const INDUSTRY_STORAGE_KEY = STORAGE_KEY;
export const DEFAULT_INDUSTRY_STATE = DEFAULT_INDUSTRY;
