export type FeatureKey =
  | 'usersRoles'
  | 'orgLocations'
  | 'catalog'
  | 'pricing'
  | 'tax'
  | 'payments'
  | 'documents'
  | 'orders'
  | 'inventory'
  | 'customers'
  | 'scheduling'
  | 'notifications'
  | 'reporting'
  | 'importExport'
  | 'flags'
  | 'audit'
  | 'localization'
  | 'branding'
  | 'timeIntelligence';

export type FeatureDef = {
  key: FeatureKey;
  title: string;
  path: string;
  requiredPerm?: string;
  enabledByDefault?: boolean;
};

export const SharedFeatureRegistry: FeatureDef[] = [
  {
    key: 'usersRoles',
    title: 'Users & Roles',
    path: '/shared/users-and-roles',
    requiredPerm: 'platform.admin',
    enabledByDefault: true,
  },
  {
    key: 'orgLocations',
    title: 'Organizations & Locations',
    path: '/shared/org-and-locations',
    requiredPerm: 'platform.admin',
    enabledByDefault: true,
  },
  {
    key: 'catalog',
    title: 'Catalog & Attributes',
    path: '/shared/catalog',
    requiredPerm: 'catalog.manage',
    enabledByDefault: true,
  },
  {
    key: 'pricing',
    title: 'Pricing Rules',
    path: '/shared/pricing-rules',
    requiredPerm: 'revenue.configure',
    enabledByDefault: true,
  },
  {
    key: 'tax',
    title: 'Tax Rules',
    path: '/shared/tax-rules',
    requiredPerm: 'finance.tax',
    enabledByDefault: true,
  },
  {
    key: 'payments',
    title: 'Payment Providers',
    path: '/shared/payment-providers',
    requiredPerm: 'billing.configure',
  },
  {
    key: 'documents',
    title: 'Documents & Branding',
    path: '/shared/documents-and-branding',
    requiredPerm: 'branding.edit',
  },
  {
    key: 'orders',
    title: 'Order Workflow',
    path: '/shared/order-workflows',
    requiredPerm: 'operations.manage',
  },
  {
    key: 'inventory',
    title: 'Inventory Settings',
    path: '/shared/inventory-settings',
    requiredPerm: 'supply.chain',
  },
  {
    key: 'customers',
    title: 'Customer Fields',
    path: '/shared/customer-fields',
    requiredPerm: 'crm.configure',
  },
  {
    key: 'scheduling',
    title: 'Scheduling Rules',
    path: '/scheduling/manager',
  },
  {
    key: 'notifications',
    title: 'Notifications',
    path: '/shared/notifications',
    requiredPerm: 'communications.manage',
  },
  {
    key: 'reporting',
    title: 'Reporting',
    path: '/shared/reporting',
    requiredPerm: 'analytics.viewer',
  },
  {
    key: 'importExport',
    title: 'Data Import/Export',
    path: '/shared/data-import-export',
    requiredPerm: 'data.pipeline',
  },
  {
    key: 'flags',
    title: 'Feature Flags',
    path: '/shared/feature-flags',
    requiredPerm: 'platform.feature-flags',
  },
  {
    key: 'audit',
    title: 'Audit Log',
    path: '/shared/audit-log',
    requiredPerm: 'security.audit',
  },
  {
    key: 'localization',
    title: 'Localization',
    path: '/shared/localization',
  },
  {
    key: 'branding',
    title: 'Branding',
    path: '/shared/branding',
  },
  {
    key: 'timeIntelligence',
    title: 'Time Intelligence',
    path: '/shared/time-intelligence-hub',
  },
];
