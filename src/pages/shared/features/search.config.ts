export type FieldClassification = 'dimension' | 'metric' | 'attribute';

export interface ReportingSearchField {
  id: string;
  label: string;
  description: string;
  classification: FieldClassification;
  sampleValue?: string;
  sources: string[];
}

export interface ReportingSearchModule {
  id: string;
  module: string;
  dataset: string;
  description: string;
  refreshCadence: string;
  owner: string;
  retention: string;
  indexableFields: ReportingSearchField[];
}

export const reportingSearchIndex: ReportingSearchModule[] = [
  {
    id: 'scheduling-coverage',
    module: 'Scheduling',
    dataset: 'coverage_commitments',
    description:
      'Index used by the coverage planning workspace to power schedule variance search, on-call lookups, and compliance audits.',
    refreshCadence: 'Every 15 minutes',
    owner: 'Scheduling data engineering',
    retention: '90 days rolling with cold storage snapshots maintained monthly.',
    indexableFields: [
      {
        id: 'location_code',
        label: 'Location code',
        description:
          'Unique identifier for storefront, clinic, or operational node. Drives drill-down experiences and geo clustering.',
        classification: 'dimension',
        sampleValue: 'SEA-047',
        sources: ['Org & Location Fabric', 'Scheduling manager console'],
      },
      {
        id: 'shift_date',
        label: 'Shift date',
        description:
          'Normalized ISO date for the associated coverage block. Used for daily timeline pivots and period filtering.',
        classification: 'dimension',
        sampleValue: '2024-04-16',
        sources: ['Coverage planner', 'Time intelligence hub'],
      },
      {
        id: 'planned_hours',
        label: 'Planned hours',
        description: 'Total scheduled labour hours for the shift slice after automation and manual adjustments.',
        classification: 'metric',
        sampleValue: '42.5',
        sources: ['Scheduling optimisation engine'],
      },
      {
        id: 'variance_minutes',
        label: 'Variance minutes',
        description:
          'Difference between planned labour and actual clocked time, surfaced for exception monitoring and SLA reviews.',
        classification: 'metric',
        sampleValue: '-35',
        sources: ['Time intelligence hub', 'Punch ingestion service'],
      },
    ],
  },
  {
    id: 'commerce-ledger',
    module: 'Commerce',
    dataset: 'order_financial_ledger',
    description:
      'Search layer that powers gross-to-net reconciliation queries across orders, tenders, adjustments, and settlements.',
    refreshCadence: 'Hourly incremental sync',
    owner: 'Revenue operations analytics',
    retention: '180 days online with quarterly archive to object storage.',
    indexableFields: [
      {
        id: 'order_id',
        label: 'Order ID',
        description: 'Canonical identifier across OMS, POS, and billing flows.',
        classification: 'dimension',
        sampleValue: 'ORD-982341',
        sources: ['Order workflow foundation', 'Point of sale ingestion'],
      },
      {
        id: 'tender_status',
        label: 'Tender status',
        description:
          'Capture, authorised, pending, or failed states mirrored from acquiring providers for dispute drill-downs.',
        classification: 'attribute',
        sampleValue: 'captured',
        sources: ['Payment provider control plane'],
      },
      {
        id: 'net_revenue',
        label: 'Net revenue',
        description: 'Revenue net of discounts and refunds calculated using pricing and tax guardrails.',
        classification: 'metric',
        sampleValue: '15892.34',
        sources: ['Pricing rules control center', 'Tax rules foundation'],
      },
      {
        id: 'channel',
        label: 'Channel',
        description:
          'Selling channel taxonomy (in-store, mobile, marketplace) harmonised for executive dashboards and segmentation.',
        classification: 'dimension',
        sampleValue: 'mobile',
        sources: ['Product catalog', 'Channel taxonomy service'],
      },
    ],
  },
  {
    id: 'customer-experience',
    module: 'Customer Experience',
    dataset: 'experience_health_scores',
    description:
      'Indexable signals for NPS, contact drivers, and SLA adherence rolled up from support tooling and survey orchestration.',
    refreshCadence: 'Nightly full rebuild with hourly delta stream for hot metrics.',
    owner: 'Customer experience insights',
    retention: 'Rolling 400 days with anonymised archival for longitudinal research.',
    indexableFields: [
      {
        id: 'account_id',
        label: 'Account ID',
        description: 'Unique tenant identifier used across CRM and billing.',
        classification: 'dimension',
        sampleValue: 'ACCT-2219',
        sources: ['Org & Location Fabric', 'Accounts master'],
      },
      {
        id: 'nps_score',
        label: 'NPS score',
        description: 'Latest survey response bucketed by promoter, passive, or detractor.',
        classification: 'metric',
        sampleValue: '42',
        sources: ['Survey automation', 'Customer portal events'],
      },
      {
        id: 'first_response_minutes',
        label: 'First-response minutes',
        description: 'Minutes from case creation to first agent touch derived from case management exports.',
        classification: 'metric',
        sampleValue: '27',
        sources: ['Support case workspace'],
      },
      {
        id: 'contact_reason',
        label: 'Contact reason',
        description: 'Normalised taxonomy aligning support operations to product development signals.',
        classification: 'attribute',
        sampleValue: 'Billing discrepancy',
        sources: ['Support knowledge base', 'Product operations taxonomy'],
      },
    ],
  },
];
