import { useMemo } from 'react';

import type { Role, User } from '../types';

export type AttributeValue = string | string[];

export interface CurrentUser extends User {
  permissions: string[];
  attributes?: Record<string, AttributeValue>;
  org?: string;
}

const normalizeKey = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

const mergePermissions = (values: string[]) => {
  const deduped = new Map<string, string>();
  values
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
    .forEach((item) => {
      const key = normalizeKey(item);
      if (!deduped.has(key)) {
        deduped.set(key, item);
      }
    });
  return Array.from(deduped.values());
};

const ROLE_PERMISSION_MATRIX: Record<Role, string[]> = {
  owner: [
    'org:manage',
    'billing:admin',
    'policies:approve',
    'users:invite',
    'reports:view:all',
  ],
  admin: [
    'org:update',
    'users:invite',
    'reports:view:department',
  ],
  manager: [
    'schedules:publish',
    'invitations:approve',
    'reports:view:team',
  ],
  clerk: [
    'inventory:update',
    'orders:process',
  ],
  tech: [
    'integrations:manage',
    'systems:monitor',
  ],
  viewer: ['reports:view'],
};

const DEFAULT_USER: CurrentUser = {
  id: 'user-001',
  name: 'Jordan Martinez',
  email: 'jordan.martinez@configpro.com',
  orgId: 'org-001',
  org: 'ConfigPro',
  roles: ['owner', 'admin'],
  permissions: ['policies:approve', 'systems:audit'],
  attributes: {
    regions: ['north-america', 'emea'],
    environment: 'production',
  },
};

const derivePermissions = ({ roles, permissions }: Pick<CurrentUser, 'roles' | 'permissions'>) => {
  const rolePermissions = roles.flatMap((role) => ROLE_PERMISSION_MATRIX[role] ?? []);
  return mergePermissions([...permissions, ...rolePermissions]);
};

export const useCurrentUser = (): CurrentUser => {
  return useMemo(() => {
    const roles = mergePermissions(DEFAULT_USER.roles) as Role[];
    const permissions = derivePermissions({ roles, permissions: DEFAULT_USER.permissions });
    return {
      ...DEFAULT_USER,
      roles,
      permissions,
    };
  }, []);
};

export const __testing = {
  DEFAULT_USER,
  ROLE_PERMISSION_MATRIX,
  mergePermissions,
  derivePermissions,
};
