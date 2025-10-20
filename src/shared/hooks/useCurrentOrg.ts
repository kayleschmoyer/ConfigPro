import { useCallback, useMemo } from 'react';

import { useSettingsStore, settingsStore } from '../../app/state/settings.store';
import {
  demoLocations,
  demoOrgs,
  type LocationFixture,
  type OrgFixture,
} from '../../dev/fixtures/org.fixtures';

const getDefaultOrgId = () => demoOrgs[0]?.id ?? null;

const getLocationsForOrg = (orgId: string | null) =>
  demoLocations.filter((location) => location.orgId === orgId);

export interface CurrentOrgContext {
  orgId: string | null;
  locationId: string | null;
  org: OrgFixture | null;
  location: LocationFixture | null;
  orgs: OrgFixture[];
  locations: LocationFixture[];
  setOrg: (orgId: string | null) => void;
  setLocation: (locationId: string | null) => void;
}

export const useCurrentOrg = (): CurrentOrgContext => {
  const { orgId: storedOrgId, locationId: storedLocationId } = useSettingsStore((state) => state);

  const orgs = useMemo(() => demoOrgs, []);
  const effectiveOrgId = storedOrgId ?? getDefaultOrgId();

  const org = useMemo(
    () => (effectiveOrgId ? orgs.find((candidate) => candidate.id === effectiveOrgId) ?? null : null),
    [effectiveOrgId, orgs],
  );

  const locations = useMemo(
    () => (effectiveOrgId ? getLocationsForOrg(effectiveOrgId) : []),
    [effectiveOrgId],
  );

  const location = useMemo(() => {
    if (!locations.length) return null;
    if (!storedLocationId) return locations[0];
    return locations.find((candidate) => candidate.id === storedLocationId) ?? locations[0];
  }, [locations, storedLocationId]);

  const setOrg = useCallback((nextOrgId: string | null) => {
    settingsStore.setOrg(nextOrgId);
  }, []);

  const setLocation = useCallback((nextLocationId: string | null) => {
    settingsStore.setLocation(nextLocationId);
  }, []);

  return {
    orgId: effectiveOrgId,
    locationId: location?.id ?? null,
    org: org ?? null,
    location,
    orgs,
    locations,
    setOrg,
    setLocation,
  };
};
