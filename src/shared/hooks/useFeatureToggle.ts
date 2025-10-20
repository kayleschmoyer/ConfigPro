import { useMemo } from 'react';

import {
  type FeatureFlagKey,
  type FlagDefinition,
  type FlagResolution,
  isFeatureEnabled,
  listFlagDefinitions,
  resolveFlagState,
} from '../../pages/shared/features/flags.client';
import { useCurrentUser } from '../state/auth';

import { useCurrentOrg } from './useCurrentOrg';

export interface FeatureToggleAudience {
  orgId: string | null;
  locationId: string | null;
  industry: string | null;
  roles: string[];
}

export interface FeatureToggleEvaluation {
  key: FeatureFlagKey;
  enabled: boolean;
  resolution: FlagResolution;
  definition?: FlagDefinition;
  audience: FeatureToggleAudience;
  rationale: string;
}

const describeSource = (resolution: FlagResolution) => {
  switch (resolution.source) {
    case 'location':
      return 'location override';
    case 'org':
      return 'org profile';
    default:
      return 'default rollout';
  }
};

const describeAudience = (audience: FeatureToggleAudience) => {
  const segments: string[] = [];
  if (audience.industry) segments.push(audience.industry);
  if (audience.roles.length > 0) segments.push(`roles: ${audience.roles.join(', ')}`);
  if (audience.locationId) segments.push(`location: ${audience.locationId}`);
  if (audience.orgId) segments.push(`org: ${audience.orgId}`);
  return segments.length > 0 ? segments.join(' • ') : 'global audience';
};

export const useFeatureToggle = (flag: FeatureFlagKey): FeatureToggleEvaluation => {
  const { org, location } = useCurrentOrg();
  const user = useCurrentUser();

  const definitions = useMemo(() => listFlagDefinitions(), []);
  const definition = useMemo(
    () => definitions.find((candidate) => candidate.key === flag),
    [definitions, flag],
  );

  const resolution = useMemo(
    () => resolveFlagState({ flag, orgId: org?.id, locationId: location?.id }),
    [flag, location?.id, org?.id],
  );

  const enabled = useMemo(
    () => isFeatureEnabled({ flag, orgId: org?.id, locationId: location?.id }),
    [flag, location?.id, org?.id],
  );

  const audience = useMemo<FeatureToggleAudience>(
    () => ({
      orgId: org?.id ?? null,
      locationId: location?.id ?? null,
      industry: (org as { industry?: string } | undefined)?.industry ?? null,
      roles: user.roles,
    }),
    [location?.id, org, user.roles],
  );

  const rationale = useMemo(() => {
    if (!definition) {
      return `Flag "${flag}" is ${enabled ? 'enabled' : 'disabled'} (${resolution.state}) via ${describeSource(
        resolution,
      )}.`;
    }

    const audienceSummary = describeAudience(audience);
    const owner = definition.owner ? ` Owner: ${definition.owner}.` : '';
    const release = definition.releasePlan ? ` Release plan: ${definition.releasePlan}.` : '';

    if (enabled) {
      return `${definition.label} is active (${resolution.state}) through ${describeSource(
        resolution,
      )} for ${audienceSummary}.${owner}${release}`;
    }

    return `${definition.label} is inactive (${resolution.state}) due to ${describeSource(
      resolution,
    )} for ${audienceSummary}.${owner}${release}`;
  }, [audience, definition, enabled, flag, resolution]);

  return {
    key: flag,
    enabled,
    resolution,
    definition,
    audience,
    rationale,
  };
};
