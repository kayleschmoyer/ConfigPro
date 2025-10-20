import { type ReactNode, useMemo } from 'react';

import { useCurrentUser } from '../state/auth';

export type PermissionMatchStrategy = 'all' | 'any';

export interface RequirePermissionProps {
  perm: string | string[];
  match?: PermissionMatchStrategy;
  children: ReactNode;
  fallback?: ReactNode;
}

const normalizeKey = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

const defaultFallback = <div>Not authorized</div>;

export function RequirePermission({
  perm,
  match = 'all',
  children,
  fallback = defaultFallback,
}: RequirePermissionProps) {
  const user = useCurrentUser();

  const allowed = useMemo(() => {
    if (!user) return false;
    const ownerRolePresent = user.roles.some((role) => normalizeKey(role) === 'owner');
    if (ownerRolePresent) return true;

    const requirements = (Array.isArray(perm) ? perm : [perm])
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    if (requirements.length === 0) return true;

    const permissionSet = new Set((user.permissions ?? []).map(normalizeKey));
    const matches = requirements.filter((item) => permissionSet.has(normalizeKey(item)));

    return match === 'any' ? matches.length > 0 : matches.length === requirements.length;
  }, [match, perm, user]);

  return <>{allowed ? children : fallback}</>;
}
