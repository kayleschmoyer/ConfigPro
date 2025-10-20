import {
  listFlagDefinitions,
  listOrgFlagProfiles,
  listOrgFlagStates,
  listLocationOverrides,
  listLocationFlagStates,
  resolveFlagState,
  isFeatureEnabled,
} from './flags.client';
import type { FeatureFlagKey, FlagResolution } from './flags.client';
import { Card, CardDescription, CardTitle } from '../../../shared/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow
} from '../../../shared/ui/Table';

const stateLabels: Record<FlagResolution['state'], string> = {
  on: 'Enabled',
  pilot: 'Pilot',
  off: 'Disabled',
};

const stateClasses: Record<FlagResolution['state'], string> = {
  on: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  pilot: 'bg-amber-100 text-amber-800 border border-amber-200',
  off: 'bg-slate-100 text-slate-600 border border-slate-200',
};

const sourceCopy: Record<FlagResolution['source'], string> = {
  default: 'Global default',
  org: 'Org rollout',
  location: 'Location override',
};

const gatingExamples: {
  id: string;
  title: string;
  description: string;
  flag: FeatureFlagKey;
  orgId?: string;
  locationId?: string;
}[] = [
  {
    id: 'aurora-ai',
    title: 'Aurora NYC pilots AI insights',
    description:
      'The New York City flagship is cleared by the command center to run AI shift insights during holiday staffing.',
    flag: 'aiShiftInsights',
    orgId: 'aurora-collective',
    locationId: 'aurora-nyc-flagship',
  },
  {
    id: 'mosaic-partner',
    title: 'Mosaic clinics use partner sandboxes',
    description:
      'Most clinics stay on the default setting, so feature checks keep partner sandboxes off until locations explicitly opt in.',
    flag: 'partnerSandboxConnectors',
    orgId: 'mosaic-health',
  },
  {
    id: 'evergreen-offline',
    title: 'Evergreen Kyoto offline mode',
    description:
      'The Kyoto retreat relies on offline mode for seasonal pop-ups, so gating must respect the location override.',
    flag: 'mobileOfflineMode',
    orgId: 'evergreen-hospitality',
    locationId: 'evergreen-kyoto-retreat',
  },
];

const renderStateBadge = (resolution: FlagResolution) => (
  <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-0.5 text-xs font-semibold ${stateClasses[resolution.state]}`}>
    {stateLabels[resolution.state]}
    <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
      {sourceCopy[resolution.source]}
    </span>
  </span>
);

export const FeatureFlagsPage = () => {
  const flagDefinitions = listFlagDefinitions();
  const orgProfiles = listOrgFlagProfiles();
  const locationOverrides = listLocationOverrides();

  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Shared platform</p>
        <h1 className="text-3xl font-semibold text-foreground">Feature flags control service</h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Monitor how feature toggles graduate from global defaults to organisation and location rollouts. This hub
          documents ownership, launch plans, and gating logic so in-app experiences stay aligned with readiness.
        </p>
      </header>

      <section aria-labelledby="flag-catalog" className="space-y-6">
        <header className="space-y-1">
          <h2 id="flag-catalog" className="text-xl font-semibold text-foreground">
            Flag catalog
          </h2>
          <p className="text-sm text-muted-foreground">
            Shared feature toggles with their default posture, owning teams, and rollout context.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {flagDefinitions.map((definition) => (
            <article key={definition.key} className="flex h-full flex-col justify-between rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="space-y-3">
                <header className="space-y-1">
                  <h3 className="text-lg font-semibold text-foreground">{definition.label}</h3>
                  <p className="text-sm text-muted-foreground">{definition.description}</p>
                </header>
                <dl className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <dt className="font-semibold text-foreground">Default state</dt>
                    <dd className={`rounded-full px-2 py-0.5 font-semibold ${stateClasses[definition.defaultState]}`}>
                      {stateLabels[definition.defaultState]}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-semibold text-foreground">Owner</dt>
                    <dd>{definition.owner}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-semibold text-foreground">Release plan</dt>
                    <dd className="text-right">{definition.releasePlan}</dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="org-rollouts" className="space-y-6">
        <header className="space-y-1">
          <h2 id="org-rollouts" className="text-xl font-semibold text-foreground">
            Organisation rollouts
          </h2>
          <p className="text-sm text-muted-foreground">
            Track which cohorts have opted into advanced functionality and where defaults remain in place.
          </p>
        </header>

        <div className="space-y-6">
          {orgProfiles.map((org) => {
            const flagStates = listOrgFlagStates(org.id);
            return (
              <Card key={org.id} className="space-y-4">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <CardTitle>{org.name}</CardTitle>
                    <CardDescription>{org.segment}</CardDescription>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">Steward:</span> {org.steward}
                  </div>
                </div>
                <CardDescription>{org.notes}</CardDescription>

                <TableContainer>
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow>
                        <TableHead scope="col">Feature</TableHead>
                        <TableHead scope="col">Org state</TableHead>
                        <TableHead scope="col">Global default</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {flagStates.map(({ definition, resolution }) => (
                        <TableRow key={`${org.id}-${definition.key}`} className="align-top">
                          <TableCell>
                            <div className="font-medium text-foreground">{definition.label}</div>
                            <p className="text-xs text-muted-foreground">{definition.description}</p>
                          </TableCell>
                          <TableCell>{renderStateBadge(resolution)}</TableCell>
                          <TableCell>
                            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${stateClasses[definition.defaultState]}`}>
                              {stateLabels[definition.defaultState]}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Card>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="location-overrides" className="space-y-6">
        <header className="space-y-1">
          <h2 id="location-overrides" className="text-xl font-semibold text-foreground">
            Location-specific overrides
          </h2>
          <p className="text-sm text-muted-foreground">
            Highlight markets that run ahead of their organisation baseline so operations and product teams stay aligned on
            local readiness.
          </p>
        </header>

        <div className="grid gap-5 lg:grid-cols-2">
          {locationOverrides.map((location) => {
            const overrides = listLocationFlagStates(location.orgId, location.locationId).filter(
              ({ resolution }) => resolution.source === 'location',
            );
            return (
              <article key={location.locationId} className="flex h-full flex-col justify-between rounded-lg border border-border bg-card p-6 shadow-sm">
                <div className="space-y-4">
                  <header className="space-y-1">
                    <h3 className="text-lg font-semibold text-foreground">{location.locationName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {location.market} · {location.contact}
                    </p>
                  </header>
                  <p className="text-sm text-muted-foreground">{location.rationale}</p>
                </div>

                <div className="mt-4 space-y-3">
                  <h4 className="text-sm font-semibold text-foreground">Overrides in effect</h4>
                  {overrides.length > 0 ? (
                    <ul className="space-y-2">
                      {overrides.map(({ definition, resolution }) => {
                        const baseline = resolveFlagState({ flag: definition.key, orgId: location.orgId });
                        return (
                          <li key={`${location.locationId}-${definition.key}`} className="rounded-lg border border-border/80 bg-muted/30 p-3 text-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <span className="font-medium text-foreground">{definition.label}</span>
                              {renderStateBadge(resolution)}
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                              Baseline: {stateLabels[baseline.state]} · Location rationale supersedes {sourceCopy[baseline.source].toLowerCase()}.
                            </p>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p className="text-xs italic text-muted-foreground">No overrides beyond organisation posture.</p>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="gating-examples" className="space-y-6">
        <header className="space-y-1">
          <h2 id="gating-examples" className="text-xl font-semibold text-foreground">
            In-app gating examples
          </h2>
          <p className="text-sm text-muted-foreground">
            Reference scenarios that product teams can reuse inside loaders, hooks, or UI components to keep feature access
            synchronized.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-3">
          {gatingExamples.map((example) => {
            const resolution = resolveFlagState({
              flag: example.flag,
              orgId: example.orgId,
              locationId: example.locationId,
            });
            const enabled = isFeatureEnabled({
              flag: example.flag,
              orgId: example.orgId,
              locationId: example.locationId,
            });
            return (
              <article key={example.id} className="flex h-full flex-col justify-between rounded-lg border border-border bg-card p-5 shadow-sm">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-foreground">{example.title}</h3>
                  <p className="text-sm text-muted-foreground">{example.description}</p>
                </div>
                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-foreground">Resolved state</span>
                    {renderStateBadge(resolution)}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-foreground">Gate check</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
                        enabled ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      {enabled ? 'Pass' : 'Blocked'}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default FeatureFlagsPage;
