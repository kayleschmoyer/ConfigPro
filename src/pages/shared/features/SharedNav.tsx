import { NavLink } from 'react-router-dom';

import { cn } from '@/lib/cn';
import { SharedFeatureRegistry } from './feature.registry';

export const SharedNav = () => {
  return (
    <nav aria-label="Shared platform navigation" className="-mx-1 overflow-x-auto pb-2">
      <ul className="flex min-w-full items-center gap-2">
        {SharedFeatureRegistry.map((feature) => (
          <li key={feature.key} className="shrink-0">
            <NavLink
              to={feature.path}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'border border-transparent bg-muted/40 text-muted-foreground hover:border-border hover:bg-muted/60 hover:text-foreground',
                )
              }
            >
              {feature.title}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SharedNav;
