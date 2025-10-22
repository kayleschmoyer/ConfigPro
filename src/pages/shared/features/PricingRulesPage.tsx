import { RequirePermission } from '@/shared/components/RequirePermission';
import { Card, CardDescription, CardFooter, CardTitle } from '@/shared/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/ui/Table';
import { evaluateDiscounts } from './discounts.engine';
import type { DiscountRule, PricingEvaluationContext } from './discounts.engine';

const priceLists = [
  {
    id: 'enterprise-usd',
    name: 'Enterprise USD',
    currency: 'USD',
    steward: 'Revenue Operations',
    defaultMarkup: 0.18,
    description:
      'Primary price list for North America enterprise accounts. Anchored to annual contracts with configurable uplift schedules.',
    segments: ['Enterprise', 'Strategic'],
    notes: [
      'Applies shared implementation retainer of $18k with option to amortise.',
      'Contracts default to annual billing with quarterly uplift reviews.',
    ],
  },
  {
    id: 'scale-emea',
    name: 'Scale EMEA',
    currency: 'EUR',
    steward: 'Regional Revenue Desk',
    defaultMarkup: 0.14,
    description:
      'Localized price list that mirrors VAT-inclusive rate cards for EMEA scale customers.',
    segments: ['Scale', 'Mid-market'],
    notes: [
      'Includes localisation surcharge for labour compliance packs.',
      'Tiered ramp discounts expire after 12 months from go-live.',
    ],
  },
  {
    id: 'embedded-partner',
    name: 'Embedded Partner',
    currency: 'USD',
    steward: 'Partner Success',
    defaultMarkup: 0.1,
    description:
      'Usage-backed price list for embedded platform partners leveraging ConfigPro APIs.',
    segments: ['ISV', 'Marketplace'],
    notes: [
      'Bundles telemetry ingestion and white-label support into metered pricing.',
      'Eligible for quarterly co-marketing credits tied to activation milestones.',
    ],
  },
] as const;

const tieredPricingModels = [
  {
    sku: 'suite-core',
    name: 'ConfigPro Core Suite',
    basePrice: 45,
    currency: 'USD',
    measure: 'per active employee / month',
    tiers: [
      { threshold: 0, discount: 0 },
      { threshold: 500, discount: 4 },
      { threshold: 1000, discount: 7 },
      { threshold: 2500, discount: 10 },
    ],
    insights: 'Volume uplift increases automation quotas, so ensure capacity models scale accordingly.',
  },
  {
    sku: 'suite-analytics',
    name: 'Insight Analytics Add-on',
    basePrice: 120,
    currency: 'USD',
    measure: 'per location / month',
    tiers: [
      { threshold: 0, discount: 0 },
      { threshold: 25, discount: 5 },
      { threshold: 50, discount: 8 },
      { threshold: 75, discount: 10 },
    ],
    insights:
      'Discount unlocks cross-environment telemetry connectors; confirm data residency requirements early.',
  },
  {
    sku: 'suite-integration',
    name: 'Integration Fabric',
    basePrice: 200,
    currency: 'USD',
    measure: 'per connector / month',
    tiers: [
      { threshold: 0, discount: 0 },
      { threshold: 10, discount: 6 },
      { threshold: 25, discount: 9 },
      { threshold: 40, discount: 12 },
    ],
    insights: 'Higher tiers require solution engineering review for managed adapters.',
  },
] as const;

const promoCampaigns = [
  {
    name: 'Spring Preview',
    code: 'SPRINGPREVIEW',
    window: '1 Mar — 30 Apr 2024',
    eligible: ['Direct', 'Partner-assisted'],
    highlights: [
      'Applies 5% boost on ConfigPro Core Suite for launch customers with signed pilots.',
      'Stacks with enterprise loyalty if ordered through direct channel.',
    ],
  },
  {
    name: 'Analytics Accelerator',
    code: 'ANLYTX24',
    window: '1 May — 30 Jun 2024',
    eligible: ['Direct'],
    highlights: [
      'Doubles the tier breakpoint for Insight Analytics so sites 1–50 inherit tier-two pricing.',
      'Includes complimentary telemetry governance workshop.',
    ],
  },
  {
    name: 'Integration Launchpad',
    code: 'FABRICBOOST',
    window: 'Rolling (evergreen)',
    eligible: ['ISV', 'Marketplace'],
    highlights: [
      'Awards $1,500 platform credit when three or more managed adapters go live.',
      'Provides priority access to the connector certification queue.',
    ],
  },
] as const;

const discountRules: DiscountRule[] = [
  {
    id: 'enterprise-loyalty-order',
    name: 'Enterprise Loyalty',
    description: '8% incentive for enterprise customers closing annual agreements via the direct channel.',
    priority: 10,
    isActive: true,
    stackable: true,
    conditions: {
      segments: ['enterprise'],
      channels: ['direct'],
      minOrderValue: 5000,
    },
    action: {
      type: 'percentage',
      value: 8,
      appliesTo: 'order',
    },
  },
  {
    id: 'analytics-volume-tier',
    name: 'Analytics Volume Booster',
    description: 'Tiered percentage applied to Insight Analytics when locations exceed breakpoints.',
    priority: 15,
    isActive: true,
    stackable: true,
    conditions: {
      segments: ['enterprise', 'scale'],
      skuInclusion: ['suite-analytics'],
      minQuantity: 25,
    },
    action: {
      type: 'tiered-percentage',
      metric: 'quantity',
      tiers: [
        { threshold: 25, value: 5 },
        { threshold: 50, value: 8 },
        { threshold: 75, value: 10 },
      ],
      targetSkus: ['suite-analytics'],
      appliesTo: 'line',
    },
  },
  {
    id: 'integration-bundle-credit',
    name: 'Integration Bundle Credit',
    description: 'Provides $1,500 credit when 10 or more managed adapters are activated.',
    priority: 20,
    isActive: true,
    stackable: true,
    conditions: {
      segments: ['enterprise', 'isv'],
      skuInclusion: ['suite-integration'],
      minQuantity: 10,
    },
    action: {
      type: 'fixed',
      value: 1500,
      targetSkus: ['suite-integration'],
      appliesTo: 'line',
    },
  },
  {
    id: 'spring-preview-core',
    name: 'Spring Preview Core Boost',
    description: 'Promo code adds an extra 5% savings on ConfigPro Core for launch customers.',
    priority: 25,
    isActive: true,
    stackable: true,
    conditions: {
      promoCodes: ['SPRINGPREVIEW'],
      skuInclusion: ['suite-core'],
    },
    action: {
      type: 'percentage',
      value: 5,
      targetSkus: ['suite-core'],
      appliesTo: 'line',
    },
  },
];

const evaluationContext: PricingEvaluationContext = {
  currency: 'USD',
  date: '2024-03-18',
  customerSegment: 'enterprise',
  channel: 'direct',
  promoCode: 'SPRINGPREVIEW',
  lines: [
    { sku: 'suite-core', quantity: 1200, unitPrice: 45 },
    { sku: 'suite-analytics', quantity: 48, unitPrice: 120 },
    { sku: 'suite-integration', quantity: 12, unitPrice: 200 },
  ],
};

const formatCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: evaluationContext.currency,
});

const formatPercent = (value: number) => `${value}%`;

const evaluateSample = () => evaluateDiscounts(evaluationContext, discountRules);

const PricingRulesPageContent = () => {
  const evaluation = evaluateSample();

  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Shared platform</p>
        <h1 className="text-3xl font-semibold text-foreground">Pricing Rules Control Center</h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Govern price books, tier logic, and promotional playbooks that every ConfigPro module can reuse. Use this
          hub to coordinate revenue strategy, align with sales enablement, and surface the rule engine inputs shared
          across product teams.
        </p>
      </header>

      <section className="space-y-5">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Price lists</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Centralised catalogues with owner accountability, default markups, and enablement notes. Map regional and
            segment-specific behaviours without duplicating logic across product teams.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {priceLists.map((list) => (
            <article key={list.id} className="flex h-full flex-col justify-between rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{list.name}</h3>
                  <p className="text-sm text-muted-foreground">{list.description}</p>
                </div>
                <dl className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="font-medium text-foreground">Currency</dt>
                    <dd className="text-muted-foreground">{list.currency}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-foreground">Default markup</dt>
                    <dd className="text-muted-foreground">{formatPercent(Math.round(list.defaultMarkup * 100))}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="font-medium text-foreground">Segments</dt>
                    <dd className="text-muted-foreground">{list.segments.join(', ')}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="font-medium text-foreground">Steward</dt>
                    <dd className="text-muted-foreground">{list.steward}</dd>
                  </div>
                </dl>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {list.notes.map((note) => (
                  <li key={note} className="flex items-start gap-2">
                    <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Tiered pricing</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Visibility into breakpoints keeps deal desks and product squads aligned on automation costs. Tiers mirror
            the rule engine so real-time quoting stays accurate.
          </p>
        </header>

        <div className="space-y-6">
          {tieredPricingModels.map((model) => (
            <Card key={model.sku} className="space-y-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>{model.name}</CardTitle>
                  <CardDescription>SKU: {model.sku}</CardDescription>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div className="font-medium text-foreground">{formatCurrency.format(model.basePrice)} {model.measure}</div>
                  <div>Base rate before tier adjustments</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{model.insights}</p>

              <TableContainer>
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Threshold</TableHead>
                      <TableHead>Discount</TableHead>
                      <TableHead>Effective price</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {model.tiers.map((tier) => {
                      const effectivePrice = model.basePrice * (1 - tier.discount / 100);
                      return (
                        <TableRow key={`${model.sku}-${tier.threshold}`} className="bg-card">
                          <TableCell className="text-foreground">
                            {tier.threshold.toLocaleString()}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatPercent(tier.discount)}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {formatCurrency.format(effectivePrice)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Promotions &amp; campaign overlays</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Promotional logic is centralised so launch teams can activate incentives without redeploying product
            code. Pair each campaign with enablement and measurement plans.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {promoCampaigns.map((promo) => (
            <article key={promo.code} className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{promo.name}</h3>
                  <p className="text-sm text-muted-foreground">Code: {promo.code}</p>
                </div>
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {promo.window}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Eligible: {promo.eligible.join(', ')}
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {promo.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2">
                    <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Rule engine snapshot</h2>
          <p className="max-w-3xl text-sm text-muted-foreground">
            The evaluator below mirrors the shared discounts engine so GTM, product, and finance teams can validate
            stacking behaviour before publishing updates.
          </p>
        </header>

        <Card className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subtotal</div>
              <div className="text-lg font-semibold text-foreground">{formatCurrency.format(evaluation.subtotal)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total discount</div>
              <div className="text-lg font-semibold text-primary">-{formatCurrency.format(evaluation.totalDiscount)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total due</div>
              <div className="text-lg font-semibold text-foreground">{formatCurrency.format(evaluation.totalDue)}</div>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Promo code</div>
              <div className="text-sm text-muted-foreground">{evaluationContext.promoCode}</div>
            </div>
          </div>

          <TableContainer>
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Rule</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {evaluation.appliedDiscounts.map((entry) => (
                  <TableRow key={entry.ruleId} className="bg-card">
                    <TableCell className="text-foreground">{entry.name}</TableCell>
                    <TableCell className="text-muted-foreground">{entry.description}</TableCell>
                    <TableCell className="text-primary">
                      -{formatCurrency.format(entry.amount)}
                    </TableCell>
                  </TableRow>
                ))}
                {evaluation.appliedDiscounts.length === 0 ? (
                  <TableRow className="bg-card">
                    <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                      No discounts qualified for this scenario.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>

          <CardFooter className="text-xs text-muted-foreground">
            Pricing sample uses enterprise direct order from March 2024 with shared rule definitions. Update the shared
            engine to propagate behaviour across quoting surfaces.
          </CardFooter>
        </Card>
      </section>
    </div>
  );
};

const GuardedPricingRulesPage = () => (
  <RequirePermission perm="pricing.manage">
    <PricingRulesPageContent />
  </RequirePermission>
);

export const PricingRulesPage = GuardedPricingRulesPage;
export default GuardedPricingRulesPage;

export { PricingRulesPageContent };
