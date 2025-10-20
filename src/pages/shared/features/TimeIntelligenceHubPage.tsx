import { Button } from '../../../components/ui/Button';
import { cn } from '../../../lib/cn';

const heroStats = [
  {
    label: 'Punch accuracy',
    value: '99.4%',
    detail: 'Auto-validated against shift intent and labor rules',
  },
  {
    label: 'Exception triage time',
    value: '-68%',
    detail: 'Resolved with AI coaching and automated escalations',
  },
  {
    label: 'Coverage confidence',
    value: '+22%',
    detail: 'Live demand deltas mapped to planned staffing',
  },
  {
    label: 'Punch-to-payroll latency',
    value: '<30s',
    detail: 'Streaming ledger sync keeps finance, analytics, and leaders aligned',
  },
];

const experiencePrinciples = [
  {
    title: 'Frictionless intent recognition',
    description:
      'Biometric-ready prompts, location sensing, and device heuristics anticipate every punch so staff simply show up and confirm.',
  },
  {
    title: 'Human + AI coaching',
    description:
      'Leaders receive conversational nudges with suggested remedies the moment adherence slips or compliance risk appears.',
  },
  {
    title: 'Trust at enterprise scale',
    description:
      'Immutable audit fabrics, SOC-ready exports, and union-grade approvals keep legal and payroll teams in the same pane of glass.',
  },
];

const whyNow = [
  {
    title: 'Leverage existing scheduling intelligence',
    description:
      'Mirror roster qualifications, fairness scoring, and overtime risk from scheduling to validate every punch automatically.',
  },
  {
    title: 'Stream real-time labor telemetry',
    description:
      'Reuse the metrics registry to broadcast adherence signals, geofence events, and late arrivals into any observability stack.',
  },
  {
    title: 'Bridge demand to execution',
    description:
      'Contrast planned coverage with live attendance to recommend shift extensions, backfills, or standby activation before service gaps form.',
  },
];

const signatureCapabilities = [
  {
    title: 'AI-validated punch journeys',
    description:
      'Auto-approve compliant punches, flag anomalies with corrective actions, and surface swap or overtime mitigations instantly.',
  },
  {
    title: 'Demand-aware time prompts',
    description:
      'Use forecasting signals to nudge leaders and staff when extending, ending, or reassigning shifts would protect service levels.',
  },
  {
    title: 'Universal device strategy',
    description:
      'Deliver responsive web, kiosk, and mobile experiences with biometric-ready APIs for warehouses, clinics, and hospitality floors.',
  },
  {
    title: 'Trust-grade audit layer',
    description:
      'Provide immutable logs, geolocation attestation, and union-ready approvals so compliance teams can certify every hour worked.',
  },
];

const punchFlow = [
  {
    step: '01',
    title: 'Predictive arrival sensing',
    description:
      'Geofences, badge taps, and Bluetooth beacons wake the punch journey before workers reach the threshold.',
    highlight: 'Signal fusion reaches 98% accuracy on expected arrivals five minutes out.',
  },
  {
    step: '02',
    title: 'Adaptive punch canvas',
    description:
      'Context-rich prompts summarise roster intent, skill validations, and real-time demand loads so the right action is obvious.',
    highlight: 'Assistants recommend shift swaps, extensions, or rapid approvals inline—no modal fatigue.',
  },
  {
    step: '03',
    title: 'Precision compliance routing',
    description:
      'Exception pathways dispatch to the correct leader with jurisdiction-aware remedies and documentation ready to sign.',
    highlight: 'AI-authored annotations cut manual payroll research time by 63%.',
  },
  {
    step: '04',
    title: 'Instant payroll continuity',
    description:
      'Approved punches stream to payroll, analytics, and staffing war rooms with immutable ledgers and rollback controls.',
    highlight: 'Finance operates on streaming actuals with no end-of-week imports.',
  },
];

const telemetryHighlights = [
  {
    title: 'Unified visibility',
    points: [
      'Coverage and compliance heatmaps live stream to command centers and mobile dashboards.',
      'Punch variance is plotted against forecast precision to surface teams needing proactive support.',
    ],
  },
  {
    title: 'Guided leadership actions',
    points: [
      'AI playbooks select the best coaching moment and channel for every exception.',
      'Escalations carry pre-filled context, recommended outcomes, and follow-up cadences.',
    ],
  },
  {
    title: 'Ecosystem-grade APIs',
    points: [
      'Webhooks and streaming topics deliver punch proof to ERP, LMS, and safety systems instantly.',
      'Normalization and enrichment pipelines apply consistent identity, localization, and retention policies.',
    ],
  },
];

const operationalBlueprint = [
  {
    phase: 'Shape',
    focus: 'Map cross-industry personas',
    checklist: [
      'Document frontline, manager, and payroll analyst needs across verticals',
      'Align geofencing, biometric, and network fingerprinting requirements',
      'Define baseline AI guardrails for punch approvals and escalations',
    ],
  },
  {
    phase: 'Build',
    focus: 'Assemble adaptive punch flows',
    checklist: [
      'Wire punch validations to scheduling context and qualification data',
      'Stream demand deltas from forecasting into prompt orchestration',
      'Instrument metrics for adherence, compliance breaches, and payroll variance',
    ],
  },
  {
    phase: 'Launch',
    focus: 'Operationalise trust and adoption',
    checklist: [
      'Ship compliance attestations, audit exports, and anomaly war rooms',
      'Publish adoption dashboards for coverage confidence and utilization',
      'Hand off rollout playbooks to customer success and solution partners',
    ],
  },
];

const deviceMatrix = [
  {
    title: 'Operational everywhere',
    details: [
      'Offline-safe kiosks with smart queueing for manufacturing and logistics hubs.',
      'Edge-compute gateways in clinics to maintain HIPAA-aligned punch verification.',
      'Retail-ready progressive web apps tuned for low-connectivity environments.',
    ],
  },
  {
    title: 'Identity confident',
    details: [
      'Biometric integrations for fingerprint, facial, and palm vein hardware certified through ConfigPro labs.',
      'Multi-factor attestations layered over wearables, NFC badges, and SMS when required.',
      'Privacy-first consent and opt-out workflows honoring regional regulations.',
    ],
  },
  {
    title: 'Change-managed rollout',
    details: [
      'In-field device health monitoring with zero-touch provisioning playbooks.',
      'Simulation sandboxes for training leaders before hardware ships.',
      'Turnkey adoption kits with signage, training videos, and microsurveys.',
    ],
  },
];

const goToMarket = [
  'Position the hub as the connective tissue between planning, attendance, and payroll integrity.',
  'Bundle launch metrics that quantify coverage certainty, compliance strength, and automation lift from day one.',
  'Offer industry playbooks with configurable labor rules so enterprise teams can launch without bespoke engineering.',
];

const integrationHighlights = [
  {
    title: 'Scheduling',
    points: [
      'Reconcile actual punches against rostered intent and qualifications.',
      'Trigger swap suggestions or assistant-generated shift offers when gaps emerge.',
    ],
  },
  {
    title: 'Forecasting',
    points: [
      'Blend live punch variance with upcoming demand spikes to prioritise coverage moves.',
      'Feed “promise vs. proof” visualisations back into workforce plans for continual tuning.',
    ],
  },
  {
    title: 'Payroll & compliance',
    points: [
      'Expose certified audit trails with configurable retention policies.',
      'Deliver jurisdiction-aware alerts before premium pay or breach penalties trigger.',
    ],
  },
];

const adoptionSignals = [
  {
    label: 'Experience NPS',
    value: '92',
    detail: 'Beta enterprises rated the ConfigPro punch journey the highest among workforce tools.',
  },
  {
    label: 'Time theft reduction',
    value: '-38%',
    detail: 'Cross-reconciled anomalies shrink as the hub auto-validates variance at clock-in.',
  },
  {
    label: 'Leader coaching uptake',
    value: '4.7x',
    detail: 'Guided interventions are actioned nearly five times more than manual escalations.',
  },
];

const customerQuote = {
  quote:
    '“Our teams stopped thinking about time clocks. They just start their shift and the hub orchestrates the rest—including payroll and compliance sign-off.”',
  attribution: 'COO, Global Hospitality Collective',
  context: '12 countries • 68k employees • SOC 2 Type II compliant deployment in under 90 days',
};

const sectionNavItems = [
  { id: 'impact', label: 'Impact metrics' },
  { id: 'experience', label: 'Experience manifesto' },
  { id: 'why-now', label: 'Why now' },
  { id: 'flow', label: 'Punch flow' },
  { id: 'capabilities', label: 'Signature capabilities' },
  { id: 'telemetry', label: 'Telemetry & APIs' },
  { id: 'blueprint', label: 'Operational blueprint' },
  { id: 'devices', label: 'Device strategy' },
  { id: 'integrations', label: 'System integrations' },
  { id: 'proof', label: 'Proof & quote' },
  { id: 'gtm', label: 'Go-to-market' },
  { id: 'cta', label: 'Launch with ConfigPro' },
];

export const TimeIntelligenceHubPage = () => {
  return (
    <div
      className={cn(
        'min-h-screen bg-background text-foreground',
        'bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),transparent_55%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.14),transparent_60%)]'
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-24 pt-16 sm:px-10 lg:px-14">
        <header className="space-y-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-primary">
            Shared feature spotlight
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Adaptive Time Intelligence Hub
            </h1>
            <p className="max-w-3xl text-base text-muted sm:text-lg">
              Transform commodity time clocks into an AI-guarded attendance engine that fuses scheduling intent, live demand, and payroll-grade compliance for every industry ConfigPro serves. Every punch is effortless, trusted, and instantly valuable.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button className="rounded-full px-7 text-sm" size="md">
              Preview punch experience
            </Button>
            <Button variant="outline" className="rounded-full px-7 text-sm" size="md">
              View integration map
            </Button>
            <span className="text-xs text-muted">Unified telemetry, compliance, and adoption dashboards ship out of the box—plus exclusive concierge rollout support.</span>
          </div>
        </header>

        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-[240px_1fr] lg:gap-14">
          <nav className="lg:sticky lg:top-28 lg:self-start">
            <div className="-mx-6 overflow-x-auto pb-2 lg:mx-0 lg:overflow-visible lg:pb-0">
              <ul className="flex gap-3 px-6 text-sm text-muted-foreground lg:flex-col lg:gap-2 lg:px-0">
                {sectionNavItems.map((item) => (
                  <li key={item.id} className="flex-shrink-0 lg:flex-shrink">
                    <a
                      href={`#${item.id}`}
                      className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-2 font-medium transition-colors hover:border-primary/60 hover:text-foreground lg:w-full lg:rounded-xl lg:bg-card/50"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-primary lg:hidden" aria-hidden />
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <p className="hidden text-xs text-muted-foreground lg:mt-4 lg:block">
              Jump between stories without losing your place. Every section mirrors the scheduling, attendance, and payroll journey.
            </p>
          </nav>

          <div className="space-y-12">
            <section id="impact" className="grid gap-4 scroll-mt-32 sm:grid-cols-2 lg:grid-cols-4">
              {heroStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur">
                  <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{stat.label}</div>
                  <div className="mt-3 text-3xl font-semibold text-foreground">{stat.value}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{stat.detail}</p>
                </div>
              ))}
            </section>

            <section id="experience" className="grid gap-8 scroll-mt-32 lg:grid-cols-[1.1fr_0.9fr]">
              <article className="relative overflow-hidden rounded-3xl border border-primary/40 bg-gradient-to-br from-primary/15 via-background to-background p-8 shadow-lg">
                <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/20 blur-3xl" aria-hidden />
                <div className="absolute -bottom-24 left-12 h-52 w-52 rounded-full bg-purple-500/20 blur-3xl" aria-hidden />
                <div className="relative space-y-4">
                  <h2 className="text-2xl font-semibold text-foreground">Experience manifesto</h2>
                  <p className="max-w-xl text-sm text-muted-foreground">
                    Elite teams demand more than accurate punches—they expect a moment of clarity that kicks off every shift with confidence. The Time Intelligence Hub choreographs identity, intent, and guidance before anyone taps a button.
                  </p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1">Forecast-aware arrivals</span>
                    <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1">Biometric ready</span>
                    <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1">Concierge rollout</span>
                  </div>
                </div>
              </article>
              <div className="grid gap-4">
                {experiencePrinciples.map((principle) => (
                  <article key={principle.title} className="rounded-2xl border border-border/60 bg-card/80 p-6 backdrop-blur">
                    <h3 className="text-base font-semibold text-foreground">{principle.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{principle.description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section id="why-now" className="grid gap-6 scroll-mt-32 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <h2 className="text-xl font-semibold">Why the hub lands now</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  The scheduling and forecasting pillars already deliver the intelligence needed to validate every punch in real time. This release simply connects the dots.
                </p>
              </div>
              <div className="grid gap-4 lg:col-span-2">
                {whyNow.map((item) => (
                  <article key={item.title} className="rounded-xl border border-border/60 bg-surface/80 p-5 backdrop-blur">
                    <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section id="flow" className="space-y-6 scroll-mt-32">
              <header className="space-y-2">
                <h2 className="text-xl font-semibold">Punch flow orchestrated to perfection</h2>
                <p className="text-sm text-muted-foreground">
                  Every step is pre-composed so staff glide through time entry while leaders receive actionable context without hunting.
                </p>
              </header>
              <div className="grid gap-4 md:grid-cols-2">
                {punchFlow.map((step) => (
                  <article key={step.step} className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
                    <div className="absolute -right-10 top-6 h-20 w-20 rounded-full bg-primary/10 blur-2xl" aria-hidden />
                    <div className="relative space-y-3">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-sm font-semibold text-primary">
                        {step.step}
                      </span>
                      <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      <p className="text-xs font-medium text-primary">{step.highlight}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section id="capabilities" className="space-y-4 scroll-mt-32">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Signature capabilities</h2>
                  <p className="text-sm text-muted-foreground">
                    Differentiators that elevate ConfigPro above commodity punch clocks.
                  </p>
                </div>
                <span className="text-xs text-muted">AI guardrails, adaptive prompts, and immutable audits baked in.</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {signatureCapabilities.map((capability) => (
                  <article key={capability.title} className="space-y-2 rounded-xl border border-border/60 bg-card/80 p-6 backdrop-blur">
                    <h3 className="text-lg font-semibold text-foreground">{capability.title}</h3>
                    <p className="text-sm text-muted-foreground">{capability.description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section id="telemetry" className="space-y-6 scroll-mt-32">
              <header className="space-y-2">
                <h2 className="text-xl font-semibold">Telemetry, coaching, and APIs in one pane</h2>
                <p className="text-sm text-muted-foreground">
                  Operators see exactly what matters, when it matters, and can extend the hub into any enterprise system with ease.
                </p>
              </header>
              <div className="grid gap-4 md:grid-cols-3">
                {telemetryHighlights.map((highlight) => (
                  <article key={highlight.title} className="rounded-xl border border-border/60 bg-surface/80 p-5 backdrop-blur">
                    <h3 className="text-base font-semibold text-foreground">{highlight.title}</h3>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {highlight.points.map((point) => (
                        <li key={point} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section id="blueprint" className="space-y-6 scroll-mt-32">
              <header className="space-y-2">
                <h2 className="text-xl font-semibold">Operational blueprint</h2>
                <p className="text-sm text-muted-foreground">
                  Stage the launch with repeatable motions that partners and internal teams can reuse for every industry vertical.
                </p>
              </header>
              <div className="grid gap-4 md:grid-cols-3">
                {operationalBlueprint.map((phase) => (
                  <article key={phase.phase} className="rounded-xl border border-border/60 bg-surface/80 p-5 backdrop-blur">
                    <div className="text-xs font-semibold uppercase tracking-wide text-primary">{phase.phase}</div>
                    <h3 className="mt-1 text-base font-semibold text-foreground">{phase.focus}</h3>
                    <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                      {phase.checklist.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section id="devices" className="space-y-4 scroll-mt-32">
              <header className="space-y-2">
                <h2 className="text-xl font-semibold">Device and environment mastery</h2>
                <p className="text-sm text-muted-foreground">
                  From flagship headquarters to remote depots, the Time Intelligence Hub stays always-on and identity-assured.
                </p>
              </header>
              <div className="grid gap-4 md:grid-cols-3">
                {deviceMatrix.map((device) => (
                  <article key={device.title} className="space-y-3 rounded-2xl border border-border/60 bg-card/80 p-6 backdrop-blur">
                    <h3 className="text-base font-semibold text-foreground">{device.title}</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {device.details.map((detail) => (
                        <li key={detail} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section id="integrations" className="grid gap-6 scroll-mt-32 lg:grid-cols-3">
              <div className="lg:col-span-1">
                <h2 className="text-xl font-semibold">System integrations</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Time data becomes instantly useful when shared with adjacent ConfigPro pillars.
                </p>
              </div>
              <div className="grid gap-4 lg:col-span-2">
                {integrationHighlights.map((integration) => (
                  <article key={integration.title} className="space-y-3 rounded-xl border border-border/60 bg-card/80 p-5 backdrop-blur">
                    <h3 className="text-base font-semibold text-foreground">{integration.title}</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {integration.points.map((point) => (
                        <li key={point} className="flex items-start gap-2">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
              </div>
            </section>

            <section id="proof" className="grid gap-6 scroll-mt-32 md:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Proof the elite experience delivers</h2>
                <p className="text-sm text-muted-foreground">
                  Early adopters prove that when timekeeping becomes orchestration, the business responds with loyalty and measurable lift.
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {adoptionSignals.map((signal) => (
                    <article key={signal.label} className="rounded-2xl border border-border/60 bg-card/80 p-5 text-center backdrop-blur">
                      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{signal.label}</div>
                      <div className="mt-2 text-3xl font-semibold text-foreground">{signal.value}</div>
                      <p className="mt-2 text-xs text-muted-foreground">{signal.detail}</p>
                    </article>
                  ))}
                </div>
              </div>
              <aside className="rounded-3xl border border-primary/40 bg-primary/10 p-8 text-sm text-foreground shadow-lg">
                <p className="text-lg font-semibold text-primary">{customerQuote.quote}</p>
                <div className="mt-4 font-semibold">{customerQuote.attribution}</div>
                <p className="mt-1 text-xs text-muted-foreground">{customerQuote.context}</p>
              </aside>
            </section>

            <section id="gtm" className="space-y-4 scroll-mt-32">
              <h2 className="text-xl font-semibold">Go-to-market narrative</h2>
              <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                {goToMarket.map((item) => (
                  <li key={item} className="rounded-xl border border-border/60 bg-surface/80 p-4 backdrop-blur">
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section
              id="cta"
              className="rounded-3xl border border-primary/40 bg-gradient-to-r from-primary/15 via-background to-purple-500/10 p-8 text-center shadow-lg scroll-mt-32"
            >
              <h2 className="text-2xl font-semibold text-foreground">Bring the elite time intelligence experience to your teams</h2>
              <p className="mx-auto mt-3 max-w-3xl text-sm text-muted-foreground">
                Pair our orchestration experts with your operations leads to launch in record time. We co-design punch flows, hardware rollouts, and success metrics so every shift starts with certainty.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button className="rounded-full px-7" size="md">
                  Book the immersion session
                </Button>
                <Button variant="outline" className="rounded-full px-7" size="md">
                  Download the readiness guide
                </Button>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeIntelligenceHubPage;
