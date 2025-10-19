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

export const TimeIntelligenceHubPage = () => {
  return (
    <div
      className={cn(
        'min-h-screen bg-background text-foreground',
        'bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),transparent_55%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.14),transparent_60%)]'
      )}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 pb-20 pt-14 sm:px-10 lg:px-14">
        <header className="space-y-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-primary">
            Shared feature spotlight
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Adaptive Time Intelligence Hub
            </h1>
            <p className="max-w-3xl text-base text-muted sm:text-lg">
              Transform commodity time clocks into an AI-guarded attendance engine that fuses scheduling intent, live demand, and payroll-grade compliance for every industry ConfigPro serves.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button className="rounded-full px-7 text-sm" size="md">
              Preview punch experience
            </Button>
            <Button variant="outline" className="rounded-full px-7 text-sm" size="md">
              View integration map
            </Button>
            <span className="text-xs text-muted">Unified telemetry, compliance, and adoption dashboards ship out of the box.</span>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          {heroStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border/60 bg-card/80 p-6 shadow-sm backdrop-blur">
              <div className="text-sm font-medium uppercase tracking-wide text-muted-foreground">{stat.label}</div>
              <div className="mt-3 text-3xl font-semibold text-foreground">{stat.value}</div>
              <p className="mt-2 text-sm text-muted-foreground">{stat.detail}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
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

        <section className="space-y-4">
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

        <section className="space-y-6">
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

        <section className="grid gap-6 lg:grid-cols-3">
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

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Go-to-market narrative</h2>
          <ul className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            {goToMarket.map((item) => (
              <li key={item} className="rounded-xl border border-border/60 bg-surface/80 p-4 backdrop-blur">
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};
