import { Button } from '../../../components/ui/Button';
import { cn } from '../../../lib/cn';

type BuildStat = {
  label: string;
  value: string;
  trend: string;
  status: 'on-track' | 'at-risk' | 'ahead';
};

type Blueprint = {
  name: string;
  owner: string;
  progress: number;
  blockers: string[];
};

type Activity = {
  time: string;
  description: string;
  actor: string;
  category: 'Workflow' | 'Automation' | 'Collaboration' | 'Change';
};

type Milestone = {
  phase: string;
  goal: string;
  due: string;
  tasks: { label: string; done: boolean }[];
};

type ResourceHighlight = {
  title: string;
  description: string;
  linkLabel: string;
};

const buildStats: BuildStat[] = [
  {
    label: 'Blueprint coverage',
    value: '84%',
    trend: '+6.4% this sprint',
    status: 'ahead'
  },
  {
    label: 'Automation readiness',
    value: '12 / 15 flows',
    trend: 'Needs QA in 2 flows',
    status: 'at-risk'
  },
  {
    label: 'Team adoption',
    value: '63 active builders',
    trend: '+18 new collaborators',
    status: 'on-track'
  }
];

const blueprints: Blueprint[] = [
  {
    name: 'Site launch runbook',
    owner: 'Drew R. · Ops Enablement',
    progress: 92,
    blockers: ['Waiting on signage guidelines', 'Legal review due 04/12']
  },
  {
    name: 'Service ticketing workspace',
    owner: 'Priya L. · Support Programs',
    progress: 68,
    blockers: ['Automation sync paused 2h ago']
  },
  {
    name: 'Crew onboarding portal',
    owner: 'Noelle K. · People Ops',
    progress: 41,
    blockers: ['Needs asset uploads', 'Dependency on LMS integration']
  }
];

const milestones: Milestone[] = [
  {
    phase: 'Shape',
    goal: 'Define the core dashboard experience',
    due: 'Due Apr 22',
    tasks: [
      { label: 'Approve visual system', done: true },
      { label: 'Map key decision loops', done: true },
      { label: 'Lock data integrations', done: false }
    ]
  },
  {
    phase: 'Build',
    goal: 'Configure modules, automations, and access',
    due: 'Due May 3',
    tasks: [
      { label: 'Assemble workspace templates', done: true },
      { label: 'QA automation handoffs', done: false },
      { label: 'Pilot with 2 field teams', done: false }
    ]
  },
  {
    phase: 'Launch',
    goal: 'Prepare rollout and success measurement',
    due: 'Due May 15',
    tasks: [
      { label: 'Create announcement kit', done: false },
      { label: 'Finalize training assets', done: false },
      { label: 'Define adoption signals', done: false }
    ]
  }
];

const resourceHighlights: ResourceHighlight[] = [
  {
    title: 'Blueprint gallery',
    description: 'Start with curated dashboards for operations, finance, or field enablement teams.',
    linkLabel: 'Browse templates'
  },
  {
    title: 'Automation recipes',
    description: 'Accelerate checklists, escalations, and approvals with drag-and-drop logic blocks.',
    linkLabel: 'Open the library'
  },
  {
    title: 'Adoption playbook',
    description: 'Launch in weeks with rollout guides, training paths, and stakeholder updates.',
    linkLabel: 'Review playbook'
  }
];

const activities: Activity[] = [
  {
    time: '09:36',
    description: 'Updated “Operations analytics” workspace with new shift KPIs',
    actor: 'Monica T.',
    category: 'Workflow'
  },
  {
    time: '09:10',
    description: 'Published automation: Auto-create follow-ups for overdue field inspections',
    actor: 'Miles J.',
    category: 'Automation'
  },
  {
    time: '08:44',
    description: 'Commented on “Launch playbook”: Added launch comms for warehouse teams',
    actor: 'Avery Q.',
    category: 'Collaboration'
  },
  {
    time: '08:18',
    description: 'Swapped metric card layout for production blueprint (awaiting review)',
    actor: 'Carmen L.',
    category: 'Change'
  }
];

const statusStyles: Record<BuildStat['status'], string> = {
  ahead: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
  'at-risk': 'bg-amber-500/15 text-amber-500 border-amber-500/30',
  'on-track': 'bg-sky-500/15 text-sky-500 border-sky-500/30'
};

const categoryStyles: Record<Activity['category'], string> = {
  Workflow: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
  Automation: 'bg-purple-500/15 text-purple-500 border-purple-500/30',
  Collaboration: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
  Change: 'bg-orange-500/15 text-orange-500 border-orange-500/30'
};

const gradientBackground =
  'bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.18),transparent_55%),radial-gradient(circle_at_bottom,_rgba(129,140,248,0.12),transparent_60%)]';

export const FeatureConstructionDashboardPage = () => {
  return (
    <div className={cn('min-h-screen bg-background text-foreground', gradientBackground)}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-16 pt-12 sm:px-10 lg:px-14">
        <header className="flex flex-col gap-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-primary">
            Free feature dashboard
          </div>
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              Build and launch ConfigPro dashboards without waiting on engineering
            </h1>
            <p className="max-w-3xl text-base text-muted sm:text-lg">
              Orchestrate blueprints, automations, and launch tasks in one collaborative view. Track status, unblock teams, and ship new operational intelligence faster.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Button className="h-11 rounded-full px-6 text-sm font-semibold">Start a new blueprint</Button>
            <Button
              variant="ghost"
              className="h-11 rounded-full border border-border/60 px-6 text-sm font-semibold text-muted hover:border-primary/30 hover:text-foreground"
            >
              Invite collaborators
            </Button>
            <span className="text-xs text-muted">
              Last synced 3 minutes ago · 4 updates awaiting review
            </span>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          {buildStats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-border/70 bg-card/60 p-6 shadow-sm backdrop-blur">
              <div className="flex items-start justify-between">
                <p className="text-sm font-semibold text-muted">{stat.label}</p>
                <span className={cn('rounded-full border px-3 py-1 text-xs font-medium', statusStyles[stat.status])}>
                  {stat.status === 'ahead' && 'Ahead'}
                  {stat.status === 'on-track' && 'On track'}
                  {stat.status === 'at-risk' && 'At risk'}
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-semibold text-foreground">{stat.value}</span>
                <span className="text-xs font-medium text-muted">{stat.trend}</span>
              </div>
              <div className="mt-6 h-2 rounded-full bg-muted/20">
                <div
                  className={cn('h-full rounded-full bg-primary transition-all', {
                    'bg-emerald-500': stat.status === 'ahead',
                    'bg-sky-500': stat.status === 'on-track',
                    'bg-amber-500': stat.status === 'at-risk'
                  })}
                  style={{ width: stat.status === 'ahead' ? '88%' : stat.status === 'on-track' ? '72%' : '60%' }}
                />
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-border/70 bg-card/60 p-6 shadow-sm backdrop-blur">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-foreground">Blueprint workstreams</h2>
                <p className="text-sm text-muted">Monitor progress and unblock owners across every dashboard build.</p>
              </div>
              <Button variant="ghost" className="h-10 rounded-full border border-border/60 px-4 text-xs font-semibold">
                Export status
              </Button>
            </div>
            <div className="mt-6 space-y-5">
              {blueprints.map((blueprint) => (
                <div key={blueprint.name} className="rounded-xl border border-border/70 bg-background/60 p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{blueprint.name}</h3>
                      <p className="text-sm text-muted">{blueprint.owner}</p>
                    </div>
                    <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {blueprint.progress}% ready
                    </span>
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-muted/20">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${blueprint.progress}%` }}
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {blueprint.blockers.map((blocker) => (
                      <span
                        key={blocker}
                        className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-500"
                      >
                        {blocker}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <div className="rounded-2xl border border-border/70 bg-card/60 p-6 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Launch milestones</h2>
                <Button variant="ghost" className="h-9 rounded-full px-4 text-xs font-semibold">
                  View plan
                </Button>
              </div>
              <div className="mt-6 space-y-5">
                {milestones.map((milestone) => (
                  <div key={milestone.phase} className="rounded-xl border border-border/70 bg-background/60 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">{milestone.phase}</p>
                        <h3 className="mt-1 text-sm font-semibold text-foreground">{milestone.goal}</h3>
                      </div>
                      <span className="text-xs font-medium text-muted">{milestone.due}</span>
                    </div>
                    <ul className="mt-4 space-y-3">
                      {milestone.tasks.map((task) => (
                        <li key={task.label} className="flex items-center gap-3 text-sm">
                          <span
                            className={cn(
                              'flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold',
                              task.done ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' : 'border-muted/40 text-muted'
                            )}
                          >
                            {task.done ? '✓' : ''}
                          </span>
                          <span className={cn('transition-colors', task.done ? 'text-muted line-through' : 'text-foreground')}>
                            {task.label}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card/60 p-6 shadow-sm backdrop-blur">
              <h2 className="text-lg font-semibold text-foreground">Resource hub</h2>
              <p className="mt-1 text-sm text-muted">
                Tap into curated guidance to keep build momentum high and teams aligned.
              </p>
              <div className="mt-5 space-y-4">
                {resourceHighlights.map((resource) => (
                  <div key={resource.title} className="rounded-xl border border-border/60 bg-background/70 p-4">
                    <h3 className="text-sm font-semibold text-foreground">{resource.title}</h3>
                    <p className="mt-2 text-sm text-muted">{resource.description}</p>
                    <button className="mt-3 text-xs font-semibold text-primary underline-offset-4 hover:underline">
                      {resource.linkLabel}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
          <div className="rounded-2xl border border-border/70 bg-card/60 p-6 shadow-sm backdrop-blur">
            <h2 className="text-lg font-semibold text-foreground">Readiness checklist</h2>
            <p className="mt-1 text-sm text-muted">Use these guardrails before launching your ConfigPro dashboard.</p>
            <ul className="mt-5 space-y-4 text-sm text-foreground">
              <li className="rounded-xl border border-border/60 bg-background/60 p-4">
                <p className="font-semibold">Data fidelity</p>
                <p className="mt-1 text-sm text-muted">Run snapshot validation and confirm live data refresh cadence.</p>
              </li>
              <li className="rounded-xl border border-border/60 bg-background/60 p-4">
                <p className="font-semibold">Stakeholder dry run</p>
                <p className="mt-1 text-sm text-muted">Record a guided walkthrough for leadership and capture sign-off.</p>
              </li>
              <li className="rounded-xl border border-border/60 bg-background/60 p-4">
                <p className="font-semibold">Support enablement</p>
                <p className="mt-1 text-sm text-muted">Publish FAQs and escalation routes inside the workspace.</p>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card/60 p-6 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Live activity</h2>
              <Button variant="ghost" className="h-9 rounded-full px-4 text-xs font-semibold">
                View all updates
              </Button>
            </div>
            <div className="mt-5 space-y-4">
              {activities.map((activity) => (
                <div key={`${activity.time}-${activity.description}`} className="flex flex-col gap-3 rounded-xl border border-border/70 bg-background/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">{activity.time}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{activity.description}</p>
                      <p className="text-xs text-muted">{activity.actor}</p>
                    </div>
                  </div>
                  <span className={cn('inline-flex h-fit w-fit items-center rounded-full border px-3 py-1 text-xs font-semibold', categoryStyles[activity.category])}>
                    {activity.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FeatureConstructionDashboardPage;
