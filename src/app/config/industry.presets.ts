import { FeatureKey } from "../../pages/shared/features";

export type IndustryKey = "retail" | "construction" | "daycare" | "automotive" | "generic";

export const IndustryFeatureMatrix: Record<IndustryKey, Partial<Record<FeatureKey, boolean>>> = {
  generic: {},
  retail:       { inventory: true, pricing: true, tax: true, payments: true, scheduling: false },
  construction: { scheduling: true, documents: true, pricing: true, tax: true },
  daycare:      { scheduling: true, customers: true, documents: true, payments: true },
  automotive:   { inventory: true, orders: true, customers: true, scheduling: true },
};
