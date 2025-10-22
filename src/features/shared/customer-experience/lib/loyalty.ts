import {
  evaluateAccrualRules,
  evaluateRedemptionRules,
  loyaltyRulebook
} from '@/pages/shared/features/loyalty.rules';
import type { Loyalty, LoyaltyHistoryItem, Money, Reward } from './types';

const tierThresholds = [
  { tier: 'Member', minPoints: 0 },
  { tier: 'Silver', minPoints: 2500 },
  { tier: 'Gold', minPoints: 7500 },
  { tier: 'Platinum', minPoints: 15000 }
];

const findTierForPoints = (points: number) => {
  let matched = tierThresholds[0].tier;
  for (const tier of tierThresholds) {
    if (points >= tier.minPoints) matched = tier.tier;
  }
  return matched;
};

export const summarizeLoyalty = (loyalty: Loyalty) => {
  const currentTier = loyalty.tier ?? findTierForPoints(loyalty.points);
  const nextTier = tierThresholds.find(tier => tier.minPoints > loyalty.points);
  const progress = nextTier
    ? Math.min(1, loyalty.points / nextTier.minPoints)
    : 1;

  return {
    tier: currentTier,
    nextTier: nextTier?.tier,
    points: loyalty.points,
    pending: loyalty.pending ?? 0,
    progress,
    expiresAt: loyalty.expiresAt
  };
};

export type AccrualProjectionInput = {
  eventType: string;
  spend?: number;
  channel?: string;
  tier?: string;
  metadata?: Record<string, string>;
};

export const projectAccrual = (loyalty: Loyalty, input: AccrualProjectionInput) => {
  const account = {
    balances: { points: loyalty.points, credits: 0 },
    tier: loyalty.tier,
    segment: undefined
  } as const;

  const evaluation = evaluateAccrualRules(
    loyaltyRulebook,
    {
      type: input.eventType,
      spend: input.spend,
      channel: input.channel,
      tier: input.tier ?? loyalty.tier,
      occurredAt: new Date().toISOString(),
      metadata: input.metadata
    },
    account
  );

  const projectedPoints = evaluation.totalByCurrency.points ?? 0;
  const projectedCredits = evaluation.totalByCurrency.credits ?? 0;

  return {
    awards: evaluation.awards,
    projectedPoints,
    projectedCredits,
    projectedBalance: loyalty.points + projectedPoints
  };
};

export const evaluateRedemption = (
  loyalty: Loyalty,
  desiredValue: number,
  channel: string,
  metadata?: Record<string, string>
) => {
  const account = {
    balances: { points: loyalty.points, credits: loyalty.pending ?? 0 },
    tier: loyalty.tier,
    segment: undefined
  } as const;

  return evaluateRedemptionRules(
    loyaltyRulebook,
    {
      currency: 'points',
      desiredValue,
      channel,
      requestedAt: new Date().toISOString(),
      metadata
    },
    account
  );
};

export const loyaltyVelocityGuard = (history: LoyaltyHistoryItem[], limit = 5000) => {
  const windowStart = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const earned = history
    .filter(entry => new Date(entry.at).getTime() >= windowStart && entry.delta > 0)
    .reduce((sum, entry) => sum + entry.delta, 0);
  return earned <= limit;
};

export const convertRewardToMoney = (reward: Reward, rate = 0.05): Money => ({
  currency: 'USD',
  value: Math.round(reward.pointsCost * rate * 100)
});
