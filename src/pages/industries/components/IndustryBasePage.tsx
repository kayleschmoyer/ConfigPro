import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';

import { SharedNav } from '../../../layout/SharedNav';
import { SharedFeatureRegistry, FeatureDef } from '../../shared/features';
import { IndustryFeatureMatrix, IndustryKey } from '../../../app/config/industry.presets';
import { setIndustry } from '../../../app/state/industry';

export type IndustryHighlight = {
  label: string;
  value: string;
  description: string;
};

export interface IndustryBasePageProps {
  industry: Extract<IndustryKey, 'retail' | 'construction' | 'daycare' | 'automotive'>;
  heroEyebrow?: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  highlights?: IndustryHighlight[];
  focusAreas?: string[];
}

const buildFeatureList = (
  industry: IndustryBasePageProps['industry'],
): FeatureDef[] => {
  const matrix = IndustryFeatureMatrix[industry] ?? {};
  return SharedFeatureRegistry.filter(
    (feature) => feature.enabledByDefault || matrix[feature.key],
  );
};

export const IndustryBasePage = ({
  industry,
  heroEyebrow = 'Industry base package',
  heroTitle,
  heroSubtitle,
  heroDescription,
  highlights = [],
  focusAreas = [],
}: IndustryBasePageProps) => {
  useEffect(() => {
    setIndustry(industry);
  }, [industry]);

  const features = useMemo(() => buildFeatureList(industry), [industry]);

  const totalFeatures = SharedFeatureRegistry.length;
  const coverage = totalFeatures === 0 ? 0 : Math.round((features.length / totalFeatures) * 100);

  const industryAddOns = useMemo(
    () => features.filter((feature) => !feature.enabledByDefault),
    [features],
  );

  return (
    <div className="space-y-10">
      <header className="space-y-6">
        <div className="space-y-2">
          {heroEyebrow ? (
            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              {heroEyebrow}
            </p>
          ) : null}
          <h1 className="text-3xl font-semibold text-foreground">{heroTitle}</h1>
          <p className="text-lg text-muted-foreground">{heroSubtitle}</p>
        </div>
        <p className="max-w-3xl text-base text-muted-foreground">{heroDescription}</p>

        {highlights.length > 0 ? (
          <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {highlights.map((highlight) => (
              <div
                key={highlight.label}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <dt className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {highlight.label}
                </dt>
                <dd className="mt-2 text-2xl font-semibold text-foreground">{highlight.value}</dd>
                <p className="mt-2 text-sm text-muted-foreground">{highlight.description}</p>
              </div>
            ))}
          </dl>
        ) : null}

        {focusAreas.length > 0 ? (
          <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Rollout focus
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {focusAreas.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span aria-hidden className="mt-1 text-primary">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </header>

      <SharedNav />

      <section aria-labelledby="base-package" className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 id="base-package" className="text-xl font-semibold text-foreground">
              Base package modules
            </h2>
            <p className="text-sm text-muted-foreground">
              ConfigPro automatically enables these shared capabilities for the {industry}{' '}
              footprint. Extend or swap modules as pilots expand.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {features.length} of {totalFeatures} shared modules · {coverage}% coverage
          </div>
        </header>

        {features.length > 0 ? (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => {
              const isCore = feature.enabledByDefault;
              return (
                <li key={feature.key} className="rounded-lg border border-border bg-card p-4 shadow-sm">
                  <div className="space-y-4">
                    <header className="space-y-1">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${
                            isCore
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {isCore ? 'Platform core' : 'Industry add-on'}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {isCore
                          ? 'Included across every ConfigPro deployment.'
                          : 'Activated specifically for this industry rollout.'}
                      </p>
                    </header>

                    {feature.requiredPerm ? (
                      <div className="rounded-lg border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-foreground">Required permission</span>
                          <span className="font-mono">{feature.requiredPerm}</span>
                        </div>
                      </div>
                    ) : null}

                    <Link
                      to={feature.path}
                      className="inline-flex items-center gap-1 text-sm font-medium text-primary transition hover:text-primary/80"
                    >
                      Explore module overview
                      <span aria-hidden className="text-base">→</span>
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-sm text-muted-foreground">
            No shared modules are enabled for this industry yet. Use the shared registry to toggle
            capabilities on.
          </div>
        )}
      </section>

      {industryAddOns.length > 0 ? (
        <section aria-labelledby="industry-add-ons" className="space-y-4">
          <div className="space-y-1">
            <h2 id="industry-add-ons" className="text-lg font-semibold text-foreground">
              Industry-exclusive upgrades
            </h2>
            <p className="text-sm text-muted-foreground">
              These modules extend the platform baseline with workflows tuned to the {industry}{' '}
              operating model.
            </p>
          </div>
          <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {industryAddOns.map((feature) => (
              <li key={feature.key} className="rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                <div className="space-y-2">
                  <p className="text-base font-semibold text-foreground">{feature.title}</p>
                  <p>
                    Linked module:{' '}
                    <Link
                      to={feature.path}
                      className="font-medium text-primary transition hover:text-primary/80"
                    >
                      {feature.path}
                    </Link>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
};

export default IndustryBasePage;
