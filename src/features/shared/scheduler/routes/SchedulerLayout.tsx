import { NavLink, Outlet } from 'react-router-dom';
import { cn } from '@/lib/cn';
import { Legend } from '../components/Legend';

const NAV_ITEMS = [
  { label: 'Schedule', path: '/scheduler' },
  { label: 'Availability', path: '/scheduler/availability' },
  { label: 'Rules & Labor Law', path: '/scheduler/rules' },
  { label: 'Auto-Scheduler', path: '/scheduler/auto' },
  { label: 'Swaps & Time Off', path: '/scheduler/swaps' },
  { label: 'Publishing', path: '/scheduler/publishing' },
  { label: 'Reports', path: '/scheduler/reports' },
  { label: 'Settings', path: '/scheduler/settings' },
];

export const SchedulerLayout = () => (
  <div className="flex min-h-screen flex-col bg-background">
    <header className="border-b border-border bg-gradient-to-r from-background via-background/80 to-background/60 px-10 py-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">ConfigPro Workforce</p>
          <h1 className="text-3xl font-semibold text-foreground">Employee Scheduler</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Plan, automate, and publish with confidence. Drag-and-drop shifts, guardrail compliance, fairness-aware auto scheduling,
            and publishing in one high-velocity workspace.
          </p>
        </div>
        <Legend />
      </div>
      <nav className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'rounded-full border border-transparent px-4 py-2 transition hover:border-border hover:bg-surface/70',
                isActive && 'border-primary/40 bg-primary/10 text-primary',
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
    <main className="flex flex-1 flex-col gap-8 px-10 py-10">
      <Outlet />
    </main>
  </div>
);
