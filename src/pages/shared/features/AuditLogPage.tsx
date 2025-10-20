import { consentLifecycle, consentPrimitives, consentSignalChannels } from './privacy.consents';

const auditEventDimensions = [
  {
    id: 'who',
    label: 'Who',
    summary: 'Precise actor identity with support for workforce, partner, and system identities.',
    capture: [
      'Workforce ID, partner ID, or service account fingerprint resolved through ConfigPro IAM.',
      'Session context with device posture, client certificate, and geolocation hints.',
      'Delegation trail including approver references for just-in-time access.',
    ],
    instrumentation: ['Identity Service', 'Session Intelligence', 'ConfigPro Directory'],
  },
  {
    id: 'what',
    label: 'What',
    summary: 'Resource and action cataloged with schema-aware payload snapshots.',
    capture: [
      'CRUD verb, feature module, and resource identifier (org, location, policy, transaction).',
      'Pre- and post-state diff stored as redacted JSON patch for sensitive fields.',
      'Linked consent primitive or policy ID when the action touches privacy scope.',
    ],
    instrumentation: ['Audit Event Bus', 'Config Store Change Feed', 'Privacy Tagger'],
  },
  {
    id: 'when',
    label: 'When',
    summary: 'Tamper-evident timing with region-aware retention clocks.',
    capture: [
      'Coordinated timestamp with millisecond precision and timezone offset.',
      'Processing duration and downstream replication SLA status.',
      'Retention tier assignment (hot, warm, cold) resolved at write-time.',
    ],
    instrumentation: ['Chronicle Service', 'Regional Clock Sync', 'Retention Orchestrator'],
  },
  {
    id: 'where',
    label: 'Where',
    summary: 'Surface, environment, and network metadata for forensic replay.',
    capture: [
      'Application surface (web, mobile, API) with version and deployment ring.',
      'Ingress IP, ASN, and facility as resolved by the network telemetry spine.',
      'Data residency region plus cross-border replication entitlements.',
    ],
    instrumentation: ['Edge Gateway', 'Network Telemetry', 'Residency Router'],
  },
];

const retentionTiers = [
  {
    id: 'hot',
    title: 'Hot path (0–90 days)',
    objectives: [
      'Real-time investigations and SOC alert enrichment.',
      'UI access for customer success and trust engineers within seconds.',
      'Streaming replication into SIEM and anomaly detectors.',
    ],
    storage: 'Elasticsearch-backed cluster with 30-day immutable window and 90-day searchable archive.',
  },
  {
    id: 'warm',
    title: 'Warm archive (3–18 months)',
    objectives: [
      'Quarterly compliance reviews and partner attestations.',
      'DSAR lookups paired with consent evidence bundles.',
      'Model training for risk scoring and access review automation.',
    ],
    storage: 'Columnar warehouse with partitioning by org, region, and event family.',
  },
  {
    id: 'cold',
    title: 'Cold compliance vault (18–84 months)',
    objectives: [
      'Regulator inquiries requiring long-tail access.',
      'Litigation hold fulfillment with legal sign-off workflows.',
      'Historical trend analysis for zero-trust posture reports.',
    ],
    storage: 'WORM object storage with quarterly integrity attestations and AES-256 encryption.',
  },
];

const retentionPolicies = [
  {
    id: 'gdpr',
    name: 'GDPR default',
    window: '6 years or employee lifecycle + 12 months, whichever is greater.',
    triggers: [
      'DSAR deletion processed via privacy command center.',
      'Legal hold release approved by compliance officer.',
      'Regional residency change requiring data minimization.',
    ],
  },
  {
    id: 'ccpa',
    name: 'CCPA / CPRA',
    window: '4 years with opt-out events mirrored indefinitely in hashed ledger.',
    triggers: [
      'Consumer verification complete with 45-day SLA.',
      'Ad-tech suppression sync validated across downstream partners.',
      'Secondary uses flagged by data governance workflows.',
    ],
  },
  {
    id: 'global',
    name: 'Global baseline',
    window: '7 years rolling to satisfy SOX and PCI change tracking obligations.',
    triggers: [
      'SOX evidence package regenerated for external auditors.',
      'PCI segmentation review concluding with green status.',
      'ConfigPro master policy update requiring new retention counters.',
    ],
  },
];

const streamingDestinations = [
  {
    id: 'siem',
    name: 'Security Analytics',
    description:
      'Splunk, Chronicle, and Azure Sentinel feeds ingest the hot-path stream for correlation with detection rules.',
    freshness: 'Under 5 minutes',
  },
  {
    id: 'warehouse',
    name: 'Data Warehouse',
    description:
      'Snowflake/BigQuery privacy schema optimized for DSAR fulfilment and trust reporting with consent joins.',
    freshness: 'Hourly micro-batch',
  },
  {
    id: 'customer-trust',
    name: 'Customer Trust Portal',
    description:
      'ConfigPro customer workspace exposes filtered audit slices with consent evidence bundles for export.',
    freshness: 'On-demand with RBAC + ABAC checks',
  },
];

const alertingPlaybooks = [
  {
    id: 'anomaly',
    title: 'Anomalous activity',
    signals: [
      'Impossible travel heuristics triggered within 4 hour window.',
      'Bulk export attempts on sensitive datasets without approved change request.',
      'Policy bypass or break-glass sessions exceeding pre-defined duration.',
    ],
    response: [
      'Escalate to on-call trust engineer and freeze affected sessions.',
      'Auto-generate incident workspace with audit, consent, and identity context.',
      'Kick off post-incident review capturing containment and remediation notes.',
    ],
  },
  {
    id: 'retention-drift',
    title: 'Retention drift',
    signals: [
      'Objects flagged for purge still present beyond retention horizon.',
      'Regional replication missing mandatory wipe confirmation.',
      'Cold storage inventory drift detected during quarterly checksum.',
    ],
    response: [
      'Open compliance ticket with purge evidence and remediation owner.',
      'Run targeted purge job and attach logs to retention ledger.',
      'Update data map to reflect storage location adjustments.',
    ],
  },
];

export const AuditLogPage = () => {
  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Shared platform</p>
        <h1 className="text-3xl font-semibold text-foreground">Audit Log &amp; Evidence Fabric</h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Blueprint for capturing ConfigPro trust signals across every product surface. This reference covers the
          who/what/when/where model, retention controls, and privacy consent stitching so every team can answer
          regulator and customer questions in minutes.
        </p>
      </header>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Who / What / When / Where</h2>
          <p className="text-sm text-muted-foreground">
            Canonical capture dimensions recorded for every ConfigPro action. Each entry is immutable, hashed, and
            replicated across regions.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {auditEventDimensions.map((dimension) => (
            <div key={dimension.id} className="flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">{dimension.label}</h3>
                <p className="text-sm text-muted-foreground">{dimension.summary}</p>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {dimension.capture.map((item) => (
                  <li key={item} className="rounded-md bg-muted/40 p-3">
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-4 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Systems:</span> {dimension.instrumentation.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Retention tiers</h2>
          <p className="text-sm text-muted-foreground">
            Structured retention strategy aligning security, regulatory, and customer transparency requirements.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-3">
          {retentionTiers.map((tier) => (
            <div key={tier.id} className="flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground">{tier.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{tier.storage}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {tier.objectives.map((objective) => (
                  <li key={objective} className="rounded-md bg-muted/40 p-3">
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Policy retention windows</h2>
          <p className="text-sm text-muted-foreground">
            Regionally tuned retention configurations referenced by ConfigPro policy engine and privacy command center.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {retentionPolicies.map((policy) => (
            <div key={policy.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground">{policy.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{policy.window}</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {policy.triggers.map((trigger) => (
                  <li key={trigger} className="rounded-md bg-muted/40 p-3">
                    {trigger}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Consent stitching</h2>
          <p className="text-sm text-muted-foreground">
            Audit events link to consent primitives so downstream teams can prove lawful basis with full context.
          </p>
        </header>

        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {consentPrimitives.map((primitive) => (
              <div key={primitive.id} className="flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-sm">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {primitive.regulation}
                  </p>
                  <h3 className="text-lg font-semibold text-foreground">{primitive.title}</h3>
                  <p className="text-sm text-muted-foreground">{primitive.description}</p>
                </div>
                <div className="mt-4 space-y-3 text-xs text-muted-foreground">
                  <div>
                    <span className="font-semibold text-foreground">Lawful basis:</span> {primitive.lawfulBasis.join(', ')}
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Default:</span> {primitive.defaultState}
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">Signals:</span> {primitive.signals.join(', ')}
                  </div>
                </div>
                <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                  {primitive.evidence.map((evidence) => (
                    <li key={evidence} className="rounded-md bg-muted/40 p-3">
                      {evidence}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 space-y-1 text-xs text-muted-foreground">
                  <div className="font-semibold text-foreground">Retention ladder</div>
                  <ul className="space-y-1">
                    <li>Hot: {primitive.retentionWindow.hot}</li>
                    <li>Warm: {primitive.retentionWindow.warm}</li>
                    <li>Cold: {primitive.retentionWindow.cold}</li>
                    <li>Purge: {primitive.retentionWindow.purge}</li>
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {consentLifecycle.map((stage) => (
              <div key={stage.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Stage {stage.stage}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-foreground">{stage.objective}</h3>
                <div className="mt-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Systems:</span> {stage.primarySystems.join(', ')}
                </div>
                <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                  {stage.guardrails.map((guardrail) => (
                    <li key={guardrail} className="rounded-md bg-muted/40 p-3">
                      {guardrail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {consentSignalChannels.map((channel) => (
              <div key={channel.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <h3 className="text-lg font-semibold text-foreground">{channel.channel}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{channel.description}</p>
                <ul className="mt-4 space-y-2 text-xs text-muted-foreground">
                  {channel.examples.map((example) => (
                    <li key={example} className="rounded-md bg-muted/40 p-3">
                      {example}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Audit note:</span> {channel.auditNotes}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Streaming destinations</h2>
          <p className="text-sm text-muted-foreground">
            Every audit event fans out through real-time and batch connectors to keep downstream platforms synchronized.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {streamingDestinations.map((destination) => (
            <div key={destination.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground">{destination.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{destination.description}</p>
              <p className="mt-4 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Freshness:</span> {destination.freshness}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 pb-12">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground">Monitoring playbooks</h2>
          <p className="text-sm text-muted-foreground">
            Automations that keep the audit service healthy and defensible when threats or retention drift are detected.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {alertingPlaybooks.map((playbook) => (
            <div key={playbook.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-foreground">{playbook.title}</h3>
              <div className="mt-3 space-y-3 text-sm text-muted-foreground">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Signals watched</p>
                  <ul className="mt-2 space-y-2">
                    {playbook.signals.map((signal) => (
                      <li key={signal} className="rounded-md bg-muted/40 p-3">
                        {signal}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Response steps</p>
                  <ul className="mt-2 space-y-2">
                    {playbook.response.map((step) => (
                      <li key={step} className="rounded-md bg-muted/40 p-3">
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AuditLogPage;
