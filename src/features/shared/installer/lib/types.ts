import type { ReactNode } from 'react';

export type ID = string;
export type ISO = string;

export type Money = {
  currency: string;
  value: number;
  precision?: number;
  cadence?: 'monthly' | 'annual' | 'one_time';
};

export type PlanTier = 'STARTER' | 'PRO' | 'ENTERPRISE' | 'CUSTOM';

export type FeatureCategory =
  | 'FINANCE'
  | 'WORKFORCE'
  | 'INVENTORY'
  | 'CUSTOMER'
  | 'INTEGRATIONS'
  | 'ADMIN'
  | 'ANALYTICS';

export interface FeatureCatalogItem {
  id: ID;
  name: string;
  category: FeatureCategory;
  description: string;
  basePrice?: Money;
  priceModel?: 'MONTHLY' | 'ANNUAL' | 'ONE_TIME' | 'PER_SEAT' | 'PER_LOCATION';
  perSeat?: boolean;
  perLocation?: boolean;
  dependsOn?: ID[];
  conflictsWith?: ID[];
  optionsSchema?: Record<string, unknown>;
  defaultRegion?: LayoutRegion;
  defaultIcon?: string;
  route?: string;
  tags?: string[];
  setupEstimate?: string;
  roiNote?: string;
  adminMeta?: {
    pinned?: boolean;
    hidden?: boolean;
    lastEditedAt?: string;
    lastEditedBy?: string;
  };
}

export interface FeatureSelection {
  featureId: ID;
  enabled: boolean;
  options?: Record<string, unknown>;
}

export type LayoutRegion = 'SIDEBAR' | 'HOME_BUTTON' | 'TOPBAR' | 'HIDDEN';

export interface LayoutItem {
  featureId: ID;
  label?: string;
  icon?: string;
  order: number;
  region: LayoutRegion;
}

export interface InstallerDraft {
  plan: PlanTier;
  seats?: number;
  locations?: number;
  selections: FeatureSelection[];
  layout: LayoutItem[];
  currency: string;
  locale?: string;
  couponCode?: string;
}

export interface PriceLineItem {
  label: string;
  amount: Money;
  meta?: Record<string, unknown>;
}

export interface PriceBreakdown {
  subtotal: Money;
  discounts?: Money;
  tax?: Money;
  totalMonthly?: Money;
  totalAnnual?: Money;
  lines: PriceLineItem[];
}

export interface ApplyResult {
  updatedRegistry: boolean;
  updatedFlags: boolean;
  updatedNav: boolean;
  mountedRoutes: string[];
  message?: string;
}

export type InstallerStepKey =
  | 'WELCOME'
  | 'FEATURES'
  | 'CONFIGURE'
  | 'PRICING'
  | 'LAYOUT'
  | 'REVIEW';

export type InstallerStep = {
  key: InstallerStepKey;
  label: string;
  description: string;
};

export interface PlanDefinition {
  tier: PlanTier;
  name: string;
  description: string;
  basePrice: Money;
  inclusions: string[];
  limits?: string[];
  recommended?: boolean;
}

export type InstallerContextValue = {
  draft: InstallerDraft;
  steps: InstallerStep[];
  activeStepIndex: number;
  catalog: FeatureCatalogItem[];
  selectedFeatureIds: string[];
  toggleFeature: (featureId: string, enabled: boolean) => void;
  updateFeatureOptions: (featureId: string, options: Record<string, unknown>) => void;
  updatePlan: (tier: PlanTier) => void;
  updateSeats: (seats: number | undefined) => void;
  updateLocations: (locations: number | undefined) => void;
  setCouponCode: (code?: string) => void;
  setActiveStep: (index: number) => void;
  goToStep: (step: InstallerStepKey) => void;
  goNext: () => void;
  goPrev: () => void;
  priceBreakdown: PriceBreakdown;
  layoutItems: LayoutItem[];
  updateLayout: (items: LayoutItem[]) => void;
  validation: {
    dependencies: Record<string, string[]>;
    conflicts: Record<string, string[]>;
    layout: string[];
  };
  billingVisible: boolean;
  applyChanges: () => Promise<ApplyResult>;
  applying: boolean;
  lastApplyResult?: ApplyResult;
  resetApplyResult: () => void;
  planDefinitions: PlanDefinition[];
  billingRole?: string;
  seatRange: { min: number; max: number };
  locationRange: { min: number; max: number };
  toastRegionProps: {
    id: string;
    role: string;
    'aria-live': 'polite' | 'assertive';
  };
  summaryHighlights: ReactNode[];
  admin: {
    isInternal: boolean;
    isAdmin: boolean;
    adminMode: boolean;
    setAdminMode: (enabled: boolean) => void;
    openPricingEditor: () => void;
    openCatalogEditor: (featureId?: string) => void;
    openDependenciesModal: () => void;
    openAuditDrawer: () => void;
    pinnedFeatureIds: string[];
    markPinned: (featureId: string, pinned: boolean) => Promise<void>;
    lastPublishedPricingAt?: string;
    resetLayout: () => Promise<void>;
  };
};
