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
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-6 py-4 sm:px-10 lg:px-12">
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
          className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-10 sm:px-10 lg:px-12"
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
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold sm:text-4xl">Counter order in progress</h1>
                <p className="max-w-xl text-sm text-muted">
                  Add line items in a rhythm-first grid, get instant totals, and stay focused on the customer in front of you.
                </p>
              </div>
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

          <div className="grid flex-1 gap-8 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
            <section className="flex flex-col gap-6 rounded-3xl border border-foreground/10 bg-background/85 p-7 shadow-xl shadow-primary/10 backdrop-blur-xl">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-xl font-semibold">Line items</h2>
                  <p className="text-sm text-muted">
                    Complete a row and ConfigPro opens the next one automatically.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleAddLineItem}>
                  Add line
                </Button>
              </div>

              <div className="overflow-hidden rounded-2xl border border-foreground/5">
                <div className="grid grid-cols-[1.3fr_1.8fr_0.8fr_0.9fr_0.9fr] items-center gap-4 border-b border-foreground/5 bg-surface/60 px-6 py-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-muted">
                  <span>Part</span>
                  <span>Description</span>
                  <span>Qty</span>
                  <span>Unit price</span>
                  <span>Tax</span>
                </div>
                <div className="divide-y divide-foreground/5 bg-background/70">
                  {lineItems.map((item, index) => {
                    const quantity = parseFloat(item.quantity) || 0;
                    const unitPrice = parseFloat(item.unitPrice) || 0;
                    const lineSubtotal = quantity * unitPrice;
                    const lineTax = lineSubtotal * item.taxRate;
                    const lineTotal = lineSubtotal + lineTax;

                    const isComplete =
                      item.partNumber.trim() !== '' &&
                      item.description.trim() !== '' &&
                      item.unitPrice.trim() !== '';

                    return (
                      <div key={item.id} className="group grid grid-cols-[1.3fr_1.8fr_0.8fr_0.9fr_0.9fr] items-start gap-4 px-6 py-6 transition hover:bg-surface/80">
                        <div className="space-y-2">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted">Line {index + 1}</span>
                          <Input
                            label="Part number"
                            value={item.partNumber}
                            onChange={(event) =>
                              handleItemChange(item.id, 'partNumber', event.target.value)
                            }
                            placeholder="e.g. ABC-1234"
                            className="h-11 rounded-2xl border-transparent bg-surface/80 text-sm shadow-sm focus:border-primary"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted">Details</span>
                          <Input
                            label="Description"
                            value={item.description}
                            onChange={(event) =>
                              handleItemChange(item.id, 'description', event.target.value)
                            }
                            placeholder="Item description"
                            className="h-11 rounded-2xl border-transparent bg-surface/80 text-sm shadow-sm focus:border-primary"
                          />
                          <dl className="grid grid-cols-3 gap-3 rounded-2xl border border-foreground/5 bg-background/70 p-3 text-[11px] text-muted">
                            <div>
                              <dt className="font-semibold text-foreground">Subtotal</dt>
                              <dd>{formatCurrency(lineSubtotal)}</dd>
                            </div>
                            <div>
                              <dt className="font-semibold text-foreground">Tax</dt>
                              <dd>{formatCurrency(lineTax)}</dd>
                            </div>
                            <div>
                              <dt className="font-semibold text-foreground">Line total</dt>
                              <dd className="text-foreground">{formatCurrency(lineTotal)}</dd>
                            </div>
                          </dl>
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted">Quantity</span>
                          <Input
                            label="Quantity"
                            type="number"
                            min="0"
                            step="1"
                            value={item.quantity}
                            onChange={(event) =>
                              handleItemChange(item.id, 'quantity', event.target.value)
                            }
                            className="h-11 rounded-2xl border-transparent bg-surface/80 text-sm shadow-sm focus:border-primary"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted">Unit price</span>
                          <Input
                            label="Unit price"
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(event) =>
                              handleItemChange(item.id, 'unitPrice', event.target.value)
                            }
                            className="h-11 rounded-2xl border-transparent bg-surface/80 text-sm shadow-sm focus:border-primary"
                            placeholder="0.00"
                          />
                        </div>
                        <div className="flex flex-col gap-3">
                          <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-muted">Tax rate</span>
                          <label className="flex flex-col gap-2 text-sm font-medium text-muted">
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
                          <div className="flex items-center justify-between text-[11px] text-muted">
                            <span className="inline-flex items-center gap-2">
                              <span
                                className={cn(
                                  'h-1.5 w-1.5 rounded-full transition',
                                  isComplete ? 'bg-primary' : 'bg-muted/50'
                                )}
                              />
                              {isComplete ? 'Ready' : 'In progress'}
                            </span>
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
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
                <Input
                  label="Bill to"
                  placeholder="Customer or company name"
                  value={customerName}
                  onChange={(event) => setCustomerName(event.target.value)}
                  className="h-12 rounded-2xl border-transparent bg-surface/80 text-sm shadow-sm focus:border-primary"
                />
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
              </div>
            </section>

            <aside className="flex flex-col gap-6">
              <div className="rounded-3xl border border-primary/30 bg-primary/10 p-6 shadow-xl shadow-primary/20">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-primary">Totals</h2>
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
                    Synced live
                  </span>
                </div>
                <dl className="mt-4 space-y-3 text-sm text-primary/90">
                  <div className="flex items-center justify-between">
                    <dt>Subtotal</dt>
                    <dd className="text-foreground">{formatCurrency(totals.subtotal)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt>Taxes</dt>
                    <dd className="text-foreground">{formatCurrency(totals.tax)}</dd>
                  </div>
                  <div className="flex items-center justify-between border-t border-primary/25 pt-3 text-base font-semibold text-primary">
                    <dt>Total due</dt>
                    <dd className="text-foreground">{formatCurrency(grandTotal)}</dd>
                  </div>
                </dl>
                <div className="mt-6 space-y-3">
                  <Button type="button" className="w-full" size="lg">
                    Collect payment
                  </Button>
                  <Button type="button" variant="outline" className="w-full">
                    Send invoice
                  </Button>
                </div>
              </div>

              <div className="space-y-4 rounded-3xl border border-foreground/10 bg-background/70 p-6 text-sm text-muted shadow-lg shadow-primary/10 backdrop-blur">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                    Checkout rhythm
                  </h3>
                  <span className="rounded-full bg-primary/15 px-3 py-1 text-[11px] font-semibold text-primary">
                    Average · 02:14
                  </span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <p>Drop in a part, description, and price — the next line appears automatically.</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <p>Totals sync instantly to every register and the back office.</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <p>Switch to Reports or Accounting from the guide bar without losing your draft.</p>
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </motion.main>
      </div>
    </div>
  );
};
