import { useMemo, useState } from 'react';
import { Button } from '../../shared/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../shared/ui/Card';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '../../shared/ui/Table';
import { useToast } from '../../shared/ui/Toast';
import { cn } from '../../lib/cn';
import { formatMoney } from './data';
import { useAccountsReceivable } from './context';
import { AgingIcon } from './components/Icons';

const buckets: Array<{ key: '0_30' | '31_60' | '61_90' | '90_PLUS'; label: string; color: string }> = [
  { key: '0_30', label: '0-30', color: 'bg-emerald-500/40' },
  { key: '31_60', label: '31-60', color: 'bg-amber-400/50' },
  { key: '61_90', label: '61-90', color: 'bg-orange-500/50' },
  { key: '90_PLUS', label: '90+', color: 'bg-red-500/50' }
];

export const ARAging = () => {
  const { data } = useAccountsReceivable();
  const { showToast } = useToast();
  const [selectedBucket, setSelectedBucket] = useState<'ALL' | (typeof buckets)[number]['key']>('ALL');

  const customerBuckets = useMemo(() => {
    return data.customers.map((customer) => {
      const invoices = data.invoices.filter((invoice) => invoice.customerId === customer.id);
      const bucketTotals = buckets.reduce(
        (acc, bucket) => {
          acc[bucket.key] = invoices
            .filter((invoice) => invoice.agingBucket === bucket.key)
            .reduce((sum, invoice) => sum + invoice.balance.value, 0);
          return acc;
        },
        { '0_30': 0, '31_60': 0, '61_90': 0, '90_PLUS': 0 } as Record<(typeof buckets)[number]['key'], number>
      );
      const total = Object.values(bucketTotals).reduce((sum, value) => sum + value, 0);
      return { customer, bucketTotals, total };
    });
  }, [data.customers, data.invoices]);

  const overall = useMemo(() => {
    return customerBuckets.reduce(
      (acc, row) => {
        buckets.forEach((bucket) => {
          acc[bucket.key] += row.bucketTotals[bucket.key];
        });
        return acc;
      },
      { '0_30': 0, '31_60': 0, '61_90': 0, '90_PLUS': 0 } as Record<(typeof buckets)[number]['key'], number>
    );
  }, [customerBuckets]);

  const overallTotal = Object.values(overall).reduce((sum, value) => sum + value, 0);

  const filteredRows = selectedBucket === 'ALL'
    ? customerBuckets
    : customerBuckets.filter((row) => row.bucketTotals[selectedBucket] > 0);

  const triggerBulkAction = (message: string) => {
    showToast({
      variant: 'info',
      title: 'Bulk action queued',
      description: message
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          <AgingIcon className="h-4 w-4 text-primary" />
          Aging and collections
        </span>
        <h2 className="text-3xl font-semibold">Prioritize outreach by risk</h2>
        <p className="text-sm text-muted">
          Monitor exposure across buckets, trigger reminders, and assign work to collectors.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        {buckets.map((bucket) => {
          const value = overall[bucket.key];
          return (
            <Card
              key={bucket.key}
              className={cn(
                'cursor-pointer bg-background/80 transition hover:border-primary/50',
                selectedBucket === bucket.key && 'border-primary/60 shadow-primary/20'
              )}
              onClick={() => setSelectedBucket(bucket.key)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base font-semibold">
                  {bucket.label} days
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                    {overallTotal ? Math.round((value / overallTotal) * 100) : 0}%
                  </span>
                </CardTitle>
                <CardDescription>Total outstanding</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold text-foreground">{formatMoney({ currency: 'USD', value })}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-background/80">
        <CardHeader>
          <CardTitle>Portfolio distribution</CardTitle>
          <CardDescription>Stacked exposure by aging bucket.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex h-12 overflow-hidden rounded-full border border-border/60 bg-surface/60">
            {buckets.map((bucket) => {
              const value = overall[bucket.key];
              const width = overallTotal ? Math.max(4, (value / overallTotal) * 100) : 0;
              return (
                <div
                  key={bucket.key}
                  className={cn('flex items-center justify-center text-xs font-semibold text-foreground/80', bucket.color)}
                  style={{ width: `${width}%` }}
                >
                  {bucket.label}
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
            {buckets.map((bucket) => (
              <span key={bucket.key} className="inline-flex items-center gap-2">
                <span className={cn('h-2 w-6 rounded-full', bucket.color)} />
                {bucket.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => triggerBulkAction('Statements will be emailed to selected customers.')}
>
            Send statements
          </Button>
          <Button variant="ghost" onClick={() => triggerBulkAction('Reminder cadence scheduled for past due accounts.')}>
            Schedule reminders
          </Button>
          <Button variant="ghost" onClick={() => triggerBulkAction('Collector tasks created and assigned.')}
>
            Assign collector tasks
          </Button>
        </div>
        <Button variant="outline" onClick={() => triggerBulkAction('Aging summary exported as PDF.')}>Export aging report</Button>
      </div>

      <TableContainer className="bg-background/80">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              {buckets.map((bucket) => (
                <TableHead key={bucket.key}>{bucket.label}</TableHead>
              ))}
              <TableHead>Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRows.map((row) => (
              <TableRow key={row.customer.id}>
                <TableCell className="font-semibold text-foreground">{row.customer.name}</TableCell>
                {buckets.map((bucket) => (
                  <TableCell key={bucket.key} className="text-sm text-muted">
                    {formatMoney({ currency: 'USD', value: row.bucketTotals[bucket.key] })}
                  </TableCell>
                ))}
                <TableCell className="font-semibold text-foreground">
                  {formatMoney({ currency: 'USD', value: row.total })}
                </TableCell>
              </TableRow>
            ))}
            {filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted">
                  No customers in this bucket.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
