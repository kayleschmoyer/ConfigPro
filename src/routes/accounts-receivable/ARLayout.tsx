import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../shared/ui/Button';
import { Input } from '../../shared/ui/Input';
import { ToastProvider, useToast } from '../../shared/ui/Toast';
import { cn } from '../../lib/cn';
import {
  AgingIcon,
  AutomationIcon,
  CashIcon,
  ClockIcon,
  CustomerIcon,
  DisputeIcon,
  InvoiceIcon,
  ReportIcon,
  SearchIcon,
  SettingsIcon,
  SparkleIcon
} from './components/Icons';
import { AccountsReceivableProvider, useAccountsReceivable } from './context';

const navItems = [
  { label: 'Home', to: '/ar', icon: SparkleIcon },
  { label: 'Invoices', to: '/ar/invoices', icon: InvoiceIcon },
  { label: 'Payments & Apply Cash', to: '/ar/payments', icon: CashIcon },
  { label: 'Customers & Credit', to: '/ar/customers', icon: CustomerIcon },
  { label: 'Aging & Collections', to: '/ar/aging', icon: AgingIcon },
  { label: 'Disputes', to: '/ar/disputes', icon: DisputeIcon },
  { label: 'Automation & Rules', to: '/ar/automation', icon: AutomationIcon },
  { label: 'Reports', to: '/ar/reports', icon: ReportIcon },
  { label: 'AR Settings', to: '/ar/settings', icon: SettingsIcon }
] as const;

const chordTimeoutMs = 750;

const useGlobalShortcuts = (
  focusSearch: () => void,
  openNewInvoice: () => void,
  navigate: ReturnType<typeof useNavigate>
) => {
  const chordRef = useRef<{ key: string | null; timestamp: number }>({ key: null, timestamp: 0 });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        !target ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable;

      if (event.key === '/' && !isTyping) {
        event.preventDefault();
        focusSearch();
        return;
      }

      if (isTyping) return;

      const normalizedKey = event.key.toLowerCase();
      const { key, timestamp } = chordRef.current;
      const now = performance.now();

      if (normalizedKey === 'g') {
        chordRef.current = { key: 'g', timestamp: now };
        return;
      }

      if (key === 'g' && now - timestamp <= chordTimeoutMs) {
        if (normalizedKey === 'i') {
          navigate('/ar/invoices');
          chordRef.current = { key: null, timestamp: 0 };
          return;
        }
        if (normalizedKey === 'p') {
          navigate('/ar/payments');
          chordRef.current = { key: null, timestamp: 0 };
          return;
        }
      }

      if (normalizedKey === 'n') {
        event.preventDefault();
        openNewInvoice();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusSearch, navigate, openNewInvoice]);
};

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
    isActive
      ? 'bg-primary/20 text-foreground shadow-inner shadow-primary/20'
      : 'text-muted hover:bg-surface/80 hover:text-foreground'
  );

const RemindersStrip = () => {
  const { data } = useAccountsReceivable();
  if (!data.reminders.length) return null;

  return (
    <div className="flex flex-wrap gap-3 rounded-3xl border border-primary/40 bg-primary/10 p-3 text-sm text-foreground">
      {data.reminders.map((reminder) => (
        <a
          key={reminder.id}
          href={reminder.href ?? '#'}
          className={cn(
            'group inline-flex items-center gap-2 rounded-2xl px-4 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-primary/10',
            reminder.severity === 'critical'
              ? 'bg-red-500/20 text-red-100 hover:bg-red-500/30 focus-visible:ring-red-400'
              : reminder.severity === 'warning'
                ? 'bg-amber-500/20 text-amber-100 hover:bg-amber-500/30 focus-visible:ring-amber-400'
                : 'bg-sky-500/20 text-sky-100 hover:bg-sky-500/25 focus-visible:ring-sky-400'
          )}
        >
          <span className="text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
            {reminder.severity === 'critical'
              ? 'Escalate'
              : reminder.severity === 'warning'
                ? 'Action'
                : 'Heads up'}
          </span>
          <span className="text-sm font-medium text-white/90">{reminder.message}</span>
          {reminder.actionLabel && (
            <span className="text-xs font-semibold uppercase text-white/80">
              {reminder.actionLabel}
            </span>
          )}
        </a>
      ))}
    </div>
  );
};

const LayoutChrome = () => {
  const { searchQuery, setSearchQuery, registerSearchInput, focusSearch, data, openNewInvoice } =
    useAccountsReceivable();
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const handleExport = useCallback(
    (format: 'csv' | 'xlsx') => {
      showToast({
        title: `Exporting ${format.toUpperCase()}`,
        description: 'We are preparing your download. You will be notified shortly.',
        variant: 'info'
      });
    },
    [showToast]
  );

  useGlobalShortcuts(focusSearch, openNewInvoice, navigate);

  const pageVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 }
  };

  const isHome = location.pathname === '/ar';

  return (
    <div className="relative -mx-4 -my-6 flex min-h-[calc(100vh-1px)] bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.35),transparent_55%),_radial-gradient(circle_at_bottom,_rgba(14,116,144,0.22),transparent_58%)] text-foreground">
      <div className="flex h-full w-64 flex-col border-r border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="flex items-center gap-3 border-b border-white/10 px-6 py-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-primary/40 bg-primary/20 text-lg font-semibold text-primary shadow-inner shadow-primary/40">
            AR
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">ConfigPro</p>
            <p className="text-sm font-semibold text-foreground">Accounts Receivable</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-4 py-6">
          {navItems.map((item) => (
            <NavLink key={item.label} to={item.to} className={navLinkClass} end={item.to === '/ar'}>
              <item.icon className="h-5 w-5 text-primary" />
              <span className="flex-1 text-left">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="space-y-2 border-t border-white/10 px-4 py-6">
          <Button variant="outline" size="sm" onClick={() => handleExport('csv')}>
            Quick export CSV
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleExport('xlsx')}>
            Export Excel workbook
          </Button>
        </div>
      </div>
      <div className="relative flex min-h-full flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-white/10 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-6 px-8 py-6">
            <div className="flex flex-col gap-1">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.35em] text-muted">
                <ClockIcon className="h-4 w-4 text-primary" />
                Real-time sync
              </p>
              <h1 className="text-2xl font-semibold">Accounts Receivable</h1>
            </div>
            <div className="flex flex-1 flex-col items-end gap-4 sm:flex-row sm:items-center sm:justify-end">
              <div className="relative w-full max-w-md">
                <Input
                  label="Global search"
                  placeholder="Search invoices, customers, or amounts"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  ref={registerSearchInput}
                />
                <SearchIcon className="pointer-events-none absolute right-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => navigate('/ar/invoices')}>
                  View invoices
                </Button>
                <Button size="sm" onClick={() => navigate('/ar/payments')}>
                  Record payment
                </Button>
              </div>
            </div>
          </div>
          {isHome && (
            <div className="px-8 pb-6">
              <RemindersStrip />
            </div>
          )}
        </header>
        <motion.main
          className="flex-1 overflow-y-auto px-8 py-8"
          initial="hidden"
          animate="visible"
          variants={pageVariants}
          transition={{ duration: 0.18, ease: 'easeOut' }}
        >
          <Outlet />
        </motion.main>
        <footer className="border-t border-white/10 bg-background/80 px-8 py-4 text-sm text-muted">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span>
              Connected to {data.customers.length} customers · {data.invoices.length} invoices monitored
            </span>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
              Shortcuts: G I (Invoices) · G P (Payments) · N (New invoice) · / (Search)
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export const ARLayout = () => (
  <ToastProvider>
    <AccountsReceivableProvider>
      <LayoutChrome />
    </AccountsReceivableProvider>
  </ToastProvider>
);
