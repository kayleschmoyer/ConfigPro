import { useMemo } from 'react';
import { sharedFeatureGroups } from '../../../pages/shared/features/sharedFeatures.data';
import type { FeatureCatalogItem, FeatureCategory, LayoutRegion } from './types';

const groupCategoryMap: Record<string, FeatureCategory> = {
  'core-workflows': 'WORKFORCE',
  'enterprise-foundation': 'ADMIN',
  integrations: 'INTEGRATIONS',
  'supporting-tools': 'CUSTOMER',
  'trust-and-compliance': 'FINANCE',
};

const defaultRegionForCategory: Record<FeatureCategory, LayoutRegion> = {
  FINANCE: 'SIDEBAR',
  WORKFORCE: 'SIDEBAR',
  INVENTORY: 'SIDEBAR',
  CUSTOMER: 'HOME_BUTTON',
  INTEGRATIONS: 'TOPBAR',
  ADMIN: 'TOPBAR',
  ANALYTICS: 'HOME_BUTTON',
};

const featureOverrides: Record<string, Partial<FeatureCatalogItem>> = {
  'payment-provider-control-plane': {
    basePrice: { currency: 'USD', value: 249 },
    priceModel: 'MONTHLY',
    perLocation: true,
    setupEstimate: '2 hours',
    roiNote: 'Reduces reconciliations by automating gateway routing.',
    defaultIcon: 'credit-card',
    route: '/shared/payment-providers',
  },
  'feature-flags-control-service': {
    basePrice: { currency: 'USD', value: 149 },
    priceModel: 'MONTHLY',
    perSeat: true,
    setupEstimate: '45 minutes',
    roiNote: 'Safely graduate new experiences with progressive rollout tooling.',
    defaultIcon: 'flag-triangle-right',
    route: '/shared/feature-flags',
  },
  'pricing-rules-control-center': {
    basePrice: { currency: 'USD', value: 199 },
    priceModel: 'MONTHLY',
    setupEstimate: '3 hours',
    defaultIcon: 'badge-percent',
    route: '/shared/pricing-rules',
    dependsOn: ['organization-and-locations'],
  },
  'organization-and-locations': {
    basePrice: { currency: 'USD', value: 0 },
    priceModel: 'MONTHLY',
    setupEstimate: '30 minutes',
    defaultIcon: 'building-2',
    route: '/shared/org-and-locations',
  },
  'users-and-roles-foundation': {
    basePrice: { currency: 'USD', value: 0 },
    priceModel: 'MONTHLY',
    setupEstimate: '40 minutes',
    defaultIcon: 'shield-check',
    route: '/shared/users-and-roles',
  },
  'reporting-intelligence': {
    basePrice: { currency: 'USD', value: 299 },
    priceModel: 'MONTHLY',
    setupEstimate: '1.5 hours',
    defaultIcon: 'bar-chart-3',
    route: '/shared/reporting',
    dependsOn: ['organization-and-locations'],
  },
  'runtime-error-boundary': {
    basePrice: { currency: 'USD', value: 79 },
    priceModel: 'MONTHLY',
    setupEstimate: '15 minutes',
    defaultIcon: 'shield-alert',
    route: '/shared/error-boundary',
  },
  'global-tax-rules-foundation': {
    basePrice: { currency: 'USD', value: 259 },
    priceModel: 'MONTHLY',
    setupEstimate: '4 hours',
    defaultIcon: 'globe',
    route: '/shared/tax-rules',
    dependsOn: ['organization-and-locations'],
  },
  'audit-log-evidence-fabric': {
    basePrice: { currency: 'USD', value: 189 },
    priceModel: 'MONTHLY',
    setupEstimate: '2 hours',
    defaultIcon: 'clipboard-list',
    route: '/shared/audit-log',
  },
  'data-import-export-studio': {
    basePrice: { currency: 'USD', value: 129 },
    priceModel: 'MONTHLY',
    setupEstimate: '1 hour',
    defaultIcon: 'upload-cloud',
    route: '/shared/data-import-export',
  },
  'reporting-intelligence-roi': {
    roiNote: 'Customers report 17% lift in insights adoption after rollout.',
  },
};

const conflictMatrix: Record<string, string[]> = {
  'payment-provider-control-plane': ['pricing-rules-control-center'],
};

const normalizedCatalog: FeatureCatalogItem[] = sharedFeatureGroups.flatMap((group) => {
  const category = groupCategoryMap[group.id] ?? 'ANALYTICS';

  return group.features.map<FeatureCatalogItem>((feature) => {
    const overrides = featureOverrides[feature.id] ?? {};
    const basePrice = overrides.basePrice ?? {
      currency: 'USD',
      value: feature.status === 'available' ? 0 : 0,
    };

    return {
      id: feature.id,
      name: feature.title,
      description: feature.summary ?? feature.description ?? '',
      category,
      basePrice,
      priceModel: overrides.priceModel ?? 'MONTHLY',
      perSeat: overrides.perSeat ?? false,
      perLocation: overrides.perLocation ?? false,
      dependsOn: overrides.dependsOn,
      conflictsWith: conflictMatrix[feature.id],
      optionsSchema: overrides.optionsSchema,
      defaultRegion: overrides.defaultRegion ?? defaultRegionForCategory[category],
      defaultIcon: overrides.defaultIcon,
      route: overrides.route,
      tags: feature.systems,
      setupEstimate: overrides.setupEstimate,
      roiNote: overrides.roiNote ?? (featureOverrides[`${feature.id}-roi`]?.roiNote ?? undefined),
    };
  });
});

export const getInstallerCatalog = (): FeatureCatalogItem[] => normalizedCatalog;

export const useInstallerCatalog = () => {
  return useMemo(() => getInstallerCatalog(), []);
};
