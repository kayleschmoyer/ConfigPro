const taxRegions = [
  {
    id: 'amer',
    title: 'Americas',
    description:
      'Blend U.S. state nexus, Canadian GST/HST, and Latin American electronic invoicing into a single governance program.',
    considerations: [
      'Map product tax codes to destination states and provinces with overrides for marketplace facilitators and digital goods.',
      'Automate state and local filing calendars with consolidated remittance schedules and audit-ready exports.',
      'Support jurisdiction-specific document requirements including SAT CFDI and Brazil NF-e schemas.',
    ],
  },
  {
    id: 'emea',
    title: 'EMEA',
    description:
      'Coordinate VAT registrations, OSS flows, and fiscal representation requirements across the European Union, UK, and Middle East.',
    considerations: [
      'Track VAT registration thresholds, distance selling triggers, and local establishment status per member state.',
      'Publish electronic reporting packages aligned with SAF-T, MTD, and digital invoice mandates.',
      'Surface foreign exchange treatments and rounding logic for multi-currency VAT settlements.',
    ],
  },
  {
    id: 'apac',
    title: 'APAC',
    description:
      'Unify GST, VAT, and consumption tax programs across Australia, New Zealand, Singapore, and rapidly evolving ASEAN markets.',
    considerations: [
      'Centralise customer location evidence and reverse charge determinations for cross-border digital services.',
      'Model low value goods, customs declarations, and import tax scenarios alongside domestic GST rules.',
      'Expose compliance status dashboards for inland revenue audits and periodic reconciliations.',
    ],
  },
];

const vatAndSalesTaxPrograms = [
  {
    title: 'Rate intelligence',
    items: [
      'Pluggable tax engines expose real-time rates, historical lookup, and holiday handling through a shared contract.',
      'Taxability matrices map product families to VAT, GST, or sales tax categories with effective dating support.',
      'Automated rounding, currency conversion, and inclusive/exclusive price handling remain consistent across channels.',
    ],
  },
  {
    title: 'Document lifecycle',
    items: [
      'Invoices, credit notes, and self-billing documents carry jurisdiction specific references and sequential numbering.',
      'Filing packs bundle transaction extracts, reconciliation summaries, and signature artefacts for every return.',
      'Event streams emit status changes to finance, ERP, and data warehouses for audit traceability.',
    ],
  },
  {
    title: 'Exception handling',
    items: [
      'Customer exemptions, reseller certificates, and VAT IDs are validated and stored with expiry tracking.',
      'B2B and B2C scenarios apply reverse charge, zero-rating, or reduced rates with explicit rule justification.',
      'Risk signals flag out-of-threshold transactions and high variance filings for pre-submission review.',
    ],
  },
];

const nexusGovernance = [
  {
    title: 'Discovery & monitoring',
    bullets: [
      'Aggregate sales, headcount, inventory, and click-through activity to evaluate economic nexus thresholds.',
      'Track physical presence changes from warehouses, pop-ups, or remote employees with jurisdiction alerts.',
      'Score nexus exposure and recommend registration actions with contextual policy guidance.',
    ],
  },
  {
    title: 'Registration workflow',
    bullets: [
      'Capture required legal entities, certificates, and power-of-attorney artefacts in a single request queue.',
      'Route tasks to tax, legal, and finance approvers with SLA tracking and integrated document storage.',
      'Sync registration IDs, effective dates, and filing frequencies back to downstream billing and ERP systems.',
    ],
  },
  {
    title: 'Lifecycle compliance',
    bullets: [
      'Continuously reconcile nexus status with transaction volumes to trigger de-registration or expansion playbooks.',
      'Maintain audit trails for nexus decisions, responsible parties, and supporting documentation.',
      'Expose dashboards highlighting renewal deadlines, bond requirements, and agency correspondences.',
    ],
  },
];

export const TaxRulesPage = () => {
  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Shared platform</p>
        <h1 className="text-3xl font-semibold text-foreground">Global tax rules foundation</h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Standardise how ConfigPro orchestrates tax calculations, registrations, and reporting across every region.
          Use these patterns to onboard pluggable tax engines while keeping compliance operations transparent.
        </p>
      </header>

      <section aria-labelledby="tax-regions" className="space-y-6">
        <header className="space-y-1">
          <h2 id="tax-regions" className="text-xl font-semibold text-foreground">
            Regional governance programs
          </h2>
          <p className="text-sm text-muted-foreground">
            Align tax obligations across shared regions with reusable controls for product, finance, and compliance
            teams.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {taxRegions.map((region) => (
            <article key={region.id} className="flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-sm">
              <header className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{region.title}</h3>
                <p className="text-sm text-muted-foreground">{region.description}</p>
              </header>

              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {region.considerations.map((item) => (
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

      <section aria-labelledby="vat-sales" className="space-y-6">
        <header className="space-y-1">
          <h2 id="vat-sales" className="text-xl font-semibold text-foreground">
            VAT and sales tax operating model
          </h2>
          <p className="text-sm text-muted-foreground">
            Keep calculations, documents, and exception handling consistent regardless of channel or jurisdiction.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {vatAndSalesTaxPrograms.map((program) => (
            <article key={program.title} className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
              <h3 className="text-base font-semibold text-foreground">{program.title}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {program.items.map((item) => (
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

      <section aria-labelledby="nexus-governance" className="space-y-6">
        <header className="space-y-1">
          <h2 id="nexus-governance" className="text-xl font-semibold text-foreground">
            Nexus governance toolkit
          </h2>
          <p className="text-sm text-muted-foreground">
            Detect, register, and maintain nexus obligations with traceable workflows and decision history.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {nexusGovernance.map((program) => (
            <article key={program.title} className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
              <h3 className="text-base font-semibold text-foreground">{program.title}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {program.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{bullet}</span>
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
