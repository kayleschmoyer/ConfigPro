import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { baseTheme, resolveTheme } from '@/app/config/theme';
import { cn } from '@/lib/cn';
import { useShortcuts } from '../lib/shortcuts';

const theme = resolveTheme() ?? baseTheme;

const links = [
  { to: 'home', label: 'Integrations Home', shortcut: 'G H' },
  { to: 'connectors', label: 'Connectors', shortcut: 'G C' },
  { to: 'api-keys', label: 'API Keys', shortcut: 'G K' },
  { to: 'webhooks', label: 'Webhooks', shortcut: 'G W' },
  { to: 'sync-jobs', label: 'Sync Jobs', shortcut: 'G S' },
  { to: 'logs', label: 'Logs', shortcut: 'G L' },
  { to: 'settings', label: 'Settings', shortcut: 'G ?' }
];

export function IntegrationsLayout() {
  useShortcuts(
    links.map((link) => ({
      keys: [link.shortcut.toLowerCase().replace(' ', '')],
      handler: () => {
        const anchor = document.querySelector<HTMLAnchorElement>(`a[href*="${link.to}"]`);
        anchor?.focus();
        anchor?.click();
      }
    }))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-black/80 text-foreground">
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
        className="border-b border-border/60 bg-background/80 px-8 py-6 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Integration Center</h1>
            <p className="text-sm text-muted">
              Manage connectors, API keys, webhooks and sync jobs from a single hardened control surface.
            </p>
          </div>
          <nav className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-muted">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-full border border-transparent px-4 py-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                    isActive ? 'border-primary/60 bg-primary/10 text-primary' : 'hover:text-foreground'
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </motion.header>
      <main className="mx-auto flex max-w-7xl flex-1 flex-col gap-10 px-8 py-10">
        <Outlet />
      </main>
      <footer className="border-t border-border/60 bg-background/60 px-8 py-6 text-xs text-muted">
        <div className="mx-auto flex max-w-7xl justify-between">
          <span>ConfigPro base theme — {theme.name}</span>
          <span>Keyboard: / search, G + routes</span>
        </div>
      </footer>
    </div>
  );
}
