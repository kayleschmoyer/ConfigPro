import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { resolveTheme } from '@/app/config/theme';
import { cn } from '@/lib/cn';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { useShortcut } from '../lib/shortcuts';
import type { TimeClockNavItem } from '../lib/types';
import { ClockProvider } from '../hooks/ClockProvider';

const navItems: TimeClockNavItem[] = [
  { label: 'Home', path: '/time-clock', shortcut: 'g h' },
  { label: 'Clock In/Out', path: '/time-clock/clock', shortcut: 'g c' },
  { label: 'Breaks', path: '/time-clock/breaks' },
  { label: 'Timesheets', path: '/time-clock/timesheets', shortcut: 'g t' },
  { label: 'Scheduling', path: '/time-clock/scheduling' },
  { label: 'Approvals', path: '/time-clock/approvals', shortcut: 'g a' },
  { label: 'Exceptions', path: '/time-clock/exceptions' },
  { label: 'Policies & Rules', path: '/time-clock/policies' },
  { label: 'Devices & Kiosk', path: '/time-clock/devices' },
  { label: 'Reports', path: '/time-clock/reports' },
  { label: 'Settings', path: '/time-clock/settings' },
];

const sidebarClasses =
  'flex flex-col gap-6 rounded-3xl border border-white/5 bg-surface/80 p-6 shadow-2xl shadow-black/40 backdrop-blur-lg';

export const TimeClockLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef<HTMLInputElement | null>(null);
  const theme = useMemo(() => resolveTheme('construction'), []);
  const [searchTerm, setSearchTerm] = useState('');

  useShortcut('/', () => {
    searchRef.current?.focus();
  });
  useShortcut('g c', (event) => {
    event.preventDefault();
    navigate('/time-clock/clock');
  });
  useShortcut('g t', (event) => {
    event.preventDefault();
    navigate('/time-clock/timesheets');
  });
  useShortcut('g a', (event) => {
    event.preventDefault();
    navigate('/time-clock/approvals');
  });
  useShortcut('g h', (event) => {
    event.preventDefault();
    navigate('/time-clock');
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen bg-[#050914] text-white"
      style={{
        backgroundImage: `radial-gradient(circle at 10% 20%, ${theme.primary}15, transparent 60%), radial-gradient(circle at 80% 0%, ${theme.accent}20, transparent 55%)`,
      }}
    >
      <div className="mx-auto flex max-w-[1440px] gap-8 px-6 py-10 lg:px-10">
        <aside className={cn(sidebarClasses, 'w-64 shrink-0')} aria-label="Time Clock navigation">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">ConfigPro</p>
              <h1 className="text-lg font-semibold">Time Clock</h1>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard')}>
              Exit
            </Button>
          </div>
          <Input
            ref={searchRef}
            placeholder="Search employees"
            aria-label="Search employees"
            helperText="Press / to focus"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <nav className="flex flex-col gap-1" aria-label="Primary">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                    isActive
                      ? 'bg-primary/20 text-white shadow-inner shadow-primary/40'
                      : 'text-muted-foreground hover:bg-white/5 hover:text-white'
                  )
                }
              >
                <span>{item.label}</span>
                {item.shortcut && <span className="text-[10px] uppercase tracking-[0.4em] text-muted">{item.shortcut}</span>}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="flex-1">
          <div className="flex flex-col gap-6">
            <header className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold text-white">{navItems.find((item) => item.path === location.pathname)?.label ?? 'Time Clock'}</h2>
                <p className="text-sm text-muted-foreground">
                  {location.pathname === '/time-clock'
                    ? 'Fast, foolproof, and compliant time capture for teams of every size.'
                    : 'Stay compliant with instant context, smart policies, and offline resilience.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>Shortcuts: / search • G + C clock • G + T timesheets • G + A approvals</span>
              </div>
            </header>
            <section className="rounded-3xl border border-white/5 bg-surface/70 p-1 shadow-2xl shadow-black/30 backdrop-blur">
              <ClockProvider>
                <Outlet />
              </ClockProvider>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};
