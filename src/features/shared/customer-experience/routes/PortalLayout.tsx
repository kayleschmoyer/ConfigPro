import { useMemo, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { cn } from '../../../lib/cn';
import { heroGradient } from '../lib/format';
import { useShortcuts } from '../lib/shortcuts';
import { PortalProvider, usePortal } from '../hooks/usePortal';

const portalNavigation = [
  { to: '/portal', label: 'Home', shortcut: 'g h' },
  { to: '/portal/invoices', label: 'Invoices', shortcut: 'g i' },
  { to: '/portal/orders', label: 'Orders', shortcut: 'g o' },
  { to: '/portal/appointments', label: 'Appointments', shortcut: 'g a' },
  { to: '/portal/messages', label: 'Messages', shortcut: 'g m' },
  { to: '/portal/documents', label: 'Documents', shortcut: 'g d' },
  { to: '/portal/loyalty', label: 'Loyalty', shortcut: 'g l' },
  { to: '/portal/feedback', label: 'Feedback', shortcut: 'g f' },
  { to: '/portal/profile', label: 'Profile', shortcut: 'g p' },
  { to: '/portal/support', label: 'Support', shortcut: 'g s' }
];

const PortalShell = () => {
  const { snapshot } = usePortal();
  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  useShortcuts({ '/': () => setShowSearch(true) });

  const greeting = useMemo(
    () => `Welcome back, ${snapshot.customer.custom?.preferred_name ?? snapshot.customer.firstName}`,
    [snapshot.customer]
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background text-foreground">
      <header
        className="relative overflow-hidden border-b border-border/50"
        style={{ backgroundImage: heroGradient }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-background/40 to-background/80" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="text-3xl font-semibold text-white"
            >
              {greeting}
            </motion.h1>
            <p className="text-sm text-slate-200">
              Manage invoices, appointments, and loyalty from a single trusted space.
            </p>
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.4em] text-slate-200/80">
              <span>{snapshot.customer.email}</span>
              <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
              <span>{snapshot.loyalty.tier} tier</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <Button variant="outline" onClick={() => setShowSearch(current => !current)}>
              {showSearch ? 'Hide search' : 'Global search (/)' }
            </Button>
            {showSearch && (
              <Input
                autoFocus
                placeholder="Search invoices, orders, appointments…"
                value={search}
                onChange={event => setSearch(event.target.value)}
                containerClassName="w-80"
              />
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        <nav className="flex flex-wrap items-center gap-3" aria-label="Portal navigation">
          {portalNavigation.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                  isActive
                    ? 'bg-primary text-white shadow-md shadow-primary/30'
                    : 'bg-surface/80 text-foreground hover:bg-surface'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="min-h-[60vh] pb-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const PortalLayout = () => (
  <PortalProvider>
    <PortalShell />
  </PortalProvider>
);

export default PortalLayout;
