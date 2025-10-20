export type SharedFeatureStatus = 'planned' | 'in-progress' | 'available';

export interface SharedFeature {
  id: string;
  title: string;
  summary?: string;
  systems: string[];
  status: SharedFeatureStatus;
  href?: string;
}

export interface SharedFeatureGroup {
  id: string;
  title: string;
  description?: string;
  features: SharedFeature[];
}

export const sharedFeatureGroups: SharedFeatureGroup[] = [
  {
    id: 'core-workflows',
    title: 'Core Workflows',
    description: 'Reusable flows shared across ConfigPro experiences.',
    features: [
      {
        id: 'forecast-to-schedule-orchestration',
        title: 'Forecast-to-Schedule Orchestration',
        summary:
          'Connect the AuroraDemandNet forecasting workspace to scheduling coverage plans with shared guardrails.',
        systems: ['Forecasting', 'Scheduling'],
        status: 'in-progress',
      },
      {
        id: 'orders-and-work-orders-foundation',
        title: 'Orders & Work Orders Foundation',
        summary:
          'Neutral workflow patterns that support intake through closeout with compliance-aware branching and SLA intelligence.',
        systems: ['Operations', 'Field Service', 'Shared Platform'],
        status: 'in-progress',
        href: '/shared/order-workflows',
      },
      {
        id: 'adaptive-time-intelligence-hub',
        title: 'Adaptive Time Intelligence Hub',
        summary:
          'Elite time intelligence flows that choreograph scheduling intent, live demand, and compliance automation into a concierge punch experience.',
        systems: ['Scheduling', 'Forecasting', 'Time Intelligence'],
        status: 'in-progress',
        href: '/shared/time-intelligence-hub',
      },
    ],
  },
  {
    id: 'enterprise-foundation',
    title: 'Enterprise Foundation',
    description: 'Shared master data and operating narratives that underpin every module.',
    features: [
      {
        id: 'organization-and-locations',
        title: 'Organization & Location Fabric',
        summary:
          'Single source of truth for company identity, location network archetypes, and operating rhythms reused across ConfigPro experiences.',
        systems: ['Org Management', 'Scheduling', 'Facilities'],
        status: 'available',
        href: '/shared/org-and-locations',
      },
    ],
  },
  {
    id: 'integrations',
    title: 'Integrations',
    description: 'Connections and services accessible from any system.',
    features: [
      {
        id: 'payment-provider-control-plane',
        title: 'Payment providers control plane',
        summary:
          'Central hub for gateway credentials, webhooks, and finance guardrails across Stripe, Adyen, Checkout.com, and more.',
        systems: ['Shared Platform', 'Billing', 'Commerce'],
        status: 'planned',
        href: '/shared/payment-providers',
      },
    ],
  },
  {
    id: 'supporting-tools',
    title: 'Supporting Tools',
    description: 'Utilities and enablement shared between teams.',
    features: [
      {
        id: 'pricing-rules-control-center',
        title: 'Pricing Rules Control Center',
        summary:
          'Unified price lists, tier logic, and promotion orchestration accessible by every go-to-market surface.',
        systems: ['Revenue Ops', 'Product', 'Partner'],
        status: 'planned',
        href: '/shared/pricing-rules',
      },
      {
        id: 'users-and-roles-foundation',
        title: 'Users & Roles Foundation',
        summary:
          'Unified RBAC and ABAC modeling with invitation orchestration for every ConfigPro org.',
        systems: ['Scheduling', 'Forecasting', 'Shared Platform'],
        status: 'in-progress',
        href: '/shared/users-and-roles',
      },
      {
        id: 'documents-and-branding-system',
        title: 'Documents & Branding System',
        summary: 'Handlebars templates plus brand guardrails for quotes, invoices, and receipts.',
        systems: ['Billing', 'Shared Platform'],
        status: 'available',
        href: '/shared/documents-and-branding',
      },
      {
        id: 'global-tax-rules-foundation',
        title: 'Global Tax Rules Foundation',
        summary:
          'Regional VAT, sales tax, and nexus guardrails with pluggable calculation services for every channel.',
        systems: ['Shared Platform', 'Billing', 'Commerce'],
        status: 'in-progress',
        href: '/shared/tax-rules',
      },
      {
        id: 'customer-fields-consent-registry',
        title: 'Customer Fields & Consent Registry',
        summary:
          'Canonical documentation for profile attributes, consent primitives, and stewardship guardrails across ConfigPro teams.',
        systems: ['Customer Data Platform', 'Marketing', 'Service'],
        status: 'available',
        href: '/shared/customer-fields',
        id: 'notification-orchestration-hub',
        title: 'Notification orchestration hub',
        summary:
          'Shared template library, trigger automation, and provider guardrails for omni-channel communications.',
        systems: ['Shared Platform', 'Communications', 'Operations'],
        status: 'planned',
        href: '/shared/notifications',
      },
    ],
  },
];
