import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import type { RouteObject } from 'react-router-dom';
import { SharedFeatureRegistry } from '../../pages/shared/features';

type FeatureComponent = LazyExoticComponent<ComponentType<unknown>>;

type FeatureLoader = () => Promise<{ default: ComponentType<unknown> }>;

const featureComponentLoaders: Record<string, FeatureLoader | undefined> = {
  usersRoles: () => import('../../pages/shared/features/UsersAndRolesPage'),
  orgLocations: () => import('../../pages/shared/features/OrgAndLocationsPage'),
  catalog: () => import('../../pages/shared/features/CatalogAttributesPage'),
  pricing: () => import('../../pages/shared/features/PricingRulesPage'),
  tax: () => import('../../pages/shared/features/TaxRulesPage'),
  payments: () => import('../../pages/shared/features/PaymentProvidersPage'),
  documents: () => import('../../pages/shared/features/DocumentsAndBrandingPage'),
  orders: () => import('../../pages/shared/features/OrderWorkflowPage'),
  inventory: () => import('../../pages/shared/features/InventorySettingsPage'),
  customers: () => import('../../pages/shared/features/CustomerFieldsPage'),
  notifications: () => import('../../pages/shared/features/NotificationsPage'),
  reporting: () => import('../../pages/shared/features/ReportingPage'),
  importExport: () => import('../../pages/shared/features/DataImportExportPage'),
  flags: () => import('../../pages/shared/features/FeatureFlagsPage'),
  audit: () => import('../../pages/shared/features/AuditLogPage'),
  localization: () => import('../../pages/shared/features/LocalizationPage'),
  branding: () => import('../../pages/shared/features/BrandingPage'),
  timeIntelligence: () => import('../../pages/shared/features/TimeIntelligenceHubPage'),
};

const mapToElement = (key: string): FeatureComponent | null => {
  const loader = featureComponentLoaders[key];
  return loader ? lazy(loader) : null;
};

export const sharedRoutes: RouteObject[] = SharedFeatureRegistry.map((feature) => {
  const Component = mapToElement(feature.key);

  return {
    path: feature.path,
    element: Component ? <Component /> : <div className="p-6">Coming soon</div>,
  };
});
