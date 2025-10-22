import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../../shared/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../shared/ui/Card';
import { Input } from '../../shared/ui/Input';
import { Select } from '../../shared/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../shared/ui/Tabs';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '../../shared/ui/Table';
import { useToast } from '../../shared/ui/Toast';
import { formatMoney } from './data';
import { useAccountsReceivable } from './context';
import { AttachmentIcon, CashIcon, CheckCircleIcon, ErrorIcon, UploadIcon } from './components/Icons';

interface AllocationState {
  invoiceId: string;
  amount: number;
  balance: number;
}

export const ARPayments = () => {
  const { data } = useAccountsReceivable();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'record' | 'batch'>('record');
  const [customerId, setCustomerId] = useState(data.customers[0]?.id ?? '');
  const [paymentMethod, setPaymentMethod] = useState<'ACH' | 'CARD' | 'CHECK' | 'CASH'>('ACH');
  const [reference, setReference] = useState('');
  const [memo, setMemo] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [allocations, setAllocations] = useState<AllocationState[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reconciliationStatus, setReconciliationStatus] = useState<'idle' | 'posting' | 'error' | 'success'>('idle');
  const statusRef = useRef(reconciliationStatus);

  useEffect(() => {
    statusRef.current = reconciliationStatus;
  }, [reconciliationStatus]);

  useEffect(() => {
    const openInvoices = data.invoices
      .filter((invoice) => invoice.customerId === customerId && invoice.balance.value > 0)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    const defaultAmount = openInvoices.reduce((sum, invoice) => sum + invoice.balance.value, 0);
    setPaymentAmount(defaultAmount ? defaultAmount.toFixed(2) : '');
    setAllocations(
      openInvoices.map((invoice) => ({
        invoiceId: invoice.id,
        amount: invoice.balance.value,
        balance: invoice.balance.value
      }))
    );
  }, [customerId, data.invoices]);

  const openInvoices = useMemo(
    () =>
      data.invoices
        .filter((invoice) => invoice.customerId === customerId && invoice.balance.value > 0)
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()),
    [customerId, data.invoices]
  );

  const totalAllocation = allocations.reduce((sum, allocation) => sum + allocation.amount, 0);

  const autoApply = () => {
    const amount = Number(paymentAmount) || 0;
    let remaining = amount;
    const next = allocations.map((allocation) => {
      const applied = Math.min(allocation.balance, Math.max(0, remaining));
      remaining -= applied;
      return { ...allocation, amount: applied };
    });
    setAllocations(next);
  };

  const updateAllocation = (invoiceId: string, amount: number) => {
    setAllocations((current) =>
      current.map((allocation) =>
        allocation.invoiceId === invoiceId
          ? { ...allocation, amount: Math.max(0, Math.min(allocation.balance, amount)) }
          : allocation
      )
    );
  };

  const submitPayment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setReconciliationStatus('posting');
    const optimisticId = showToast({
      variant: 'success',
      title: 'Payment posted',
      description: 'Allocations will sync across ledgers in seconds.',
      action: {
        label: 'Undo',
        onClick: () => {
          setReconciliationStatus('error');
          showToast({
            variant: 'warning',
            title: 'Reverted',
            description: 'Payment posting has been rolled back.',
          });
        }
      }
    });

    window.setTimeout(() => {
      setIsSubmitting(false);
      if (statusRef.current === 'error') {
        showToast({
          variant: 'destructive',
          title: 'Posting cancelled',
          description: 'Undo applied. Review allocations and retry.'
        });
        return;
      }
      setReconciliationStatus('success');
      showToast({
        id: optimisticId,
        variant: 'success',
        title: 'Payment reconciled',
        description: 'Deposits matched successfully. Bank feed pending final confirmation.'
      });
    }, 900);
  };

  const batchTips = [
    'Upload bank remittance or lockbox files in CSV format.',
    'Map invoice numbers and amounts — ConfigPro auto-validates before posting.',
    'Download a variance report before committing changes.'
  ];

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          <CashIcon className="h-4 w-4 text-primary" />
          Cash application cockpit
        </span>
        <h2 className="text-3xl font-semibold">Record and apply payments</h2>
        <p className="text-sm text-muted">
          Allocate receipts against open invoices, attach proof of payment, and reconcile deposits — without leaving AR.
        </p>
      </header>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="record">Record payment</TabsTrigger>
          <TabsTrigger value="batch">Batch apply remittance</TabsTrigger>
        </TabsList>
        <TabsContent value="record" className="mt-6 space-y-6">
          <Card className="bg-background/80">
            <CardHeader>
              <CardTitle>Payment details</CardTitle>
              <CardDescription>Automatically applies oldest invoices first — adjust as needed.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Select label="Customer" value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
                {data.customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </Select>
              <Select label="Method" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as typeof paymentMethod)}>
                <option value="ACH">ACH</option>
                <option value="CARD">Credit card</option>
                <option value="CHECK">Check</option>
                <option value="CASH">Cash</option>
              </Select>
              <Input
                label="Payment amount"
                type="number"
                value={paymentAmount}
                onChange={(event) => setPaymentAmount(event.target.value)}
                min={0}
              />
              <Input
                label="Reference"
                placeholder="Check #, confirmation, etc."
                value={reference}
                onChange={(event) => setReference(event.target.value)}
              />
              <Input
                label="Memo"
                placeholder="Optional notes"
                value={memo}
                onChange={(event) => setMemo(event.target.value)}
              />
              <label className="flex flex-col gap-2 text-sm font-medium text-muted">
                Attach receipt
                <div className="flex h-24 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/60 bg-surface/60 p-3 text-center text-xs text-muted transition hover:border-primary/40">
                  <AttachmentIcon className="h-6 w-6 text-muted" />
                  <span>Drop files or click to browse</span>
                  <input type="file" className="hidden" multiple />
                </div>
              </label>
            </CardContent>
            <CardFooter className="flex flex-wrap items-center justify-between gap-4">
              <Button variant="ghost" onClick={autoApply}>
                Auto-apply oldest
              </Button>
              <div className="flex items-center gap-3 text-sm text-muted">
                <span>Allocated: {formatMoney({ currency: 'USD', value: totalAllocation })}</span>
                <span>Unapplied: {formatMoney({ currency: 'USD', value: Math.max(0, (Number(paymentAmount) || 0) - totalAllocation) })}</span>
              </div>
            </CardFooter>
          </Card>

          <form onSubmit={submitPayment} className="space-y-4">
            <TableContainer className="bg-background/80">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Due</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Apply</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openInvoices.map((invoice) => {
                    const allocation = allocations.find((item) => item.invoiceId === invoice.id);
                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-semibold text-foreground">{invoice.number}</TableCell>
                        <TableCell className="text-sm text-muted">
                          {new Date(invoice.dueDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted">
                          {formatMoney(invoice.balance)}
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={allocation?.balance ?? invoice.balance.value}
                            value={allocation?.amount.toString() ?? '0'}
                            onChange={(event) => updateAllocation(invoice.id, Number(event.target.value))}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/60 bg-surface/60 p-4">
              <div className="flex items-center gap-3 text-sm">
                {reconciliationStatus === 'success' ? (
                  <CheckCircleIcon className="h-6 w-6 text-emerald-400" />
                ) : reconciliationStatus === 'error' ? (
                  <ErrorIcon className="h-6 w-6 text-red-400" />
                ) : (
                  <UploadIcon className="h-6 w-6 text-primary" />
                )}
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground">
                    {reconciliationStatus === 'success'
                      ? 'Payment reconciled'
                      : reconciliationStatus === 'error'
                        ? 'Posting reverted'
                        : 'Ready to post'}
                  </span>
                  <span className="text-xs text-muted">
                    {reconciliationStatus === 'idle' && 'Review allocations and submit.'}
                    {reconciliationStatus === 'posting' && 'Applying payment and updating ledger…'}
                    {reconciliationStatus === 'error' && 'Use auto-apply or adjust allocations then retry.'}
                    {reconciliationStatus === 'success' && 'All allocations synced. View in cash receipts report.'}
                  </span>
                </div>
              </div>
              <Button type="submit" disabled={isSubmitting || !paymentAmount}>
                {isSubmitting ? 'Posting…' : 'Post payment'}
              </Button>
            </div>
          </form>
        </TabsContent>
        <TabsContent value="batch" className="mt-6 space-y-6">
          <Card className="bg-background/80">
            <CardHeader>
              <CardTitle>Import remittance file</CardTitle>
              <CardDescription>Support for bank lockbox, NACHA detail, or custom CSV layouts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex flex-col gap-2 text-sm font-medium text-muted">
                Upload file
                <div className="flex h-32 flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border/60 bg-surface/60 p-4 text-center text-sm text-muted transition hover:border-primary/40">
                  <UploadIcon className="h-8 w-8 text-primary" />
                  <span>Drop CSV or click to browse</span>
                  <input type="file" accept=".csv" className="hidden" />
                </div>
              </label>
              <div className="grid gap-4 md:grid-cols-3">
                <Select label="Invoice column">
                  <option value="invoice">Invoice Number</option>
                  <option value="po">Purchase Order</option>
                </Select>
                <Select label="Amount column">
                  <option value="amount">Applied Amount</option>
                  <option value="balance">Balance</option>
                </Select>
                <Select label="Date column">
                  <option value="date">Payment Date</option>
                  <option value="value-date">Value Date</option>
                </Select>
              </div>
              <ul className="list-disc space-y-2 pl-5 text-sm text-muted">
                {batchTips.map((tip) => (
                  <li key={tip}>{tip}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <Button variant="ghost">Download template</Button>
              <Button>Preview &amp; apply</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
