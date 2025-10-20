import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import type { FeatureKey } from '../shared/features/feature.registry';
import { SharedFeatureRegistry } from '../shared/features/feature.registry';
import { Input } from '../../shared/ui/Input';
import { Button } from '../../shared/ui/Button';
import {
  demoOrgs,
  listOrgLocations,
  listOrgUsers,
  type OrgFixture,
  type LocationFixture,
  type UserFixture,
} from '../../dev/fixtures/org.fixtures';

type FeatureMockInfo = {
  scenario: string;
  sample: unknown;
  spotlight?: string[];
};

const buildFeatureMockData = (): Partial<Record<FeatureKey, FeatureMockInfo>> => {
  const primaryOrg: OrgFixture | undefined = demoOrgs[0];
  const primaryLocations: LocationFixture[] = primaryOrg
    ? listOrgLocations(primaryOrg.id)
    : [];
  const primaryUsers: UserFixture[] = primaryOrg ? listOrgUsers(primaryOrg.id) : [];

  const roleCatalog = Array.from(
    new Set(primaryUsers.flatMap((user) => user.roles)),
  );

  const baseOrgSummary = primaryOrg
    ? {
        id: primaryOrg.id,
        name: primaryOrg.name,
        industry: primaryOrg.industry,
        timeZone: primaryOrg.timeZone,
        supportEmail: primaryOrg.supportEmail,
        currency: primaryOrg.currency,
      }
    : undefined;

  const locationPreview = primaryLocations.map((location) => ({
    id: location.id,
    name: location.name,
    tz: location.tz,
    address: location.address,
    phone: location.phone ?? null,
  }));

  const personaPreview = primaryUsers.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    title: user.title,
    roles: user.roles,
  }));

  return {
    usersRoles: {
      scenario: 'Model platform policies for operations versus corporate teams.',
      spotlight: ['Role coverage heatmap', 'Permission comparison diff'],
      sample: {
        org: baseOrgSummary,
        personas: personaPreview,
        roleCatalog,
        recommendedPolicies: [
          {
            id: 'ops-floor',
            grants: ['orders:manage', 'inventory:write'],
            audience: 'Operations managers',
          },
          {
            id: 'finance-admin',
            grants: ['payments:configure', 'pricing:edit'],
            audience: 'Finance leadership',
          },
        ],
      },
    },
    orgLocations: {
      scenario: 'Visualize a multi-site footprint and switch context quickly.',
      spotlight: ['Timezone-aware scheduling', 'Regional access toggles'],
      sample: {
        org: baseOrgSummary,
        locations: locationPreview,
        defaultLocationId: locationPreview[0]?.id ?? null,
      },
    },
    catalog: {
      scenario: 'Prototype global attribute definitions and bundles.',
      spotlight: ['Attribute groups', 'Variant compatibility'],
      sample: {
        attributes: [
          {
            id: 'material',
            label: 'Material',
            type: 'select',
            options: ['Steel', 'Aluminum', 'Composite'],
          },
          {
            id: 'finish',
            label: 'Finish',
            type: 'select',
            options: ['Matte', 'Brushed', 'Polished'],
          },
        ],
        bundles: [
          {
            id: 'smart-sensor-kit',
            includes: ['sensor-core', 'calibration-pack'],
            availability: ['manufacturing'],
          },
        ],
      },
    },
    pricing: {
      scenario: 'Preview pricing adjustments by region and customer tier.',
      spotlight: ['Tiered matrices', 'Bulk override review'],
      sample: {
        currency: baseOrgSummary?.currency ?? 'USD',
        basePrice: 12900,
        adjustments: [
          {
            id: 'preferred-partner',
            type: 'discount',
            value: 0.1,
            appliesTo: 'Preferred partners',
          },
          {
            id: 'canada-fx',
            type: 'surcharge',
            value: 0.05,
            appliesTo: 'Canada distribution',
          },
        ],
      },
    },
    tax: {
      scenario: 'Surface real-time nexus coverage for operations.',
      spotlight: ['Avalara sandbox', 'Manual override queue'],
      sample: {
        engineId: 'avalara-sandbox',
        jurisdictions: [
          { region: 'US-IL', status: 'registered' },
          { region: 'US-NV', status: 'collecting' },
          { region: 'CA-BC', status: 'pending' },
        ],
        fallbackRate: 0.0825,
      },
    },
    payments: {
      scenario: 'Quickly switch between sandbox payment providers during development.',
      spotlight: ['Provider vaults', 'Webhook harness'],
      sample: {
        providers: [
          {
            id: 'stripe-sandbox',
            mode: 'test',
            capabilities: ['card', 'ach'],
            status: 'connected',
          },
          {
            id: 'adyen-sandbox',
            mode: 'test',
            capabilities: ['card'],
            status: 'disconnected',
          },
        ],
        defaultProviderId: 'stripe-sandbox',
      },
    },
    documents: {
      scenario: 'Preview invoice and quote templates with brand tokens.',
      spotlight: ['Dynamic placeholders', 'Legal footer library'],
      sample: {
        templateId: 'invoice-v3',
        brand: {
          primaryColor: '#2563eb',
          accentColor: '#f97316',
          logo: 'acme-industries.svg',
        },
        placeholders: ['{customer.name}', '{order.total}', '{due_date}'],
      },
    },
    orders: {
      scenario: 'Validate workflow hand-offs before syncing with ERP.',
      spotlight: ['Exception routing', 'Audit checkpoints'],
      sample: {
        workflow: [
          { step: 'Capture', owner: 'sales', slaMinutes: 30 },
          { step: 'Validate', owner: 'ops', slaMinutes: 45 },
          { step: 'Schedule', owner: 'scheduling', slaMinutes: 120 },
        ],
        cancellationReasons: [
          'Pricing error',
          'Capacity limits',
          'Customer withdrawal',
        ],
      },
    },
    inventory: {
      scenario: 'Sandbox replenishment rules before pushing live.',
      spotlight: ['Buffer thresholds', 'Supplier health'],
      sample: {
        items: [
          {
            sku: 'sensor-core',
            onHand: 420,
            reorderPoint: 180,
            supplier: 'QuantumParts',
          },
          {
            sku: 'calibration-pack',
            onHand: 125,
            reorderPoint: 80,
            supplier: 'Northwind Labs',
          },
        ],
        alerts: [
          {
            sku: 'calibration-pack',
            message: 'Below safety stock',
            severity: 'medium',
          },
        ],
      },
    },
    customers: {
      scenario: 'Experiment with CRM field mappings and personas.',
      spotlight: ['360° profile', 'Enrichment jobs'],
      sample: {
        profileTemplate: {
          requiredFields: ['name', 'email', 'lifecycleStage'],
          optionalFields: ['industry', 'mrr', 'productInterest'],
        },
        segments: [
          {
            id: 'manufacturing-enterprise',
            criteria: ['industry:manufacturing', 'mrr>50000'],
          },
          {
            id: 'hospitality-growth',
            criteria: ['industry:hospitality', 'multi-location=true'],
          },
        ],
      },
    },
    scheduling: {
      scenario: 'Model cross-location staffing windows.',
      spotlight: ['Shift templates', 'Capacity heatmap'],
      sample: {
        rules: [
          {
            id: 'weekday-production',
            appliesTo: 'Chicago Innovation Center',
            window: '06:00-18:00',
            requiredRoles: ['tech', 'manager'],
          },
          {
            id: 'weekend-support',
            appliesTo: 'Reno Distribution Hub',
            window: '08:00-16:00',
            requiredRoles: ['manager', 'viewer'],
          },
        ],
        blackoutDates: ['2025-07-04', '2025-12-25'],
      },
    },
    notifications: {
      scenario: 'Ensure critical alerts reach the right audiences.',
      spotlight: ['Sequenced messaging', 'Failover channels'],
      sample: {
        channels: [
          {
            id: 'ops-slack',
            type: 'slack',
            target: '#ops-alerts',
            severity: 'high',
          },
          {
            id: 'finance-email',
            type: 'email',
            target: 'finance@acme-industries.example',
            severity: 'medium',
          },
        ],
        digests: [
          {
            cadence: 'daily',
            audience: 'executive',
            includes: ['orders', 'inventory'],
          },
        ],
      },
    },
    reporting: {
      scenario: 'Assemble insight bundles for leadership reviews.',
      spotlight: ['Metrics contracts', 'Drill-through prototypes'],
      sample: {
        dashboards: [
          {
            id: 'executive-weekly',
            tiles: ['revenueByChannel', 'inventoryTurns', 'ticketVolume'],
          },
          {
            id: 'plant-ops',
            tiles: ['downtime', 'ordersInQueue', 'oee'],
          },
        ],
        metricDefinitions: [
          {
            id: 'inventoryTurns',
            formula: 'COGS / AverageInventory',
            cadence: 'monthly',
          },
        ],
      },
    },
    importExport: {
      scenario: 'Dry-run ETL flows with synthetic payloads.',
      spotlight: ['Column mapping', 'Validation summaries'],
      sample: {
        pipelines: [
          {
            id: 'customer-sync',
            direction: 'import',
            source: 's3://configpro-demo/customers.csv',
            schedule: '0 * * * *',
          },
          {
            id: 'orders-to-erp',
            direction: 'export',
            target: 'netsuite',
            schedule: '*/15 * * * *',
          },
        ],
        lastRun: { status: 'success', processed: 1280, errors: 4 },
      },
    },
    flags: {
      scenario: 'Stage rollouts for experimental capabilities.',
      spotlight: ['Progressive delivery', 'Kill switch'],
      sample: {
        toggles: [
          {
            key: 'pos.nextGenLayout',
            state: 'gradual',
            audience: '10% of Lumen Coffee',
          },
          {
            key: 'inventory.aiReplenishment',
            state: 'beta',
            audience: 'Acme Industries managers',
          },
        ],
        defaultStrategy: 'percentageRollout',
      },
    },
    audit: {
      scenario: 'Trace sensitive actions for compliance exports.',
      spotlight: ['Tamper proofing', 'Export queue'],
      sample: {
        events: [
          {
            at: '2025-01-17T14:32:00Z',
            actor: 'Ava Patel',
            action: 'pricing.rule.updated',
            metadata: { ruleId: 'preferred-partner' },
          },
          {
            at: '2025-01-18T09:12:12Z',
            actor: 'Luke Chen',
            action: 'inventory.adjustment',
            metadata: { sku: 'sensor-core', delta: -5 },
          },
        ],
        retentionDays: 365,
      },
    },
    localization: {
      scenario: 'Preview translation coverage across surfaces.',
      spotlight: ['Missing key detector', 'Number/date presets'],
      sample: {
        locales: [
          { code: 'en-US', completion: 100 },
          { code: 'fr-CA', completion: 82 },
          { code: 'es-MX', completion: 68 },
        ],
        fallbackLocale: 'en-US',
        phraseExample: {
          key: 'orders.newOrder',
          values: { 'en-US': 'New order', 'fr-CA': 'Nouvelle commande' },
        },
      },
    },
    branding: {
      scenario: 'Validate theme tokens and asset packages.',
      spotlight: ['Dark mode parity', 'Channel-specific logos'],
      sample: {
        kitId: 'configpro-default',
        colors: {
          primary: '#0f172a',
          secondary: '#22d3ee',
          accent: '#facc15',
        },
        assets: [
          { type: 'logo', filename: 'logo-horizontal.svg' },
          { type: 'favicon', filename: 'favicon.svg' },
        ],
        typography: { heading: 'Inter', body: 'Work Sans' },
      },
    },
    timeIntelligence: {
      scenario: 'Experiment with trending baselines and forecast windows.',
      spotlight: ['Seasonality detection', 'Anomaly windows'],
      sample: {
        cadence: 'weekly',
        baselineRange: { from: '2024-01-01', to: '2024-12-31' },
        forecasts: [
          { metric: 'orders', horizonWeeks: 12, confidence: 0.92 },
          { metric: 'revenue', horizonWeeks: 8, confidence: 0.88 },
        ],
      },
    },
  };
};

const featureMockData = buildFeatureMockData();

const fallbackMockData: FeatureMockInfo = {
  scenario: 'No curated mock data yet. Add a fixture in buildFeatureMockData().',
  sample: {
    status: 'todo',
    description:
      'Document how this capability is configured or consumed from the shared feature registry.',
  },
};

export const FeaturePlaygroundPage = () => {
  const [query, setQuery] = useState('');
  const [copiedKey, setCopiedKey] = useState<FeatureKey | null>(null);

  const filteredFeatures = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return SharedFeatureRegistry;
    }

    return SharedFeatureRegistry.filter((feature) =>
      [feature.title, feature.key].some((value) =>
        value.toLowerCase().includes(normalized),
      ),
    );
  }, [query]);

  const handleCopy = (key: FeatureKey, sample: unknown) => {
    const serialized = JSON.stringify(sample, null, 2);

    if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard?.writeText
    ) {
      void navigator.clipboard.writeText(serialized);
    }

    setCopiedKey(key);

    const resetCopyState = () => {
      setCopiedKey((current) => (current === key ? null : current));
    };

    if (typeof window !== 'undefined') {
      window.setTimeout(resetCopyState, 1600);
    } else {
      setTimeout(resetCopyState, 1600);
    }
  };

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Developer playground
        </p>
        <h1 className="text-3xl font-semibold text-foreground">
          Shared Feature Playground
        </h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Quickly inspect every shared capability with example payloads. New teammates or AI
          copilots can use this hub to jump directly into an isolated module with data that
          mirrors how ConfigPro stitches systems together.
        </p>
        <Link
          to="/shared/features"
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:text-primary/80"
        >
          View shared feature overview
          <span aria-hidden className="text-base">→</span>
        </Link>
      </header>

      <section aria-labelledby="feature-playground" className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input
            name="feature-search"
            label="Search shared features"
            placeholder="Search by name or key"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="md:min-w-80"
          />
          <div className="text-sm text-muted-foreground">
            Showing {filteredFeatures.length} of {SharedFeatureRegistry.length} features
          </div>
        </div>

        {filteredFeatures.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
            No shared features match “{query}”. Try a different keyword or clear the search.
          </p>
        ) : (
          <ul className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredFeatures.map((feature) => {
              const mockInfo = featureMockData[feature.key] ?? fallbackMockData;
              const sampleJson = JSON.stringify(mockInfo.sample, null, 2);

              return (
                <li
                  key={feature.key}
                  className="flex flex-col gap-4 rounded-2xl border border-border bg-card/80 p-5 shadow-sm backdrop-blur"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold text-foreground">{feature.title}</h2>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          {feature.key}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                          feature.enabledByDefault
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {feature.enabledByDefault ? 'Default' : 'Opt-in'}
                      </span>
                    </div>
                    {feature.requiredPerm ? (
                      <div className="text-xs text-muted-foreground">
                        Requires permission:
                        <span className="ml-1 font-semibold text-foreground">
                          {feature.requiredPerm}
                        </span>
                      </div>
                    ) : null}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <Link
                        to={feature.path}
                        className="inline-flex items-center gap-1 font-semibold text-primary transition hover:text-primary/80"
                      >
                        Open module
                        <span aria-hidden>→</span>
                      </Link>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(feature.key, mockInfo.sample)}
                      >
                        {copiedKey === feature.key ? 'Copied!' : 'Copy mock JSON'}
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground">{mockInfo.scenario}</p>

                  {mockInfo.spotlight && mockInfo.spotlight.length > 0 ? (
                    <ul className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {mockInfo.spotlight.map((item) => (
                        <li
                          key={item}
                          className="rounded-full bg-muted px-3 py-1 font-semibold text-foreground/80"
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="overflow-hidden rounded-lg border border-dashed border-border bg-muted/30">
                    <pre className="max-h-72 overflow-x-auto px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                      {sampleJson}
                    </pre>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};
