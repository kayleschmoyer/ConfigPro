import { useEffect, useMemo, useState } from 'react';
import { Drawer } from '@/shared/ui/Drawer';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { cn } from '@/lib/cn';
import { formatMoney } from '../lib/format';
import { calculateRedeemable, buildPaymentIntent } from '../lib/payments';
import type { InvoiceRef, Loyalty, Reward } from '../lib/types';

interface PaymentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  invoice?: InvoiceRef;
  loyalty: Loyalty;
  rewards: Reward[];
  onSubmit: (redirectUrl: string) => void;
}

export const PaymentDrawer = ({ isOpen, onClose, invoice, loyalty, rewards, onSubmit }: PaymentDrawerProps) => {
  const [amount, setAmount] = useState<number | undefined>(invoice?.balance.value);
  const [selectedRewards, setSelectedRewards] = useState<string[]>([]);

  useEffect(() => {
    setAmount(invoice?.balance.value);
    setSelectedRewards([]);
  }, [invoice]);

  const redeemable = useMemo(() => calculateRedeemable(loyalty, rewards), [loyalty, rewards]);

  const formattedBalance = invoice ? formatMoney(invoice.balance) : '';

  const handleSubmit = () => {
    if (!invoice || !amount) return;
    const chosenRewards = rewards.filter(reward => selectedRewards.includes(reward.id));
    const intent = buildPaymentIntent(invoice, amount, chosenRewards, {
      allowPartial: true,
      minimumAmount: 1000
    });
    onSubmit(intent.redirectUrl);
  };

  const toggleReward = (rewardId: string) => {
    setSelectedRewards(current =>
      current.includes(rewardId)
        ? current.filter(id => id !== rewardId)
        : [...current, rewardId]
    );
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Settle invoice"
      description={invoice ? `Invoice ${invoice.number}` : 'Choose invoice to start.'}
      footer={
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm text-muted">Remaining balance: {formattedBalance}</div>
          <Button onClick={handleSubmit} disabled={!invoice}>
            Continue to payment
          </Button>
        </div>
      }
    >
      {!invoice ? (
        <p className="text-sm text-muted">Select an invoice to begin checkout.</p>
      ) : (
        <div className="space-y-8">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">Amount</h3>
            <Input
              type="number"
              min={10}
              step={5}
              value={amount ? amount / 100 : ''}
              onChange={event => setAmount(Number(event.target.value) * 100)}
              label="Amount to pay"
              helperText="You can submit partial payments."
            />
          </section>

          <section className="space-y-3">
            <header className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">Rewards</h3>
              <span className="text-xs text-muted">Available balance {loyalty.points} pts</span>
            </header>
            <ul className="grid gap-3">
              {redeemable.map(reward => {
                const selected = selectedRewards.includes(reward.id);
                return (
                  <li key={reward.id}>
                    <button
                      type="button"
                      onClick={() => toggleReward(reward.id)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-2xl border border-border/60 bg-surface/60 px-4 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                        selected && 'border-primary/80 bg-primary/10'
                      )}
                    >
                      <span className="text-sm font-semibold text-foreground">{reward.name}</span>
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                        {reward.pointsCost} pts
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      )}
    </Drawer>
  );
};
