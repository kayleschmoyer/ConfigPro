export type DiscountActionType = 'percentage' | 'fixed' | 'tiered-percentage';

export type DiscountTarget = 'order' | 'line';

export interface DiscountTier {
  threshold: number;
  value: number;
}

export interface TieredDiscountAction {
  type: 'tiered-percentage';
  metric: 'orderValue' | 'quantity';
  tiers: DiscountTier[];
  targetSkus?: string[];
}

export interface PercentageDiscountAction {
  type: 'percentage';
  value: number;
  targetSkus?: string[];
}

export interface FixedDiscountAction {
  type: 'fixed';
  value: number;
  targetSkus?: string[];
}

export type DiscountRuleAction =
  | (PercentageDiscountAction & { appliesTo: DiscountTarget })
  | (FixedDiscountAction & { appliesTo: DiscountTarget })
  | (TieredDiscountAction & { appliesTo: DiscountTarget });

export interface DiscountRuleConditions {
  segments?: string[];
  channels?: string[];
  promoCodes?: string[];
  minOrderValue?: number;
  minQuantity?: number;
  skuInclusion?: string[];
  startDate?: string;
  endDate?: string;
}

export interface DiscountRule {
  id: string;
  name: string;
  description?: string;
  priority: number;
  isActive: boolean;
  stackable: boolean;
  conditions: DiscountRuleConditions;
  action: DiscountRuleAction;
}

export interface PricingLine {
  sku: string;
  quantity: number;
  unitPrice: number;
  segment?: string;
}

export interface PricingEvaluationContext {
  currency: string;
  date: string | Date;
  customerSegment?: string;
  channel?: string;
  promoCode?: string;
  lines: PricingLine[];
}

export interface AppliedDiscount {
  ruleId: string;
  name: string;
  amount: number;
  description?: string;
}

export interface DiscountEvaluation {
  subtotal: number;
  appliedDiscounts: AppliedDiscount[];
  totalDiscount: number;
  totalDue: number;
}

const toDate = (value: string | Date): Date => (value instanceof Date ? value : new Date(value));

const normalizeTiers = (tiers: DiscountTier[]): DiscountTier[] =>
  [...tiers].sort((a, b) => a.threshold - b.threshold);

const sumLineTotal = (line: PricingLine) => line.quantity * line.unitPrice;

const calculateOrderValue = (context: PricingEvaluationContext) =>
  context.lines.reduce((acc, line) => acc + sumLineTotal(line), 0);

const calculateQuantity = (context: PricingEvaluationContext, skus?: string[]) =>
  context.lines
    .filter((line) => (skus ? skus.includes(line.sku) : true))
    .reduce((acc, line) => acc + line.quantity, 0);

const calculateLineAmount = (context: PricingEvaluationContext, skus?: string[]) =>
  context.lines
    .filter((line) => (skus ? skus.includes(line.sku) : true))
    .reduce((acc, line) => acc + sumLineTotal(line), 0);

const isWithinDateWindow = (contextDate: Date, start?: string, end?: string) => {
  if (!start && !end) {
    return true;
  }

  if (start && contextDate < toDate(start)) {
    return false;
  }

  if (end && contextDate > toDate(end)) {
    return false;
  }

  return true;
};

const matchesConditions = (
  rule: DiscountRule,
  context: PricingEvaluationContext,
  orderValue: number,
  contextDate: Date,
): boolean => {
  const { conditions } = rule;

  if (conditions.segments && conditions.segments.length > 0) {
    if (!context.customerSegment || !conditions.segments.includes(context.customerSegment)) {
      return false;
    }
  }

  if (conditions.channels && conditions.channels.length > 0) {
    if (!context.channel || !conditions.channels.includes(context.channel)) {
      return false;
    }
  }

  if (conditions.promoCodes && conditions.promoCodes.length > 0) {
    if (!context.promoCode || !conditions.promoCodes.includes(context.promoCode)) {
      return false;
    }
  }

  if (!isWithinDateWindow(contextDate, conditions.startDate, conditions.endDate)) {
    return false;
  }

  if (typeof conditions.minOrderValue === 'number' && orderValue < conditions.minOrderValue) {
    return false;
  }

  if (conditions.minQuantity) {
    const quantity = calculateQuantity(context, conditions.skuInclusion);
    if (quantity < conditions.minQuantity) {
      return false;
    }
  }

  if (conditions.skuInclusion && conditions.skuInclusion.length > 0) {
    const hasSku = context.lines.some((line) => conditions.skuInclusion?.includes(line.sku));
    if (!hasSku) {
      return false;
    }
  }

  return true;
};

const evaluatePercentageAction = (
  action: PercentageDiscountAction & { appliesTo: DiscountTarget },
  context: PricingEvaluationContext,
  orderValue: number,
): number => {
  const baseAmount =
    action.appliesTo === 'order'
      ? orderValue
      : calculateLineAmount(context, action.targetSkus);

  return (baseAmount * action.value) / 100;
};

const evaluateFixedAction = (
  action: FixedDiscountAction & { appliesTo: DiscountTarget },
  context: PricingEvaluationContext,
  orderValue: number,
): number => {
  const baseAmount =
    action.appliesTo === 'order'
      ? orderValue
      : calculateLineAmount(context, action.targetSkus);

  return Math.min(action.value, baseAmount);
};

const resolveTierValue = (tiers: DiscountTier[], metricValue: number): number => {
  const ordered = normalizeTiers(tiers);
  let resolved = 0;

  for (const tier of ordered) {
    if (metricValue >= tier.threshold) {
      resolved = tier.value;
    } else {
      break;
    }
  }

  return resolved;
};

const evaluateTieredAction = (
  action: TieredDiscountAction & { appliesTo: DiscountTarget },
  context: PricingEvaluationContext,
  orderValue: number,
): number => {
  const baseAmount =
    action.appliesTo === 'order'
      ? orderValue
      : calculateLineAmount(context, action.targetSkus);

  const metricValue =
    action.metric === 'quantity'
      ? calculateQuantity(context, action.targetSkus)
      : baseAmount;

  const tierValue = resolveTierValue(action.tiers, metricValue);

  return (baseAmount * tierValue) / 100;
};

const evaluateRule = (
  rule: DiscountRule,
  context: PricingEvaluationContext,
  orderValue: number,
): number => {
  switch (rule.action.type) {
    case 'percentage':
      return evaluatePercentageAction(rule.action, context, orderValue);
    case 'fixed':
      return evaluateFixedAction(rule.action, context, orderValue);
    case 'tiered-percentage':
      return evaluateTieredAction(rule.action, context, orderValue);
    default:
      return 0;
  }
};

export const evaluateDiscounts = (
  context: PricingEvaluationContext,
  rules: DiscountRule[],
): DiscountEvaluation => {
  const contextDate = toDate(context.date);
  const subtotal = calculateOrderValue(context);
  const sortedRules = [...rules]
    .filter((rule) => rule.isActive)
    .sort((a, b) => a.priority - b.priority);

  const appliedDiscounts: AppliedDiscount[] = [];
  const nonStackableTargets = new Set<DiscountTarget>();

  for (const rule of sortedRules) {
    if (nonStackableTargets.has(rule.action.appliesTo)) {
      continue;
    }

    if (!matchesConditions(rule, context, subtotal, contextDate)) {
      continue;
    }

    const amount = evaluateRule(rule, context, subtotal);

    if (amount <= 0) {
      continue;
    }

    appliedDiscounts.push({
      ruleId: rule.id,
      name: rule.name,
      description: rule.description,
      amount,
    });

    if (!rule.stackable) {
      nonStackableTargets.add(rule.action.appliesTo);
    }
  }

  const totalDiscount = appliedDiscounts.reduce((acc, entry) => acc + entry.amount, 0);
  const totalDue = Math.max(subtotal - totalDiscount, 0);

  return {
    subtotal,
    appliedDiscounts,
    totalDiscount,
    totalDue,
  };
};
