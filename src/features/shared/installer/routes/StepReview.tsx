import { useMemo } from 'react';
import { CheckCircle2, Map, ToggleRight } from 'lucide-react';
import { useInstaller } from './InstallerLayout';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '../../../shared/ui/Table';
import { useCurrencyFormat } from '../../../shared/hooks/useCurrencyFormat';

export const StepReview = () => {
  const { draft, catalog, layoutItems, priceBreakdown, billingVisible } = useInstaller();
  const { formatCurrency } = useCurrencyFormat({ currency: draft.currency, locale: draft.locale });

  const enabledFeatures = useMemo(
    () => draft.selections.filter((selection) => selection.enabled).map((selection) => selection.featureId),
    [draft.selections]
  );

  const featureRows = useMemo(
    () =>
      enabledFeatures.map((featureId) => {
        const feature = catalog.find((item) => item.id === featureId);
        return {
          id: featureId,
          name: feature?.name ?? featureId,
          route: feature?.route,
          category: feature?.category,
        };
      }),
    [catalog, enabledFeatures]
  );

  const routePreviews = useMemo(
    () =>
      layoutItems
        .map((item) => {
          const feature = catalog.find((candidate) => candidate.id === item.featureId);
          if (!feature?.route) return null;
          return `${item.region.toLowerCase()} → ${feature.route}`;
        })
        .filter((value): value is string => Boolean(value)),
    [catalog, layoutItems]
  );

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Review & install</h2>
        <p className="text-sm text-muted-foreground">
          Confirm the modules, navigation placements, and pricing impact. Ctrl + Enter applies immediately.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-border/60 bg-surface/80 p-5 shadow-inner shadow-primary/5">
          <ToggleRight className="h-5 w-5 text-primary" aria-hidden />
          <p className="mt-3 text-sm font-semibold text-foreground">Feature flags</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {enabledFeatures.length} features will be enabled across the registry.
          </p>
        </div>
        <div className="rounded-3xl border border-border/60 bg-surface/80 p-5 shadow-inner shadow-primary/5">
          <Map className="h-5 w-5 text-primary" aria-hidden />
          <p className="mt-3 text-sm font-semibold text-foreground">Navigation updates</p>
          <p className="mt-1 text-xs text-muted-foreground">{layoutItems.length} placements across sidebar, home, and topbar.</p>
        </div>
        <div className="rounded-3xl border border-border/60 bg-surface/80 p-5 shadow-inner shadow-primary/5">
          <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden />
          <p className="mt-3 text-sm font-semibold text-foreground">Billing impact</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {billingVisible
              ? `${formatCurrency({ currency: draft.currency, value: priceBreakdown.totalMonthly?.value ?? 0 })} monthly`
              : 'Hidden for your role'}
          </p>
        </div>
      </div>
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Feature</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Route</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {featureRows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-semibold text-foreground">{row.name}</TableCell>
                <TableCell>{row.category}</TableCell>
                <TableCell>{row.route ?? '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="rounded-3xl border border-border/60 bg-surface/70 p-5 text-sm text-muted-foreground">
        <p className="font-semibold text-foreground">Routes to mount</p>
        {routePreviews.length === 0 ? (
          <p className="mt-1 text-xs">No new workspaces will be added to navigation.</p>
        ) : (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
            {routePreviews.map((route) => (
              <li key={route}>{route}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
