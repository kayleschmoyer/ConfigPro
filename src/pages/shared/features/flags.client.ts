export type FeatureFlagKey =
  | 'smartSchedulingAutomation'
  | 'aiShiftInsights'
  | 'mobileOfflineMode'
  | 'partnerSandboxConnectors'
  | 'advancedAuditLogStreaming';

type FlagState = 'on' | 'off' | 'pilot';

export interface FlagDefinition {
  key: FeatureFlagKey;
  label: string;
  description: string;
  defaultState: FlagState;
  owner: string;
  releasePlan: string;
}

export interface OrgFlagProfile {
  id: string;
  name: string;
  segment: string;
  steward: string;
  notes: string;
  flags: Partial<Record<FeatureFlagKey, FlagState>>;
}

export interface LocationFlagOverride {
  orgId: string;
  locationId: string;
  locationName: string;
  market: string;
  contact: string;
  rationale: string;
  flags: Partial<Record<FeatureFlagKey, FlagState>>;
}

const featureFlagDefinitions: FlagDefinition[] = [
  {
    key: 'smartSchedulingAutomation',
    label: 'Smart scheduling automation',
    description:
      'Unlocks the orchestration engine that generates coverage plans from demand scenarios, guardrails, and labour policies.',
    defaultState: 'pilot',
    owner: 'Workforce Intelligence',
    releasePlan: 'Scaling globally after the spring release window',
  },
  {
    key: 'aiShiftInsights',
    label: 'AI shift insights',
    description:
      'Surfaces prescriptive shift suggestions, attrition signals, and variance explanations directly in scheduling consoles.',
    defaultState: 'off',
    owner: 'Time Intelligence Studio',
    releasePlan: 'Beta invites refreshed monthly based on telemetry readiness',
  },
  {
    key: 'mobileOfflineMode',
    label: 'Mobile offline mode',
    description:
      'Ensures team members can clock actions, review tasks, and sync updates while connectivity is degraded or unavailable.',
    defaultState: 'on',
    owner: 'Mobile Platform Guild',
    releasePlan: 'Generally available and monitored through resiliency scorecards',
  },
  {
    key: 'partnerSandboxConnectors',
    label: 'Partner sandbox connectors',
    description:
      'Provides managed partner environments with seeded data, throttling controls, and secure credential rotations.',
    defaultState: 'pilot',
    owner: 'Ecosystem Partnerships',
    releasePlan: 'Expanding quarterly as new partner cohorts clear certification',
  },
  {
    key: 'advancedAuditLogStreaming',
    label: 'Advanced audit log streaming',
    description:
      'Streams configuration mutations and privileged actions to customer SIEM tooling via EventBridge.',
    defaultState: 'off',
    owner: 'Security & Compliance',
    releasePlan: 'Enterprise early access with SOC2 attestation updates in Q3',
  },
];

const orgFlagProfiles: OrgFlagProfile[] = [
  {
    id: 'aurora-collective',
    name: 'Aurora Retail Collective',
    segment: 'Enterprise retail',
    steward: 'Chief Workforce Officer',
    notes: 'Flagship modernisation cohort with heavy experimentation appetite.',
    flags: {
      smartSchedulingAutomation: 'on',
      aiShiftInsights: 'pilot',
      mobileOfflineMode: 'on',
      partnerSandboxConnectors: 'pilot',
      advancedAuditLogStreaming: 'on',
    },
  },
  {
    id: 'mosaic-health',
    name: 'Mosaic Health Network',
    segment: 'Healthcare & life sciences',
    steward: 'Field Operations Council',
    notes: 'Rolling out time intelligence in phases aligned to compliance sign-off.',
    flags: {
      smartSchedulingAutomation: 'pilot',
      aiShiftInsights: 'off',
      mobileOfflineMode: 'on',
      partnerSandboxConnectors: 'off',
      advancedAuditLogStreaming: 'pilot',
    },
  },
  {
    id: 'evergreen-hospitality',
    name: 'Evergreen Hospitality Group',
    segment: 'Hospitality & leisure',
    steward: 'Experience Transformation Office',
    notes: 'Prioritising operational stability while building telemetry maturity.',
    flags: {
      smartSchedulingAutomation: 'off',
      aiShiftInsights: 'off',
      mobileOfflineMode: 'on',
      partnerSandboxConnectors: 'off',
      advancedAuditLogStreaming: 'pilot',
    },
  },
];

const locationFlagOverrides: LocationFlagOverride[] = [
  {
    orgId: 'aurora-collective',
    locationId: 'aurora-nyc-flagship',
    locationName: 'New York City Flagship',
    market: 'North America',
    contact: 'Command Center (nyc-ops@aurora.example)',
    rationale: 'Hyper-connected store with live pilots and 24/7 coverage from the operations command center.',
    flags: {
      aiShiftInsights: 'on',
      partnerSandboxConnectors: 'on',
    },
  },
  {
    orgId: 'aurora-collective',
    locationId: 'aurora-oslo-studio',
    locationName: 'Oslo Studio',
    market: 'EMEA',
    contact: 'Regional Experience Lead (oslo-playbooks@aurora.example)',
    rationale: 'Testing mobility resilience to support remote pop-ups in winter markets.',
    flags: {
      mobileOfflineMode: 'on',
      smartSchedulingAutomation: 'pilot',
    },
  },
  {
    orgId: 'mosaic-health',
    locationId: 'mosaic-seattle-clinic',
    locationName: 'Seattle Specialty Clinic',
    market: 'North America',
    contact: 'Clinical Operations PMO (clinic-pmo@mosaic.example)',
    rationale: 'Clinic pilots higher automation with 24-hour nursing rotation and union observers.',
    flags: {
      smartSchedulingAutomation: 'on',
      advancedAuditLogStreaming: 'on',
    },
  },
  {
    orgId: 'evergreen-hospitality',
    locationId: 'evergreen-kyoto-retreat',
    locationName: 'Kyoto Retreat',
    market: 'APAC',
    contact: 'Guest Experience Lab (kyoto-gxl@evergreen.example)',
    rationale: 'Seasonal team extends concierge experiences that rely on partner sandbox integrations.',
    flags: {
      partnerSandboxConnectors: 'pilot',
    },
  },
];

const flagOrder: FlagState[] = ['off', 'pilot', 'on'];

const isActiveState = (state: FlagState) => state === 'on' || state === 'pilot';

export interface FlagResolution {
  state: FlagState;
  source: 'default' | 'org' | 'location';
}

export const getFlagDefinition = (key: FeatureFlagKey) =>
  featureFlagDefinitions.find((definition) => definition.key === key);

export const listFlagDefinitions = () => featureFlagDefinitions;

export const listOrgFlagProfiles = () => orgFlagProfiles;

export const listLocationOverrides = () => locationFlagOverrides;

const resolveOrgState = (flag: FeatureFlagKey, orgId?: string): FlagResolution => {
  const definition = getFlagDefinition(flag);
  let state: FlagState = definition?.defaultState ?? 'off';
  let source: FlagResolution['source'] = 'default';

  if (orgId) {
    const profile = orgFlagProfiles.find((org) => org.id === orgId);
    const orgState = profile?.flags[flag];
    if (orgState) {
      state = orgState;
      source = 'org';
    }
  }

  return { state, source };
};

export const resolveFlagState = ({
  flag,
  orgId,
  locationId,
}: {
  flag: FeatureFlagKey;
  orgId?: string;
  locationId?: string;
}): FlagResolution => {
  let resolution = resolveOrgState(flag, orgId);

  if (orgId && locationId) {
    const override = locationFlagOverrides.find(
      (location) => location.orgId === orgId && location.locationId === locationId,
    );

    const locationState = override?.flags[flag];
    if (locationState) {
      const shouldOverride =
        flagOrder.indexOf(locationState) >= flagOrder.indexOf(resolution.state) || resolution.source === 'default';
      if (shouldOverride) {
        resolution = { state: locationState, source: 'location' };
      }
    }
  }

  return resolution;
};

export const isFeatureEnabled = ({
  flag,
  orgId,
  locationId,
}: {
  flag: FeatureFlagKey;
  orgId?: string;
  locationId?: string;
}) => isActiveState(resolveFlagState({ flag, orgId, locationId }).state);

export const listOrgFlagStates = (orgId: string) => {
  return featureFlagDefinitions.map((definition) => ({
    flag: definition.key,
    definition,
    resolution: resolveFlagState({ flag: definition.key, orgId }),
  }));
};

export const listLocationFlagStates = (orgId: string, locationId: string) => {
  return featureFlagDefinitions.map((definition) => ({
    flag: definition.key,
    definition,
    resolution: resolveFlagState({ flag: definition.key, orgId, locationId }),
  }));
};
