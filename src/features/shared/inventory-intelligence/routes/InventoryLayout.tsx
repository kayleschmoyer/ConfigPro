import { useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { baseTheme } from '@/app/config/theme';
import { cn } from '@/lib/cn';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { useInventoryShortcuts } from '../lib/shortcuts';
import type { SearchResult } from '../lib/types';

const NAV_ITEMS = [
  { label: 'Home', path: '/inventory', key: 'home', shortcut: 'g h' },
  { label: 'Forecasts', path: '/inventory/forecasts', key: 'forecasts', shortcut: 'g f' },
  { label: 'Replenishment', path: '/inventory/replenishment', key: 'replenishment', shortcut: 'g r' },
  { label: 'Suppliers & Lead Times', path: '/inventory/suppliers', key: 'suppliers', shortcut: 'g s' },
  { label: 'Multi-Location Balancer', path: '/inventory/balancer', key: 'balancer', shortcut: 'g b' },
  { label: 'Kits & BOM', path: '/inventory/kits', key: 'kits', shortcut: 'g k' },
  { label: 'Exceptions', path: '/inventory/exceptions', key: 'exceptions', shortcut: 'g e' },
  { label: 'Automation & Rules', path: '/inventory/automation', key: 'automation', shortcut: 'g a' },
  { label: 'Reports', path: '/inventory/reports', key: 'reports', shortcut: 'g p' },
  { label: 'Inventory Settings', path: '/inventory/settings', key: 'settings', shortcut: 'g i' }
] as const;

const demoResults: SearchResult[] = [
  { id: 'sku-001', type: 'SKU', label: 'ACME-COOLER', sublabel: 'Outdoor' },
  { id: 'sup-001', type: 'SUPPLIER', label: 'Northwind Plastics', sublabel: 'Supplier' },
  { id: 'cat-ice', type: 'CATEGORY', label: 'Cold Chain', sublabel: 'Category' }
];

export const InventoryLayout = () => {
  const [query, setQuery] = useState('');
  const [resultsVisible, setResultsVisible] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredResults = useMemo(() => {
    if (!query) return demoResults;
    const lower = query.toLowerCase();
    return demoResults.filter((item) => item.label.toLowerCase().includes(lower));
  }, [query]);

  useInventoryShortcuts({
    '/': () => searchRef.current?.focus(),
    'g f': () => navigate('/inventory/forecasts'),
    'g r': () => navigate('/inventory/replenishment'),
    'g b': () => navigate('/inventory/balancer')
  });

  return (
    <div className="flex min-h-screen bg-[color:var(--inventory-bg,#030712)]" style={{ background: `radial-gradient(circle at top, ${baseTheme.primary}0a, transparent 65%)` }}>
      <aside className="hidden w-72 flex-col gap-6 border-r border-border/60 bg-background/40 px-6 py-8 backdrop-blur xl:flex" aria-label="Inventory navigation">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Inventory Intelligence</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">ConfigPro</h1>
        </div>
        <nav className="flex flex-1 flex-col gap-1" aria-label="Inventory sections">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex items-center justify-between rounded-full px-4 py-3 text-sm font-semibold text-foreground/70 transition hover:text-foreground hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                  isActive && 'bg-primary/20 text-foreground'
                )
              }
            >
              <span>{item.label}</span>
              <span className="text-xs uppercase tracking-[0.3em] text-muted">{item.shortcut}</span>
            </NavLink>
          ))}
        </nav>
        <Button asChild variant="outline">
          <a href="#reports">Export Intelligence</a>
        </Button>
      </aside>
      <main className="flex-1 overflow-y-auto bg-background/60 px-6 py-10 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-col gap-8">
          <div className="flex flex-col gap-3" role="search">
            <Input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setResultsVisible(true)}
              onBlur={() => setTimeout(() => setResultsVisible(false), 100)}
              placeholder="Search SKUs, suppliers, categories"
              aria-label="Global inventory search"
            />
            {resultsVisible && (
              <motion.ul
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.16 }}
                className="grid gap-2 rounded-3xl border border-border/60 bg-surface/80 p-4 text-sm text-muted"
              >
                {filteredResults.map((result) => (
                  <li key={result.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-foreground">{result.label}</p>
                      <p className="text-xs text-muted">{result.sublabel}</p>
                    </div>
                    <Button size="sm" variant="ghost">
                      Open
                    </Button>
                  </li>
                ))}
              </motion.ul>
            )}
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
};
