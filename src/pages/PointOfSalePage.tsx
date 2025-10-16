import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
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
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 }
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0);

export const PointOfSalePage = () => {
  const [lineItems, setLineItems] = useState<LineItem[]>([
    {
      id: 'item-1',
      partNumber: '',
      description: '',
      quantity: '1',
      unitPrice: '',
      taxRate: 0.085
    }
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
    setLineItems((items) => [
      ...items,
      {
        id: `item-${items.length + 1}-${Date.now()}`,
        partNumber: '',
        description: '',
        quantity: '1',
        unitPrice: '',
        taxRate: 0.085
      }
    ]);
  };

  const handleRemoveLineItem = (id: string) => {
    setLineItems((items) =>
      items.length === 1 ? items : items.filter((item) => item.id !== id)
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background/95 to-background/90 text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(80,115,255,0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(49,162,255,0.08),transparent_60%)]" />
      </div>
      <motion.div
        className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10 sm:px-10 lg:px-12"
        variants={pageVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/80">
            Point of sale
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-semibold sm:text-4xl">
                New counter order
              </h1>
              <p className="text-sm text-muted">
                Add parts, confirm pricing, and invoice the customer in seconds.
              </p>
            </div>
            <div className="rounded-full border border-foreground/10 bg-surface/60 px-5 py-2 text-sm text-muted shadow-sm backdrop-blur">
              Reference · {referenceId}
            </div>
          </div>
        </header>

        <div className="grid flex-1 gap-7 lg:grid-cols-[minmax(0,2.3fr)_minmax(0,1fr)]">
          <section className="space-y-6 rounded-3xl border border-foreground/10 bg-background/80 p-7 shadow-xl shadow-primary/10 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold">Line items</h2>
                <p className="text-sm text-muted">
                  Enter part numbers, adjust quantities, and confirm taxes per line.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleAddLineItem}>
                Add line
              </Button>
            </div>

            <div className="grid gap-5">
              {lineItems.map((item, index) => {
                const quantity = parseFloat(item.quantity) || 0;
                const unitPrice = parseFloat(item.unitPrice) || 0;
                const lineSubtotal = quantity * unitPrice;
                const lineTax = lineSubtotal * item.taxRate;
                const lineTotal = lineSubtotal + lineTax;

                return (
                  <div
                    key={item.id}
                    className="rounded-3xl border border-foreground/8 bg-surface/60 p-5 shadow-sm backdrop-blur"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                        Line {index + 1}
                      </span>
                      {lineItems.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted hover:text-red-500"
                          onClick={() => handleRemoveLineItem(item.id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                    <div className="mt-4 grid gap-4 lg:grid-cols-[repeat(4,minmax(0,1fr))_minmax(0,1.2fr)]">
                      <Input
                        label="Part number"
                        value={item.partNumber}
                        onChange={(event) =>
                          handleItemChange(item.id, 'partNumber', event.target.value)
                        }
                        placeholder="e.g. ABC-1234"
                        className="h-10 rounded-2xl text-sm"
                      />
                      <Input
                        label="Description"
                        value={item.description}
                        onChange={(event) =>
                          handleItemChange(item.id, 'description', event.target.value)
                        }
                        placeholder="Item description"
                        className="h-10 rounded-2xl text-sm"
                      />
                      <Input
                        label="Quantity"
                        type="number"
                        min="0"
                        step="1"
                        value={item.quantity}
                        onChange={(event) =>
                          handleItemChange(item.id, 'quantity', event.target.value)
                        }
                        className="h-10 rounded-2xl text-sm"
                      />
                      <Input
                        label="Unit price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(event) =>
                          handleItemChange(item.id, 'unitPrice', event.target.value)
                        }
                        className="h-10 rounded-2xl text-sm"
                        placeholder="0.00"
                      />
                      <label className="flex flex-col gap-2 text-sm font-medium text-muted">
                        Tax rate
                        <select
                          value={item.taxRate}
                          onChange={(event) =>
                            handleTaxChange(item.id, parseFloat(event.target.value))
                          }
                          className={cn(
                            'h-10 w-full rounded-2xl border border-surface/50 bg-background/70 px-4 text-sm text-foreground shadow-sm transition',
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
                    </div>
                    <dl className="mt-4 grid gap-3 rounded-2xl bg-background/70 p-4 text-sm text-muted shadow-inner sm:grid-cols-3">
                      <div>
                        <dt className="font-medium text-foreground">Line subtotal</dt>
                        <dd>{formatCurrency(lineSubtotal)}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-foreground">Tax ({(item.taxRate * 100).toFixed(1)}%)</dt>
                        <dd>{formatCurrency(lineTax)}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-foreground">Line total</dt>
                        <dd className="text-foreground">{formatCurrency(lineTotal)}</dd>
                      </div>
                    </dl>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Bill to"
                placeholder="Customer or company name"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                className="h-11 rounded-2xl"
              />
              <label className="flex flex-col gap-2 text-sm font-medium text-muted">
                Internal notes
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Instructions, delivery preferences, or internal reminders"
                  rows={3}
                  className={cn(
                    'w-full rounded-2xl border border-surface/50 bg-background/70 px-4 py-3 text-sm text-foreground shadow-sm transition',
                    'focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50'
                  )}
                />
              </label>
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-primary/30 bg-primary/10 p-6 shadow-lg shadow-primary/20">
              <h2 className="text-lg font-semibold text-primary">Totals</h2>
              <dl className="mt-4 space-y-3 text-sm text-primary/90">
                <div className="flex items-center justify-between">
                  <dt>Subtotal</dt>
                  <dd className="text-foreground">{formatCurrency(totals.subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt>Taxes</dt>
                  <dd className="text-foreground">{formatCurrency(totals.tax)}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-primary/20 pt-3 text-base font-semibold text-primary">
                  <dt>Total due</dt>
                  <dd className="text-foreground">{formatCurrency(grandTotal)}</dd>
                </div>
              </dl>
              <div className="mt-6 space-y-3">
                <Button type="button" className="w-full" size="lg">
                  Invoice customer
                </Button>
                <Button type="button" variant="outline" className="w-full">
                  Collect payment
                </Button>
              </div>
            </div>
            <div className="rounded-3xl border border-foreground/10 bg-background/70 p-5 text-sm text-muted shadow-sm backdrop-blur">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">
                Summary
              </h3>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <p>Taxes are calculated per line and rounded to the nearest cent.</p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <p>Invoices are emailed instantly with a payment link for customers.</p>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <p>Drafts are auto-saved every 30 seconds and synced to all registers.</p>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </motion.div>
    </div>
  );
};
