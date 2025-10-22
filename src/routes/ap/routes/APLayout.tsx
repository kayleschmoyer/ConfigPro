import { useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { baseTheme, resolveTheme } from '@/app/config/theme';
import { cn } from '@/lib/cn';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { useShortcutSequence } from '../lib/shortcuts';

const theme = resolveTheme('configpro') ?? baseTheme;

const navItems = [
  { label: 'Home', path: '/ap', hotkey: ['g', 'h'] },
  { label: 'Bills', path: '/ap/bills', hotkey: ['g', 'b'] },
  { label: 'Vendors', path: '/ap/vendors' },
  { label: 'Purchase Orders', path: '/ap/purchase-orders', hotkey: ['n'] },
  { label: '3-Way Match', path: '/ap/match' },
  { label: 'Approvals', path: '/ap/approvals' },
  { label: 'Payments', path: '/ap/payments', hotkey: ['g', 'p'] },
  { label: 'Exceptions', path: '/ap/exceptions' },
  { label: 'Automation & Rules', path: '/ap/automation' },
  { label: 'Reports', path: '/ap/reports' },
  { label: 'AP Settings', path: '/ap/settings' },
];

export const APLayout = () => {
  const searchRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useShortcutSequence({
    '/': () => searchRef.current?.focus(),
    'g h': () => navigate('/ap'),
    'g b': () => navigate('/ap/bills'),
    'g p': () => navigate('/ap/payments'),
    n: () => navigate('/ap/purchase-orders'),
  });

  return (
    <div
      className="flex min-h-screen bg-[radial-gradient(circle_at_top,_rgba(90,121,255,0.12)_0,_transparent_65%)]"
      style={{ color: theme.foreground }}
    >
      <aside className="flex w-64 flex-col gap-6 border-r border-border/60 bg-background/70 px-6 py-8 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="h-10 w-10 rounded-2xl bg-primary/80" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">ConfigPro</p>
            <p className="text-sm font-semibold text-foreground">Accounts Payable</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1" aria-label="Accounts Payable">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between rounded-full px-4 py-2 text-sm font-semibold uppercase tracking-[0.2em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                  isActive ? 'bg-primary text-background shadow shadow-primary/20' : 'text-muted hover:text-foreground'
                )
              }
            >
              <span>{item.label}</span>
              {item.hotkey && (
                <span className="rounded-full border border-border/40 bg-surface/80 px-2 py-0.5 text-[10px] font-semibold text-muted">
                  {item.hotkey.join(' + ').toUpperCase()}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-3">
          <Button variant="outline" className="w-full">
            New automation rule
          </Button>
          <p className="text-xs text-muted/80">
            Keyboard shortcuts: <kbd className="rounded border border-border/60 bg-surface px-1">/</kbd> search,{' '}
            <kbd className="rounded border border-border/60 bg-surface px-1">G</kbd> then{' '}
            <kbd className="rounded border border-border/60 bg-surface px-1">B</kbd> for bills.
          </p>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-background/80">
        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 px-10 py-6 backdrop-blur-lg">
          <div className="flex items-center justify-between gap-6">
            <Input
              ref={searchRef}
              placeholder="Search vendor, bill #, PO #, amount"
              className="w-96"
              aria-label="Global search"
            />
            <div className="flex items-center gap-3">
              <Button variant="ghost">Export aging</Button>
              <Button>Capture bill</Button>
            </div>
          </div>
        </header>
        <section className="px-10 py-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
            <Outlet />
          </motion.div>
        </section>
      </main>
    </div>
  );
};
