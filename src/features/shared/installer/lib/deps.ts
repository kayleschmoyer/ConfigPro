import type { FeatureCatalogItem, FeatureSelection } from './types';

export interface DependencyResolution {
  selections: FeatureSelection[];
  autoEnabled: string[];
  autoDisabled: string[];
  blockedBy?: { featureId: string; conflictingWith: string };
}

const getSelection = (selections: FeatureSelection[], featureId: string) =>
  selections.find((selection) => selection.featureId === featureId);

const ensureSelection = (
  selections: FeatureSelection[],
  featureId: string,
  enabled: boolean
): FeatureSelection[] => {
  const existing = getSelection(selections, featureId);
  if (existing) {
    return selections.map((selection) =>
      selection.featureId === featureId ? { ...selection, enabled } : selection
    );
  }
  return [...selections, { featureId, enabled }];
};

export const toggleFeatureWithDependencies = (
  catalog: FeatureCatalogItem[],
  selections: FeatureSelection[],
  featureId: string,
  enabled: boolean
): DependencyResolution => {
  const feature = catalog.find((item) => item.id === featureId);
  if (!feature) {
    return { selections, autoEnabled: [], autoDisabled: [] };
  }

  const current = ensureSelection(selections, featureId, enabled);

  if (enabled) {
    const conflict = feature.conflictsWith?.find((conflictId) =>
      current.some((selection) => selection.featureId === conflictId && selection.enabled)
    );
    if (conflict) {
      return {
        selections,
        autoEnabled: [],
        autoDisabled: [],
        blockedBy: { featureId, conflictingWith: conflict },
      };
    }

    const dependencies = feature.dependsOn ?? [];
    const autoEnabled: string[] = [];
    let nextSelections = current;
    dependencies.forEach((dependencyId) => {
      const dependency = catalog.find((item) => item.id === dependencyId);
      if (!dependency) return;
      const dependencySelection = getSelection(nextSelections, dependencyId);
      if (!dependencySelection || !dependencySelection.enabled) {
        autoEnabled.push(dependencyId);
        nextSelections = ensureSelection(nextSelections, dependencyId, true);
      }
    });

    return { selections: nextSelections, autoEnabled, autoDisabled: [] };
  }

  const dependents = catalog.filter((item) =>
    item.dependsOn?.includes(featureId) &&
    current.some((selection) => selection.featureId === item.id && selection.enabled)
  );
  const autoDisabled = dependents.map((item) => item.id);
  let nextSelections = current;
  autoDisabled.forEach((dependentId) => {
    nextSelections = ensureSelection(nextSelections, dependentId, false);
  });

  return { selections: nextSelections, autoEnabled: [], autoDisabled };
};

export const summarizeDependencyImpact = (
  catalog: FeatureCatalogItem[],
  selectionIds: string[]
) => {
  const dependencies: Record<string, string[]> = {};
  const conflicts: Record<string, string[]> = {};

  selectionIds.forEach((featureId) => {
    const feature = catalog.find((item) => item.id === featureId);
    if (!feature) return;
    if (feature.dependsOn?.length) {
      dependencies[featureId] = feature.dependsOn;
    }
    const conflicting = feature.conflictsWith?.filter((conflictId) =>
      selectionIds.includes(conflictId)
    );
    if (conflicting?.length) {
      conflicts[featureId] = conflicting;
    }
  });

  return { dependencies, conflicts };
};
