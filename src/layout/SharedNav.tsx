import { NavLink } from 'react-router-dom';

import { SharedFeatureRegistry } from '../pages/shared/features';
import { IndustryFeatureMatrix } from '../app/config/industry.presets';
import { useIndustry } from '../app/state/industry';

const navLinkStyles = ({ isActive }: { isActive: boolean }) =>
  `inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 ${
    isActive
      ? 'border-primary bg-primary/10 text-primary shadow-sm'
      : 'border-border bg-muted text-muted-foreground hover:bg-muted/80'
  }`;

export function SharedNav() {
  const industry = useIndustry();

  const features = SharedFeatureRegistry.filter(
    (feature) => feature.enabledByDefault || IndustryFeatureMatrix[industry]?.[feature.key],
  );

  if (features.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Shared feature navigation" className="flex flex-wrap gap-2">
      {features.map((feature) => (
        <NavLink key={feature.key} to={feature.path} className={navLinkStyles} end>
          {feature.title}
        </NavLink>
      ))}
    </nav>
  );
}
