import { Outlet, NavLink } from 'react-router-dom';

const navLinkStyles = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-blue-600 text-white' : 'text-blue-600 hover:bg-blue-50'}`;

export const SchedulingLayout = () => (
  <div className="flex h-full flex-col">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">AI Scheduling</h1>
          <p className="text-sm text-slate-500">Coordinate staff, compliance, and demand from one workspace.</p>
        </div>
        <nav className="flex gap-2">
          <NavLink to="manager" className={navLinkStyles} end>
            Manager console
          </NavLink>
          <NavLink to="employee" className={navLinkStyles}>
            Employee portal
          </NavLink>
        </nav>
      </div>
    </header>
    <main className="flex-1 overflow-y-auto bg-slate-50">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </div>
    </main>
  </div>
);
