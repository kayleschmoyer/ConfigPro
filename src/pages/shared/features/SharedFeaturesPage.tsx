import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { SharedFeatureRegistry } from './feature.registry';
import type { FeatureKey } from './feature.registry';
import { SharedNav } from './SharedNav';
import { sharedFeatureGroups } from './sharedFeatures.data';

const registryDefaults: Record<FeatureKey, boolean> = SharedFeatureRegistry.reduce(
  (accumulator, feature) => {
    accumulator[feature.key] = feature.enabledByDefault ?? false;
    return accumulator;
  },
  {} as Record<FeatureKey, boolean>,
);

export const SharedFeaturesPage = () => {
  const [enabledFeatures, setEnabledFeatures] = useState<Record<FeatureKey, boolean>>(registryDefaults);

  const enabledCount = useMemo(
    () => Object.values(enabledFeatures).filter(Boolean).length,
    [enabledFeatures],
  );

  const coverage = useMemo(() => {
    if (SharedFeatureRegistry.length === 0) {
      return 0;
    }
    return Math.round((enabledCount / SharedFeatureRegistry.length) * 100);
  }, [enabledCount]);

  const toggleFeature = (key: FeatureKey) => {
    setEnabledFeatures((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Shared platform
        </p>
        <h1 className="text-3xl font-semibold text-foreground">Shared Features Overview</h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Central hub for documenting reusable capabilities that power the entire ConfigPro
          ecosystem. Populate each section with the features that apply to every system as they
          become available.
        </p>
      </header>

      <SharedNav />

      <section aria-labelledby="base-package" className="space-y-6">
        <header className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 id="base-package" className="text-xl font-semibold text-foreground">
                Base package modules
              </h2>
              <p className="text-sm text-muted-foreground">
                Toggle which shared capabilities are bundled for a given industry or customer tier.
                Defaults reflect the foundation every ConfigPro deployment starts with.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {enabledCount} of {SharedFeatureRegistry.length} enabled · {coverage}% coverage
            </div>
          </div>
        </header>

        <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SharedFeatureRegistry.map((feature) => {
            const enabled = enabledFeatures[feature.key];
            return (
              <li key={feature.key} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                <div className="flex flex-col gap-4">
                  <header className="space-y-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                          Default: {feature.enabledByDefault ? 'Enabled' : 'Disabled'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleFeature(feature.key)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition ${
                          enabled ? 'bg-primary/80' : 'bg-muted'
                        }`}
                        role="switch"
                        aria-checked={enabled}
                        aria-label={`Toggle ${feature.title}`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-background shadow transition ${
                            enabled ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <Link
                      to={feature.path}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:text-primary/80"
                    >
                      View module overview
                      <span aria-hidden className="text-base">
                        →
                      </span>
                    </Link>
                  </header>

                  <dl className="space-y-1 text-xs text-muted-foreground">
                    {feature.requiredPerm ? (
                      <div className="flex items-center justify-between gap-2">
                        <dt className="font-semibold text-foreground">Required permission</dt>
                        <dd className="text-right">{feature.requiredPerm}</dd>
                      </div>
                    ) : null}
                    <div className="flex items-center justify-between gap-2">
                      <dt className="font-semibold text-foreground">Current state</dt>
                      <dd className={`rounded-full px-2 py-0.5 font-semibold ${enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                        {enabled ? 'Enabled' : 'Disabled'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="space-y-12">
        {sharedFeatureGroups.map((group) => (
          <section key={group.id} className="space-y-4">
            <header className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">{group.title}</h2>
              {group.description ? (
                <p className="text-sm text-muted-foreground">{group.description}</p>
              ) : null}
            </header>

            {group.features.length > 0 ? (
              <ul className="grid gap-4 md:grid-cols-2">
                {group.features.map((feature) => (
                  <li key={feature.id} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-lg font-medium text-foreground">{feature.title}</h3>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {feature.status}
                        </span>
                      </div>

                      {feature.summary ? (
                        <p className="text-sm text-muted-foreground">{feature.summary}</p>
                      ) : null}

                      {feature.systems.length > 0 ? (
                        <div className="text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">Systems:</span>{' '}
                          {feature.systems.join(', ')}
                        </div>
                      ) : null}

                      {feature.href ? (
                        <Link
                          to={feature.href}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition hover:text-primary/80"
                        >
                          Explore feature overview
                          <span aria-hidden className="text-base">→</span>
                        </Link>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm italic text-muted-foreground">
                Shared features for this area have not been documented yet.
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
};

export default SharedFeaturesPage;
