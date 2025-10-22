import { useMemo } from 'react';
import { summarizeLoyalty, projectAccrual } from '../lib/loyalty';
import { formatDate, formatMoney } from '../lib/format';
import type { Reward } from '../lib/types';
import { usePortal } from './usePortal';

export const useLoyalty = () => {
  const { snapshot } = usePortal();
  const loyalty = snapshot.loyalty;
  const rewards = snapshot.rewards;

  const summary = useMemo(() => summarizeLoyalty(loyalty), [loyalty]);

  const nextExpiration = useMemo(() => loyalty.expiresAt && formatDate(loyalty.expiresAt), [loyalty.expiresAt]);

  const projection = useMemo(
    () =>
      projectAccrual(loyalty, {
        eventType: 'purchase',
        spend: 25000,
        channel: 'web'
      }),
    [loyalty]
  );

  const wallet = useMemo(
    () => ({
      balance: summary.points,
      pending: summary.pending,
      formattedBalance: formatMoney({ currency: 'USD', value: summary.points }),
      expiresAt: nextExpiration
    }),
    [summary.points, summary.pending, nextExpiration]
  );

  const redeemable = useMemo(() => rewards.filter(reward => reward.pointsCost <= summary.points), [rewards, summary.points]);

  const formattedHistory = useMemo(
    () =>
      loyalty.history.map(entry => ({
        ...entry,
        atLabel: formatDate(entry.at, { month: 'short', day: 'numeric' })
      })),
    [loyalty.history]
  );

  return { loyalty, rewards, summary, projection, wallet, redeemable, formattedHistory };
};

export const useRewardById = (rewardId: string): Reward | undefined => {
  const { snapshot } = usePortal();
  return snapshot.rewards.find(reward => reward.id === rewardId);
};
