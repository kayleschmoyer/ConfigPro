import { useMemo } from 'react';
import { useCurrencyFormat } from '@/shared/hooks/useCurrencyFormat';
import type {
  FeatureCatalogItem,
  FeatureSelection,
  InstallerDraft,
  PlanDefinition,
  PlanTier,
  PriceBreakdown,
  PriceLineItem,
} from './types';

const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    tier: 'STARTER',
    name: 'Starter',
    description: 'Core scheduling, invoicing, and compliance guardrails for new teams.',
    basePrice: { currency: 'USD', value: 399 },
    inclusions: ['Shared navigation foundation', 'Up to 50 employees', 'One location'],
    limits: ['Email support only'],
  },
  {
    tier: 'PRO',
    name: 'Pro',
    description: 'Multi-location finance automation with workforce intelligence built in.',
    basePrice: { currency: 'USD', value: 899 },
    inclusions: ['Everything in Starter', 'Finance automation APIs', 'Up to 5 locations'],
    limits: ['Success manager check-ins quarterly'],
    recommended: true,
  },
  {
    tier: 'ENTERPRISE',
    name: 'Enterprise',
    description: 'Scaled rollouts with enterprise security, analytics, and partner ecosystem.',
    basePrice: { currency: 'USD', value: 1999 },
    inclusions: ['Dedicated success pod', 'Unlimited locations', 'Audit-grade controls'],
    limits: ['Annual commitment'],
  },
  {
    tier: 'CUSTOM',
    name: 'Custom',
    description: 'Tailored bundle for unique go-to-market and compliance motions.',
    basePrice: { currency: 'USD', value: 0 },
    inclusions: ['Solution architect scoping workshop'],
  },
];

export const planDefinitions = PLAN_DEFINITIONS;

export const getPlanDefinition = (tier: PlanTier): PlanDefinition => {
  return PLAN_DEFINITIONS.find((plan) => plan.tier === tier) ?? PLAN_DEFINITIONS[0];
};

const resolveFeatureSelection = (
  selections: FeatureSelection[],
  feature: FeatureCatalogItem
) => selections.find((selection) => selection.featureId === feature.id && selection.enabled);

export const computePricing = (
  draft: InstallerDraft,
  catalog: FeatureCatalogItem[]
): PriceBreakdown => {
  const plan = getPlanDefinition(draft.plan);
  const currency = draft.currency || plan.basePrice.currency;

  const lines: PriceLineItem[] = [];
  const seatCount = draft.seats ?? 50;
  const locationCount = draft.locations ?? 1;

  const basePlanLine: PriceLineItem = {
    label: `${plan.name} plan`,
    amount: { currency, value: plan.basePrice.value },
    meta: { tier: plan.tier },
  };
  lines.push(basePlanLine);

  const featureLines = catalog
    .filter((feature) => resolveFeatureSelection(draft.selections, feature))
    .map<PriceLineItem>((feature) => {
      const baseValue = feature.basePrice?.value ?? 0;
      let value = baseValue;
      const meta: Record<string, unknown> = {};
      if (feature.perSeat) {
        value = baseValue * seatCount;
        meta.perSeat = seatCount;
      }
      if (feature.perLocation) {
        value = baseValue * locationCount;
        meta.perLocation = locationCount;
      }
      return {
        label: feature.name,
        amount: { currency, value },
        meta: {
          ...meta,
          priceModel: feature.priceModel,
        },
      };
    });

  lines.push(...featureLines);

  const subtotalValue = lines.reduce((sum, line) => sum + line.amount.value, 0);
  const subtotal = { currency, value: subtotalValue };

  let discounts: PriceLineItem['amount'] | undefined;
  if (draft.couponCode?.trim()) {
    discounts = { currency, value: Math.round(subtotalValue * 0.05 * -1) };
  }

  const taxableBase = subtotalValue + (discounts?.value ?? 0);
  const tax = { currency, value: Math.max(taxableBase * 0.0825, 0) };

  const totalMonthlyValue = taxableBase + tax.value;

  const totalMonthly = { currency, value: totalMonthlyValue };
  const annualDiscountRate = 0.1;
  const totalAnnual = {
    currency,
    value: Math.max(totalMonthlyValue * 12 * (1 - annualDiscountRate), 0),
  };

  if (discounts) {
    lines.push({ label: 'Promotional credit', amount: discounts, meta: { code: draft.couponCode } });
  }
  lines.push({ label: 'Estimated tax', amount: tax, meta: { rate: 0.0825 } });

  return {
    subtotal,
    discounts,
    tax,
    totalMonthly,
    totalAnnual,
    lines,
  };
};

export const usePriceBreakdown = (
  draft: InstallerDraft,
  catalog: FeatureCatalogItem[],
  formatterOptions?: { locale?: string; currency?: string }
) => {
  const breakdown = useMemo(() => computePricing(draft, catalog), [draft, catalog]);
  const { formatCurrency } = useCurrencyFormat({
    locale: formatterOptions?.locale ?? draft.locale,
    currency: formatterOptions?.currency ?? draft.currency,
  });

  return useMemo(
    () => ({
      breakdown,
      format: (value: number, currency = breakdown.subtotal.currency) =>
        formatCurrency(value, { currency }),
    }),
    [breakdown, formatCurrency]
  );
};
