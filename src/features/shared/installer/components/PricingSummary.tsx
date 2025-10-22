import { useMemo } from 'react';
import { BadgeDollarSign } from 'lucide-react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/shared/ui/Table';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import type { PriceBreakdown } from '../lib';

interface PricingSummaryProps {
  breakdown: PriceBreakdown;
  formatCurrency: (value: number) => string;
  couponCode?: string;
  onCouponChange: (code: string) => void;
  billingVisible: boolean;
  isAdmin?: boolean;
  adminMode?: boolean;
  onEditPricing?: () => void;
  lastPublishedAt?: string;
}

export const PricingSummary = ({
  breakdown,
  formatCurrency,
  couponCode,
  onCouponChange,
  billingVisible,
  isAdmin,
  adminMode,
  onEditPricing,
  lastPublishedAt,
}: PricingSummaryProps) => {
  const totals = useMemo(() => {
    if (!billingVisible) {
      return { monthly: 'Hidden', annual: 'Hidden' };
    }
    const monthly = formatCurrency(breakdown.totalMonthly?.value ?? 0);
    const annual = formatCurrency(breakdown.totalAnnual?.value ?? 0);
    return { monthly, annual };
  }, [billingVisible, breakdown.totalAnnual?.value, breakdown.totalMonthly?.value, formatCurrency]);

  const publishedLabel = useMemo(() => {
    if (!lastPublishedAt) return null;
    try {
      return new Date(lastPublishedAt).toLocaleString();
    } catch {
      return lastPublishedAt;
    }
  }, [lastPublishedAt]);

  return (
    <section aria-labelledby="pricing-summary" className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 id="pricing-summary" className="text-xl font-semibold text-foreground">
            Pricing & impact
          </h2>
          <p className="text-sm text-muted-foreground">
            Review how your plan, add-ons, seats, and locations influence the subscription.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {publishedLabel && (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-emerald-200">
              Live pricing
              <span className="font-normal normal-case tracking-normal text-emerald-100/80">
                Published {publishedLabel}
              </span>
            </span>
          )}
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
            <BadgeDollarSign className="h-3.5 w-3.5" aria-hidden />
            Billing preview
          </div>
          {isAdmin && adminMode && (
            <Button size="sm" variant="outline" onClick={onEditPricing}>
              Edit pricing
            </Button>
          )}
        </div>
      </header>
      <TableContainer>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {breakdown.lines.map((line) => (
              <TableRow key={line.label}>
                <TableCell className="font-medium text-foreground">
                  <div className="flex flex-col">
                    <span>{line.label}</span>
                    {line.meta && (
                      <span className="text-xs text-muted-foreground">
                        {Object.entries(line.meta)
                          .map(([key, value]) => `${key}: ${String(value)}`)
                          .join(' • ')}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm font-semibold text-foreground">
                  {billingVisible ? formatCurrency(line.amount.value) : 'Included by admin'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-inner shadow-primary/10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">Monthly impact</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{totals.monthly}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Includes stubbed taxes (8.25%) and applied promotions.
          </p>
        </div>
        <div className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-inner shadow-primary/10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">Annual impact (with savings)</p>
          <p className="mt-2 text-3xl font-semibold text-foreground">{totals.annual}</p>
          <p className="mt-2 text-xs text-muted-foreground">Reflects a 10% annual commitment discount.</p>
        </div>
        <div className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-inner shadow-primary/10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">Coupons & credits</p>
          {billingVisible ? (
            <Input
              value={couponCode ?? ''}
              onChange={(event) => onCouponChange(event.target.value)}
              placeholder="Add coupon code"
              helperText="Credits apply once the bundle is activated."
            />
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Pricing hidden for your role. Ask a billing admin to review credits.
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            disabled={!billingVisible}
          >
            Apply code
          </Button>
        </div>
      </div>
    </section>
  );
};
