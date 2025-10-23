export { SharedFeatureRegistry } from './feature.registry';
export type { FeatureDef, FeatureKey } from './feature.registry';

export { sharedFeatureGroups } from './sharedFeatures.data';
export type { SharedFeature, SharedFeatureGroup, SharedFeatureStatus } from './sharedFeatures.data';

export type * from '@/shared/types/core';

export { default as SharedNav } from './SharedNav';

export { default as SharedFeaturesPage } from './SharedFeaturesPage';
export { default as ErrorBoundaryPage } from './error.boundary';

export { default as UsersAndRolesPage } from './UsersAndRolesPage';
export { default as OrgAndLocationsPage } from './OrgAndLocationsPage';
export { default as CatalogAttributesPage } from './CatalogAttributesPage';
export { default as PricingRulesPage } from './PricingRulesPage';
export { default as TaxRulesPage } from './TaxRulesPage';
export { default as PaymentProvidersPage } from './PaymentProvidersPage';
export { default as DocumentsAndBrandingPage } from './DocumentsAndBrandingPage';
export { default as OrderWorkflowPage } from './OrderWorkflowPage';
export { default as InventorySettingsPage } from './InventorySettingsPage';
export { default as CustomerFieldsPage } from './CustomerFieldsPage';
export { default as NotificationsPage } from './NotificationsPage';
export { default as ReportingPage } from './ReportingPage';
export { default as DataImportExportPage } from './DataImportExportPage';
export { default as FeatureFlagsPage } from './FeatureFlagsPage';
export { default as AuditLogPage } from './AuditLogPage';
export { default as LocalizationPage } from './LocalizationPage';
export { default as BrandingPage } from './BrandingPage';
export { default as TimeIntelligenceHubPage } from './TimeIntelligenceHubPage';
export { default as FuturisticBlueprintCreatorPage } from './FuturisticBlueprintCreatorPage';

export * from './api.client';
export * from './businessHours.data';
export * from './discounts.engine';
export * from './documentTemplates.data';
export * from './flags.client';
export * from './import.mappings';
export * from './loyalty.rules';
export * from './offline.queue';
export * from './permissions.model';
export * from './privacy.consents';
export * from './suppliers.data';
export * from './uom.data';
export * from './validation.schemas';
export * from './workflow.engine';
export * from './search.config';
export * from './branding.data';
