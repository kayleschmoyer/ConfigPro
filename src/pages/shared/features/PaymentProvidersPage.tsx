const gatewayBlueprints = [
  {
    id: 'stripe',
    name: 'Stripe',
    description:
      'Card acquiring plus alternative payment methods with an opinionated API surface. Ideal for rapid expansion teams who want unified reporting and dispute automation.',
    focusAreas: [
      'Segmented accounts that isolate marketplace, subscription, and in-person channels while sharing compliance policies.',
      'Event-driven reconciliation that fans out ledger adjustments and payout statuses to finance data stores.',
      'Adaptive 3DS and network tokenisation controls surfaced via ConfigPro guardrails.',
    ],
  },
  {
    id: 'adyen',
    name: 'Adyen',
    description:
      'Enterprise orchestration for global, in-person, and marketplace flows. Built for organisations standardising on unified commerce reporting.',
    focusAreas: [
      'Terminal fleet configuration that cascades firmware, tender routing, and settlement schedules.',
      'Multi-acquirer routing logic with failover policies owned in ConfigPro, deployed to Adyen\'s rule engine.',
      'Automated reconciliation hooks into treasury systems for same-day payout certainty.',
    ],
  },
  {
    id: 'checkout',
    name: 'Checkout.com',
    description:
      'Flexible acquiring with regional APM coverage and modular risk tooling. Serves digital-first merchants expanding into new markets.',
    focusAreas: [
      'Token vault synchronisation so customer wallets stay portable across commerce and billing experiences.',
      'Risk configuration templates that align fraud scoring with ConfigPro\'s customer lifecycle signals.',
      'Regional settlement calendars surfaced to finance teams with predictive cash flow alerts.',
    ],
  },
];

const controlPlaneCapabilities = [
  {
    title: 'Gateway lifecycle management',
    points: [
      'Single workspace to request credentials, store connection metadata, and track go-live readiness.',
      'Change management workflow with audit-ready approvals for remapping webhooks or rotating keys.',
      'Health signals piped to observability stack for incident routing and automatic failover.',
    ],
  },
  {
    title: 'Contract & compliance overlays',
    points: [
      'Surface contract constraints like region availability, MID allocations, or volume caps directly in configuration forms.',
      'Map PCI scope decisions, data residency, and encryption responsibilities to each provider connection.',
      'Generate attestation packages with last-rotated secrets, webhook monitoring, and settlement controls.',
    ],
  },
  {
    title: 'Reconciliation intelligence',
    points: [
      'Daily settlement feeds normalised into ConfigPro ledgers for finance automation.',
      'Exception queues that highlight chargebacks, mismatched payouts, or delayed settlements.',
      'Ledger sync connectors for ERP, billing, and analytics subscribers.',
    ],
  },
];

const launchChecklist = [
  {
    title: 'Credential readiness',
    items: [
      'Store test and live API keys with rotation cadences aligned to security policy.',
      'Map webhook endpoints with signature validation and replay protection toggled.',
      'Define provider capabilities (cards, wallets, local APMs) and assign ownership teams.',
    ],
  },
  {
    title: 'Operational guardrails',
    items: [
      'Set risk scoring thresholds and manual review queues connected to ConfigPro case tooling.',
      'Enable fallback routing logic with decision trees for downtime or error thresholds.',
      'Attach monitoring SLAs for authorisation rates, latency, and dispute ratios.',
    ],
  },
  {
    title: 'Finance alignment',
    items: [
      'Reconcile expected fees, settlement timing, and reserve policies with treasury stakeholders.',
      'Publish accounting mappings for fees, chargebacks, and refunds into ERP templates.',
      'Schedule pilot settlements with finance observers before full production launch.',
    ],
  },
];

export const PaymentProvidersPage = () => {
  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Shared platform</p>
        <h1 className="text-3xl font-semibold text-foreground">Payment provider control plane</h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Operationalise every acquiring partnership from a single ConfigPro workspace. These playbooks align product,
          finance, security, and operations teams on how gateways plug into fulfilment, billing, and customer
          experiences.
        </p>
      </header>

      <section aria-labelledby="gateway-blueprints" className="space-y-6">
        <header className="space-y-1">
          <h2 id="gateway-blueprints" className="text-xl font-semibold text-foreground">
            Gateway blueprints
          </h2>
          <p className="text-sm text-muted-foreground">
            Standardise what “good” looks like for leading providers so launches and expansions reuse proven patterns.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {gatewayBlueprints.map((gateway) => (
            <article
              key={gateway.id}
              className="flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-sm"
            >
              <header className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{gateway.name}</h3>
                <p className="text-sm text-muted-foreground">{gateway.description}</p>
              </header>

              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {gateway.focusAreas.map((area) => (
                  <li key={area} className="flex gap-2">
                    <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="control-plane" className="space-y-6">
        <header className="space-y-1">
          <h2 id="control-plane" className="text-xl font-semibold text-foreground">
            Control plane capabilities
          </h2>
          <p className="text-sm text-muted-foreground">
            Keep every gateway compliant, observable, and ready for global scale with consistent governance tooling.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {controlPlaneCapabilities.map((capability) => (
            <article key={capability.title} className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
              <h3 className="text-base font-semibold text-foreground">{capability.title}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {capability.points.map((point) => (
                  <li key={point} className="flex gap-2">
                    <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="launch-checklist" className="space-y-6">
        <header className="space-y-1">
          <h2 id="launch-checklist" className="text-xl font-semibold text-foreground">
            Launch readiness checklist
          </h2>
          <p className="text-sm text-muted-foreground">
            Align stakeholders and systems before switching traffic to production acquiring endpoints.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {launchChecklist.map((checklist) => (
            <article key={checklist.title} className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
              <h3 className="text-base font-semibold text-foreground">{checklist.title}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {checklist.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
