import { useState } from 'react';
import { LoyaltyWallet } from '../components/LoyaltyWallet';
import { RewardCatalog } from '../components/RewardCatalog';
import { useLoyalty } from '../hooks/useLoyalty';

export const PortalLoyalty = () => {
  const { summary, rewards, formattedHistory, redeemable } = useLoyalty();
  const [redeemed, setRedeemed] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-foreground">Loyalty & rewards</h2>
        <p className="text-sm text-muted">Track your wallet, tier progress, and redeem curated rewards.</p>
      </header>
      {redeemed && (
        <div className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          Reward “{redeemed}” queued for redemption.
        </div>
      )}
      <LoyaltyWallet
        balance={summary.points}
        pending={summary.pending}
        tier={summary.tier}
        nextTier={summary.nextTier}
        progress={summary.progress}
        expiresAt={summary.expiresAt}
        rewards={redeemable}
        history={formattedHistory}
        onRedeem={reward => setRedeemed(reward.name)}
      />
      <RewardCatalog rewards={rewards} onRedeem={reward => setRedeemed(reward.name)} />
    </div>
  );
};

export default PortalLoyalty;
