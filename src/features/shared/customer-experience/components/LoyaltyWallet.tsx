import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { formatDate } from '../lib/format';
import type { LoyaltyHistoryItem, Reward } from '../lib';

interface LoyaltyWalletProps {
  balance: number;
  pending: number;
  tier: string;
  nextTier?: string;
  progress: number;
  expiresAt?: string;
  rewards: Reward[];
  history: Array<LoyaltyHistoryItem & { atLabel: string }>;
  onRedeem: (reward: Reward) => void;
}

export const LoyaltyWallet = ({
  balance,
  pending,
  tier,
  nextTier,
  progress,
  expiresAt,
  rewards,
  history,
  onRedeem
}: LoyaltyWalletProps) => {
  return (
    <div className="grid gap-6 lg:grid-cols-[2fr,3fr]">
      <section className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{tier} tier</h3>
            {nextTier ? (
              <p className="text-sm text-muted">{Math.round(progress * 100)}% of the way to {nextTier}</p>
            ) : (
              <p className="text-sm text-muted">Elite tier unlocked</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-3xl font-semibold text-primary">{balance.toLocaleString()}</p>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Points</p>
          </div>
        </header>
        <div className="mt-6 h-2 w-full rounded-full bg-surface/50">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 1) * 100}%` }}
            transition={{ duration: 0.2 }}
            className="h-full rounded-full bg-primary"
          />
        </div>
        <div className="mt-4 flex items-center justify-between text-sm text-muted">
          <span>Pending: {pending.toLocaleString()} pts</span>
          {expiresAt && <span>Expires {formatDate(expiresAt)}</span>}
        </div>
      </section>

      <section className="space-y-5">
        <div className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">Redeem rewards</h3>
          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {rewards.map(reward => (
              <li key={reward.id}>
                <Button
                  variant="outline"
                  className="h-auto w-full flex-col items-start gap-1 rounded-2xl px-5 py-4 text-left"
                  onClick={() => onRedeem(reward)}
                >
                  <span className="text-base font-semibold text-foreground">{reward.name}</span>
                  <span className="text-xs uppercase tracking-[0.3em] text-muted">
                    {reward.pointsCost} pts • {reward.kind}
                  </span>
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">History</h3>
          <ul className="mt-4 space-y-3">
            {history.map(entry => (
              <li key={`${entry.at}-${entry.reason}`} className="flex items-center justify-between text-sm text-muted">
                <span>{entry.atLabel}</span>
                <span className="font-semibold text-foreground">
                  {entry.delta > 0 ? '+' : ''}
                  {entry.delta}
                </span>
                <span className="w-1/2 text-right text-foreground/80">{entry.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
};
