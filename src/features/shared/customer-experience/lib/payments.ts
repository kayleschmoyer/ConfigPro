import type { InvoiceRef, Loyalty, Money, Reward } from './types';

export type PaymentIntent = {
  invoiceId: string;
  amount: Money;
  rewardsUsed?: Reward[];
  redirectUrl: string;
};

export type PaymentOptions = {
  allowPartial?: boolean;
  minimumAmount?: number;
};

export const buildPaymentIntent = (
  invoice: InvoiceRef,
  amount: number,
  rewards: Reward[],
  options: PaymentOptions = {}
): PaymentIntent => {
  const requested = Math.max(amount, options.minimumAmount ?? 0);
  const normalizedAmount = options.allowPartial ? Math.min(requested, invoice.balance.value) : invoice.balance.value;

  const amountMoney: Money = { currency: invoice.balance.currency, value: normalizedAmount };
  const appliedRewards = rewards.filter(reward => reward.pointsCost <= normalizedAmount / 100);

  return {
    invoiceId: invoice.id,
    amount: amountMoney,
    rewardsUsed: appliedRewards,
    redirectUrl: `/payments/checkout?invoice=${invoice.id}&amount=${normalizedAmount}`
  };
};

export const calculateRedeemable = (loyalty: Loyalty, rewards: Reward[]) => {
  const availablePoints = loyalty.points - (loyalty.pending ?? 0);
  return rewards.filter(reward => reward.pointsCost <= availablePoints);
};

export const rewardSavings = (rewards: Reward[], conversionRate = 0.01) =>
  rewards.reduce((total, reward) => total + reward.pointsCost * conversionRate, 0);
