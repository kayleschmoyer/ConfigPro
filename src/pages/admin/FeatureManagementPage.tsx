import { useMemo, useState } from 'react';
import { Switch } from '../../components/ui/Switch';
import { SharedFeatureRegistry } from '../shared/features';
import type { FeatureKey } from '../shared/features';

type RolloutStatus = 'Active' | 'Monitoring' | 'Planned';

interface FeatureRollout {
  name: string;
  status: RolloutStatus;
  owner: string;
  target: string;
  checkpoint: string;
}

interface OrganizationProfile {
  id: string;
  name: string;
  segment: string;
  tier: 'Enterprise' | 'Growth' | 'Emerging';
  steward: string;
  opsContact: string;
  changeWindow: string;
  lastReview: string;
  notes: string;
  featureOverrides: Partial<Record<FeatureKey, boolean>>;
  guardrails: string[];
  rollouts: FeatureRollout[];
}

const organizations: OrganizationProfile[] = [
  {
    id: 'aurora-collective',
    name: 'Aurora Retail Collective',
    segment: 'Enterprise retail',
    tier: 'Enterprise',
    steward: 'Chief Workforce Officer',
    opsContact: 'operations@aurora.example',
    changeWindow: 'Mondays · 05:00 UTC',
    lastReview: '2025-02-18',
    notes: 'Flagship modernization cohort piloting automation across 80 flagship locations.',
    featureOverrides: {
      payments: true,
      notifications: true,
      audit: true,
      importExport: true,
      flags: true,
      timeIntelligence: true,
    },
    guardrails: [
      'Automation features require command center approval before disabling.',
      'Inventory settings remain locked during the holiday resilience freeze.',
      'Notify the risk office when audit capabilities are toggled.',
    ],
    rollouts: [
      {
        name: 'Automation pilot expansion',
        status: 'Active',
        owner: 'Automation Guild',
        target: 'Extend to 12 additional flagship stores',
        checkpoint: 'Q2 adoption review on Apr 30',
      },
      {
        name: 'Compliance telemetry uplift',
        status: 'Monitoring',
        owner: 'Risk & Trust Office',
        target: 'SOC2 attestation updates for streaming audit logs',
        checkpoint: 'Weekly controls sync every Thursday',
      },
    ],
  },
  {
    id: 'mosaic-health',
    name: 'Mosaic Health Network',
    segment: 'Healthcare & life sciences',
    tier: 'Growth',
    steward: 'Field Operations Council',
    opsContact: 'clinical-ops@mosaic.example',
    changeWindow: 'Wednesdays · 01:00 UTC',
    lastReview: '2025-02-12',
    notes: 'Rolling out time intelligence in phases aligned to compliance sign-off.',
    featureOverrides: {
      documents: true,
      reporting: true,
      notifications: true,
      audit: true,
      localization: true,
    },
    guardrails: [
      'Changes to scheduling must be communicated to the staffing council.',
      'Localization toggles require legal review for regional consent language.',
    ],
    rollouts: [
      {
        name: 'Care team coordination pilot',
        status: 'Active',
        owner: 'Clinical Transformation',
        target: 'Enable notifications + reporting across 6 hubs',
        checkpoint: 'Adoption retro every second Friday',
      },
      {
        name: 'Regulatory readiness window',
        status: 'Planned',
        owner: 'Compliance Office',
        target: 'Stage audit logging ahead of Q3 inspections',
        checkpoint: 'Kick-off planned for May 12',
      },
    ],
  },
  {
    id: 'evergreen-hospitality',
    name: 'Evergreen Hospitality Group',
    segment: 'Hospitality & leisure',
    tier: 'Emerging',
    steward: 'Experience Transformation Office',
    opsContact: 'experiences@evergreen.example',
    changeWindow: 'Fridays · 09:00 UTC',
    lastReview: '2025-02-07',
    notes: 'Prioritising operational stability with curated feature rollouts.',
    featureOverrides: {
      branding: true,
      customers: true,
      catalog: true,
      payments: true,
      scheduling: true,
    },
    guardrails: [
      'Do not disable customer data capture during loyalty relaunch.',
      'Coordinate catalog changes with merchandising leads before toggling.',
    ],
    rollouts: [
      {
        name: 'Guest experience uplift',
        status: 'Monitoring',
        owner: 'Guest Experience Lab',
        target: 'Track branding + scheduling adoption across retreats',
        checkpoint: 'Pulse survey every Monday',
      },
      {
        name: 'Payments resilience rehearsal',
        status: 'Planned',
        owner: 'Revenue Operations',
        target: 'Enable fallback providers ahead of summer travel peak',
        checkpoint: 'Tabletop exercise on Jun 2',
      },
    ],
  },
];

const registryDefaults: Record<FeatureKey, boolean> = SharedFeatureRegistry.reduce(
  (accumulator, feature) => {
    accumulator[feature.key] = feature.enabledByDefault ?? false;
    return accumulator;
  },
  {} as Record<FeatureKey, boolean>,
);

const totalFeatures = SharedFeatureRegistry.length;
const defaultEnabledCount = Object.values(registryDefaults).filter(Boolean).length;

const rolloutStatusStyles: Record<RolloutStatus, string> = {
  Active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Monitoring: 'bg-amber-100 text-amber-700 border-amber-200',
  Planned: 'bg-sky-100 text-sky-700 border-sky-200',
};

export const FeatureManagementPage = () => {
  const [featureState, setFeatureState] = useState<Record<string, Record<FeatureKey, boolean>>>(() =>
    organizations.reduce((accumulator, org) => {
      accumulator[org.id] = {
        ...registryDefaults,
        ...org.featureOverrides,
      };
      return accumulator;
    }, {} as Record<string, Record<FeatureKey, boolean>>),
  );

  const setFeatureEnabled = (orgId: string, key: FeatureKey, enabled: boolean) => {
    setFeatureState((current) => ({
      ...current,
      [orgId]: {
        ...(current[orgId] ?? registryDefaults),
        [key]: enabled,
      },
    }));
  };

  const summaries = useMemo(
    () =>
      organizations.map((org) => {
        const state = featureState[org.id] ?? registryDefaults;
        const enabledCount = Object.values(state).filter(Boolean).length;
        const coverage = totalFeatures === 0 ? 0 : Math.round((enabledCount / totalFeatures) * 100);
        const overrides = SharedFeatureRegistry.filter(
          (feature) => state[feature.key] !== registryDefaults[feature.key],
        ).length;

        return { org, state, enabledCount, coverage, overrides };
      }),
    [featureState],
  );

  const averageCoverage = useMemo(() => {
    if (summaries.length === 0 || totalFeatures === 0) {
      return 0;
    }
    const totalCoverage = summaries.reduce((accumulator, summary) => accumulator + summary.coverage, 0);
    return Math.round(totalCoverage / summaries.length);
  }, [summaries]);

  const activeOverrides = useMemo(
    () => summaries.reduce((accumulator, summary) => accumulator + summary.overrides, 0),
    [summaries],
  );

  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Platform administration</p>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-foreground">Feature Management Control Center</h1>
          <p className="max-w-3xl text-base text-muted-foreground">
            Coordinate feature availability across enterprise tenants. Use the toggles below to manage
            rollouts, keep compliance guardrails in place, and monitor divergence from the shared defaults
            defined in the platform registry.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Average coverage</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{averageCoverage}%</p>
            <p className="mt-1 text-xs text-muted-foreground">Across {summaries.length} organizations</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Baseline defaults</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {defaultEnabledCount} of {totalFeatures}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Features enabled by default in the registry</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/60 p-4 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Active overrides</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{activeOverrides}</p>
            <p className="mt-1 text-xs text-muted-foreground">Custom toggles across all organizations</p>
          </div>
        </div>
      </header>

      <div className="space-y-8">
        {summaries.map(({ org, state, enabledCount, coverage, overrides }) => (
          <article
            key={org.id}
            className="space-y-6 rounded-2xl border border-border bg-card/60 p-6 shadow-sm backdrop-blur"
          >
            <header className="flex flex-col gap-4 border-b border-border/60 pb-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {org.tier} organization · {org.segment}
                </p>
                <h2 className="text-2xl font-semibold text-foreground">{org.name}</h2>
                <p className="text-sm text-muted-foreground">{org.notes}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {enabledCount} / {totalFeatures} enabled
                </div>
                <div className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                  {coverage}% coverage
                </div>
                <div className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                  {overrides} overrides
                </div>
              </div>
            </header>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Feature toggles</h3>
                    <p className="text-sm text-muted-foreground">
                      Adjust availability per organization. Overrides differ from the shared defaults set in the
                      registry.
                    </p>
                  </div>
                  <div className="rounded-lg border border-border/70 bg-background/60 px-3 py-1 text-xs text-muted-foreground">
                    Steward: <span className="font-semibold text-foreground">{org.steward}</span>
                  </div>
                </div>

                <ul className="grid gap-3 md:grid-cols-2">
                  {SharedFeatureRegistry.map((feature) => {
                    const enabled = state[feature.key];
                    const isDefault = registryDefaults[feature.key];
                    const isOverride = enabled !== isDefault;

                    return (
                      <li
                        key={feature.key}
                        className="rounded-xl border border-border/60 bg-background/60 p-4 shadow-sm transition hover:border-primary/50"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-foreground">{feature.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Default: {isDefault ? 'Enabled' : 'Disabled'}
                              {feature.requiredPerm ? ` · Perm: ${feature.requiredPerm}` : ''}
                            </p>
                          </div>
                          <Switch
                            aria-label={`Toggle ${feature.title} for ${org.name}`}
                            checked={enabled}
                            onCheckedChange={(value) => setFeatureEnabled(org.id, feature.key, value)}
                          />
                        </div>
                        {isOverride ? (
                          <p className="mt-3 text-xs font-medium text-amber-600">
                            Override active · {enabled ? 'Enabled' : 'Disabled'} for this organization
                          </p>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              </section>

              <aside className="space-y-5 rounded-xl border border-border/60 bg-background/60 p-4 shadow-sm">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Operational
                    context</h3>
                  <dl className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between gap-2">
                      <dt className="font-semibold text-foreground">Change window</dt>
                      <dd>{org.changeWindow}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="font-semibold text-foreground">Operations contact</dt>
                      <dd>{org.opsContact}</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt className="font-semibold text-foreground">Last review</dt>
                      <dd>{org.lastReview}</dd>
                    </div>
                  </dl>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Guardrails</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {org.guardrails.map((guardrail) => (
                      <li key={guardrail} className="rounded-lg border border-border/60 bg-card/60 p-3">
                        {guardrail}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Rollout
                    trackers</h3>
                  <ul className="space-y-3">
                    {org.rollouts.map((rollout) => (
                      <li
                        key={rollout.name}
                        className="rounded-lg border border-border/60 bg-card/60 p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold text-foreground">{rollout.name}</p>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${rolloutStatusStyles[rollout.status]}`}
                          >
                            {rollout.status}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">{rollout.target}</p>
                        <dl className="mt-2 space-y-1 text-xs text-muted-foreground">
                          <div className="flex justify-between gap-2">
                            <dt className="font-semibold text-foreground">Owner</dt>
                            <dd>{rollout.owner}</dd>
                          </div>
                          <div className="flex justify-between gap-2">
                            <dt className="font-semibold text-foreground">Checkpoint</dt>
                            <dd>{rollout.checkpoint}</dd>
                          </div>
                        </dl>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
