import { useMemo, useCallback } from 'react';
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { cn } from '@/lib/cn';
import type { FeatureCatalogItem, LayoutItem, LayoutRegion } from '../lib/types';
import { groupLayoutByRegion, layoutRegionLabels, moveLayoutItem, regionOrder } from '../lib/layout';

interface LayoutMapperProps {
  layout: LayoutItem[];
  catalog: FeatureCatalogItem[];
  onChange: (next: LayoutItem[]) => void;
  validationMessages: string[];
  pinnedFeatureIds?: string[];
  adminMode?: boolean;
  onReset?: () => void;
}

const iconHints = ['layers', 'sparkles', 'calendar', 'credit-card', 'bar-chart-3', 'users'];

export const LayoutMapper = ({ layout, catalog, onChange, validationMessages, pinnedFeatureIds, adminMode, onReset }: LayoutMapperProps) => {
  const grouped = useMemo(() => groupLayoutByRegion(layout), [layout]);
  const pinnedSet = useMemo(() => new Set(pinnedFeatureIds), [pinnedFeatureIds]);

  const handleLabelChange = useCallback(
    (featureId: string, label: string) => {
      onChange(layout.map((item) => (item.featureId === featureId ? { ...item, label } : item)));
    },
    [layout, onChange]
  );

  const handleIconChange = useCallback(
    (featureId: string, icon: string) => {
      onChange(layout.map((item) => (item.featureId === featureId ? { ...item, icon } : item)));
    },
    [layout, onChange]
  );

  const handleRegionChange = useCallback(
    (featureId: string, region: LayoutRegion) => {
      onChange(moveLayoutItem(layout, featureId, region, grouped[region]?.length ?? 0));
    },
    [layout, onChange, grouped]
  );

  const handleReorder = useCallback(
    (featureId: string, direction: 'up' | 'down') => {
      const current = layout.find((item) => item.featureId === featureId);
      if (!current) return;
      const siblings = grouped[current.region] ?? [];
      const index = siblings.findIndex((item) => item.featureId === featureId);
      const targetIndex = direction === 'up' ? Math.max(0, index - 1) : Math.min(siblings.length - 1, index + 1);
      if (targetIndex === index) return;
      onChange(moveLayoutItem(layout, featureId, current.region, targetIndex));
    },
    [grouped, layout, onChange]
  );

  const resolveFeature = useCallback(
    (id: string) => catalog.find((feature) => feature.id === id),
    [catalog]
  );

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-foreground">Map layout</h2>
          <p className="text-sm text-muted-foreground">
            Drag with mouse or use Alt + ↑/↓ keys to reorder. Update labels and icons to match how the feature appears on day one.
          </p>
        </div>
        {adminMode && (
          <Button variant="outline" size="sm" onClick={() => void onReset?.()}>
            Reset layout to default
          </Button>
        )}
      </header>
      {validationMessages.length > 0 && (
        <div className="rounded-3xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">
          <p className="font-semibold text-amber-50">Layout checks</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-amber-50">
            {validationMessages.map((message) => (
              <li key={message}>{message}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-5">
          {regionOrder.map((region) => {
            const regionItems = grouped[region] ?? [];
            return (
              <div
                key={region}
                className="rounded-3xl border border-border/60 bg-surface/80 p-5 shadow-inner shadow-primary/5"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-muted">
                    {layoutRegionLabels[region]}
                  </h3>
                  <span className="text-xs text-muted-foreground">{regionItems.length} items</span>
                </div>
                <ul className="mt-4 space-y-3">
                  {regionItems.map((item, index) => {
                    const feature = resolveFeature(item.featureId);
                    if (!feature) return null;
                    const isPinned = pinnedSet.has(item.featureId);
                    return (
                      <li key={item.featureId}>
                        <article
                          className={cn(
                            'group flex flex-col gap-3 rounded-2xl border border-border/50 bg-background/60 p-4 shadow-sm focus-within:ring-2 focus-within:ring-primary/60',
                            'transition hover:border-primary/60 hover:shadow-primary/10'
                          )}
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
                              event.preventDefault();
                              handleReorder(item.featureId, event.key === 'ArrowUp' ? 'up' : 'down');
                            }
                          }}
                        >
                          <header className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                              <GripVertical className="h-4 w-4 text-muted" aria-hidden />
                              {feature.name}
                              {isPinned && (
                                <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-amber-200">
                                  Pinned
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReorder(item.featureId, 'up')}
                                disabled={index === 0}
                                aria-label="Move up"
                              >
                                <ArrowUp className="h-4 w-4" aria-hidden />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleReorder(item.featureId, 'down')}
                                disabled={index === regionItems.length - 1}
                                aria-label="Move down"
                              >
                                <ArrowDown className="h-4 w-4" aria-hidden />
                              </Button>
                            </div>
                          </header>
                          <div className="grid gap-3 md:grid-cols-2">
                            <Input
                              label="Label"
                              value={item.label ?? feature.name}
                              onChange={(event) => handleLabelChange(item.featureId, event.target.value)}
                            />
                            <Input
                              label="Icon"
                              value={item.icon ?? feature.defaultIcon ?? ''}
                              onChange={(event) => handleIconChange(item.featureId, event.target.value)}
                              helperText={`Try: ${iconHints.join(', ')}`}
                            />
                          </div>
                          <Select
                            label="Region"
                            value={item.region}
                            onChange={(event) => handleRegionChange(item.featureId, event.target.value as LayoutRegion)}
                          >
                            {regionOrder.map((candidate) => (
                              <option key={candidate} value={candidate}>
                                {layoutRegionLabels[candidate]}
                              </option>
                            ))}
                          </Select>
                        </article>
                      </li>
                    );
                  })}
                  {regionItems.length === 0 && (
                    <li className="rounded-2xl border border-dashed border-border/40 bg-background/30 p-4 text-xs text-muted-foreground">
                      Nothing assigned yet. Drop or move a feature here.
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
        <aside className="space-y-4 rounded-3xl border border-border/60 bg-background/40 p-5 shadow-inner shadow-primary/10">
          <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-muted">
            Keyboard guidance
          </h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Alt + ↑ / ↓ reorders within a region</li>
            <li>• Use the region selector to move between surfaces</li>
            <li>• Label updates reflect instantly in the preview</li>
          </ul>
          <p className="text-xs text-muted-foreground">
            Icons accept lucide-react names. Hidden items remain discoverable via global search.
          </p>
        </aside>
      </div>
    </section>
  );
};
