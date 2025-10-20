import {
  strategicSuppliers,
  supplierPerformanceKpis,
  supplierPartnershipPrograms,
} from './suppliers.data';

const stockPolicyFrameworks = [
  {
    id: 'multi-echelon',
    title: 'Multi-echelon governance',
    description:
      'Orchestrate stock policies across central warehouses, regional hubs, and stores so every node knows its guardrails.',
    guardrails: [
      'Align max/min levels to service-level objectives that factor dwell time and customer promise windows.',
      'Flow bulk replenishment to hubs while stores focus on high-velocity unit turns and emergency safety stock.',
      'Auto-freeze reorder plans when quality incidents or supplier holds trigger escalation paths.',
    ],
  },
  {
    id: 'category-playbooks',
    title: 'Category-specific playbooks',
    description:
      'Codify how perishables, equipment, and consumables behave so planners can tune reorder logic without guesswork.',
    guardrails: [
      'Perishables reference demand sensing signals and shrink allowances to keep freshness above SLA.',
      'Repair components anchor to install base telemetry, open work orders, and warranty coverage.',
      'Consumables leverage promotion calendars, store traffic forecasts, and packaging trials.',
    ],
  },
  {
    id: 'compliance-controls',
    title: 'Compliance & audit controls',
    description:
      'Give risk and finance teams line of sight into policy changes, approvals, and exceptions.',
    guardrails: [
      'Dual-approval workflow for any override that increases on-hand value beyond threshold.',
      'Immutable audit log surfaces policy history, owner, and supporting justification.',
      'Automated notifications keep auditors informed when safety stock is dipped below critical floor.',
    ],
  },
];

const reorderPointBlueprints = [
  {
    skuFamily: 'Nitro cold brew kegs',
    nodeFocus: 'Regional cold chain hubs',
    reorderTrigger: 'Projected 10 days of cover remaining based on multi-source demand inputs.',
    safetyStock: 'Minimum 2 days of cover reserved for taproom outages and events.',
    monitoring: 'IoT keg telemetry plus store pull-through pacing feeds.',
  },
  {
    skuFamily: 'Brew controller motherboards',
    nodeFocus: 'Central repair depot',
    reorderTrigger: 'Lead time adjusted reorder point = (daily usage × 21 days) + install base predictive failures.',
    safetyStock: 'Emergency reserve sized for top 5% of outage scenarios validated with field service.',
    monitoring: 'Case management integration to flag spikes in warranty replacements.',
  },
  {
    skuFamily: 'Compostable drinkware',
    nodeFocus: 'Stores with beverage programmes',
    reorderTrigger: 'Daily sales velocity × 7 day cycle with promo uplift coefficient.',
    safetyStock: 'Two-shift buffer to cover pop-up events or marketing pushes.',
    monitoring: 'POS sell-through matched against packaging waste analytics.',
  },
];

const replenishmentCadences = [
  {
    title: 'Weekly replenishment sync',
    summary:
      'Cross-functional review to reconcile forecast adjustments, supplier constraints, and regional promotions.',
    agenda: [
      'Review OTIF trends and supplier risk signals impacting the next three weeks.',
      'Align stock policy changes with financial guardrails and working capital targets.',
      'Approve prioritized expedite requests and document follow-up actions.',
    ],
  },
  {
    title: 'Daily control tower huddle',
    summary: 'Short stand-up to triage alerts from inventory telemetry and store feedback loops.',
    agenda: [
      'Validate overnight replenishment execution and identify any incomplete transfers.',
      'Escalate low-safety-stock locations with supplier ETA exceptions.',
      'Capture learnings for inclusion in rolling forecast adjustments.',
    ],
  },
  {
    title: 'Quarterly design review',
    summary:
      'Strategic forum to revisit policy assumptions, lead time modelling, and capacity investments.',
    agenda: [
      'Benchmark reorder parameters against industry peers and partner benchmarks.',
      'Update segmentation models that feed demand, supply, and working capital scenarios.',
      'Confirm roadmap for automation, telemetry, and supplier integration enhancements.',
    ],
  },
];

export const InventorySettingsPage = () => {
  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Shared platform</p>
        <h1 className="text-3xl font-semibold text-foreground">Inventory settings & supplier alignment</h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Establish the reusable operating policies that guide how ConfigPro orchestrates stock positions, reorder
          automation, and supplier partnerships. These guardrails keep service levels predictable while preserving
          working capital discipline.
        </p>
      </header>

      <section aria-labelledby="stock-policies" className="space-y-6">
        <header className="space-y-1">
          <h2 id="stock-policies" className="text-xl font-semibold text-foreground">
            Stock policy frameworks
          </h2>
          <p className="text-sm text-muted-foreground">
            Referenceable programs that inform every module on how inventory should be buffered, reviewed, and escalated.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {stockPolicyFrameworks.map((framework) => (
            <article key={framework.id} className="flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-sm">
              <header className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{framework.title}</h3>
                <p className="text-sm text-muted-foreground">{framework.description}</p>
              </header>

              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {framework.guardrails.map((guardrail) => (
                  <li key={guardrail} className="flex gap-2">
                    <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{guardrail}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="reorder-points" className="space-y-6">
        <header className="space-y-1">
          <h2 id="reorder-points" className="text-xl font-semibold text-foreground">
            Reorder point blueprints
          </h2>
          <p className="text-sm text-muted-foreground">
            Apply these templates when configuring automation so reorder signals align to demand behaviour, lead times,
            and resiliency expectations.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {reorderPointBlueprints.map((blueprint) => (
            <article key={blueprint.skuFamily} className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
              <header className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">{blueprint.skuFamily}</h3>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{blueprint.nodeFocus}</p>
              </header>
              <dl className="space-y-3 text-sm text-muted-foreground">
                <div>
                  <dt className="font-medium text-foreground">Reorder trigger</dt>
                  <dd>{blueprint.reorderTrigger}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Safety stock posture</dt>
                  <dd>{blueprint.safetyStock}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Monitoring inputs</dt>
                  <dd>{blueprint.monitoring}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="replenishment-ceremonies" className="space-y-6">
        <header className="space-y-1">
          <h2 id="replenishment-ceremonies" className="text-xl font-semibold text-foreground">
            Replenishment operating cadence
          </h2>
          <p className="text-sm text-muted-foreground">
            Rituals that keep planners, finance, and supplier managers aligned on the most current inventory posture.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {replenishmentCadences.map((cadence) => (
            <article key={cadence.title} className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
              <header className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">{cadence.title}</h3>
                <p className="text-sm text-muted-foreground">{cadence.summary}</p>
              </header>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {cadence.agenda.map((item) => (
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

      <section aria-labelledby="supplier-insights" className="space-y-6">
        <header className="space-y-1">
          <h2 id="supplier-insights" className="text-xl font-semibold text-foreground">
            Supplier intelligence & lead times
          </h2>
          <p className="text-sm text-muted-foreground">
            Pair inventory settings with the supplier context they depend on so exceptions route to the right partners.
          </p>
        </header>

        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {strategicSuppliers.map((supplier) => (
              <article key={supplier.id} className="space-y-4 rounded-lg border border-border bg-card p-5 shadow-sm">
                <header className="space-y-1">
                  <h3 className="text-lg font-semibold text-foreground">{supplier.name}</h3>
                  <p className="text-sm text-muted-foreground">{supplier.category}</p>
                  <p className="text-xs text-muted-foreground">{supplier.coverage}</p>
                </header>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Lead times</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {supplier.leadTimes.map((leadTime) => (
                      <li key={`${supplier.id}-${leadTime.skuFamily}`} className="rounded-md border border-border/60 bg-muted/30 p-3">
                        <p className="text-sm font-medium text-foreground">{leadTime.skuFamily}</p>
                        <p>Standard: {leadTime.standard}</p>
                        {leadTime.expedited ? <p>Expedited: {leadTime.expedited}</p> : null}
                        {leadTime.notes ? <p className="text-xs">{leadTime.notes}</p> : null}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Collaboration practices</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {supplier.collaborationPractices.map((practice) => (
                      <li key={practice} className="flex gap-2">
                        <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{practice}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Risk signals</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {supplier.riskSignals.map((signal) => (
                      <li key={signal} className="flex gap-2">
                        <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-destructive/80" />
                        <span>{signal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          <section aria-labelledby="supplier-kpis" className="space-y-4">
            <header className="space-y-1">
              <h3 id="supplier-kpis" className="text-lg font-semibold text-foreground">
                Supplier performance scorecard
              </h3>
              <p className="text-sm text-muted-foreground">
                Embed these KPIs into analytics and alerts so deviations from plan are visible instantly.
              </p>
            </header>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {supplierPerformanceKpis.map((kpi) => (
                <article key={kpi.metric} className="space-y-3 rounded-lg border border-border bg-card p-4 shadow-sm">
                  <h4 className="text-sm font-semibold text-foreground">{kpi.metric}</h4>
                  <p className="text-sm text-muted-foreground">{kpi.definition}</p>
                  <p className="text-xs font-medium text-foreground">Target: {kpi.target}</p>
                  <p className="text-xs text-muted-foreground">Instrumentation: {kpi.instrumentation}</p>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="supplier-programs" className="space-y-4">
            <header className="space-y-1">
              <h3 id="supplier-programs" className="text-lg font-semibold text-foreground">
                Partnership programmes
              </h3>
              <p className="text-sm text-muted-foreground">
                Operational toolkits for teams coordinating with vendors during escalations or strategic planning.
              </p>
            </header>
            <div className="grid gap-4 md:grid-cols-3">
              {supplierPartnershipPrograms.map((program) => (
                <article key={program.id} className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
                  <header className="space-y-1">
                    <h4 className="text-base font-semibold text-foreground">{program.title}</h4>
                    <p className="text-sm text-muted-foreground">{program.focus}</p>
                  </header>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {program.playbook.map((item) => (
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
      </section>
    </div>
  );
};
