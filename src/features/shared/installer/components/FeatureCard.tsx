import { useMemo } from 'react';
import { Clock, Settings } from 'lucide-react';
import { Switch } from '../../../components/ui/Switch';
import { Button } from '../../../shared/ui/Button';
import { cn } from '../../../lib/cn';
import type { FeatureCatalogItem } from '../lib/types';
import { ConflictBadge } from './ConflictBadge';
import { DependencyNotice } from './DependencyNotice';

interface FeatureCardProps {
  feature: FeatureCatalogItem;
  selected: boolean;
  onToggle: (featureId: string, enabled: boolean) => void;
  onConfigure: () => void;
  billingVisible: boolean;
  formatCurrency: (value: number) => string;
  disabledReason?: string;
  autoEnabled?: boolean;
  dependencies?: string[];
  conflicts?: string[];
}

export const FeatureCard = ({
  feature,
  selected,
  onToggle,
  onConfigure,
  billingVisible,
  formatCurrency,
  disabledReason,
  autoEnabled,
  dependencies = [],
  conflicts = [],
}: FeatureCardProps) => {
  const priceLabel = useMemo(() => {
    if (!billingVisible) return 'Included by admin';
    const amount = feature.basePrice?.value ?? 0;
    const formatted = formatCurrency(amount);
    if (feature.perSeat) return `${formatted} / seat`;
    if (feature.perLocation) return `${formatted} / location`;
    if (feature.priceModel === 'ONE_TIME') return `${formatted} one-time`;
    if (feature.priceModel === 'ANNUAL') return `${formatted} / year`;
    return `${formatted} / month`;
  }, [billingVisible, feature.basePrice?.value, feature.perLocation, feature.perSeat, feature.priceModel, formatCurrency]);

  return (
    <article
      className={cn(
        'group flex h-full flex-col justify-between rounded-3xl border border-border/50 bg-background/40 p-5 transition hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/10 focus-within:ring-2 focus-within:ring-primary/70 focus-within:ring-offset-2',
        selected && 'border-primary/70 bg-primary/5 shadow-lg shadow-primary/10'
      )}
      aria-pressed={selected}
    >
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-foreground">{feature.name}</h3>
            {autoEnabled && (
              <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs font-semibold text-primary">
                Auto-enabled
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{feature.description}</p>
        </div>
        <Switch checked={selected} onCheckedChange={(checked) => onToggle(feature.id, checked)} />
      </header>
      <div className="mt-4 space-y-3 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em]">
          <span className="rounded-full bg-surface/70 px-3 py-1 text-muted-foreground">{feature.category}</span>
          {feature.perSeat && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Per Seat</span>
          )}
          {feature.perLocation && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Per Location</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span className="font-semibold text-foreground">{priceLabel}</span>
          {feature.setupEstimate && (
            <span className="inline-flex items-center gap-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {feature.setupEstimate}
            </span>
          )}
        </div>
        <DependencyNotice dependencies={dependencies} />
        <ConflictBadge conflicts={conflicts} />
        {feature.roiNote && (
          <p className="rounded-2xl bg-primary/5 p-3 text-xs text-primary/90">{feature.roiNote}</p>
        )}
        {disabledReason && (
          <p className="rounded-2xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-100">{disabledReason}</p>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <Button
          variant="subtle"
          size="sm"
          onClick={onConfigure}
          className="rounded-2xl px-4"
        >
          <Settings className="h-4 w-4" aria-hidden />
          Configure
        </Button>
        {feature.route && (
          <a
            href={feature.route}
            className="text-xs font-medium text-primary underline-offset-4 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Preview workspace
          </a>
        )}
      </div>
    </article>
  );
};
