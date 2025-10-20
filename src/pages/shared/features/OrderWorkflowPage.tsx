import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { WorkflowEngine, type WorkflowTransition } from './workflow.engine';

type OrderWorkflowState =
  | 'intake'
  | 'qualification'
  | 'compliance-review'
  | 'planning'
  | 'execution'
  | 'quality-assurance'
  | 'closeout';

type OrderWorkflowContext = {
  requiresComplianceReview: boolean;
  partsReady: boolean;
};

interface OrderStatus {
  id: OrderWorkflowState;
  title: string;
  description: string;
  owner: string;
  signals: string[];
  exitCriteria: string[];
}

interface CustomWorkflowStep {
  id: string;
  title: string;
  summary: string;
  triggers: string[];
  automation: string[];
}

interface ServiceLevelPackage {
  id: string;
  name: string;
  coverage: string;
  metrics: { label: string; value: string }[];
  commitments: string[];
  differentiators: string[];
}

const orderStatuses: OrderStatus[] = [
  {
    id: 'intake',
    title: 'Intake & triage',
    description:
      'Capture request intent, entitlement, and operational metadata so every order is routed with the right context from the start.',
    owner: 'Service coordination',
    signals: [
      'Digital form submissions, API intake, or call centre logging feed the same order queue.',
      'Contract, asset, and location lookups validate eligibility and hazard requirements instantly.',
      'Automated duplication checks prevent parallel work orders from colliding.',
    ],
    exitCriteria: [
      'Intent classified (break/fix, preventive, project, or inspection).',
      'All required contact, asset, and access details verified.',
      'Priority and requested completion target agreed with requestor.',
    ],
  },
  {
    id: 'qualification',
    title: 'Qualification & scoping',
    description:
      'Assess risk, regulatory impact, and the work breakdown to determine the correct delivery pattern.',
    owner: 'Regional planner',
    signals: [
      'Smart questionnaires highlight hazardous materials, lock-out procedures, or special tooling needs.',
      'Work type library recommends skill sets, parts kits, and estimated effort based on historical performance.',
      'Integrated cost guardrails surface budget thresholds and approval routing up front.',
    ],
    exitCriteria: [
      'Impact rating captured with supporting justification.',
      'Routing decision recorded (standard flow, compliance branch, or partner fulfilment).',
      'Pre-approval or funding code confirmed where required.',
    ],
  },
  {
    id: 'compliance-review',
    title: 'Compliance review (conditional)',
    description:
      'Enforce industry or regional safety programmes before scheduling resources for sensitive work.',
    owner: 'Compliance officer',
    signals: [
      'Automated regulation matrix flags permit, union, or certification requirements.',
      'Checklist templates align with OSHA, NERC, or local authority expectations.',
      'Evidence package builder collects permits, photos, and digital signatures.',
    ],
    exitCriteria: [
      'All regulatory gates passed or mitigations documented.',
      'External approvals captured and versioned in the order record.',
      'Risk rating downgraded to acceptable threshold for execution.',
    ],
  },
  {
    id: 'planning',
    title: 'Planning & scheduling',
    description:
      'Coordinate people, materials, and access windows so work can start without blockers.',
    owner: 'Central dispatch',
    signals: [
      'Capacity planner suggests qualified crews with union, certification, and travel compliance.',
      'Inventory service sync checks part availability, alternates, and lead times.',
      'Customer or site contact receives scheduling options with automated reminders.',
    ],
    exitCriteria: [
      'Crew, date, and on-site requirements confirmed.',
      'Parts kits picked and staged with substitution plan if shortages occur.',
      'Access instructions communicated and acknowledged by stakeholders.',
    ],
  },
  {
    id: 'execution',
    title: 'Execution & field updates',
    description:
      'Deliver the work safely, capture artefacts in real time, and surface blockers early.',
    owner: 'Field lead',
    signals: [
      'Mobile checklist guides start, during, and completion tasks with offline resilience.',
      'Telematics, IoT, or SCADA feeds update progress and safety status automatically.',
      'Exception reporting triggers rapid escalation to planners or compliance teams.',
    ],
    exitCriteria: [
      'All mandatory steps completed with timestamps and geolocation stamps.',
      'Variance or rework items documented with estimated follow-up effort.',
      'Customer or site contact receives provisional completion notice.',
    ],
  },
  {
    id: 'quality-assurance',
    title: 'Quality assurance & validation',
    description:
      'Confirm work quality, documentation completeness, and financial accuracy before closing.',
    owner: 'Quality manager',
    signals: [
      'Photo or evidence review queues route to domain experts for sign-off.',
      'Automatic reconciliation checks labour, material, and subcontractor charges.',
      'Feedback forms invite the requestor to rate satisfaction and highlight issues.',
    ],
    exitCriteria: [
      'All QA checklist items passed or corrective actions scheduled.',
      'Billing package balanced with purchase orders and contract terms.',
      'Customer satisfaction captured with follow-up actions if below target.',
    ],
  },
  {
    id: 'closeout',
    title: 'Closeout & continuous learning',
    description:
      'Archive the order, trigger downstream updates, and feed intelligence back into planning.',
    owner: 'Operations analytics',
    signals: [
      'Asset history, warranty, and compliance systems updated in sync.',
      'Lessons learned flagged for incorporation into future playbooks.',
      'SLA attainment and cost variance written back to reporting models.',
    ],
    exitCriteria: [
      'Order status changed to closed with immutable audit log.',
      'Linked work (follow-up visits, rework orders) spawned where applicable.',
      'Insights pushed to dashboards and backlog grooming sessions.',
    ],
  },
];

const customWorkflowSteps: CustomWorkflowStep[] = [
  {
    id: 'regulated-utility',
    title: 'Regulated utility assets',
    summary:
      'Adds permit orchestration, lock-out/tag-out verification, and utility commission notifications for high-voltage or gas assets.',
    triggers: [
      'Asset class flagged as transmission, distribution, or hazardous materials.',
      'Work site falls within protected wildlife or indigenous land boundaries.',
      'Crew makeup includes apprentices requiring extra supervision ratios.',
    ],
    automation: [
      'Auto-generate permit packages with pre-filled engineering drawings and site history.',
      'Route to compliance review state until digital sign-offs are complete.',
      'Schedule pre-job safety briefs with attendance capture and photo evidence.',
    ],
  },
  {
    id: 'multi-site-deployment',
    title: 'Multi-site rollout playbook',
    summary:
      'Coordinates phased execution across dozens of locations while preserving a single reporting narrative.',
    triggers: [
      'Order involves more than five locations or stores with the same scope.',
      'Timeline requires regional staging and staggered go-live windows.',
      'Partners or subcontractors participate alongside internal crews.',
    ],
    automation: [
      'Spin off child work orders per site with inherited scope and SLA targets.',
      'Synchronise cross-site dependencies so blockers pause downstream work automatically.',
      'Aggregate completion evidence and cost metrics back to the parent order.',
    ],
  },
  {
    id: 'incident-to-project',
    title: 'Incident-to-project crossover',
    summary:
      'Escalates break/fix incidents into managed projects when impact or cost thresholds are exceeded.',
    triggers: [
      'Incident severity exceeds safety or revenue guardrails.',
      'Multiple rapid-repeat incidents on the same asset within 30 days.',
      'Customer success or account managers request proactive replacement.',
    ],
    automation: [
      'Create structured project plan with capital funding codes and stakeholder roster.',
      'Retain original incident evidence for regulatory traceability.',
      'Notify finance and procurement teams with forecasted spend profile.',
    ],
  },
];

const serviceLevelPackages: ServiceLevelPackage[] = [
  {
    id: 'assure',
    name: 'Assure',
    coverage: 'Business hours coverage for predictable work orders.',
    metrics: [
      { label: 'Initial response', value: '30 minutes' },
      { label: 'Dispatch commitment', value: '4 business hours' },
      { label: 'Standard completion', value: '5 business days' },
    ],
    commitments: [
      'Automated status updates at intake, schedule confirmation, arrival, and closeout.',
      'Shared backlog view with drag-and-drop reprioritisation and audit history.',
      'Baseline quality review on 25% of completed orders to track drift.',
    ],
    differentiators: [
      'Ideal for internal facilities or franchise operators with predictable demand.',
      'Integrates with shared resource pools to avoid idle capacity.',
      'Supports vendor scorecards with consistent metrics across regions.',
    ],
  },
  {
    id: 'continuity',
    name: 'Critical Continuity',
    coverage: '24×7 response for revenue or safety critical work.',
    metrics: [
      { label: 'Initial response', value: '10 minutes' },
      { label: 'Dispatch commitment', value: '90 minutes' },
      { label: 'Completion target', value: '24 hours' },
    ],
    commitments: [
      'Dual notification paths (SMS + voice) for site leaders and executives.',
      'Real-time telematics visibility for en route crews.',
      'Mandatory quality assurance review with customer sign-off before close.',
    ],
    differentiators: [
      'Designed for hospitals, logistics hubs, and manufacturing lines.',
      'Built-in redundancy for parts sourcing with approved alternates.',
      'Escalation ladder with executive on-call tracking.',
    ],
  },
  {
    id: 'enterprise-care',
    name: 'Enterprise Care',
    coverage: 'Global operations programme for distributed enterprises.',
    metrics: [
      { label: 'Initial response', value: '5 minutes' },
      { label: 'Dispatch commitment', value: '60 minutes' },
      { label: 'Completion target', value: 'Custom per asset criticality' },
    ],
    commitments: [
      'Dedicated command centre with regional language coverage.',
      'Predictive maintenance triggers feed shared backlog with AI-assisted scheduling.',
      'Lifecycle analytics tie work orders to capital planning and ESG reporting.',
    ],
    differentiators: [
      'Global vendor ecosystem with compliance tracking for each jurisdiction.',
      'Scenario planning to rebalance crews based on live demand and severe weather.',
      'Executive dashboards surfacing SLA, cost, and sentiment trends in real time.',
    ],
  },
];

const orderWorkflowTransitions: WorkflowTransition<OrderWorkflowState, OrderWorkflowContext>[] = [
  {
    from: 'intake',
    to: 'qualification',
    name: 'All intake data verified',
  },
  {
    from: 'qualification',
    to: 'compliance-review',
    name: 'Regulated work detected',
    condition: (context) => context.requiresComplianceReview,
  },
  {
    from: 'qualification',
    to: 'planning',
    name: 'Standard delivery path confirmed',
    condition: (context) => !context.requiresComplianceReview,
  },
  {
    from: 'compliance-review',
    to: 'planning',
    name: 'Compliance release granted',
  },
  {
    from: 'planning',
    to: 'execution',
    name: 'Resources staged & ready',
    condition: (context) => context.partsReady,
  },
  {
    from: 'execution',
    to: 'quality-assurance',
    name: 'Work completed in field',
  },
  {
    from: 'quality-assurance',
    to: 'closeout',
    name: 'QA sign-off achieved',
  },
];

const statusLookup = orderStatuses.reduce<Record<OrderWorkflowState, OrderStatus>>((acc, status) => {
  acc[status.id] = status;
  return acc;
}, {} as Record<OrderWorkflowState, OrderStatus>);

export const OrderWorkflowPage = () => {
  const [engine] = useState(
    () =>
      new WorkflowEngine<OrderWorkflowState, OrderWorkflowContext>({
        initial: 'intake',
        transitions: orderWorkflowTransitions,
      }),
  );
  const [activeState, setActiveState] = useState<OrderWorkflowState>(engine.getCurrentState());
  const [context, setContext] = useState<OrderWorkflowContext>({
    requiresComplianceReview: true,
    partsReady: true,
  });

  const currentStatus = statusLookup[activeState];
  const availableTransitions = engine.getAvailableTransitions(context);

  const handleTransition = (target: OrderWorkflowState) => {
    const nextState = engine.transition(target, context);
    setActiveState(nextState);
  };

  const handleReset = () => {
    const resetState = engine.reset();
    setActiveState(resetState);
  };

  const handleContextToggle = (field: keyof OrderWorkflowContext) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.checked;
      setContext((previous) => ({ ...previous, [field]: value }));
    };

  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Shared platform</p>
        <h1 className="text-3xl font-semibold text-foreground">Order & work order orchestration</h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Provide a neutral foundation for intake-to-close order journeys that can flex for facilities, field service,
          or managed operations teams. Status pillars, custom steps, and SLA programmes let every business launch
          accountable workflows without reinventing controls.
        </p>
      </header>

      <section aria-labelledby="order-statuses" className="space-y-6">
        <header className="space-y-1">
          <h2 id="order-statuses" className="text-xl font-semibold text-foreground">
            Status spine
          </h2>
          <p className="text-sm text-muted-foreground">
            Each status packages owners, signals, and exit criteria so adjacent systems understand when the work is
            ready for them.
          </p>
        </header>

        <div className="flex flex-wrap gap-2">
          {orderStatuses.map((status) => (
            <span
              key={status.id}
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                status.id === activeState
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {status.title}
            </span>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {orderStatuses.map((status) => (
            <article key={status.id} className="flex h-full flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-sm">
              <header className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-foreground">{status.title}</h3>
                  <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{status.owner}</span>
                </div>
                <p className="text-sm text-muted-foreground">{status.description}</p>
              </header>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Signals</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {status.signals.map((signal) => (
                      <li key={signal} className="flex gap-2">
                        <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{signal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground">Exit criteria</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {status.exitCriteria.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="custom-steps" className="space-y-6">
        <header className="space-y-1">
          <h2 id="custom-steps" className="text-xl font-semibold text-foreground">
            Custom step libraries
          </h2>
          <p className="text-sm text-muted-foreground">
            Compose optional branches and automation packs to respect compliance, rollout, or incident-driven
            variations.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-3">
          {customWorkflowSteps.map((step) => (
            <article key={step.id} className="flex h-full flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.summary}</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Triggers</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {step.triggers.map((trigger) => (
                    <li key={trigger} className="flex gap-2">
                      <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{trigger}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Automation</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {step.automation.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="sla-programmes" className="space-y-6">
        <header className="space-y-1">
          <h2 id="sla-programmes" className="text-xl font-semibold text-foreground">
            Service level programmes
          </h2>
          <p className="text-sm text-muted-foreground">
            Offer configurable SLAs that align coverage windows, notifications, and assurance rigour with customer
            promises.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {serviceLevelPackages.map((sla) => (
            <article key={sla.id} className="flex h-full flex-col gap-4 rounded-lg border border-border bg-card p-5 shadow-sm">
              <header className="space-y-2">
                <h3 className="text-base font-semibold text-foreground">{sla.name}</h3>
                <p className="text-sm text-muted-foreground">{sla.coverage}</p>
              </header>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Key metrics</h4>
                <dl className="grid gap-2 text-sm text-muted-foreground">
                  {sla.metrics.map((metric) => (
                    <div key={metric.label} className="flex items-center justify-between gap-3">
                      <dt className="font-medium text-foreground">{metric.label}</dt>
                      <dd>{metric.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">Commitments</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {sla.commitments.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-foreground">When to choose</h4>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {sla.differentiators.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="workflow-simulation" className="space-y-6">
        <header className="space-y-1">
          <h2 id="workflow-simulation" className="text-xl font-semibold text-foreground">
            Workflow simulation
          </h2>
          <p className="text-sm text-muted-foreground">
            Experiment with the lightweight workflow engine to see how branching rules and readiness gates control the
            journey from intake to closeout.
          </p>
        </header>

        <div className="space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Current status</p>
              <h3 className="text-2xl font-semibold text-foreground">{currentStatus.title}</h3>
              <p className="max-w-2xl text-sm text-muted-foreground">{currentStatus.description}</p>
            </div>
            <div className="flex flex-col items-start gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  id="requires-compliance"
                  type="checkbox"
                  checked={context.requiresComplianceReview}
                  onChange={handleContextToggle('requiresComplianceReview')}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="requires-compliance">Compliance review required</label>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <input
                  id="parts-ready"
                  type="checkbox"
                  checked={context.partsReady}
                  onChange={handleContextToggle('partsReady')}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="parts-ready">Materials and crew ready to execute</label>
              </div>
              <button
                type="button"
                onClick={handleReset}
                className="rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition hover:border-primary hover:text-primary"
              >
                Reset workflow
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm font-semibold text-foreground">Next permitted states</p>
            {availableTransitions.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {availableTransitions.map((transition) => {
                  const targetStatus = statusLookup[transition.to];
                  return (
                    <article
                      key={`${transition.from}-${transition.to}`}
                      className="flex h-full flex-col gap-4 rounded-lg border border-border bg-muted/40 p-4"
                    >
                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                          {transition.name ?? 'Transition'}
                        </p>
                        <h4 className="text-base font-semibold text-foreground">{targetStatus.title}</h4>
                        <p className="text-sm text-muted-foreground">{targetStatus.description}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleTransition(transition.to)}
                        className="self-start rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground shadow transition hover:bg-primary/90"
                      >
                        Advance to {targetStatus.title}
                      </button>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-md border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
                No transitions available. Adjust readiness toggles or reset the workflow to explore other paths.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrderWorkflowPage;
