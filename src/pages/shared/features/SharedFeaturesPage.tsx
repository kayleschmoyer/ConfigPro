import { sharedFeatureGroups } from './sharedFeatures.data';

export const SharedFeaturesPage = () => {
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
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
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
