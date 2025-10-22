import { Outlet, NavLink } from 'react-router-dom';
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { heroGradient } from '../lib/format';
import { useShortcuts } from '../lib/shortcuts';
import { PortalProvider, usePortal } from '../hooks/usePortal';

const adminNavigation = [
  { to: '/admin', label: 'Overview', shortcut: 'g h' },
  { to: '/admin/customers', label: 'Customers', shortcut: 'g c' },
  { to: '/admin/segments', label: 'Segments', shortcut: 'g s' },
  { to: '/admin/loyalty', label: 'Loyalty rules', shortcut: 'g l' },
  { to: '/admin/feedback', label: 'Feedback', shortcut: 'g f' },
  { to: '/admin/branding', label: 'Branding', shortcut: 'g b' },
  { to: '/admin/journeys', label: 'Journeys', shortcut: 'g j' },
  { to: '/admin/reports', label: 'Reports', shortcut: 'g r' },
  { to: '/admin/settings', label: 'Settings', shortcut: 'g t' }
];

const AdminShell = () => {
  const { snapshot, refresh } = usePortal();
  useShortcuts({ 'g s': () => undefined, 'g l': () => undefined, 'g f': () => undefined });

  const adminGreeting = useMemo(
    () => `Experience manager — ${snapshot.customer.orgId ?? 'Unified portfolio'}`,
    [snapshot.customer.orgId]
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="relative overflow-hidden border-b border-border/50" style={{ backgroundImage: heroGradient }}>
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 via-background/40 to-background/70" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className="text-3xl font-semibold text-white"
            >
              ConfigPro Manager Console
            </motion.h1>
            <p className="text-sm text-slate-200">{adminGreeting}</p>
          </div>
          <Button variant="outline" onClick={refresh}>
            Refresh snapshot
          </Button>
        </div>
      </header>
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-8">
        <nav className="grid gap-3 md:grid-cols-4" aria-label="Admin navigation">
          {adminNavigation.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-3xl border px-5 py-4 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  isActive
                    ? 'border-primary/80 bg-primary/10 text-primary'
                    : 'border-border/50 bg-surface/70 text-foreground hover:bg-surface/80'
                }`
              }
            >
              <span>{item.label}</span>
              <span className="text-xs uppercase tracking-[0.3em] text-muted">{item.shortcut}</span>
            </NavLink>
          ))}
        </nav>
        <main className="pb-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export const AdminLayout = () => (
  <PortalProvider>
    <AdminShell />
  </PortalProvider>
);

export default AdminLayout;
