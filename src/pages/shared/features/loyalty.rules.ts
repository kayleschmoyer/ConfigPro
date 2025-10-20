export type LoyaltyCurrency = 'points' | 'credits';

export interface LoyaltyRuleWindow {
  start?: string;
  end?: string;
}

export interface LoyaltyRuleConditions {
  channels?: string[];
  segments?: string[];
  tiers?: string[];
  eventTypes?: string[];
  promoCodes?: string[];
  metadata?: Record<string, string | number | boolean | (string | number | boolean)[]>;
  minSpend?: number;
}

export interface LoyaltyAccrualRule {
  id: string;
  name: string;
  description?: string;
  priority: number;
  isActive: boolean;
  currency: LoyaltyCurrency;
  metric: 'flat' | 'perSpend';
  rate: number;
  spendInterval?: number;
  bonusMultiplier?: number;
  cap?: number;
  window?: LoyaltyRuleWindow;
  conditions?: LoyaltyRuleConditions;
}

export interface LoyaltyRedemptionRule {
  id: string;
  name: string;
  description?: string;
  priority: number;
  isActive: boolean;
  currency: LoyaltyCurrency;
  debitPerUnit: number;
  valuePerUnit: number;
  minBalance?: number;
  maxUnitsPerRedemption?: number;
  window?: LoyaltyRuleWindow;
  conditions?: LoyaltyRuleConditions;
}

export interface LoyaltyAdjustmentPolicy {
  id: string;
  name: string;
  description: string;
  appliesTo: LoyaltyCurrency[];
  approvalRequired: boolean;
  auditCadence: 'daily' | 'weekly' | 'monthly';
}

export interface LoyaltyRulebook {
  programId: string;
  currencyLabel: string;
  accrualRules: LoyaltyAccrualRule[];
  redemptionRules: LoyaltyRedemptionRule[];
  adjustmentPolicies: LoyaltyAdjustmentPolicy[];
}

export interface LoyaltyAccountSnapshot {
  segment?: string;
  tier?: string;
  balances: Partial<Record<LoyaltyCurrency, number>>;
}

export interface LoyaltyAccrualEvent {
  type: string;
  spend?: number;
  channel?: string;
  segment?: string;
  tier?: string;
  promoCode?: string;
  metadata?: Record<string, string | number | boolean>;
  occurredAt: string | Date;
}

export interface LoyaltyAccrualAward {
  ruleId: string;
  name: string;
  currency: LoyaltyCurrency;
  amount: number;
  description?: string;
}

export interface LoyaltyAccrualEvaluation {
  awards: LoyaltyAccrualAward[];
  totalByCurrency: Partial<Record<LoyaltyCurrency, number>>;
}

export interface LoyaltyRedemptionRequest {
  currency: LoyaltyCurrency;
  desiredValue: number;
  channel?: string;
  segment?: string;
  tier?: string;
  metadata?: Record<string, string | number | boolean>;
  requestedAt: string | Date;
}

export interface LoyaltyRedemptionEvaluation {
  ruleId?: string;
  name?: string;
  unitsRedeemed: number;
  currencyDebited: number;
  valueRealised: number;
  message?: string;
}

const toDate = (value: string | Date): Date => (value instanceof Date ? value : new Date(value));

const isWithinWindow = (date: Date, window?: LoyaltyRuleWindow): boolean => {
  if (!window) {
    return true;
  }

  if (window.start && date < toDate(window.start)) {
    return false;
  }

  if (window.end && date > toDate(window.end)) {
    return false;
  }

  return true;
};

const matchesConditions = (
  conditions: LoyaltyRuleConditions | undefined,
  context: {
    channel?: string;
    segment?: string;
    tier?: string;
    eventType?: string;
    promoCode?: string;
    spend?: number;
    metadata?: Record<string, string | number | boolean>;
  },
): boolean => {
  if (!conditions) {
    return true;
  }

  const { channel, segment, tier, eventType, promoCode, spend, metadata } = context;

  if (conditions.channels?.length && (!channel || !conditions.channels.includes(channel))) {
    return false;
  }

  if (conditions.segments?.length) {
    if (!segment || !conditions.segments.includes(segment)) {
      return false;
    }
  }

  if (conditions.tiers?.length) {
    if (!tier || !conditions.tiers.includes(tier)) {
      return false;
    }
  }

  if (conditions.eventTypes?.length) {
    if (!eventType || !conditions.eventTypes.includes(eventType)) {
      return false;
    }
  }

  if (conditions.promoCodes?.length) {
    if (!promoCode || !conditions.promoCodes.includes(promoCode)) {
      return false;
    }
  }

  if (typeof conditions.minSpend === 'number') {
    if (typeof spend !== 'number' || spend < conditions.minSpend) {
      return false;
    }
  }

  if (conditions.metadata) {
    if (!metadata) {
      return false;
    }

    for (const [key, expected] of Object.entries(conditions.metadata)) {
      const actual = metadata[key];
      if (Array.isArray(expected)) {
        if (actual === undefined || !expected.includes(actual as never)) {
          return false;
        }
      } else if (actual !== expected) {
        return false;
      }
    }
  }

  return true;
};

export const evaluateAccrualRules = (
  rulebook: LoyaltyRulebook,
  event: LoyaltyAccrualEvent,
  account: LoyaltyAccountSnapshot,
): LoyaltyAccrualEvaluation => {
  const eventDate = toDate(event.occurredAt);
  const awards: LoyaltyAccrualAward[] = [];

  const context = {
    channel: event.channel,
    segment: event.segment ?? account.segment,
    tier: event.tier ?? account.tier,
    eventType: event.type,
    promoCode: event.promoCode,
    spend: event.spend,
    metadata: event.metadata,
  } as const;

  const sorted = [...rulebook.accrualRules].sort((a, b) => a.priority - b.priority);

  for (const rule of sorted) {
    if (!rule.isActive || !isWithinWindow(eventDate, rule.window)) {
      continue;
    }

    if (!matchesConditions(rule.conditions, context)) {
      continue;
    }

    let amount = 0;
    if (rule.metric === 'flat') {
      amount = rule.rate;
    } else if (rule.metric === 'perSpend') {
      const interval = rule.spendInterval && rule.spendInterval > 0 ? rule.spendInterval : 1;
      const spend = event.spend ?? 0;
      amount = Math.floor(spend / interval) * rule.rate;
    }

    if (rule.bonusMultiplier && rule.bonusMultiplier > 0) {
      amount *= rule.bonusMultiplier;
    }

    if (rule.cap && amount > rule.cap) {
      amount = rule.cap;
    }

    if (amount <= 0) {
      continue;
    }

    awards.push({
      ruleId: rule.id,
      name: rule.name,
      currency: rule.currency,
      amount,
      description: rule.description,
    });
  }

  const totalByCurrency = awards.reduce<Partial<Record<LoyaltyCurrency, number>>>((totals, award) => {
    const existing = totals[award.currency] ?? 0;
    totals[award.currency] = existing + award.amount;
    return totals;
  }, {});

  return { awards, totalByCurrency };
};

export const evaluateRedemptionRules = (
  rulebook: LoyaltyRulebook,
  request: LoyaltyRedemptionRequest,
  account: LoyaltyAccountSnapshot,
): LoyaltyRedemptionEvaluation => {
  const requestDate = toDate(request.requestedAt);
  const sorted = [...rulebook.redemptionRules].sort((a, b) => a.priority - b.priority);

  for (const rule of sorted) {
    if (!rule.isActive || rule.currency !== request.currency) {
      continue;
    }

    if (!isWithinWindow(requestDate, rule.window)) {
      continue;
    }

    const context = {
      channel: request.channel,
      segment: request.segment ?? account.segment,
      tier: request.tier ?? account.tier,
      eventType: undefined,
      promoCode: undefined,
      spend: undefined,
      metadata: request.metadata,
    } as const;

    if (!matchesConditions(rule.conditions, context)) {
      continue;
    }

    const availableBalance = account.balances[rule.currency] ?? 0;

    if (typeof rule.minBalance === 'number' && availableBalance < rule.minBalance) {
      continue;
    }

    const debitCapacity = Math.floor(availableBalance / rule.debitPerUnit);
    if (debitCapacity <= 0) {
      continue;
    }

    const desiredUnits = Math.floor(request.desiredValue / rule.valuePerUnit);
    if (desiredUnits <= 0) {
      continue;
    }

    const cappedUnits = Math.min(
      desiredUnits,
      debitCapacity,
      rule.maxUnitsPerRedemption ?? Number.POSITIVE_INFINITY,
    );

    if (cappedUnits <= 0) {
      continue;
    }

    const currencyDebited = cappedUnits * rule.debitPerUnit;
    const valueRealised = cappedUnits * rule.valuePerUnit;

    return {
      ruleId: rule.id,
      name: rule.name,
      unitsRedeemed: cappedUnits,
      currencyDebited,
      valueRealised,
      message: rule.description,
    };
  }

  return {
    unitsRedeemed: 0,
    currencyDebited: 0,
    valueRealised: 0,
    message: 'No redemption rules matched the request or balance.',
  };
};

export const loyaltyRulebook: LoyaltyRulebook = {
  programId: 'configpro-unified',
  currencyLabel: 'Spark Balance',
  accrualRules: [
    {
      id: 'base-spend',
      name: 'Base spend accrual',
      description: 'Awards 1 point per currency unit on qualifying spend across all channels.',
      priority: 10,
      isActive: true,
      currency: 'points',
      metric: 'perSpend',
      rate: 1,
      spendInterval: 1,
      window: {},
      conditions: {
        eventTypes: ['purchase'],
        minSpend: 1,
      },
    },
    {
      id: 'tier-multiplier',
      name: 'Tier multiplier',
      description: 'Loyalty tiers receive multipliers on base accrual for premium guests.',
      priority: 15,
      isActive: true,
      currency: 'points',
      metric: 'perSpend',
      rate: 1,
      spendInterval: 1,
      bonusMultiplier: 1.5,
      conditions: {
        eventTypes: ['purchase'],
        tiers: ['Gold', 'Platinum'],
      },
    },
    {
      id: 'engagement-bonus',
      name: 'Engagement survey bonus',
      description: 'Flat bonus for completing quarterly feedback journeys.',
      priority: 30,
      isActive: true,
      currency: 'points',
      metric: 'flat',
      rate: 250,
      window: {
        start: '2024-01-01',
      },
      conditions: {
        eventTypes: ['survey-completed'],
        channels: ['email', 'in-app'],
      },
    },
    {
      id: 'referral-credit',
      name: 'Referral credit issue',
      description: 'Awards configurable wallet credits when referrals convert within 30 days.',
      priority: 40,
      isActive: true,
      currency: 'credits',
      metric: 'flat',
      rate: 20,
      conditions: {
        eventTypes: ['referral-conversion'],
        metadata: { cohort: 'referrer' },
      },
    },
    {
      id: 'launch-campaign',
      name: 'New market launch boost',
      description: 'Double points for purchases in launch regions during campaign window.',
      priority: 20,
      isActive: true,
      currency: 'points',
      metric: 'perSpend',
      rate: 1,
      spendInterval: 1,
      bonusMultiplier: 2,
      window: {
        start: '2024-05-01',
        end: '2024-07-31',
      },
      conditions: {
        eventTypes: ['purchase'],
        metadata: { region: ['Berlin', 'Madrid', 'Singapore'] },
      },
    },
  ],
  redemptionRules: [
    {
      id: 'checkout-credit',
      name: 'Checkout instant credit',
      description: 'Redeem 100 points for $5 discount at checkout.',
      priority: 10,
      isActive: true,
      currency: 'points',
      debitPerUnit: 100,
      valuePerUnit: 5,
      minBalance: 200,
      maxUnitsPerRedemption: 5,
      conditions: {
        channels: ['web', 'app', 'store'],
      },
    },
    {
      id: 'loyalty-gift',
      name: 'Concierge gifting',
      description: 'Convert credits to curated experience packages.',
      priority: 30,
      isActive: true,
      currency: 'credits',
      debitPerUnit: 10,
      valuePerUnit: 10,
      maxUnitsPerRedemption: 3,
      conditions: {
        tiers: ['Platinum'],
        channels: ['concierge'],
      },
    },
    {
      id: 'cause-donation',
      name: 'Cause donation exchange',
      description: 'Guests can donate 200 points for a $10 community grant contribution.',
      priority: 40,
      isActive: true,
      currency: 'points',
      debitPerUnit: 200,
      valuePerUnit: 10,
      conditions: {
        channels: ['web'],
        metadata: { program: 'community-grant' },
      },
    },
  ],
  adjustmentPolicies: [
    {
      id: 'fraud-reversal',
      name: 'Fraud reversal',
      description: 'Reclaims points or credits identified as fraudulent activity within 90 days of accrual.',
      appliesTo: ['points', 'credits'],
      approvalRequired: true,
      auditCadence: 'weekly',
    },
    {
      id: 'goodwill',
      name: 'Goodwill gesture',
      description: 'Allows frontline teams to add discretionary credits after escalated service recoveries.',
      appliesTo: ['credits'],
      approvalRequired: false,
      auditCadence: 'monthly',
    },
    {
      id: 'expiry',
      name: 'Balance expiry',
      description: 'Scheduled job removes dormant points 24 months after inactivity while emailing reminders.',
      appliesTo: ['points'],
      approvalRequired: false,
      auditCadence: 'daily',
    },
  ],
};
