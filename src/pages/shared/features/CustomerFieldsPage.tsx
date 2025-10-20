import { loyaltyRulebook } from './loyalty.rules';

interface CustomFieldDefinition {
  key: string;
  label: string;
  dataType: string;
  requirement: 'Mandatory' | 'Optional' | 'Derived';
  usage: string;
  surfaces: string[];
  retention: string;
  consentGate?: string;
}

interface FieldCollection {
  id: string;
  title: string;
  steward: string;
  description: string;
  fields: CustomFieldDefinition[];
  handoffs: string[];
}

interface ConsentRecord {
  id: string;
  name: string;
  purpose: string;
  legalBasis: string;
  defaultState: 'Opt-in' | 'Opt-out' | 'System required';
  renewalCadence: string;
  captureSurfaces: string[];
  linkedSystems: string[];
}

interface PreferenceSurface {
  id: string;
  surface: string;
  experience: string;
  cohorts: string[];
  captures: string[];
  syncsWith: string[];
  notes: string;
}

interface GovernancePillar {
  id: string;
  title: string;
  summary: string;
  guardrails: string[];
}

interface ConsentLifecycleStage {
  stage: string;
  focus: string;
  rituals: string[];
}

const fieldCollections: FieldCollection[] = [
  {
    id: 'identity-graph',
    title: 'Identity graph foundation',
    steward: 'Customer Data Platform',
    description:
      'Normalised profile spine that anchors every ConfigPro guest experience, powering authentication, loyalty, and service workflows.',
    handoffs: ['Identity resolution jobs nightly', 'Service console profile summary', 'POS and concierge check-in'],
    fields: [
      {
        key: 'preferred_name',
        label: 'Preferred name',
        dataType: 'Short text',
        requirement: 'Mandatory',
        usage: 'Surface-friendly salutation shown on receipts, notifications, and concierge tablets.',
        surfaces: ['Account profile', 'Mobile app onboarding', 'Service console'],
        retention: 'Life of active relationship',
        consentGate: 'Profile & account terms',
      },
      {
        key: 'communication_language',
        label: 'Communication language',
        dataType: 'Picklist',
        requirement: 'Mandatory',
        usage: 'Controls template locale, SMS routing, and agent scripting.',
        surfaces: ['Profile settings', 'Care agent workspace'],
        retention: 'Life of active relationship',
        consentGate: 'Communications preference center',
      },
      {
        key: 'relationship_owner',
        label: 'Relationship owner',
        dataType: 'Reference (user)',
        requirement: 'Derived',
        usage: 'Links to assigned concierge or CSM to drive alerts and playbooks.',
        surfaces: ['Service console', 'Executive briefing reports'],
        retention: 'Retained while account is segmented',
      },
      {
        key: 'identity_confidence',
        label: 'Identity confidence score',
        dataType: 'Decimal (0-1)',
        requirement: 'Derived',
        usage: 'Identity resolution confidence for merging and fraud signals.',
        surfaces: ['Identity operations dashboard', 'Fraud analytics'],
        retention: 'Rolling 24 months',
      },
    ],
  },
  {
    id: 'experience-signals',
    title: 'Experience signal extensions',
    steward: 'Experience Design Research',
    description:
      'Optional fields that unlock proactive service and dynamic content when guests opt into richer storytelling.',
    handoffs: ['Journey orchestration platform', 'Retail associate companion app', 'Lifecycle marketing segmentation'],
    fields: [
      {
        key: 'style_persona',
        label: 'Style persona',
        dataType: 'Multiselect picklist',
        requirement: 'Optional',
        usage: 'Drives content blocks, bundle recommendations, and lookbook ordering.',
        surfaces: ['Preference quiz', 'Associate companion'],
        retention: '18 months from last interaction',
        consentGate: 'Personalisation consent',
      },
      {
        key: 'accessibility_needs',
        label: 'Accessibility considerations',
        dataType: 'Rich text',
        requirement: 'Optional',
        usage: 'Ensures events, deliveries, and in-store visits respect guest needs.',
        surfaces: ['Account profile', 'Clienteling intake form'],
        retention: 'Until request for deletion',
        consentGate: 'Service accommodation acknowledgement',
      },
      {
        key: 'loyalty_currency_wallet',
        label: `${loyaltyRulebook.currencyLabel} wallet ID`,
        dataType: 'Reference (loyalty system)',
        requirement: 'Derived',
        usage: 'Links to unified loyalty balance, instant redemption eligibility, and concierge gifting.',
        surfaces: ['Profile header', 'Checkout', 'Associate companion'],
        retention: 'Life of loyalty account',
      },
    ],
  },
  {
    id: 'trust-consent',
    title: 'Trust & consent markers',
    steward: 'Privacy & Compliance Office',
    description:
      'Regulated consent proofs with downstream webhooks to marketing, support, and analytics stacks.',
    handoffs: ['Consent ledger', 'Marketing automation', 'Data warehouse consent dimension'],
    fields: [
      {
        key: 'marketing_consent_status',
        label: 'Marketing consent status',
        dataType: 'Picklist',
        requirement: 'Mandatory',
        usage: 'Determines eligibility for promotional messages across channels.',
        surfaces: ['Preference center', 'POS consent capture'],
        retention: '7 years (auditable history)',
        consentGate: 'Marketing communications',
      },
      {
        key: 'data_processing_basis',
        label: 'Processing legal basis',
        dataType: 'Picklist',
        requirement: 'Derived',
        usage: 'Maps consent reason (contract, legitimate interest, explicit consent).',
        surfaces: ['Compliance audit reports'],
        retention: '7 years (auditable history)',
      },
      {
        key: 'consent_timestamp',
        label: 'Last consent timestamp',
        dataType: 'DateTime',
        requirement: 'Derived',
        usage: 'Signals when re-permissioning journeys should fire.',
        surfaces: ['Lifecycle automation', 'Compliance dashboards'],
        retention: '7 years (auditable history)',
      },
    ],
  },
];

const consentRegistry: ConsentRecord[] = [
  {
    id: 'marketing',
    name: 'Marketing communications',
    purpose: 'Email, SMS, and in-app marketing journeys with dynamic content.',
    legalBasis: 'Consent (GDPR Art. 6a)',
    defaultState: 'Opt-in',
    renewalCadence: '24 months with inactivity triggers at 12 months',
    captureSurfaces: ['Web preference center', 'Checkout POS', 'Mobile onboarding'],
    linkedSystems: ['Iterable', 'Twilio', 'Braze', 'Data warehouse consent dimension'],
  },
  {
    id: 'personalisation',
    name: 'Experience personalisation',
    purpose: 'Adaptive merchandising, concierge scripting, and loyalty offers.',
    legalBasis: 'Consent (GDPR Art. 6a)',
    defaultState: 'Opt-in',
    renewalCadence: '12 months or upon major product changes',
    captureSurfaces: ['Preference quiz', 'Associate companion', 'Email preference center'],
    linkedSystems: ['Journey orchestration', 'Associate companion', 'Feature flag service'],
  },
  {
    id: 'analytics',
    name: 'Product analytics & telemetry',
    purpose: 'Aggregate analytics, experimentation, and anomaly detection.',
    legalBasis: 'Legitimate interest with opt-out (GDPR Art. 6f)',
    defaultState: 'Opt-out',
    renewalCadence: 'Rolling review each fiscal year',
    captureSurfaces: ['Web cookie banner', 'Mobile app settings'],
    linkedSystems: ['Segment CDP', 'Amplitude', 'Data warehouse event stream'],
  },
  {
    id: 'service-recording',
    name: 'Service interaction recording',
    purpose: 'Quality assurance for voice, chat, and video support encounters.',
    legalBasis: 'Consent (GDPR Art. 6a) with regional exceptions',
    defaultState: 'Opt-in',
    renewalCadence: 'At each interaction when local regulations require',
    captureSurfaces: ['Contact center IVR', 'Service console prompt'],
    linkedSystems: ['Contact center platform', 'Quality assurance tooling'],
  },
];

const preferenceSurfaces: PreferenceSurface[] = [
  {
    id: 'profile',
    surface: 'Web & app profile',
    experience: 'Self-serve preference center embedded in account settings.',
    cohorts: ['All registered guests'],
    captures: ['Communication language', 'Marketing opt-in', 'Preferred channels'],
    syncsWith: ['Customer data platform', 'Marketing automation', 'Consent ledger'],
    notes: 'Real-time API updates ensure downstream orchestration is instantaneous.',
  },
  {
    id: 'concierge',
    surface: 'Concierge handheld',
    experience: 'Guided intake for in-person visits with consent capture and quick toggles.',
    cohorts: ['High-touch loyalty', 'VIP events'],
    captures: ['Accessibility considerations', 'Event reminders', 'Recording consent'],
    syncsWith: ['Service console', 'Consent ledger', 'Journey orchestration'],
    notes: 'Offline mode batches consent payloads for upload within 15 minutes.',
  },
  {
    id: 'post-purchase',
    surface: 'Post-purchase survey',
    experience: 'Transactional survey with progressive profiling prompts.',
    cohorts: ['Recent purchasers', 'Fulfillment service tickets'],
    captures: ['Style persona', 'Product affinity tags', 'Feedback consent'],
    syncsWith: ['Experience research repository', 'Analytics lakehouse'],
    notes: 'Survey completion writes to CDP with attribution for journey experimentation.',
  },
];

const governancePillars: GovernancePillar[] = [
  {
    id: 'minimisation',
    title: 'Data minimisation & stewardship',
    summary: 'Collect only what is necessary and ensure a clear steward is accountable for care and lifecycle.',
    guardrails: [
      'Each field requires a defined product owner and documented retention policy.',
      'Quarterly access reviews by Privacy Office for systems storing consent-linked fields.',
      'Automated redaction of free-form inputs after 18 months if no renewed consent.',
    ],
  },
  {
    id: 'lineage',
    title: 'Lineage & downstream visibility',
    summary: 'Make movement of fields observable across warehouses, SaaS tools, and service endpoints.',
    guardrails: [
      'Field lineage catalog maintained in the data governance workspace with change history.',
      'Streaming consent updates emit to Kafka topics with replay support for downstream tools.',
      'Every consuming team documents how the field impacts decisions or experience surfaces.',
    ],
  },
  {
    id: 'rights',
    title: 'Guest rights & fulfillment',
    summary: 'Ensure right-to-access, rectification, and erasure requests complete within SLA.',
    guardrails: [
      'DSAR automation triggers purge workflows across profile spine and archives.',
      'Guests can self-service download a machine-readable profile snapshot.',
      'Edge caches and CDN personalization keys expire within 24 hours of deletion.',
    ],
  },
];

const consentLifecycle: ConsentLifecycleStage[] = [
  {
    stage: 'Capture',
    focus: 'Progressive capture that balances clarity with conversion.',
    rituals: [
      'Use plain-language summaries with expandable legal copy for every request.',
      'Capture channel-specific consent in-line with the experience to avoid confusion.',
      'Provide immediate confirmation receipts with timestamp and steward contact.',
    ],
  },
  {
    stage: 'Sync',
    focus: 'Reliable propagation to every downstream system within SLA.',
    rituals: [
      'Publish consent updates to the event bus with idempotent payloads.',
      'Contract tests enforce schema stability before releasing new consent types.',
      'Monitor propagation dashboards for lag across marketing, analytics, and service platforms.',
    ],
  },
  {
    stage: 'Renew & expire',
    focus: 'Stay ahead of regulatory timelines and guest expectations.',
    rituals: [
      'Trigger re-permissioning journeys 60 days before expiry windows.',
      'Archive withdrawn consent evidence for the regulatory retention period.',
      'Alert customer teams when high-value guests lapse so outreach can be personalised.',
    ],
  },
];

export const CustomerFieldsPage = () => {
  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Shared platform</p>
        <h1 className="text-3xl font-semibold text-foreground">Customer Fields &amp; Consent Registry</h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Canonical reference for profile attributes, consent primitives, and the stewardship rituals that
          protect guest trust. Use this library to coordinate implementations across marketing, service,
          loyalty, and analytics teams.
        </p>
      </header>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Field collections &amp; stewards</h2>
          <p className="text-sm text-muted-foreground">
            Detailed documentation for each profile collection, the steward accountable for lifecycle,
            and downstream systems consuming the data.
          </p>
        </header>

        <div className="space-y-5">
          {fieldCollections.map((collection) => (
            <div key={collection.id} className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">{collection.title}</h3>
                  <p className="text-sm text-muted-foreground">{collection.description}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Steward:</span> {collection.steward}
                  </p>
                </div>
                <div className="space-y-1 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
                  <p className="font-semibold uppercase tracking-wide text-foreground">Key handoffs</p>
                  <ul className="space-y-1">
                    {collection.handoffs.map((handoff) => (
                      <li key={handoff} className="list-disc pl-4">
                        {handoff}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full divide-y divide-border text-left text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 font-semibold text-foreground">Field</th>
                      <th className="px-3 py-2 font-semibold text-foreground">Data type</th>
                      <th className="px-3 py-2 font-semibold text-foreground">Requirement</th>
                      <th className="px-3 py-2 font-semibold text-foreground">Usage</th>
                      <th className="px-3 py-2 font-semibold text-foreground">Surfaces</th>
                      <th className="px-3 py-2 font-semibold text-foreground">Retention</th>
                      <th className="px-3 py-2 font-semibold text-foreground">Consent gate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {collection.fields.map((field) => (
                      <tr key={field.key} className="align-top">
                        <td className="px-3 py-2">
                          <div className="font-medium text-foreground">{field.label}</div>
                          <div className="text-xs uppercase tracking-wide text-muted-foreground">{field.key}</div>
                        </td>
                        <td className="px-3 py-2 text-sm text-muted-foreground">{field.dataType}</td>
                        <td className="px-3 py-2 text-sm text-muted-foreground">{field.requirement}</td>
                        <td className="px-3 py-2 text-sm text-muted-foreground">{field.usage}</td>
                        <td className="px-3 py-2 text-sm text-muted-foreground">{field.surfaces.join(', ')}</td>
                        <td className="px-3 py-2 text-sm text-muted-foreground">{field.retention}</td>
                        <td className="px-3 py-2 text-sm text-muted-foreground">{field.consentGate ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Consent catalog &amp; legal posture</h2>
          <p className="text-sm text-muted-foreground">
            Track every consent primitive, associated legal basis, and the downstream systems that must
            honour revocation events.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {consentRegistry.map((consent) => (
            <article key={consent.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <header className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">{consent.name}</h3>
                <p className="text-sm text-muted-foreground">{consent.purpose}</p>
              </header>
              <dl className="mt-4 space-y-2 text-sm text-muted-foreground">
                <div>
                  <dt className="font-semibold text-foreground">Legal basis</dt>
                  <dd>{consent.legalBasis}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Default state</dt>
                  <dd>{consent.defaultState}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Renewal cadence</dt>
                  <dd>{consent.renewalCadence}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Capture surfaces</dt>
                  <dd>{consent.captureSurfaces.join(', ')}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Linked systems</dt>
                  <dd>{consent.linkedSystems.join(', ')}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Preference capture surfaces</h2>
          <p className="text-sm text-muted-foreground">
            Ensure every capture surface publishes the same schema, enforces validation, and confirms
            which cohorts are eligible.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-3">
          {preferenceSurfaces.map((surface) => (
            <article key={surface.id} className="flex flex-col justify-between rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{surface.surface}</h3>
                <p className="text-sm text-muted-foreground">{surface.experience}</p>
              </div>
              <dl className="mt-4 space-y-2 text-xs text-muted-foreground">
                <div>
                  <dt className="font-semibold text-foreground">Cohorts</dt>
                  <dd>{surface.cohorts.join(', ')}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Captures</dt>
                  <dd>{surface.captures.join(', ')}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-foreground">Syncs with</dt>
                  <dd>{surface.syncsWith.join(', ')}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-muted-foreground">{surface.notes}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Governance guardrails</h2>
          <p className="text-sm text-muted-foreground">
            Rituals that keep consent, retention, and guest rights at the center of how data is used.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {governancePillars.map((pillar) => (
            <article key={pillar.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <header className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">{pillar.title}</h3>
                <p className="text-sm text-muted-foreground">{pillar.summary}</p>
              </header>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {pillar.guardrails.map((guardrail) => (
                  <li key={guardrail} className="list-disc pl-4">
                    {guardrail}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Consent lifecycle ceremonies</h2>
          <p className="text-sm text-muted-foreground">
            Anchor operating rhythms that ensure every consent remains fresh, traceable, and actionable.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {consentLifecycle.map((stage) => (
            <article key={stage.stage} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <header className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">{stage.stage}</h3>
                <p className="text-sm text-muted-foreground">{stage.focus}</p>
              </header>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {stage.rituals.map((ritual) => (
                  <li key={ritual} className="list-disc pl-4">
                    {ritual}
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
