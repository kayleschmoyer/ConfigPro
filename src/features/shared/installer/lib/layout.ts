import type { FeatureCatalogItem, LayoutItem, LayoutRegion } from './types';

export const layoutRegionLabels: Record<LayoutRegion, string> = {
  SIDEBAR: 'Sidebar',
  HOME_BUTTON: 'Home Button Grid',
  TOPBAR: 'Topbar Quick Actions',
  HIDDEN: 'Hidden',
};

export const regionOrder: LayoutRegion[] = ['SIDEBAR', 'HOME_BUTTON', 'TOPBAR', 'HIDDEN'];

export const normalizeLayout = (
  catalog: FeatureCatalogItem[],
  selectionIds: string[],
  existing: LayoutItem[]
): LayoutItem[] => {
  const seen = new Set<string>();
  const normalized: LayoutItem[] = [];

  selectionIds.forEach((featureId) => {
    const feature = catalog.find((item) => item.id === featureId);
    if (!feature) return;
    const existingItem = existing.find((item) => item.featureId === featureId);
    if (existingItem) {
      normalized.push(existingItem);
      seen.add(featureId);
      return;
    }
    normalized.push({
      featureId,
      label: feature.name,
      icon: feature.defaultIcon,
      order: normalized.length,
      region: feature.defaultRegion ?? 'HIDDEN',
    });
    seen.add(featureId);
  });

  return normalized
    .filter((item) => seen.has(item.featureId))
    .map((item, index) => ({ ...item, order: index }));
};

export const validateLayout = (
  catalog: FeatureCatalogItem[],
  layout: LayoutItem[],
  selectionIds: string[]
): string[] => {
  const messages: string[] = [];
  const layoutFeatureIds = layout.map((item) => item.featureId);

  const missing = selectionIds.filter((id) => !layoutFeatureIds.includes(id));
  if (missing.length) {
    messages.push(`Layout missing placement for ${missing.length} selected feature(s).`);
  }

  const financeSelections = selectionIds.filter((id) =>
    catalog.find((feature) => feature.id === id)?.category === 'FINANCE'
  );
  if (
    financeSelections.length &&
    !layout.some((item) => item.region === 'SIDEBAR' && financeSelections.includes(item.featureId))
  ) {
    messages.push('Finance selections require at least one sidebar anchor.');
  }

  const duplicateRegionIndex = new Map<string, LayoutRegion>();
  layout.forEach((item) => {
    if (duplicateRegionIndex.has(item.featureId) && duplicateRegionIndex.get(item.featureId) !== item.region) {
      messages.push(`Feature ${item.featureId} assigned to multiple regions.`);
    }
    duplicateRegionIndex.set(item.featureId, item.region);
  });

  layout.forEach((item) => {
    const feature = catalog.find((catalogItem) => catalogItem.id === item.featureId);
    if (feature?.route && item.region === 'HIDDEN') {
      messages.push(`${feature.name} has an available workspace route; consider pinning it.`);
    }
  });

  return Array.from(new Set(messages));
};

export const groupLayoutByRegion = (layout: LayoutItem[]) => {
  return regionOrder.reduce<Record<LayoutRegion, LayoutItem[]>>((acc, region) => {
    acc[region] = layout.filter((item) => item.region === region).sort((a, b) => a.order - b.order);
    return acc;
  }, {
    SIDEBAR: [],
    HOME_BUTTON: [],
    TOPBAR: [],
    HIDDEN: [],
  });
};

export const moveLayoutItem = (
  layout: LayoutItem[],
  featureId: string,
  region: LayoutRegion,
  targetIndex: number
): LayoutItem[] => {
  const target = layout.find((item) => item.featureId === featureId);
  if (!target) return layout;

  const next = layout
    .filter((item) => item.featureId !== featureId)
    .map((item) => ({ ...item }));

  const updatedTarget: LayoutItem = { ...target, region };
  const regionItems = next.filter((item) => item.region === region);
  regionItems.splice(targetIndex, 0, updatedTarget);

  const otherRegions = next.filter((item) => item.region !== region);

  const recomposed = [...otherRegions, ...regionItems];

  const withOrder = recomposed.map((item) => {
    const siblings = recomposed
      .filter((sibling) => sibling.region === item.region)
      .sort((a, b) => a.order - b.order);
    const index = siblings.findIndex((sibling) => sibling.featureId === item.featureId);
    return { ...item, order: index };
  });

  return withOrder;
};

export const updateLayoutOrder = (
  layout: LayoutItem[],
  region: LayoutRegion,
  orderedFeatureIds: string[]
): LayoutItem[] => {
  return layout.map((item) => {
    if (item.region !== region) return item;
    const order = orderedFeatureIds.indexOf(item.featureId);
    return { ...item, order: order >= 0 ? order : item.order };
  });
};
