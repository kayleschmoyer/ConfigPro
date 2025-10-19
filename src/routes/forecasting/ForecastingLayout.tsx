import { Outlet, NavLink } from 'react-router-dom';

const navLinkStyles = ({ isActive }: { isActive: boolean }) =>
  `px-4 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-emerald-600 text-white' : 'text-emerald-600 hover:bg-emerald-50'}`;

export const ForecastingLayout = () => (
  <div className="flex h-full flex-col">
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">AI Demand Forecasting</h1>
          <p className="text-sm text-slate-500">
            Harmonise historicals, live signals, and scenario planning in a shared control center.
          </p>
        </div>
        <nav className="flex gap-2">
          <NavLink to="studio" className={navLinkStyles} end>
            Demand studio
          </NavLink>
          <NavLink to="workbench" className={navLinkStyles}>
            Scenario workbench
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
