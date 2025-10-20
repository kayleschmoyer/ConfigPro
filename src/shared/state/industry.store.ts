import { useSyncExternalStore } from 'react';

import { IndustryFeatureMatrix, type IndustryKey } from '../../app/config/industry.presets';
import { SharedFeatureRegistry, type FeatureKey } from '../../pages/shared/features/feature.registry';

export type IndustryFeatures = Record<FeatureKey, boolean>;

export interface IndustryState {
  /** The active industry selection driving configuration defaults */
  industry: IndustryKey;
  /** Feature enablement derived from the active industry presets */
  features: IndustryFeatures;
}

const ALL_FEATURE_KEYS: FeatureKey[] = SharedFeatureRegistry.map((item) => item.key);

const DEFAULT_INDUSTRY: IndustryKey = 'generic';

const createFeatureSnapshot = (industry: IndustryKey): IndustryFeatures => {
  const base = ALL_FEATURE_KEYS.reduce<IndustryFeatures>((acc, key) => {
    acc[key] = false;
    return acc;
  }, {} as IndustryFeatures);

  const preset = IndustryFeatureMatrix[industry] ?? {};
  for (const key of Object.keys(preset) as FeatureKey[]) {
    base[key] = Boolean(preset[key]);
  }

  return base;
};

const createState = (industry: IndustryKey): IndustryState => ({
  industry,
  features: createFeatureSnapshot(industry),
});

const listeners = new Set<(state: IndustryState) => void>();

const notify = () => {
  for (const listener of listeners) {
    listener(state);
  }
};

const setState = (updater: (previous: IndustryState) => IndustryState) => {
  const previous = state;
  const next = updater(previous);
  if (Object.is(previous, next)) return;
  state = next;
  notify();
};

let state: IndustryState = createState(DEFAULT_INDUSTRY);

export const industryStore = {
  getState: () => state,
  subscribe: (listener: (state: IndustryState) => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setIndustry: (industry: IndustryKey) =>
    setState((previous) => {
      if (previous.industry === industry) return previous;
      return createState(industry);
    }),
  setFeature: (feature: FeatureKey, enabled: boolean) =>
    setState((previous) => {
      if (previous.features[feature] === enabled) return previous;
      return {
        industry: previous.industry,
        features: { ...previous.features, [feature]: enabled },
      } satisfies IndustryState;
    }),
  reset: () =>
    setState((previous) => {
      if (previous.industry === DEFAULT_INDUSTRY) {
        const nextFeatures = createFeatureSnapshot(DEFAULT_INDUSTRY);
        const isUnchanged = ALL_FEATURE_KEYS.every(
          (key) => previous.features[key] === nextFeatures[key],
        );
        if (isUnchanged) return previous;
      }
      return createState(DEFAULT_INDUSTRY);
    }),
};

export const useIndustryStore = <T>(selector: (state: IndustryState) => T): T =>
  useSyncExternalStore(
    industryStore.subscribe,
    () => selector(industryStore.getState()),
    () => selector(createState(DEFAULT_INDUSTRY)),
  );

export const getIndustrySnapshot = () => industryStore.getState();
export const DEFAULT_INDUSTRY_STATE = createState(DEFAULT_INDUSTRY);
export const DEFAULT_INDUSTRY_KEY = DEFAULT_INDUSTRY;
export const ALL_INDUSTRY_FEATURE_KEYS = ALL_FEATURE_KEYS;
