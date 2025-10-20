import { unitsOfMeasure, unitConversions } from './uom.data';

const attributePillars = [
  {
    id: 'items-services',
    title: 'Items & services',
    description:
      'Structure commercial offerings with governance for productized inventory, field services, and subscription catalogues.',
    focusAreas: [
      'Shared definitions that synchronise ERP, billing, commerce, and fulfilment',
      'Channel-ready merchandising metadata with localisation support',
      'Lifecycle statuses that gate availability, pricing, and bundling',
    ],
  },
  {
    id: 'variants',
    title: 'Variants & bundles',
    description:
      'Model size, configuration, and pricing permutations with deterministic rules that downstream systems can trust.',
    focusAreas: [
      'Attribute inheritance that keeps canonical data stable while variant overrides stay auditable',
      'Assortment templates to launch new lines without rebuilding compatibility rules',
      'Matrix-driven pricing that respects currency, region, and contract entitlements',
    ],
  },
  {
    id: 'custom-fields',
    title: 'Custom fields',
    description:
      'Unlock customer-specific metadata with lifecycle, validation, and privacy policies built into the platform.',
    focusAreas: [
      'Schema registry that validates data types, dependencies, and localisation',
      'Role-aware visibility and edit policies for internal teams and channel partners',
      'Change history with activation dates so analytics and finance stay aligned',
    ],
  },
];

const variantDimensions = [
  {
    title: 'Configuration matrices',
    items: [
      'Define option groups for colour, size, capacity, or service tier with guardrails that prevent incompatible selections.',
      'Automatically expand combinations into sellable SKUs ready for inventory, CPQ, and fulfilment systems.',
      'Reference shared units of measure to keep costing and logistics consistent across the network.',
    ],
  },
  {
    title: 'Eligibility & availability',
    items: [
      'Govern region, channel, or customer segment availability with reusable rulesets.',
      'Surface lead times, provisioning requirements, and contract dependencies inline for sales and partners.',
      'Trigger downstream workflow updates when availability or configuration rules change.',
    ],
  },
  {
    title: 'Pricing intelligence',
    items: [
      'Attach price books, discount fences, and indexing to master variants.',
      'Trace margin impact by variant via shared cost drivers and landed cost data.',
      'Publish pricing changes via event streams for commerce, billing, and analytics subscribers.',
    ],
  },
];

const customFieldPrograms = [
  {
    title: 'Schema operations',
    points: [
      'Central registry exposes approved field definitions, constraints, and owners.',
      'Versioning guards ensure updates propagate with data migrations where required.',
      'Validation adapters keep inbound integrations aligned with approved data types.',
    ],
  },
  {
    title: 'Lifecycle governance',
    points: [
      'Activation windows coordinate launch, sunset, and archival policies across connected systems.',
      'Consent-aware policies flag fields containing customer or regulatory sensitive information.',
      'Field usage analytics show where metadata powers workflows, automation, or insights.',
    ],
  },
  {
    title: 'Collaboration & access',
    points: [
      'Role-aware permissions limit creation, editing, and reporting to authorised teams.',
      'Approval routing captures business justification and technical impact before changes deploy.',
      'Guided templates help customers extend catalog data without risking schema drift.',
    ],
  },
];

export const CatalogAttributesPage = () => {
  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Shared platform</p>
        <h1 className="text-3xl font-semibold text-foreground">Catalog attribute foundation</h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Standardise every item, service, and bundle configuration so sales, operations, finance, and customer
          experiences rely on the same trusted source of product truth. Use these pillars to capture the metadata each
          downstream system expects without duplicative effort.
        </p>
      </header>

      <section aria-labelledby="catalog-pillars" className="space-y-6">
        <header className="space-y-1">
          <h2 id="catalog-pillars" className="text-xl font-semibold text-foreground">
            Attribute pillars
          </h2>
          <p className="text-sm text-muted-foreground">
            Ground the catalog in consistent definitions that can be extended safely across industries and customer
            segments.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {attributePillars.map((pillar) => (
            <article key={pillar.id} className="flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-sm">
              <header className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground">{pillar.description}</p>
              </header>

              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {pillar.focusAreas.map((area) => (
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

      <section aria-labelledby="variant-operations" className="space-y-6">
        <header className="space-y-1">
          <h2 id="variant-operations" className="text-xl font-semibold text-foreground">
            Variant operations playbook
          </h2>
          <p className="text-sm text-muted-foreground">
            Coordinate configuration intelligence so every permutation remains compliant with supply, pricing, and service
            commitments.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {variantDimensions.map((dimension) => (
            <article key={dimension.title} className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
              <h3 className="text-base font-semibold text-foreground">{dimension.title}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {dimension.items.map((item) => (
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

      <section aria-labelledby="custom-fields" className="space-y-6">
        <header className="space-y-1">
          <h2 id="custom-fields" className="text-xl font-semibold text-foreground">
            Custom field programs
          </h2>
          <p className="text-sm text-muted-foreground">
            Extend catalog data with governed schemas and transparent change control so customer-specific requirements remain
            sustainable.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {customFieldPrograms.map((program) => (
            <article key={program.title} className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
              <h3 className="text-base font-semibold text-foreground">{program.title}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {program.points.map((point) => (
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

      <section aria-labelledby="units-of-measure" className="space-y-6">
        <header className="space-y-1">
          <h2 id="units-of-measure" className="text-xl font-semibold text-foreground">
            Units of measure foundation
          </h2>
          <p className="text-sm text-muted-foreground">
            Reuse the shared measurement catalogue to align costing, logistics, and revenue recognition across teams.
          </p>
        </header>

        <div className="space-y-8">
          <div className="grid gap-5 md:grid-cols-2">
            {unitsOfMeasure.map((family) => (
              <article key={family.id} className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
                <header className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{family.family}</p>
                  <h3 className="text-base font-semibold text-foreground">Base unit: {family.baseUnit}</h3>
                  <p className="text-sm text-muted-foreground">{family.description}</p>
                </header>

                <ul className="space-y-2 text-sm text-muted-foreground">
                  {family.units.map((unit) => (
                    <li key={unit.id} className="rounded-md border border-dashed border-border/60 bg-muted/40 p-3">
                      <div className="flex items-center justify-between text-foreground">
                        <span className="font-medium">{unit.name}</span>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">{unit.symbol}</span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{unit.description}</p>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
            <header className="space-y-1">
              <h3 className="text-base font-semibold text-foreground">Standard conversion references</h3>
              <p className="text-sm text-muted-foreground">
                Apply consistent conversion logic across forecasting, costing, and billing by centralising the formulas that
                govern unit interoperability.
              </p>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
              {unitConversions.map((conversion) => (
                <article key={conversion.id} className="rounded-md border border-dashed border-border/60 bg-muted/40 p-4">
                  <h4 className="text-sm font-semibold text-foreground">
                    {conversion.from} → {conversion.to}
                  </h4>
                  <p className="mt-2 text-xs text-muted-foreground">Formula: {conversion.formula}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{conversion.notes}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

