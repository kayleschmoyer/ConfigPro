import { BadgeCheck, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/lib/cn';
import type { PlanDefinition, PlanTier } from '../lib/types';

interface PlanPickerProps {
  plans: PlanDefinition[];
  activePlan: PlanTier;
  onSelect: (tier: PlanTier) => void;
  formatCurrency: (value: number) => string;
  disabled?: boolean;
}

export const PlanPicker = ({ plans, activePlan, onSelect, formatCurrency, disabled }: PlanPickerProps) => {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {plans.map((plan) => {
        const isActive = plan.tier === activePlan;
        return (
          <motion.article
            key={plan.tier}
            layout
            className={cn(
              'relative flex h-full flex-col rounded-3xl border border-border/60 bg-surface/70 p-6 shadow-inner shadow-primary/5 backdrop-blur transition focus-within:ring-2 focus-within:ring-primary/70',
              isActive && 'border-primary/80 bg-primary/10 shadow-primary/20'
            )}
            aria-pressed={isActive}
          >
            {plan.recommended && (
              <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-white">
                <Star className="h-3.5 w-3.5" aria-hidden />
                Popular
              </span>
            )}
            <header className="space-y-2">
              <div className="flex items-center gap-2 text-lg font-semibold text-foreground">
                {plan.name}
                {isActive && <BadgeCheck className="h-4 w-4 text-primary" aria-hidden />}
              </div>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </header>
            <div className="mt-5 space-y-3 text-sm text-muted-foreground">
              <div>
                <span className="text-2xl font-semibold text-foreground">{formatCurrency(plan.basePrice.value)}</span>
                <span className="ml-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">/ month</span>
              </div>
              <ul className="space-y-2">
                {plan.inclusions.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              {plan.limits?.length ? (
                <div className="rounded-2xl border border-border/40 bg-background/40 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">Limits</p>
                  <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                    {plan.limits.map((limit) => (
                      <li key={limit}>{limit}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
            <div className="mt-auto pt-5">
              <Button
                variant={isActive ? 'primary' : 'outline'}
                className="w-full"
                onClick={() => onSelect(plan.tier)}
                disabled={disabled}
              >
                {isActive ? 'Selected' : 'Choose'}
              </Button>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
};
