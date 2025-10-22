import { Button } from '@/shared/ui/Button';
import { convertRewardToMoney } from '../lib/loyalty';
import { formatMoney } from '../lib/format';
import type { Reward } from '../lib/types';

interface RewardCatalogProps {
  rewards: Reward[];
  onRedeem: (reward: Reward) => void;
}

export const RewardCatalog = ({ rewards, onRedeem }: RewardCatalogProps) => {
  if (!rewards.length) {
    return (
      <div className="rounded-3xl border border-dashed border-border/60 bg-surface/70 p-6 text-center text-sm text-muted">
        No rewards available at this time.
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rewards.map(reward => {
        const monetary = convertRewardToMoney(reward);
        return (
          <article
            key={reward.id}
            className="flex flex-col justify-between rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-md shadow-primary/10"
          >
            <header className="space-y-2">
              <span className="inline-flex items-center rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                {reward.kind}
              </span>
              <h3 className="text-lg font-semibold text-foreground">{reward.name}</h3>
              <p className="text-sm text-muted">Estimated value {formatMoney(monetary)}</p>
            </header>
            <div className="mt-6 flex items-center justify-between">
              <span className="text-sm font-semibold text-muted">{reward.pointsCost} pts</span>
              <Button size="sm" onClick={() => onRedeem(reward)}>
                Redeem
              </Button>
            </div>
          </article>
        );
      })}
    </div>
  );
};
