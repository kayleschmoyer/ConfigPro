import { useMemo } from 'react';
import { LayoutDashboard, Menu } from 'lucide-react';
import type { FeatureCatalogItem, LayoutItem } from '../lib/types';
import { groupLayoutByRegion } from '../lib/layout';

interface LayoutPreviewProps {
  layout: LayoutItem[];
  catalog: FeatureCatalogItem[];
}

export const LayoutPreview = ({ layout, catalog }: LayoutPreviewProps) => {
  const grouped = useMemo(() => groupLayoutByRegion(layout), [layout]);

  const resolveLabel = (item: LayoutItem) => {
    const feature = catalog.find((candidate) => candidate.id === item.featureId);
    return item.label ?? feature?.name ?? item.featureId;
  };

  return (
    <section className="space-y-4">
      <header className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-muted">
        <LayoutDashboard className="h-4 w-4" aria-hidden />
        Live preview
      </header>
      <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
        <aside className="rounded-3xl border border-border/60 bg-background/60 p-4 shadow-inner shadow-primary/5">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted">
            <Menu className="h-3.5 w-3.5" aria-hidden />
            Sidebar
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {grouped.SIDEBAR.length === 0 && (
              <li className="rounded-2xl border border-dashed border-border/40 bg-surface/40 p-3 text-xs text-muted-foreground">
                No sidebar entries yet.
              </li>
            )}
            {grouped.SIDEBAR.map((item) => (
              <li key={item.featureId} className="rounded-2xl bg-primary/5 px-3 py-2 text-primary">
                {resolveLabel(item)}
              </li>
            ))}
          </ul>
        </aside>
        <div className="space-y-5 rounded-3xl border border-border/60 bg-background/40 p-5 shadow-inner shadow-primary/5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">Home button grid</p>
            <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
              {grouped.HOME_BUTTON.length === 0 && (
                <div className="col-span-full rounded-2xl border border-dashed border-border/40 bg-surface/40 p-4 text-xs text-muted-foreground">
                  Choose modules to surface quick actions.
                </div>
              )}
              {grouped.HOME_BUTTON.map((item) => (
                <div
                  key={item.featureId}
                  className="rounded-2xl border border-primary/40 bg-primary/10 p-4 text-center text-sm font-semibold text-primary"
                >
                  {resolveLabel(item)}
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">Topbar quick actions</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {grouped.TOPBAR.length === 0 && (
                <span className="rounded-full border border-dashed border-border/40 px-3 py-1 text-xs text-muted-foreground">
                  Add quick access controls.
                </span>
              )}
              {grouped.TOPBAR.map((item) => (
                <span
                  key={item.featureId}
                  className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary"
                >
                  {resolveLabel(item)}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">Hidden search results</p>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              {grouped.HIDDEN.length === 0 && <li>None</li>}
              {grouped.HIDDEN.map((item) => (
                <li key={item.featureId}>{resolveLabel(item)}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
