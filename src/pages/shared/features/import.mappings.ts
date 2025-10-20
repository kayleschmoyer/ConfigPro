export type ImportFormat = 'csv' | 'xlsx';

export interface ImportFieldMap {
  column: string;
  targetField: string;
  required: boolean;
  validators: string[];
  example?: string;
  notes?: string;
}

export interface ImportMapping {
  id: string;
  name: string;
  format: ImportFormat;
  object: string;
  description: string;
  fields: ImportFieldMap[];
  transformationNotes: string[];
}

export interface ImportValidator {
  id: string;
  title: string;
  severity: 'error' | 'warning';
  description: string;
  scenarios: string[];
}

export interface SampleImportFile {
  id: string;
  name: string;
  format: ImportFormat;
  mappingId: string;
  useCase: string;
  summary: string;
  highlights: string[];
}

export const csvImportMappings: ImportMapping[] = [
  {
    id: 'catalog-items',
    name: 'Catalog items',
    format: 'csv',
    object: 'ProductCatalogItem',
    description:
      'Bootstrap products and services with pricing, taxation, and fulfilment readiness fields aligned to the shared catalog schema.',
    fields: [
      {
        column: 'item_sku',
        targetField: 'catalogItem.sku',
        required: true,
        validators: ['unique', 'alphanumeric'],
        example: 'SVC-00045',
        notes: 'Used as the immutable reference for pricing rules and downstream fulfilment.',
      },
      {
        column: 'display_name',
        targetField: 'catalogItem.name',
        required: true,
        validators: ['string', 'max:120'],
        example: 'Premium Onsite Support',
        notes: 'Appears on order workflows, quotes, and partner portals.',
      },
      {
        column: 'unit_price',
        targetField: 'pricing.unitPrice.amount',
        required: true,
        validators: ['currency', 'gt:0'],
        example: '249.00',
        notes: 'Assumes default currency defined at organisation level.',
      },
      {
        column: 'tax_profile',
        targetField: 'compliance.taxProfileId',
        required: false,
        validators: ['exists:taxProfiles'],
        example: 'SERVICES_STANDARD',
        notes: 'Links to the shared tax rules foundation when provided.',
      },
    ],
    transformationNotes: [
      'Automatically assigns default units of measure using the catalog attribute service.',
      'Creates translation shells for any configured locales so content teams can localise later.',
      'Publishes a catalog change event for downstream commerce subscribers.',
    ],
  },
  {
    id: 'customer-accounts',
    name: 'Customer accounts',
    format: 'csv',
    object: 'AccountRecord',
    description:
      'Load customer master data with segmentation, billing, and contact preferences ready for CRM and billing sync.',
    fields: [
      {
        column: 'account_external_id',
        targetField: 'account.externalId',
        required: true,
        validators: ['unique', 'string'],
        example: 'ACME-CORP-4581',
        notes: 'Primary join key between ConfigPro and upstream CRM.',
      },
      {
        column: 'account_name',
        targetField: 'account.displayName',
        required: true,
        validators: ['string', 'max:140'],
        example: 'Acme Corporation',
      },
      {
        column: 'segment_code',
        targetField: 'classification.segmentCode',
        required: false,
        validators: ['exists:segments'],
        example: 'ENTRPRISE',
        notes: 'Activates entitlement policies within the pricing and workflow engines.',
      },
      {
        column: 'primary_contact_email',
        targetField: 'contacts[0].email',
        required: true,
        validators: ['email'],
        example: 'ops@acme.com',
        notes: 'Initial contact inherits notification preferences until more contacts are loaded.',
      },
    ],
    transformationNotes: [
      'Creates account teams with default collaborator roles for onboarding specialists.',
      'Backfills location shells when address data is included via optional columns.',
      'Syncs customer eligibility flags to pricing and discount services.',
    ],
  },
];

export const excelImportMappings: ImportMapping[] = [
  {
    id: 'price-books',
    name: 'Price book adjustments',
    format: 'xlsx',
    object: 'PriceBookEntry',
    description:
      'Manage multi-region price books with tiered pricing, effective dates, and channel eligibility baked in.',
    fields: [
      {
        column: 'Item SKU',
        targetField: 'catalogItem.sku',
        required: true,
        validators: ['exists:catalogItems'],
        example: 'SVC-00045',
      },
      {
        column: 'Region Code',
        targetField: 'pricing.region',
        required: true,
        validators: ['string', 'uppercase'],
        example: 'EMEA',
      },
      {
        column: 'Tier Minimum Qty',
        targetField: 'pricing.tiers[].minimumQuantity',
        required: false,
        validators: ['integer', 'gte:1'],
        example: '10',
      },
      {
        column: 'Effective Until',
        targetField: 'lifecycle.validUntil',
        required: false,
        validators: ['date'],
        example: '2025-03-31',
        notes: 'If omitted the entry inherits the price book default end date.',
      },
    ],
    transformationNotes: [
      'Splits workbook tabs into discrete price book versions per currency.',
      'Aligns tier structures with the shared pricing engine for instant simulation.',
      'Triggers approval workflows when discount thresholds exceed policy.',
    ],
  },
  {
    id: 'inventory-balances',
    name: 'Inventory balances',
    format: 'xlsx',
    object: 'InventorySnapshot',
    description:
      'Capture network-wide inventory positions with safety stock targets and lot traceability.',
    fields: [
      {
        column: 'Location Code',
        targetField: 'location.code',
        required: true,
        validators: ['exists:locations'],
        example: 'DC-14',
      },
      {
        column: 'Item SKU',
        targetField: 'inventoryItem.sku',
        required: true,
        validators: ['exists:catalogItems'],
        example: 'KIT-00981',
      },
      {
        column: 'On Hand Qty',
        targetField: 'balances.onHand',
        required: true,
        validators: ['integer', 'gte:0'],
        example: '320',
      },
      {
        column: 'Lot Number',
        targetField: 'balances.lotNumber',
        required: false,
        validators: ['string'],
        example: 'LOT-22-04-18',
        notes: 'When provided the import enforces lot expiration validation.',
      },
    ],
    transformationNotes: [
      'Merges safety stock targets from the forecasting module when available.',
      'Flags negative availability deltas for replenishment review.',
      'Publishes restock recommendations to the scheduling workbench.',
    ],
  },
];

export const importValidators: ImportValidator[] = [
  {
    id: 'currency-consistency',
    title: 'Currency consistency',
    severity: 'error',
    description: 'Ensures every monetary field references a supported currency code for the tenant.',
    scenarios: [
      'Currency provided in the file is not configured on the organisation profile.',
      'Mixed currencies detected within a single price book tab.',
      'Detected currency symbol instead of ISO code in numeric columns.',
    ],
  },
  {
    id: 'reference-integrity',
    title: 'Reference integrity',
    severity: 'error',
    description: 'Validates lookups against shared registries before creating dependent records.',
    scenarios: [
      'Catalog item references missing from the master catalog.',
      'Tax profile identifiers not aligned with the global tax rules foundation.',
      'Location codes not yet provisioned within the organisation tree.',
    ],
  },
  {
    id: 'quality-hints',
    title: 'Data quality hints',
    severity: 'warning',
    description: 'Surface best-practice suggestions without blocking imports.',
    scenarios: [
      'Optional segmentation fields omitted for enterprise accounts.',
      'High discount percentages detected for a region compared to policy.',
      'Missing translation copy for locales configured on the tenant.',
    ],
  },
];

export const sampleImportFiles: SampleImportFile[] = [
  {
    id: 'catalog-starter-pack',
    name: 'Catalog starter pack',
    format: 'csv',
    mappingId: 'catalog-items',
    useCase: 'Kick-start catalog modelling workshops with ready-to-load examples.',
    summary:
      'Ten curated items spanning physical goods, subscriptions, and service bundles with compliant pricing metadata.',
    highlights: [
      'Demonstrates tax profile usage across mixed offering types.',
      'Includes localisation placeholders for English, German, and Japanese.',
      'Shows how lifecycle statuses control availability per channel.',
    ],
  },
  {
    id: 'enterprise-accounts-pack',
    name: 'Enterprise accounts workbook',
    format: 'csv',
    mappingId: 'customer-accounts',
    useCase: 'Onboard customer success teams to the shared account model.',
    summary:
      'Sample enterprise and mid-market accounts with contact hierarchies, segments, and billing context.',
    highlights: [
      'Illustrates parent-child account relationships and shared entitlements.',
      'Highlights notification preferences tied to each contact.',
      'Provides segmentation tags aligned with revenue operations playbooks.',
    ],
  },
  {
    id: 'price-book-scenarios',
    name: 'Price book scenario planner',
    format: 'xlsx',
    mappingId: 'price-books',
    useCase: 'Simulate tiered pricing launches across regional teams.',
    summary:
      'Workbook with separate tabs per currency and channel readiness checks built in.',
    highlights: [
      'Contains comment annotations with approval workflow tips.',
      'Preloads tier tables for volume-based and commitment pricing.',
      'Flags conflicts when multiple tiers overlap for the same SKU.',
    ],
  },
];
