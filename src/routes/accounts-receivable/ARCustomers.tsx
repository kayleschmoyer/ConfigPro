import { useMemo, useState } from 'react';
import { Button } from '../../shared/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../shared/ui/Card';
import { Input } from '../../shared/ui/Input';
import { Modal } from '../../shared/ui/Modal';
import { Select } from '../../shared/ui/Select';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '../../shared/ui/Table';
import { useToast } from '../../shared/ui/Toast';
import { cn } from '../../lib/cn';
import { formatMoney } from './data';
import { useAccountsReceivable } from './context';
import { LightningIcon, UserIcon } from './components/Icons';

const termsOptions = ['Net 15', 'Net 30', 'Net 45', 'Net 60'];

export const ARCustomers = () => {
  const { data } = useAccountsReceivable();
  const { showToast } = useToast();
  const [selectedCustomerId, setSelectedCustomerId] = useState(data.customers[0]?.id ?? '');
  const [customTerms, setCustomTerms] = useState<Record<string, string>>({});
  const [holdReason, setHoldReason] = useState('');
  const [isHoldModalOpen, setIsHoldModalOpen] = useState(false);
  const [customerOnHold, setCustomerOnHold] = useState<Record<string, boolean>>(
    () =>
      Object.fromEntries(
        data.customers.map((customer) => [customer.id, Boolean(customer.onHold)])
      )
  );

  const selectedCustomer = data.customers.find((customer) => customer.id === selectedCustomerId) ?? data.customers[0];

  const invoices = useMemo(
    () => data.invoices.filter((invoice) => invoice.customerId === selectedCustomer?.id),
    [data.invoices, selectedCustomer?.id]
  );

  const outstandingBalance = invoices
    .filter((invoice) => !['PAID', 'VOID'].includes(invoice.status))
    .reduce((sum, invoice) => sum + invoice.balance.value, 0);

  const creditLimit = selectedCustomer?.creditLimit?.value ?? 0;
  const utilization = creditLimit > 0 ? Math.min(1, outstandingBalance / creditLimit) : 0;
  const utilizationLabel = `${Math.round(utilization * 100)}%`;

  const handleStatement = () => {
    showToast({
      variant: 'info',
      title: 'Statement queued',
      description: `${selectedCustomer?.name} will receive a statement in under a minute.`
    });
  };

  const handleSaveTerms = () => {
    if (!selectedCustomer) return;
    showToast({
      variant: 'success',
      title: 'Terms updated',
      description: `${selectedCustomer.name} now has ${customTerms[selectedCustomer.id] ?? selectedCustomer.terms ?? 'Net 30'}.`
    });
  };

  const toggleHold = () => {
    if (!selectedCustomer) return;
    if (!customerOnHold[selectedCustomer.id]) {
      setIsHoldModalOpen(true);
    } else {
      setCustomerOnHold((prev) => ({ ...prev, [selectedCustomer.id]: false }));
      showToast({
        variant: 'success',
        title: 'Hold removed',
        description: `${selectedCustomer.name} is cleared for new orders.`
      });
    }
  };

  const confirmHold = () => {
    if (!selectedCustomer) return;
    setCustomerOnHold((prev) => ({ ...prev, [selectedCustomer.id]: true }));
    setIsHoldModalOpen(false);
    setHoldReason('');
    showToast({
      variant: 'warning',
      title: 'Credit hold placed',
      description: `${selectedCustomer.name} is on hold. Reason: ${holdReason || 'Manual review'}.`
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1.6fr]">
      <Card className="bg-background/80">
        <CardHeader>
          <CardTitle>Customers</CardTitle>
          <CardDescription>Credit utilization and payment behavior at a glance.</CardDescription>
        </CardHeader>
        <CardContent>
          <TableContainer className="max-h-[28rem] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Credit limit</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Avg days</TableHead>
                  <TableHead>Last payment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.customers.map((customer) => {
                  const customerInvoices = data.invoices.filter((invoice) => invoice.customerId === customer.id);
                  const balance = customerInvoices
                    .filter((invoice) => !['PAID', 'VOID'].includes(invoice.status))
                    .reduce((sum, invoice) => sum + invoice.balance.value, 0);
                  const limit = customer.creditLimit?.value ?? 0;
                  const pct = limit > 0 ? `${Math.round((balance / limit) * 100)}%` : '—';
                  return (
                    <TableRow
                      key={customer.id}
                      className={cn(
                        'cursor-pointer transition hover:bg-primary/5',
                        selectedCustomerId === customer.id && 'bg-primary/10'
                      )}
                      onClick={() => setSelectedCustomerId(customer.id)}
                    >
                      <TableCell className="font-semibold text-foreground">{customer.name}</TableCell>
                      <TableCell>{customer.creditLimit ? formatMoney(customer.creditLimit) : '—'}</TableCell>
                      <TableCell>{pct}</TableCell>
                      <TableCell>{formatMoney({ currency: 'USD', value: balance })}</TableCell>
                      <TableCell>{customer.avgDaysToPay ?? '—'}</TableCell>
                      <TableCell>
                        {customer.lastPaymentDate
                          ? new Date(customer.lastPaymentDate).toLocaleDateString()
                          : '—'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card className="bg-background/80">
          <CardHeader className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-primary/10 text-primary shadow-inner shadow-primary/30">
                <UserIcon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>{selectedCustomer?.name}</CardTitle>
                <CardDescription>
                  Account owner {selectedCustomer?.accountOwner ?? 'Unassigned'} · Terms{' '}
                  {customTerms[selectedCustomer?.id ?? ''] ?? selectedCustomer?.terms ?? 'Net 30'}
                </CardDescription>
              </div>
            </div>
            {customerOnHold[selectedCustomer?.id ?? ''] && (
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-amber-500/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-amber-200">
                <LightningIcon className="h-4 w-4" /> On credit hold
              </span>
            )}
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-border/60 bg-surface/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Balance</p>
              <p className="text-lg font-semibold text-foreground">{formatMoney({ currency: 'USD', value: outstandingBalance })}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-surface/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Utilization</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface/80">
                  <div className="h-full rounded-full bg-primary" style={{ width: utilization * 100 + '%' }} />
                </div>
                <span className="text-sm font-semibold text-foreground">{utilizationLabel}</span>
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-surface/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Average days to pay</p>
              <p className="text-lg font-semibold text-foreground">{selectedCustomer?.avgDaysToPay ?? '—'}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-surface/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Last payment</p>
              <p className="text-lg font-semibold text-foreground">
                {selectedCustomer?.lastPaymentDate
                  ? new Date(selectedCustomer.lastPaymentDate).toLocaleDateString()
                  : '—'}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={handleStatement}>
              Generate statement
            </Button>
            <Button variant="ghost" onClick={toggleHold}>
              {customerOnHold[selectedCustomer?.id ?? ''] ? 'Remove hold' : 'Place hold'}
            </Button>
            <Select
              label="Terms"
              value={customTerms[selectedCustomer?.id ?? ''] ?? selectedCustomer?.terms ?? 'Net 30'}
              onChange={(event) =>
                setCustomTerms((prev) => ({ ...prev, [selectedCustomer?.id ?? '']: event.target.value }))
              }
            >
              {termsOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
            <Button variant="ghost" onClick={handleSaveTerms}>
              Save terms
            </Button>
          </CardFooter>
        </Card>

        <Card className="bg-background/80">
          <CardHeader>
            <CardTitle>Recent invoices</CardTitle>
            <CardDescription>Dispute history, partial payments, and reminders.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {invoices.slice(0, 5).map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-surface/60 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{invoice.number}</p>
                  <p className="text-xs text-muted">
                    Due {new Date(invoice.dueDate).toLocaleDateString()} · Status {invoice.status.replace('_', ' ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{formatMoney(invoice.balance)}</p>
                  <p className="text-xs text-muted">Paid {formatMoney(invoice.amountPaid)}</p>
                </div>
              </div>
            ))}
            {invoices.length === 0 && <p className="text-sm text-muted">No invoices available for this customer.</p>}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={isHoldModalOpen}
        onClose={() => setIsHoldModalOpen(false)}
        title="Place credit hold"
        description="Document the reason for the hold to inform sales and service teams."
      >
        <div className="space-y-4">
          <Input
            label="Hold reason"
            placeholder="e.g. Past due balance over limit"
            value={holdReason}
            onChange={(event) => setHoldReason(event.target.value)}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsHoldModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmHold}>Confirm hold</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
