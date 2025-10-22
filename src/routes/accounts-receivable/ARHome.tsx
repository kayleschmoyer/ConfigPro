import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../shared/ui/Card';
import { useToast } from '../../shared/ui/Toast';
import { formatMoney } from './data';
import { useAccountsReceivable } from './context';
import {
  AgingIcon,
  AutomationIcon,
  CashIcon,
  CustomerIcon,
  DisputeIcon,
  InvoiceIcon,
  ReportIcon,
  SettingsIcon
} from './components/Icons';

const heroVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 }
};

interface QuickAction {
  label: string;
  onSelect: () => void;
}

const QuickActionMenu = ({ actions }: { actions: QuickAction[] }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const handleDismiss = (event: Event) => {
      if (!containerRef.current) return;
      if (event.target instanceof Node && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleDismiss);
    document.addEventListener('focusin', handleDismiss);
    return () => {
      document.removeEventListener('mousedown', handleDismiss);
      document.removeEventListener('focusin', handleDismiss);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-sm text-white/80 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black/20"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        ⋮
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-48 overflow-hidden rounded-2xl border border-white/20 bg-background/95 shadow-xl shadow-black/20 backdrop-blur"
        >
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className="w-full px-4 py-3 text-left text-sm text-foreground transition hover:bg-primary/10 focus-visible:outline-none focus-visible:bg-primary/15"
              role="menuitem"
              onClick={() => {
                action.onSelect();
                setOpen(false);
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CardIcon = ({ children }: { children: React.ReactNode }) => (
  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner shadow-primary/30">
    {children}
  </div>
);

export const ARHome = () => {
  const { data, openNewInvoice, searchQuery } = useAccountsReceivable();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { totalOpenBalance, overdueBalance, disputesOpen, agingBuckets } = useMemo(() => {
    const unpaid = data.invoices.filter((invoice) => !['PAID', 'VOID'].includes(invoice.status));
    const totalOpen = unpaid.reduce((sum, invoice) => sum + invoice.balance.value, 0);
    const overdue = unpaid
      .filter((invoice) => invoice.status === 'OVERDUE')
      .reduce((sum, invoice) => sum + invoice.balance.value, 0);
    const buckets = unpaid.reduce(
      (acc, invoice) => {
        acc[invoice.agingBucket] += invoice.balance.value;
        return acc;
      },
      { '0_30': 0, '31_60': 0, '61_90': 0, '90_PLUS': 0 } as Record<'0_30' | '31_60' | '61_90' | '90_PLUS', number>
    );
    return {
      totalOpenBalance: totalOpen,
      overdueBalance: overdue,
      disputesOpen: data.disputes.filter((dispute) => dispute.stage !== 'RESOLVED').length,
      agingBuckets: buckets
    };
  }, [data.disputes, data.invoices]);

  const topCustomers = useMemo(() => {
    return data.customers
      .map((customer) => {
        const balance = data.invoices
          .filter((invoice) => invoice.customerId === customer.id && invoice.balance.value > 0)
          .reduce((sum, invoice) => sum + invoice.balance.value, 0);
        const overdue = data.invoices
          .filter((invoice) => invoice.customerId === customer.id && invoice.status === 'OVERDUE')
          .reduce((sum, invoice) => sum + invoice.balance.value, 0);
        return { customer, balance, overdue };
      })
      .sort((a, b) => b.overdue - a.overdue)
      .slice(0, 4);
  }, [data.customers, data.invoices]);

  const filteredMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return data.invoices
      .filter((invoice) =>
        invoice.number.toLowerCase().includes(query) ||
        data.customers.find((customer) => customer.id === invoice.customerId)?.name.toLowerCase().includes(query)
      )
      .slice(0, 5);
  }, [data.customers, data.invoices, searchQuery]);

  const cardItems = [
    {
      id: 'invoices',
      title: 'Invoices',
      description: 'Monitor statuses, aging, and automate reminders.',
      icon: <InvoiceIcon className="h-6 w-6" />,
      href: '/ar/invoices',
      actions: [
        { label: 'New invoice', onSelect: openNewInvoice },
        {
          label: 'Send reminders',
          onSelect: () => navigate('/ar/invoices?filter=overdue')
        }
      ]
    },
    {
      id: 'payments',
      title: 'Receive payment',
      description: 'Apply cash in seconds, reconcile deposits, attach proof.',
      icon: <CashIcon className="h-6 w-6" />,
      href: '/ar/payments',
      actions: [
        {
          label: 'Record payment',
          onSelect: () => navigate('/ar/payments')
        },
        {
          label: 'Import remittance',
          onSelect: () => navigate('/ar/payments#batch')
        }
      ]
    },
    {
      id: 'aging',
      title: 'Aging summary',
      description: 'Bucketed exposure and collector worklists.',
      icon: <AgingIcon className="h-6 w-6" />,
      href: '/ar/aging',
      actions: [
        {
          label: 'Create statements',
          onSelect: () => navigate('/ar/aging#statements')
        }
      ]
    },
    {
      id: 'customers',
      title: 'Customer statements',
      description: 'Credit exposure, utilization, and outreach history.',
      icon: <CustomerIcon className="h-6 w-6" />,
      href: '/ar/customers',
      actions: [
        {
          label: 'Generate statement',
          onSelect: () => navigate('/ar/customers#statements')
        }
      ]
    },
    {
      id: 'disputes',
      title: 'Disputes',
      description: 'Track pipeline, SLAs, and resolution playbooks.',
      icon: <DisputeIcon className="h-6 w-6" />,
      href: '/ar/disputes',
      actions: [
        {
          label: 'Log new dispute',
          onSelect: () => navigate('/ar/disputes#new')
        }
      ]
    },
    {
      id: 'automation',
      title: 'Automation',
      description: 'Trigger workflows for reminders, fees, and escalations.',
      icon: <AutomationIcon className="h-6 w-6" />,
      href: '/ar/automation',
      actions: [
        {
          label: 'Create rule',
          onSelect: () => navigate('/ar/automation#builder')
        }
      ]
    },
    {
      id: 'reports',
      title: 'Reports',
      description: 'Aging, DSO, collections efficiency, and more.',
      icon: <ReportIcon className="h-6 w-6" />,
      href: '/ar/reports',
      actions: [
        {
          label: 'Export PDF',
          onSelect: () => navigate('/ar/reports#export')
        }
      ]
    },
    {
      id: 'settings',
      title: 'Settings',
      description: 'Terms, reminder cadence, branding, and numbering.',
      icon: <SettingsIcon className="h-6 w-6" />,
      href: '/ar/settings',
      actions: [
        {
          label: 'Update cadence',
          onSelect: () => navigate('/ar/settings#reminders')
        }
      ]
    }
  ];

  const showSearchResults = filteredMatches.length > 0;

  return (
    <div className="space-y-10">
      <motion.section
        className="overflow-hidden rounded-[2.75rem] border border-white/20 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-900/80 p-10 text-white shadow-[0_40px_120px_rgba(15,23,42,0.35)]"
        variants={heroVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
              Elite AR workspace
            </span>
            <h2 className="text-4xl font-semibold leading-tight sm:text-5xl">
              Close the cash gap with proactive, intelligent collections.
            </h2>
            <p className="text-lg text-white/70">
              ConfigPro orchestrates invoices, payments, disputes, and automation so your team can focus on strategic outreach and cash acceleration.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={openNewInvoice}>
                Create invoice
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate('/ar/aging')}>
                View aging summary
              </Button>
            </div>
          </div>
          <div className="grid w-full max-w-sm gap-4 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-white/80 backdrop-blur lg:max-w-xs">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Open balance</p>
              <p className="text-3xl font-semibold text-white">{formatMoney({ currency: 'USD', value: totalOpenBalance })}</p>
              <p className="text-xs text-white/60">{formatMoney({ currency: 'USD', value: overdueBalance })} overdue</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Aging buckets</p>
              {(
                [
                  ['0-30', agingBuckets['0_30']],
                  ['31-60', agingBuckets['31_60']],
                  ['61-90', agingBuckets['61_90']],
                  ['90+', agingBuckets['90_PLUS']]
                ] as const
              ).map(([label, value]) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="w-12 text-xs uppercase tracking-[0.2em] text-white/50">{label}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(100, (value / Math.max(1, totalOpenBalance)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-xs text-white/70">{formatMoney({ currency: 'USD', value })}</span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/60">Active disputes</p>
              <p className="text-2xl font-semibold text-white">{disputesOpen}</p>
              <p className="text-xs text-white/60">Escalate before SLA breach.</p>
            </div>
          </div>
        </div>
        {showSearchResults && (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
              Quick matches for “{searchQuery}”
            </p>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              {filteredMatches.map((invoice) => {
                const customer = data.customers.find((item) => item.id === invoice.customerId);
                return (
                  <li key={invoice.id} className="flex items-center justify-between gap-3">
                    <span className="font-medium">
                      {invoice.number} · {customer?.name ?? 'Customer'}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/80 hover:text-white"
                      onClick={() => navigate(`/ar/invoices?open=${invoice.id}`)}
                    >
                      View
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </motion.section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card className="bg-background/80">
          <CardHeader>
            <CardTitle>Total open balance</CardTitle>
            <CardDescription>Includes unpaid and partially paid invoices.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">{formatMoney({ currency: 'USD', value: totalOpenBalance })}</p>
          </CardContent>
        </Card>
        <Card className="bg-background/80">
          <CardHeader>
            <CardTitle>Past due balance</CardTitle>
            <CardDescription>Invoices overdue by at least one day.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground text-red-400">
              {formatMoney({ currency: 'USD', value: overdueBalance })}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-background/80">
          <CardHeader>
            <CardTitle>Customers on hold</CardTitle>
            <CardDescription>Automatic hold triggered by utilization and disputes.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {data.customers.filter((customer) => customer.onHold).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-background/80">
          <CardHeader>
            <CardTitle>Average days to pay</CardTitle>
            <CardDescription>Trailing 90 days weighted by invoice total.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold text-foreground">
              {Math.round(
                data.customers.reduce((acc, customer) => acc + (customer.avgDaysToPay ?? 0), 0) /
                  Math.max(1, data.customers.length)
              )}{' '}
              days
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cardItems.map((item) => (
          <Card key={item.id} className="relative bg-background/80 p-6">
            <div className="absolute right-5 top-5">
              <QuickActionMenu actions={item.actions} />
            </div>
            <div className="flex flex-col gap-4">
              <CardIcon>{item.icon}</CardIcon>
              <div>
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </div>
            </div>
            <CardFooter className="mt-6 justify-between">
              <Button variant="ghost" onClick={() => navigate(item.href)}>
                Open
              </Button>
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Enter</span>
            </CardFooter>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="bg-background/85">
          <CardHeader>
            <CardTitle>Collections radar</CardTitle>
            <CardDescription>Top accounts needing immediate outreach.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {topCustomers.map(({ customer, balance, overdue }) => (
              <div
                key={customer.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-border/60 bg-surface/60 p-4"
              >
                <div>
                  <p className="text-sm font-semibold text-foreground">{customer.name}</p>
                  <p className="text-xs text-muted">
                    {customer.accountOwner ? `Owner · ${customer.accountOwner}` : 'Owner unassigned'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-foreground">{formatMoney({ currency: 'USD', value: overdue })} overdue</p>
                  <p className="text-xs text-muted">
                    {formatMoney({ currency: 'USD', value: balance })} open
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigate(`/ar/customers/${customer.id}`);
                    showToast({
                      title: 'Playbook launched',
                      description: `Collections cadence started for ${customer.name}.`,
                      variant: 'info'
                    });
                  }}
                >
                  Start cadence
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="bg-background/85">
          <CardHeader>
            <CardTitle>Automation pulse</CardTitle>
            <CardDescription>Active AR automation rules and last run.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.automationRules.map((rule) => (
              <div key={rule.id} className="rounded-2xl border border-border/60 bg-surface/60 p-4">
                <p className="text-sm font-semibold text-foreground">{rule.name}</p>
                <p className="text-xs text-muted">{rule.trigger}</p>
                <p className="mt-2 text-xs text-muted">
                  {rule.status === 'ACTIVE' ? 'Active' : 'Draft'} ·{' '}
                  {rule.lastRunAt ? new Date(rule.lastRunAt).toLocaleString() : 'Not yet run'}
                </p>
              </div>
            ))}
            <Button variant="ghost" onClick={() => navigate('/ar/automation#builder')}>
              Manage rules
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};
