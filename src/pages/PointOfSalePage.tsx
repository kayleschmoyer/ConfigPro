import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { cn } from '../lib/cn';

interface LineItem {
  id: string;
  partNumber: string;
  description: string;
  quantity: string;
  unitPrice: string;
  taxRate: number;
}

const TAX_OPTIONS = [
  { label: 'No tax', value: 0 },
  { label: 'State tax · 6%', value: 0.06 },
  { label: 'Local tax · 2.5%', value: 0.025 },
  { label: 'Combined rate · 8.5%', value: 0.085 }
];

const pageVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

const navigationSections = [
  { label: 'Point of Sale', href: '/pos', isActive: true },
  { label: 'Reports', href: '#reports', isActive: false },
  { label: 'Accounting', href: '#accounting', isActive: false },
  { label: 'Customers', href: '#customers', isActive: false }
];

const createLineItem = (index: number): LineItem => ({
  id: `line-${index}-${Date.now().toString(36)}`,
  partNumber: '',
  description: '',
  quantity: '1',
  unitPrice: '',
  taxRate: 0.085
});

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0);

export const PointOfSalePage = () => {
  const [lineItems, setLineItems] = useState<LineItem[]>([
    createLineItem(1)
  ]);
  const [referenceId] = useState(() => `INV-${Date.now().toString().slice(-6)}`);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [notes, setNotes] = useState('');

  const totals = useMemo(() => {
    return lineItems.reduce(
      (acc, item) => {
        const quantity = parseFloat(item.quantity) || 0;
        const unitPrice = parseFloat(item.unitPrice) || 0;
        const lineSubtotal = quantity * unitPrice;
        const lineTax = lineSubtotal * item.taxRate;
        return {
          subtotal: acc.subtotal + lineSubtotal,
          tax: acc.tax + lineTax
        };
      },
      { subtotal: 0, tax: 0 }
    );
  }, [lineItems]);

  const grandTotal = totals.subtotal + totals.tax;

  const handleItemChange = (
    id: string,
    field: 'partNumber' | 'description' | 'quantity' | 'unitPrice',
    value: string
  ) => {
    setLineItems((items) =>
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value
            }
          : item
      )
    );
  };

  const handleTaxChange = (id: string, taxRate: number) => {
    setLineItems((items) =>
      items.map((item) => (item.id === id ? { ...item, taxRate } : item))
    );
  };

  const handleAddLineItem = () => {
    setLineItems((items) => [...items, createLineItem(items.length + 1)]);
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems((items) =>
      items.length === 1 ? items : items.filter((item) => item.id !== id)
    );
  };

  useEffect(() => {
    const lastItem = lineItems[lineItems.length - 1];
    const isLineComplete =
      Boolean(lastItem?.partNumber.trim()) &&
      Boolean(lastItem?.description.trim()) &&
      Boolean(lastItem?.unitPrice.trim());
    const hasPendingBlank = lineItems.some(
      (item) =>
        item.partNumber.trim() === '' &&
        item.description.trim() === '' &&
        item.unitPrice.trim() === ''
    );

    if (isLineComplete && !hasPendingBlank) {
      setLineItems((items) => [...items, createLineItem(items.length + 1)]);
    }
  }, [lineItems]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-background via-background/96 to-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(86,110,255,0.18),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(48,173,255,0.14),transparent_62%)]" />
      </div>
      <div className="relative flex min-h-screen flex-col">
        <header className="sticky top-0 z-20 border-b border-white/5 bg-background/90 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-[90rem] items-center justify-between gap-6 px-6 py-4 sm:px-10 lg:px-12">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-base font-semibold text-primary shadow-inner shadow-primary/20">
                CP
              </div>
              <div className="hidden items-center gap-1 rounded-full border border-foreground/5 bg-surface/60 px-2 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted sm:flex">
                <span className="rounded-full bg-primary px-2 py-1 text-[10px] text-background">Live</span>
                ConfigPro registers
              </div>
            </div>
            <nav className="hidden items-center gap-2 rounded-full border border-foreground/8 bg-surface/70 px-2 py-1 shadow-sm sm:flex">
              {navigationSections.map((section) => (
                <a
                  key={section.label}
                  href={section.href}
                  className={cn(
                    'rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition',
                    section.isActive
                      ? 'bg-primary text-background shadow-lg shadow-primary/30'
                      : 'text-muted hover:text-foreground'
                  )}
                >
                  {section.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted">Register</p>
                <p className="text-sm font-semibold">Front counter · A01</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-foreground/10 bg-surface/80 text-sm font-semibold text-foreground shadow-sm">
                JL
              </div>
            </div>
          </div>
        </header>

        <motion.main
          className="relative mx-auto flex w-full max-w-[90rem] flex-1 flex-col gap-8 px-6 py-10 sm:px-10 lg:px-12"
          variants={pageVariants}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                Point of Sale
              </div>
              <h1 className="text-3xl font-semibold sm:text-4xl">Counter order in progress</h1>
            </div>
            <div className="flex flex-col items-end gap-3 text-right">
              <div className="rounded-full border border-foreground/10 bg-surface/70 px-6 py-2 text-sm text-muted shadow-sm">
                Reference · {referenceId}
              </div>
              <div className="rounded-full border border-primary/40 bg-primary/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                Walk-up customer
              </div>
            </div>
          </div>

          <section className="space-y-6 rounded-3xl border border-foreground/10 bg-background/80 p-6 shadow-xl shadow-primary/10 backdrop-blur">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Customer</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Input
                label="Name"
                placeholder="Customer or company name"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                className="rounded-2xl border-transparent bg-surface/80 text-sm shadow-sm focus:border-primary"
              />
              <Input
                label="Phone"
                type="tel"
                placeholder="(555) 000-0000"
                value={customerPhone}
                onChange={(event) => setCustomerPhone(event.target.value)}
                className="rounded-2xl border-transparent bg-surface/80 text-sm shadow-sm focus:border-primary"
              />
              <Input
                label="Email"
                type="email"
                placeholder="name@email.com"
                value={customerEmail}
                onChange={(event) => setCustomerEmail(event.target.value)}
                className="rounded-2xl border-transparent bg-surface/80 text-sm shadow-sm focus:border-primary"
              />
              <Input
                label="Address"
                placeholder="Street, city, state"
                value={customerAddress}
                onChange={(event) => setCustomerAddress(event.target.value)}
                className="rounded-2xl border-transparent bg-surface/80 text-sm shadow-sm focus:border-primary"
              />
            </div>
          </section>

          <div className="flex flex-1 flex-col gap-8">
            <section className="flex flex-col gap-6 rounded-3xl border border-foreground/10 bg-background/85 p-7 shadow-xl shadow-primary/10 backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-semibold">Line items</h2>
                <Button variant="outline" size="sm" onClick={handleAddLineItem}>
                  Add line
                </Button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-foreground/5">
                <table className="min-w-full border-collapse text-sm">
                  <thead className="bg-surface/60 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted">
                    <tr>
                      <th className="px-4 py-4 text-left">Line</th>
                      <th className="px-4 py-4 text-left">Part</th>
                      <th className="px-4 py-4 text-left">Description</th>
                      <th className="px-4 py-4 text-left">Qty</th>
                      <th className="px-4 py-4 text-left">Unit price</th>
                      <th className="px-4 py-4 text-left">Tax</th>
                      <th className="px-4 py-4 text-right">Line total</th>
                      <th className="px-4 py-4 text-right" aria-label="Actions" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-foreground/5 bg-background/70">
                    {lineItems.map((item, index) => {
                      const quantity = parseFloat(item.quantity) || 0;
                      const unitPrice = parseFloat(item.unitPrice) || 0;
                      const lineSubtotal = quantity * unitPrice;
                      const lineTax = lineSubtotal * item.taxRate;
                      const lineTotal = lineSubtotal + lineTax;

                      return (
                        <tr
                          key={item.id}
                          className="align-top transition hover:bg-surface/80"
                        >
                          <td className="px-4 py-5 align-top text-xs font-semibold uppercase tracking-[0.25em] text-muted">
                            #{index + 1}
                          </td>
                          <td className="px-4 py-5 align-top">
                            <Input
                              value={item.partNumber}
                              onChange={(event) =>
                                handleItemChange(item.id, 'partNumber', event.target.value)
                              }
                              placeholder="e.g. ABC-1234"
                              aria-label="Part number"
                              className="h-11 rounded-2xl border-transparent bg-surface/80 text-sm shadow-sm focus:border-primary"
                            />
                          </td>
                          <td className="px-4 py-5 align-top">
                            <Input
                              value={item.description}
                              onChange={(event) =>
                                handleItemChange(item.id, 'description', event.target.value)
                              }
                              placeholder="Item description"
                              aria-label="Description"
                              className="h-11 rounded-2xl border-transparent bg-surface/80 text-sm shadow-sm focus:border-primary"
                            />
                          </td>
                          <td className="px-4 py-5 align-top">
                            <Input
                              type="number"
                              min="0"
                              step="1"
                              value={item.quantity}
                              onChange={(event) =>
                                handleItemChange(item.id, 'quantity', event.target.value)
                              }
                              aria-label="Quantity"
                              className="h-11 rounded-2xl border-transparent bg-surface/80 text-sm shadow-sm focus:border-primary"
                            />
                          </td>
                          <td className="px-4 py-5 align-top">
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unitPrice}
                              onChange={(event) =>
                                handleItemChange(item.id, 'unitPrice', event.target.value)
                              }
                              className="h-11 rounded-2xl border-transparent bg-surface/80 text-sm shadow-sm focus:border-primary"
                              placeholder="0.00"
                              aria-label="Unit price"
                            />
                          </td>
                          <td className="px-4 py-5 align-top">
                            <label className="flex flex-col gap-2 text-sm font-medium text-muted">
                              Tax rate
                              <select
                                value={item.taxRate}
                                onChange={(event) =>
                                  handleTaxChange(item.id, parseFloat(event.target.value))
                                }
                                className={cn(
                                  'h-11 w-full rounded-2xl border border-transparent bg-surface/80 px-4 text-sm text-foreground shadow-sm transition',
                                  'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50'
                                )}
                              >
                                {TAX_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </td>
                          <td className="px-4 py-5 align-top text-right text-sm font-semibold text-foreground">
                            {formatCurrency(lineTotal)}
                          </td>
                          <td className="px-4 py-5 align-top text-right">
                            {lineItems.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-xs text-muted transition hover:text-red-500"
                                onClick={() => handleRemoveLineItem(item.id)}
                              >
                                Remove
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <label className="flex flex-col gap-2 text-sm font-medium text-muted">
                Internal notes
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Delivery preferences or register reminders"
                  rows={3}
                  className={cn(
                    'w-full rounded-2xl border border-transparent bg-surface/80 px-4 py-3 text-sm text-foreground shadow-sm transition',
                    'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50'
                  )}
                />
              </label>
            </section>
            <footer className="sticky bottom-6 z-10 mt-auto">
              <div className="rounded-3xl border border-primary/40 bg-primary/15 p-6 shadow-2xl shadow-primary/20 backdrop-blur-xl">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-primary">
                      <h2 className="text-lg font-semibold">Totals</h2>
                      <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em]">
                        Synced live
                      </span>
                    </div>
                    <dl className="grid gap-3 text-sm text-primary/90 sm:grid-cols-3 sm:items-center">
                      <div className="flex items-center justify-between gap-4 rounded-2xl bg-background/40 px-4 py-3 text-foreground/90">
                        <dt className="text-muted">Subtotal</dt>
                        <dd className="font-semibold">{formatCurrency(totals.subtotal)}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4 rounded-2xl bg-background/40 px-4 py-3 text-foreground/90">
                        <dt className="text-muted">Taxes</dt>
                        <dd className="font-semibold">{formatCurrency(totals.tax)}</dd>
                      </div>
                      <div className="flex items-center justify-between gap-4 rounded-2xl border border-primary/40 bg-primary/20 px-4 py-3 text-foreground">
                        <dt className="text-sm font-semibold uppercase tracking-[0.25em] text-primary/80">Total due</dt>
                        <dd className="text-base font-semibold text-foreground">{formatCurrency(grandTotal)}</dd>
                      </div>
                    </dl>
                  </div>
                  <div className="flex w-full flex-col gap-3 md:w-auto md:min-w-[16rem]">
                    <Button type="button" className="w-full" size="lg">
                      Collect payment
                    </Button>
                    <Button type="button" variant="outline" className="w-full">
                      Send invoice
                    </Button>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </motion.main>
      </div>
    </div>
  );
};
