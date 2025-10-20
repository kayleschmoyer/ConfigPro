import { useMemo } from 'react';

import type { PermissionMatchStrategy } from '../components/RequirePermission';
import { useCurrentUser } from '../state/auth';

export interface UsePermissionOptions {
  perm: string | string[];
  match?: PermissionMatchStrategy;
}

export interface PermissionCheckResult {
  allowed: boolean;
  missing: string[];
  match: PermissionMatchStrategy;
  permissions: string[];
}

const normalizeKey = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

const toArray = (value: string | string[]) => (Array.isArray(value) ? value : [value]);

export const usePermission = ({ perm, match = 'all' }: UsePermissionOptions): PermissionCheckResult => {
  const user = useCurrentUser();

  const requirements = useMemo(
    () =>
      toArray(perm)
        .map((item) => item.trim())
        .filter((item) => item.length > 0),
    [perm],
  );

  const permissions = useMemo(
    () => (user?.permissions ?? []).map((item) => item.trim()).filter((item) => item.length > 0),
    [user?.permissions],
  );

  const allowed = useMemo(() => {
    if (!user) return false;
    if (requirements.length === 0) return true;

    const ownerRolePresent = user.roles.some((role) => normalizeKey(role) === 'owner');
    if (ownerRolePresent) return true;

    const normalizedPermissions = new Set(permissions.map(normalizeKey));
    const matches = requirements.filter((requirement) => normalizedPermissions.has(normalizeKey(requirement)));

    return match === 'any' ? matches.length > 0 : matches.length === requirements.length;
  }, [match, permissions, requirements, user]);

  const missing = useMemo(() => {
    if (allowed || requirements.length === 0) return [];

    const normalizedPermissions = new Set(permissions.map(normalizeKey));
    return requirements.filter((requirement) => !normalizedPermissions.has(normalizeKey(requirement)));
  }, [allowed, permissions, requirements]);

  return {
    allowed,
    missing,
    match,
    permissions,
  };
};
