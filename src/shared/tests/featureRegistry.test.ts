import { describe, expect, it } from 'vitest';

import { SharedFeatureRegistry } from '../../pages/shared/features/feature.registry';

const getDuplicates = (values: string[]) => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  values.forEach((value) => {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  });
  return Array.from(duplicates.values());
};

describe('SharedFeatureRegistry', () => {
  it('maintains unique keys and paths for every feature entry', () => {
    const keys = SharedFeatureRegistry.map((feature) => feature.key);
    const paths = SharedFeatureRegistry.map((feature) => feature.path);

    expect(getDuplicates(keys)).toEqual([]);
    expect(getDuplicates(paths)).toEqual([]);
  });

  it('normalises feature paths and permissions for downstream routing', () => {
    SharedFeatureRegistry.forEach((feature) => {
      expect(feature.path.startsWith('/')).toBe(true);
      if (feature.requiredPerm) {
        expect(feature.requiredPerm.trim()).toHaveLength(feature.requiredPerm.length);
        expect(feature.requiredPerm.length).toBeGreaterThan(0);
      }
    });
  });

  it('exposes at least one default-enabled feature to seed coverage metrics', () => {
    const enabledByDefault = SharedFeatureRegistry.filter((feature) => feature.enabledByDefault);
    expect(enabledByDefault.length).toBeGreaterThan(0);
  });
});
