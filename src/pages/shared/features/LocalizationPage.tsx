const translationDomains = [
  {
    id: 'core-app',
    name: 'Core application',
    summary:
      'Strings that power navigation, layout chrome, and the shared feature catalogue. Managed with high review thresholds.',
    owners: ['Foundations UX', 'Tech Writing'],
    workflows: [
      'Source strings written in TypeScript/TSX with i18n keys generated via codemods.',
      'CI checks ensure fallbacks exist for all supported locales (en, de, fr, es).',
      'Weekly sync with localisation vendor to review pending changes and publish.',
    ],
  },
  {
    id: 'commerce',
    name: 'Commerce surfaces',
    summary:
      'Transactional copy for checkout, order tracking, and fulfilment notifications. Prioritise accuracy and compliance.',
    owners: ['Growth UX', 'Legal'],
    workflows: [
      'Strings versioned via Contentful with automatic snapshot exports into the monorepo.',
      'VAT/tax copy requires legal approval before entering translation workflow.',
      'Runtime toggles in ConfigPro select locale bundles per market rollout plan.',
    ],
  },
  {
    id: 'support',
    name: 'Support & help centre',
    summary:
      'Knowledge base articles, chat prompts, and macro templates. Heavy emphasis on tone and clarity.',
    owners: ['Support Ops'],
    workflows: [
      'Markdown sources stored in docs repo with locale directories.',
      'Machine translations seeded, then reviewed by native speakers in-market.',
      'Context packages supplied to LLM tooling for glossary-aware suggestions.',
    ],
  },
];

const localeGuardrails = [
  {
    title: 'Glossary & tone of voice',
    items: [
      'Single glossary service that exposes terminology, gender rules, and banned phrases via API.',
      'Tone profiles (formal, neutral, playful) applied per locale and experience type.',
      'Release gates prevent publishing strings without glossary coverage or reviewer sign-off.',
    ],
  },
  {
    title: 'Fallback & runtime strategy',
    items: [
      'Deterministic fallback chain: market locale → language → English.',
      'Missing string detector surfaces telemetry to localisation dashboards.',
      'Runtime flag ensures experiments declare supported locales before launch.',
    ],
  },
  {
    title: 'Accessibility & formatting',
    items: [
      'Direction metadata (LTR/RTL) shipped with every locale bundle.',
      'Screen reader annotations translated alongside visible copy.',
      'Date, number, and currency formats centralised in Intl config helpers.',
    ],
  },
];

const currencyConfigurations = [
  {
    code: 'USD',
    name: 'US Dollar',
    precision: 2,
    rounding: 'Standard banker\'s rounding with trailing zeros displayed.',
    regions: ['US', 'CA (USD stores)'],
  },
  {
    code: 'EUR',
    name: 'Euro',
    precision: 2,
    rounding: 'Round half up, spacing according to locale (comma decimal).',
    regions: ['EU markets', 'EEA partners'],
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    precision: 0,
    rounding: 'Whole unit pricing with optional ceremonial decimal display suppressed.',
    regions: ['JP storefronts'],
  },
  {
    code: 'AED',
    name: 'UAE Dirham',
    precision: 2,
    rounding: 'Cash rounding rules applied to 0.25 increments for cash-on-delivery.',
    regions: ['MENA expansion'],
  },
];

const formattingRules = [
  {
    id: 'numbers',
    title: 'Number formatting',
    description:
      'Provide consistent thousand separators, decimal symbols, and digit grouping per locale. Backed by Intl.NumberFormat wrappers.',
    specs: [
      'Compact notation thresholds for metrics dashboards (1K/1M) localised per language.',
      'Percentage formatting respects locale-specific spacing and symbol placement.',
      'Input sanitisation accepts locale-specific numerals before normalising to canonical form.',
    ],
  },
  {
    id: 'dates',
    title: 'Date & time formatting',
    description:
      'Centralise calendars, timezone offsets, and relative time copy in a shared provider.',
    specs: [
      'Support Gregorian and Hijri calendars with toggle per market rollout.',
      'Relative time phrases ("2 hours ago") sourced from i18n bundles with pluralisation rules.',
      'Timezone presentation defaults to customer preference; admin dashboards show organisation defaults.',
    ],
  },
  {
    id: 'pluralisation',
    title: 'Pluralisation & grammar',
    description:
      'Plural categories defined in ICU syntax with test coverage for zero, dual, and paucal forms.',
    specs: [
      'Unit formatters (items, hours, seats) reuse shared translation helpers.',
      'Validation pipeline catches interpolations missing placeholders per locale.',
      'QA scripts diff rendered copy snapshots to flag grammatical regressions.',
    ],
  },
];

export const LocalizationPage = () => {
  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Shared platform</p>
        <h1 className="text-3xl font-semibold text-foreground">Localization and internationalisation</h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Governance hub for language assets, currency handling, and locale-aware formatting. Use this
          as the single source of truth for how ConfigPro delivers globally consistent experiences.
        </p>
      </header>

      <section aria-labelledby="translation-domains" className="space-y-6">
        <header className="space-y-1">
          <h2 id="translation-domains" className="text-xl font-semibold text-foreground">
            Translation domains
          </h2>
          <p className="text-sm text-muted-foreground">
            Capture ownership, workflows, and rollout cadence for every localisation surface.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {translationDomains.map((domain) => (
            <article key={domain.id} className="flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-sm">
              <header className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{domain.name}</h3>
                <p className="text-sm text-muted-foreground">{domain.summary}</p>
              </header>

              <dl className="mt-4 space-y-3 text-sm">
                <div className="space-y-1">
                  <dt className="font-medium text-foreground">Owners</dt>
                  <dd className="text-muted-foreground">{domain.owners.join(', ')}</dd>
                </div>
                <div className="space-y-1">
                  <dt className="font-medium text-foreground">Workflow highlights</dt>
                  <dd>
                    <ul className="space-y-2 text-muted-foreground">
                      {domain.workflows.map((step) => (
                        <li key={step} className="flex gap-2">
                          <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="locale-guardrails" className="space-y-6">
        <header className="space-y-1">
          <h2 id="locale-guardrails" className="text-xl font-semibold text-foreground">
            Locale guardrails
          </h2>
          <p className="text-sm text-muted-foreground">
            Cross-cutting standards that every localisation release must satisfy before shipping.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {localeGuardrails.map((guardrail) => (
            <article key={guardrail.title} className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
              <h3 className="text-base font-semibold text-foreground">{guardrail.title}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {guardrail.items.map((item) => (
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

      <section aria-labelledby="currency-standards" className="space-y-6">
        <header className="space-y-1">
          <h2 id="currency-standards" className="text-xl font-semibold text-foreground">
            Currency standards
          </h2>
          <p className="text-sm text-muted-foreground">
            Document precision, rounding, and rollout rules for all supported tenders.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {currencyConfigurations.map((currency) => (
            <article key={currency.code} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <header className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-foreground">{currency.name}</h3>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{currency.code}</p>
                </div>
                <span className="text-sm font-medium text-muted-foreground">Precision: {currency.precision}</span>
              </header>

              <dl className="mt-4 space-y-3 text-sm text-muted-foreground">
                <div>
                  <dt className="font-medium text-foreground">Rounding</dt>
                  <dd>{currency.rounding}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">Regions</dt>
                  <dd>{currency.regions.join(', ')}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="formatting-rules" className="space-y-6">
        <header className="space-y-1">
          <h2 id="formatting-rules" className="text-xl font-semibold text-foreground">
            Number & date frameworks
          </h2>
          <p className="text-sm text-muted-foreground">
            Shared Intl utilities that guarantee consistent rendering for metrics, schedules, and user
            communications.
          </p>
        </header>

        <div className="space-y-6">
          {formattingRules.map((rule) => (
            <article key={rule.id} className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
              <header className="space-y-2">
                <h3 className="text-base font-semibold text-foreground">{rule.title}</h3>
                <p className="text-sm text-muted-foreground">{rule.description}</p>
              </header>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {rule.specs.map((spec) => (
                  <li key={spec} className="flex gap-2">
                    <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{spec}</span>
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

export default LocalizationPage;
