import { useState, useCallback } from 'react';
import type { ApplyResult, FeatureCatalogItem, InstallerDraft, LayoutItem } from './types';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const runApply = async (
  draft: InstallerDraft,
  layout: LayoutItem[],
  catalog: FeatureCatalogItem[]
): Promise<ApplyResult> => {
  await sleep(450);

  const enabledFeatures = draft.selections.filter((selection) => selection.enabled);

  const mountedRoutes = layout
    .map((item) => catalog.find((feature) => feature.id === item.featureId)?.route)
    .filter((route): route is string => Boolean(route));

  console.info('[ConfigPro Installer] Prepared registry diff', {
    plan: draft.plan,
    enabledFeatures: enabledFeatures.map((feature) => feature.featureId),
    layout,
    mountedRoutes,
  });

  return {
    updatedRegistry: true,
    updatedFlags: true,
    updatedNav: true,
    mountedRoutes,
    message: `Applied ${enabledFeatures.length} feature toggles and refreshed navigation (${layout.length} placements).`,
  };
};

export const useApplyChanges = (
  draft: InstallerDraft,
  layout: LayoutItem[],
  catalog: FeatureCatalogItem[]
) => {
  const [applying, setApplying] = useState(false);
  const [result, setResult] = useState<ApplyResult | undefined>(undefined);

  const applyChanges = useCallback(async () => {
    setApplying(true);
    try {
      const outcome = await runApply(draft, layout, catalog);
      setResult(outcome);
      return outcome;
    } finally {
      setApplying(false);
    }
  }, [draft, layout, catalog]);

  const reset = useCallback(() => setResult(undefined), []);

  return { applying, applyChanges, result, reset };
};
