import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';
import { Drawer } from '../../shared/ui/Drawer';
import { Input } from '../../shared/ui/Input';
import { Select } from '../../shared/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../shared/ui/Tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow
} from '../../shared/ui/Table';
import { useToast } from '../../shared/ui/Toast';
import { cn } from '../../lib/cn';
import { formatMoney } from './data';
import { useAccountsReceivable } from './context';
import {
  AttachmentIcon,
  DownloadIcon,
  LightningIcon,
  TagIcon
} from './components/Icons';
import type { Invoice } from './types';

const ROW_HEIGHT = 72;
const OVERSCAN = 6;

const statusColors: Record<Invoice['status'], string> = {
  UNPAID: 'bg-amber-500/15 text-amber-400 border border-amber-400/40',
  PARTIALLY_PAID: 'bg-blue-500/15 text-blue-300 border border-blue-400/40',
  PAID: 'bg-emerald-500/15 text-emerald-300 border border-emerald-300/40',
  OVERDUE: 'bg-red-500/15 text-red-300 border border-red-400/40',
  DISPUTED: 'bg-purple-500/15 text-purple-200 border border-purple-400/40',
  VOID: 'bg-white/10 text-muted border border-white/20'
};

const agingLabels: Record<Invoice['agingBucket'], string> = {
  '0_30': '0-30',
  '31_60': '31-60',
  '61_90': '61-90',
  '90_PLUS': '90+'
};

const toDateValue = (value: string) => (value ? new Date(value) : null);

export const ARInvoices = () => {
  const { data, openNewInvoice, searchQuery } = useAccountsReceivable();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [status, setStatus] = useState<'ALL' | Invoice['status']>('ALL');
  const [customerId, setCustomerId] = useState('ALL');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [terms, setTerms] = useState('ALL');
  const [salesRep, setSalesRep] = useState('ALL');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(720);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsLoading(false), 260);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const invoiceId = params.get('open');
    if (invoiceId) {
      const invoice = data.invoices.find((item) => item.id === invoiceId || item.number === invoiceId);
      if (invoice) {
        setSelectedInvoice(invoice);
        setIsDrawerOpen(true);
      }
    }
  }, [data.invoices, location.search]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    const updateMetrics = () => {
      setViewportHeight(element.clientHeight || 720);
      setScrollTop(element.scrollTop);
    };
    updateMetrics();
    const handleScroll = () => setScrollTop(element.scrollTop);
    element.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateMetrics);
    return () => {
      element.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateMetrics);
    };
  }, []);

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag]
    );
  };

  const clearFilters = () => {
    setStatus('ALL');
    setCustomerId('ALL');
    setFromDate('');
    setToDate('');
    setMinAmount('');
    setMaxAmount('');
    setTerms('ALL');
    setSalesRep('ALL');
    setSelectedTags([]);
  };

  const filteredInvoices = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return data.invoices.filter((invoice) => {
      if (status !== 'ALL' && invoice.status !== status) return false;
      if (customerId !== 'ALL' && invoice.customerId !== customerId) return false;
      if (terms !== 'ALL' && invoice.terms !== terms) return false;
      if (salesRep !== 'ALL' && invoice.salesRep !== salesRep) return false;

      if (selectedTags.length && !selectedTags.every((tag) => invoice.tags?.includes(tag))) return false;

      const from = toDateValue(fromDate);
      const to = toDateValue(toDate);
      const issue = new Date(invoice.issueDate);
      if (from && issue < from) return false;
      if (to && issue > to) return false;

      if (minAmount && invoice.total.value < Number(minAmount)) return false;
      if (maxAmount && invoice.total.value > Number(maxAmount)) return false;

      if (query) {
        const customer = data.customers.find((item) => item.id === invoice.customerId);
        const matches =
          invoice.number.toLowerCase().includes(query) ||
          (customer?.name.toLowerCase().includes(query) ?? false);
        if (!matches) return false;
      }

      return true;
    });
  }, [customerId, data.customers, data.invoices, fromDate, maxAmount, minAmount, salesRep, searchQuery, selectedTags, status, terms, toDate]);

  const totalHeight = filteredInvoices.length * ROW_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const visibleCount = Math.ceil(viewportHeight / ROW_HEIGHT) + OVERSCAN * 2;
  const endIndex = Math.min(filteredInvoices.length, startIndex + visibleCount);
  const visibleInvoices = filteredInvoices.slice(startIndex, endIndex);
  const offsetTop = startIndex * ROW_HEIGHT;
  const offsetBottom = Math.max(0, totalHeight - offsetTop - visibleInvoices.length * ROW_HEIGHT);

  const totals = useMemo(() => {
    const openBalance = filteredInvoices.reduce((sum, invoice) => sum + invoice.balance.value, 0);
    const paid = filteredInvoices.reduce((sum, invoice) => sum + invoice.amountPaid.value, 0);
    return { openBalance, paid };
  }, [filteredInvoices]);

  const openDrawer = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsDrawerOpen(true);
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    showToast({
      title: `Exporting ${format.toUpperCase()}`,
      description: 'Filtered invoices are being prepared for download.',
      variant: 'info'
    });
  };

  const handleAction = (invoice: Invoice, action: 'REMIND' | 'PAYMENT' | 'PDF' | 'DUPLICATE' | 'VOID' | 'DISPUTE') => {
    switch (action) {
      case 'REMIND':
        showToast({
          title: 'Reminder queued',
          description: `Reminder email scheduled for ${invoice.number}.`,
          variant: 'success'
        });
        break;
      case 'PAYMENT':
        navigate(`/ar/payments?invoice=${invoice.id}`);
        break;
      case 'PDF':
        showToast({
          title: 'PDF download starting',
          description: `${invoice.number} is rendering.`,
          variant: 'info'
        });
        break;
      case 'DUPLICATE':
        showToast({
          title: 'Invoice duplicated',
          description: `${invoice.number} copied as draft.`,
          variant: 'success'
        });
        break;
      case 'VOID':
        showToast({
          title: 'Void requested',
          description: `${invoice.number} routed for approval.`,
          variant: 'warning'
        });
        break;
      case 'DISPUTE':
        navigate(`/ar/disputes?invoice=${invoice.id}`);
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Invoice portfolio</h2>
          <p className="text-sm text-muted">
            Showing {filteredInvoices.length} of {data.invoices.length} invoices. Balance{' '}
            {formatMoney({ currency: 'USD', value: totals.openBalance })} · Paid{' '}
            {formatMoney({ currency: 'USD', value: totals.paid })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <DownloadIcon className="h-4 w-4" /> CSV
          </Button>
          <Button variant="ghost" onClick={() => handleExport('xlsx')}>
            <DownloadIcon className="h-4 w-4" /> Excel
          </Button>
          <Button onClick={openNewInvoice}>New invoice</Button>
        </div>
      </div>

      <div className="grid gap-4 rounded-3xl border border-border/60 bg-surface/60 p-6 shadow-lg shadow-primary/10">
        <div className="flex flex-wrap items-center gap-4">
          <Select label="Status" value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
            <option value="ALL">All statuses</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIALLY_PAID">Partially paid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="DISPUTED">Disputed</option>
            <option value="PAID">Paid</option>
          </Select>
          <Select label="Customer" value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
            <option value="ALL">All customers</option>
            {data.customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </Select>
          <Select label="Terms" value={terms} onChange={(event) => setTerms(event.target.value)}>
            <option value="ALL">All terms</option>
            {[...new Set(data.invoices.map((invoice) => invoice.terms))].map((term) => (
              <option key={term} value={term}>
                {term}
              </option>
            ))}
          </Select>
          <Select label="Sales rep" value={salesRep} onChange={(event) => setSalesRep(event.target.value)}>
            <option value="ALL">All reps</option>
            {data.salesReps.map((rep) => (
              <option key={rep} value={rep}>
                {rep}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <Input
            label="Issue date from"
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
          />
          <Input label="Issue date to" type="date" value={toDate} onChange={(event) => setToDate(event.target.value)} />
          <Input
            label="Amount min"
            type="number"
            min={0}
            value={minAmount}
            onChange={(event) => setMinAmount(event.target.value)}
            placeholder="0"
          />
          <Input
            label="Amount max"
            type="number"
            min={0}
            value={maxAmount}
            onChange={(event) => setMaxAmount(event.target.value)}
            placeholder="0"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {data.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={cn(
                'inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition hover:border-primary/50 hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                selectedTags.includes(tag) && 'border-primary/60 bg-primary/20 text-primary'
              )}
              onClick={() => toggleTag(tag)}
            >
              <TagIcon className="h-4 w-4" /> {tag}
            </button>
          ))}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear filters
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-3xl border border-border/60 bg-surface/60 p-8 text-center text-muted">
          Loading invoices…
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-border/60 bg-surface/60 p-16 text-center">
          <LightningIcon className="h-10 w-10 text-muted" />
          <div>
            <p className="text-lg font-semibold text-foreground">No invoices match these filters</p>
            <p className="text-sm text-muted">Try removing a filter or creating a new invoice.</p>
          </div>
          <Button onClick={openNewInvoice}>New invoice</Button>
        </div>
      ) : (
        <TableContainer
          ref={scrollRef}
          className="max-h-[calc(100vh-320px)] overflow-y-auto"
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Issue date</TableHead>
                <TableHead>Due date</TableHead>
                <TableHead>Terms</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Tax</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aging</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offsetTop > 0 && (
                <TableRow aria-hidden>
                  <TableCell colSpan={13} className="p-0">
                    <div style={{ height: offsetTop }} />
                  </TableCell>
                </TableRow>
              )}
              {visibleInvoices.map((invoice) => {
                const progress = Math.min(100, (invoice.amountPaid.value / Math.max(invoice.total.value, 1)) * 100);
                const customer = data.customers.find((item) => item.id === invoice.customerId);
                const isOverdue = invoice.status === 'OVERDUE';
                const dueDate = new Date(invoice.dueDate);
                return (
                  <TableRow key={invoice.id} className="cursor-pointer" onClick={() => openDrawer(invoice)}>
                    <TableCell className="font-semibold text-foreground">{invoice.number}</TableCell>
                    <TableCell className="text-muted">{customer?.name ?? 'Unknown'}</TableCell>
                    <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]',
                          isOverdue ? 'bg-red-500/15 text-red-400' : 'bg-surface/80 text-muted'
                        )}
                      >
                        {dueDate.toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>{invoice.terms}</TableCell>
                    <TableCell>{formatMoney(invoice.subtotal)}</TableCell>
                    <TableCell>{formatMoney(invoice.tax)}</TableCell>
                    <TableCell className="font-semibold text-foreground">{formatMoney(invoice.total)}</TableCell>
                    <TableCell>{formatMoney(invoice.amountPaid)}</TableCell>
                    <TableCell className="font-semibold text-foreground">{formatMoney(invoice.balance)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <span className={cn('inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]', statusColors[invoice.status])}>
                          {invoice.status.replace('_', ' ')}
                        </span>
                        {invoice.status === 'PARTIALLY_PAID' && (
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-surface/80">
                            <div className="h-full bg-blue-400" style={{ width: `${progress}%` }} />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center rounded-full bg-surface/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
                        {agingLabels[invoice.agingBucket]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(event) => {
                            event.stopPropagation();
                            openDrawer(invoice);
                          }}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleAction(invoice, 'PAYMENT');
                          }}
                        >
                          Record payment
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleAction(invoice, 'REMIND');
                          }}
                        >
                          Send reminder
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleAction(invoice, 'PDF');
                          }}
                        >
                          PDF
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleAction(invoice, 'DUPLICATE');
                          }}
                        >
                          Duplicate
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleAction(invoice, 'VOID');
                          }}
                        >
                          Void
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleAction(invoice, 'DISPUTE');
                          }}
                        >
                          Dispute
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {offsetBottom > 0 && (
                <TableRow aria-hidden>
                  <TableCell colSpan={13} className="p-0">
                    <div style={{ height: offsetBottom }} />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Drawer
        isOpen={isDrawerOpen && Boolean(selectedInvoice)}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedInvoice ? `${selectedInvoice.number} · ${formatMoney(selectedInvoice.total)}` : ''}
        description={selectedInvoice ? `Due ${new Date(selectedInvoice.dueDate).toLocaleDateString()}` : ''}
      >
        {selectedInvoice ? (
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="emails">Emails</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6 space-y-4">
              <div className="grid gap-4 rounded-2xl border border-border/60 bg-surface/60 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Customer</p>
                    <p className="text-sm text-muted">
                      {data.customers.find((customer) => customer.id === selectedInvoice.customerId)?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">Balance</p>
                    <p className="text-sm text-muted">{formatMoney(selectedInvoice.balance)}</p>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-2xl bg-background/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Issue</p>
                    <p className="text-sm text-foreground">{new Date(selectedInvoice.issueDate).toLocaleString()}</p>
                  </div>
                  <div className="rounded-2xl bg-background/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Due</p>
                    <p className="text-sm text-foreground">{new Date(selectedInvoice.dueDate).toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-border/60 bg-surface/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Tags</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {(selectedInvoice.tags ?? ['No tags']).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 rounded-full bg-background/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-muted"
                    >
                      <TagIcon className="h-4 w-4" /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="activity" className="mt-6 space-y-4 text-sm text-muted">
              <p>No activity logged yet. Automations will capture status changes and payment application events here.</p>
            </TabsContent>
            <TabsContent value="emails" className="mt-6 space-y-4 text-sm text-muted">
              <p>Outbound reminders and customer replies will stream into this thread.</p>
            </TabsContent>
            <TabsContent value="notes" className="mt-6 space-y-4 text-sm text-muted">
              <p>Add collector notes or pin internal context for your team.</p>
            </TabsContent>
            <TabsContent value="files" className="mt-6 space-y-4 text-sm text-muted">
              <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-background/60 p-8 text-center">
                <AttachmentIcon className="h-8 w-8 text-muted" />
                <p>Drop remittance advice or backup documentation here.</p>
                <Button size="sm" variant="outline">
                  Upload
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <p className="text-sm text-muted">Select an invoice to view details.</p>
        )}
      </Drawer>
    </div>
  );
};
