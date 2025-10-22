import { useSyncExternalStore } from 'react';
import { isAdmin, type User } from '@/lib/authz';
import type { FeatureCatalogItem, LayoutItem, LayoutRegion } from './types';
import { normalizeLayout } from './layout';

export type PricingSheet = {
  currency: string;
  monthly: number;
  annual: number;
  oneTime: number;
  perSeat: boolean;
  perLocation: boolean;
};

export type AdminAuditType =
  | 'RBAC_DENY'
  | 'PRICING_DRAFT_SAVED'
  | 'PRICING_PUBLISHED'
  | 'CATALOG_UPDATED'
  | 'DEPENDENCIES_UPDATED'
  | 'FEATURE_PINNED'
  | 'FEATURE_UNPINNED'
  | 'LAYOUT_RESET'
  | 'AUDIT_EVENT';

export interface AdminAuditEntry {
  id: string;
  type: AdminAuditType;
  actorId: string;
  actorEmail?: string;
  summary: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export interface CatalogOverride {
  description?: string;
  defaultRegion?: LayoutRegion;
  defaultIcon?: string;
  defaultVisibility?: 'visible' | 'hidden';
  defaultRegionLabel?: string;
  tags?: string[];
  pricingFlags?: {
    perSeat?: boolean;
    perLocation?: boolean;
  };
}

export interface DependencyOverride {
  dependsOn?: string[];
  conflictsWith?: string[];
}

interface AdminState {
  pricing: {
    draft: PricingSheet;
    published: PricingSheet;
    lastPublishedAt?: string;
    lastEditedAt?: string;
    lastEditedBy?: string;
  };
  catalogOverrides: Record<string, CatalogOverride>;
  dependencyOverrides: Record<string, DependencyOverride>;
  pinned: string[];
  audits: AdminAuditEntry[];
  lastLayoutResetAt?: string;
}

const now = () => new Date().toISOString();

const defaultPricing: PricingSheet = {
  currency: 'USD',
  monthly: 1599,
  annual: 16999,
  oneTime: 0,
  perSeat: false,
  perLocation: false,
};

const DEFAULT_STATE: AdminState = {
  pricing: {
    draft: { ...defaultPricing },
    published: { ...defaultPricing },
    lastPublishedAt: now(),
  },
  catalogOverrides: {},
  dependencyOverrides: {},
  pinned: [],
  audits: [],
  lastLayoutResetAt: undefined,
};

let state: AdminState = { ...DEFAULT_STATE };
const listeners = new Set<() => void>();

const notify = () => {
  for (const listener of listeners) {
    listener();
  }
};

const setState = (updater: (current: AdminState) => AdminState) => {
  const next = updater(state);
  state = next;
  notify();
  return state;
};

const makeId = () => `adm_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;

export class AdminForbiddenError extends Error {
  status = 403;

  constructor(message = 'Restricted to ConfigPro admins.') {
    super(message);
    this.name = 'AdminForbiddenError';
  }
}

const recordAudit = (entry: Omit<AdminAuditEntry, 'id' | 'timestamp'>) => {
  const fullEntry: AdminAuditEntry = {
    ...entry,
    id: makeId(),
    timestamp: now(),
  };
  setState((current) => ({
    ...current,
    audits: [fullEntry, ...current.audits].slice(0, 200),
  }));
};

const assertAdmin = (user: User | null | undefined, action: string) => {
  if (!user || !isAdmin(user)) {
    recordAudit({
      type: 'RBAC_DENY',
      actorId: user?.id ?? 'anonymous',
      actorEmail: user?.email,
      summary: `RBAC_DENY: ${action}`,
      details: { action },
    });
    throw new AdminForbiddenError();
  }
};

export const adminStore = {
  getState: () => state,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export const useAdminState = <T,>(selector: (state: AdminState) => T): T =>
  useSyncExternalStore(adminStore.subscribe, () => selector(adminStore.getState()), () => selector(DEFAULT_STATE));

export const getAdminSnapshot = () => adminStore.getState();

export const applyAdminCatalogAdjustments = (
  catalog: FeatureCatalogItem[],
  adminState: AdminState,
  options: { includeHidden: boolean }
) => {
  return catalog
    .map<FeatureCatalogItem>((item) => {
      const override = adminState.catalogOverrides[item.id];
      const dependencyOverride = adminState.dependencyOverrides[item.id];
      const pinned = adminState.pinned.includes(item.id);
      const hidden = override?.defaultVisibility === 'hidden';
      const merged: FeatureCatalogItem = {
        ...item,
        description: override?.description ?? item.description,
        defaultRegion: override?.defaultRegion ?? item.defaultRegion,
        defaultIcon: override?.defaultIcon ?? item.defaultIcon,
        perSeat: override?.pricingFlags?.perSeat ?? item.perSeat,
        perLocation: override?.pricingFlags?.perLocation ?? item.perLocation,
        dependsOn: dependencyOverride?.dependsOn ?? item.dependsOn,
        conflictsWith: dependencyOverride?.conflictsWith ?? item.conflictsWith,
      };
      merged.adminMeta = {
        pinned,
        hidden,
        lastEditedAt: adminState.pricing.lastEditedAt,
        lastEditedBy: adminState.pricing.lastEditedBy,
      };
      return merged;
    })
    .filter((item) => options.includeHidden || !item.adminMeta?.hidden);
};

export const savePricingDraft = async (user: User | null | undefined, draft: PricingSheet) => {
  assertAdmin(user, 'pricing.draft.save');
  setState((current) => ({
    ...current,
    pricing: {
      ...current.pricing,
      draft: { ...draft },
      lastEditedAt: now(),
      lastEditedBy: user?.email,
    },
  }));
  recordAudit({
    type: 'PRICING_DRAFT_SAVED',
    actorId: user!.id,
    actorEmail: user?.email,
    summary: 'Pricing draft updated',
    details: { draft },
  });
};

export const publishPricing = async (user: User | null | undefined) => {
  assertAdmin(user, 'pricing.publish');
  setState((current) => ({
    ...current,
    pricing: {
      ...current.pricing,
      published: { ...current.pricing.draft },
      lastPublishedAt: now(),
      lastEditedAt: now(),
      lastEditedBy: user?.email,
    },
  }));
  recordAudit({
    type: 'PRICING_PUBLISHED',
    actorId: user!.id,
    actorEmail: user?.email,
    summary: 'Pricing published to live catalog',
  });
};

export const getPublishedPricing = () => adminStore.getState().pricing.published;

export const getDraftPricing = (user: User | null | undefined) => {
  assertAdmin(user, 'pricing.draft.read');
  return adminStore.getState().pricing.draft;
};

export const saveCatalogOverride = async (
  user: User | null | undefined,
  featureId: string,
  override: CatalogOverride
) => {
  assertAdmin(user, 'catalog.update');
  setState((current) => ({
    ...current,
    catalogOverrides: {
      ...current.catalogOverrides,
      [featureId]: {
        ...(current.catalogOverrides[featureId] ?? {}),
        ...override,
      },
    },
  }));
  recordAudit({
    type: 'CATALOG_UPDATED',
    actorId: user!.id,
    actorEmail: user?.email,
    summary: `Catalog updated for ${featureId}`,
    details: override,
  });
};

export const saveDependencyOverride = async (
  user: User | null | undefined,
  featureId: string,
  override: DependencyOverride
) => {
  assertAdmin(user, 'dependencies.update');
  setState((current) => ({
    ...current,
    dependencyOverrides: {
      ...current.dependencyOverrides,
      [featureId]: {
        dependsOn: override.dependsOn ?? [],
        conflictsWith: override.conflictsWith ?? [],
      },
    },
  }));
  recordAudit({
    type: 'DEPENDENCIES_UPDATED',
    actorId: user!.id,
    actorEmail: user?.email,
    summary: `Dependencies updated for ${featureId}`,
    details: override,
  });
};

export const markFeaturePinned = async (user: User | null | undefined, featureId: string, pinned: boolean) => {
  assertAdmin(user, pinned ? 'feature.pin' : 'feature.unpin');
  setState((current) => {
    const set = new Set(current.pinned);
    if (pinned) {
      set.add(featureId);
    } else {
      set.delete(featureId);
    }
    return {
      ...current,
      pinned: Array.from(set),
    };
  });
  recordAudit({
    type: pinned ? 'FEATURE_PINNED' : 'FEATURE_UNPINNED',
    actorId: user!.id,
    actorEmail: user?.email,
    summary: `${pinned ? 'Pinned' : 'Unpinned'} feature ${featureId}`,
  });
};

export const resetLayoutToDefault = async (
  user: User | null | undefined,
  catalog: FeatureCatalogItem[],
  selectionIds: string[]
): Promise<LayoutItem[]> => {
  assertAdmin(user, 'layout.reset');
  const layout = normalizeLayout(catalog, selectionIds, []);
  setState((current) => ({
    ...current,
    lastLayoutResetAt: now(),
  }));
  recordAudit({
    type: 'LAYOUT_RESET',
    actorId: user!.id,
    actorEmail: user?.email,
    summary: 'Layout reset to defaults',
    details: { selectionCount: selectionIds.length },
  });
  return layout;
};

export const getPinnedFeatures = () => new Set(adminStore.getState().pinned);

export const useAuditLog = () =>
  useAdminState((adminState) => adminState.audits);

export const clearAdminState = () => {
  state = { ...DEFAULT_STATE };
  notify();
};
