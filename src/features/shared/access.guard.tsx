import { type ReactNode, useCallback, useMemo } from 'react';

import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  coreRoleDefinitions,
  type RoleDefinition,
} from '../../pages/shared/features/permissions.model';

export type MatchStrategy = 'all' | 'any';

type Renderable = ReactNode | ((context: RequirePermissionRenderContext) => ReactNode);

export interface RequirePermissionProps {
  needs: string | string[];
  match?: MatchStrategy;
  roleId?: string;
  children: Renderable;
  fallback?: Renderable;
}

export interface RequirePermissionRenderContext {
  canAccess: boolean;
  missing: string[];
  activeRole: RoleDefinition;
  availableRoles: RoleDefinition[];
  permissions: string[];
  match: MatchStrategy;
  evaluate: (needs: string | string[], strategy?: MatchStrategy) => boolean;
  setActiveRole: (roleId: string) => void;
}

const FALLBACK_ROLE: RoleDefinition =
  coreRoleDefinitions[0] ?? {
    id: 'unknown',
    name: 'Unknown role',
    summary: 'Default fallback role when no role definitions are available.',
    systems: [],
    permissions: [],
  };

const normalizePermission = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-');

const defaultFallback = ({ missing, activeRole }: RequirePermissionRenderContext) => (
  <div className="rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
    <p className="font-semibold text-foreground">Access restricted</p>
    <p className="mt-1">
      The <span className="font-medium text-foreground">{activeRole.name}</span> role is missing the required
      permission{missing.length > 1 ? 's' : ''}.
    </p>
    <ul className="mt-2 list-disc space-y-1 pl-5">
      {missing.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  </div>
);

export const RequirePermission = ({
  needs,
  match = 'all',
  roleId,
  children,
  fallback,
}: RequirePermissionProps) => {
  const [storedRoleId, setStoredRoleId] = useLocalStorage<string>('configpro.activeRole', FALLBACK_ROLE.id);

  const resolvedRoleId = roleId ?? storedRoleId;

  const activeRole = useMemo(() => {
    return coreRoleDefinitions.find((role) => role.id === resolvedRoleId) ?? FALLBACK_ROLE;
  }, [resolvedRoleId]);

  const normalizedPermissions = useMemo(
    () =>
      activeRole.permissions.map((permission) => ({
        raw: permission,
        key: normalizePermission(permission),
      })),
    [activeRole.permissions]
  );

  const permissionKeys = useMemo(
    () => new Set(normalizedPermissions.map((permission) => permission.key)),
    [normalizedPermissions]
  );

  const requirementList = useMemo(() => (Array.isArray(needs) ? needs : [needs]), [needs]);

  const evaluate = useCallback(
    (targetNeeds: string | string[], strategy: MatchStrategy = 'all') => {
      const requested = Array.isArray(targetNeeds) ? targetNeeds : [targetNeeds];
      if (requested.length === 0) return true;
      const hits = requested.filter((item) => permissionKeys.has(normalizePermission(item)));
      return strategy === 'all' ? hits.length === requested.length : hits.length > 0;
    },
    [permissionKeys]
  );

  const canAccess = useMemo(() => evaluate(requirementList, match), [evaluate, requirementList, match]);

  const missing = useMemo(() => {
    if (canAccess) return [];
    const unmatched = requirementList.filter((item) => !permissionKeys.has(normalizePermission(item)));
    return unmatched.length > 0 ? unmatched : requirementList;
  }, [canAccess, requirementList, permissionKeys]);

  const setActiveRole = useCallback(
    (nextRoleId: string) => {
      setStoredRoleId(nextRoleId);
    },
    [setStoredRoleId]
  );

  const context: RequirePermissionRenderContext = {
    canAccess,
    missing,
    activeRole,
    availableRoles: coreRoleDefinitions.length > 0 ? coreRoleDefinitions : [FALLBACK_ROLE],
    permissions: normalizedPermissions.map((permission) => permission.raw),
    match,
    evaluate,
    setActiveRole,
  };

  const renderNode = (node?: Renderable) => {
    if (typeof node === 'function') {
      return node(context);
    }
    if (!node) {
      return null;
    }
    return node;
  };

  return <>{canAccess ? renderNode(children) : renderNode(fallback ?? defaultFallback)}</>;
};

