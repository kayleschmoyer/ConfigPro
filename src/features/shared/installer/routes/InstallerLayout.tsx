import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { baseTheme, resolveTheme } from '../../../app/config/theme';
import { Button } from '../../../shared/ui/Button';
import { ToastProvider, useToast } from '../../../shared/ui/Toast';
import { useLocalStorage } from '../../../hooks/useLocalStorage';
import { coreRoleDefinitions } from '../../../pages/shared/features/permissions.model';
import { InstallerStepper } from '../components/InstallerStepper';
import { useInstallerCatalog } from '../lib/catalog';
import { planDefinitions, computePricing, getPlanDefinition } from '../lib/pricing';
import {
  type InstallerContextValue,
  type InstallerDraft,
  type InstallerStepKey,
  type LayoutItem,
  type PlanTier,
} from '../lib/types';
import { summarizeDependencyImpact, toggleFeatureWithDependencies } from '../lib/deps';
import { normalizeLayout, validateLayout } from '../lib/layout';
import { useApplyChanges } from '../lib/apply';
import { useInstallerShortcuts } from '../lib/shortcuts';
import { StepWelcome } from './StepWelcome';
import { StepSelectFeatures } from './StepSelectFeatures';
import { StepConfigure } from './StepConfigure';
import { StepPricing } from './StepPricing';
import { StepLayoutMapping } from './StepLayoutMapping';
import { StepReview } from './StepReview';

const steps = [
  {
    key: 'WELCOME',
    label: 'Welcome & Plan',
    description: 'Choose the plan that unlocks the right foundations.',
  },
  {
    key: 'FEATURES',
    label: 'Select features',
    description: 'Pick modules and handle dependencies with confidence.',
  },
  {
    key: 'CONFIGURE',
    label: 'Configure options',
    description: 'Tailor modules to match your operating model.',
  },
  {
    key: 'PRICING',
    label: 'Pricing',
    description: 'Preview subscription impact with taxes and credits.',
  },
  {
    key: 'LAYOUT',
    label: 'Layout mapping',
    description: 'Place features across navigation surfaces.',
  },
  {
    key: 'REVIEW',
    label: 'Review & install',
    description: 'Confirm changes and apply updates across surfaces.',
  },
] as const;

const initialDraft: InstallerDraft = {
  plan: 'PRO',
  seats: 120,
  locations: 5,
  selections: [],
  layout: [],
  currency: 'USD',
  locale: 'en-US',
};

const InstallerContext = createContext<InstallerContextValue | null>(null);

const areLayoutsEqual = (next: LayoutItem[], current: LayoutItem[]) => {
  if (next.length !== current.length) return false;
  return next.every((item, index) => {
    const other = current[index];
    return (
      item.featureId === other.featureId &&
      item.region === other.region &&
      item.order === other.order &&
      item.label === other.label &&
      item.icon === other.icon
    );
  });
};

export const useInstaller = () => {
  const context = useContext(InstallerContext);
  if (!context) {
    throw new Error('useInstaller must be used within InstallerLayout.');
  }
  return context;
};

const theme = resolveTheme('configpro') ?? baseTheme;

export const InstallerLayout = () => {
  const catalog = useInstallerCatalog();
  const [draft, setDraft] = useState<InstallerDraft>(initialDraft);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [searchFocus, setSearchFocus] = useState<(() => void) | null>(null);
  const [activeRole] = useLocalStorage<string>('configpro.activeRole', 'org-admin');
  const { showToast } = useToast();

  const billingVisible = useMemo(() => {
    const role = coreRoleDefinitions.find((definition) => definition.id === activeRole);
    if (!role) return true;
    return role.permissions.some((permission) => /billing|financial|revenue/i.test(permission));
  }, [activeRole]);

  const selectedFeatureIds = useMemo(
    () => draft.selections.filter((selection) => selection.enabled).map((selection) => selection.featureId),
    [draft.selections]
  );

  useEffect(() => {
    setDraft((current) => {
      const normalized = normalizeLayout(catalog, selectedFeatureIds, current.layout);
      return areLayoutsEqual(normalized, current.layout) ? current : { ...current, layout: normalized };
    });
  }, [catalog, selectedFeatureIds]);

  const priceBreakdown = useMemo(() => computePricing(draft, catalog), [draft, catalog]);
  const dependencySummary = useMemo(
    () => summarizeDependencyImpact(catalog, selectedFeatureIds),
    [catalog, selectedFeatureIds]
  );
  const layoutValidation = useMemo(
    () => validateLayout(catalog, draft.layout, selectedFeatureIds),
    [catalog, draft.layout, selectedFeatureIds]
  );

  const { applying, applyChanges, result, reset } = useApplyChanges(draft, draft.layout, catalog);

  const toggleFeature = useCallback(
    (featureId: string, enabled: boolean) => {
      setDraft((current) => {
        const resolution = toggleFeatureWithDependencies(catalog, current.selections, featureId, enabled);
        if (resolution.blockedBy) {
          const conflict = catalog.find((item) => item.id === resolution.blockedBy?.conflictingWith);
          showToast({
            title: 'Selection blocked',
            description: `${catalog.find((item) => item.id === featureId)?.name ?? featureId} conflicts with ${conflict?.name ?? resolution.blockedBy?.conflictingWith}.`,
            variant: 'warning',
          });
          return current;
        }
        if (resolution.autoEnabled.length) {
          const names = resolution.autoEnabled
            .map((id) => catalog.find((item) => item.id === id)?.name ?? id)
            .join(', ');
          showToast({
            title: 'Dependencies enabled',
            description: `Enabled ${names} to satisfy requirements.`,
            variant: 'info',
          });
        }
        if (resolution.autoDisabled.length) {
          const names = resolution.autoDisabled
            .map((id) => catalog.find((item) => item.id === id)?.name ?? id)
            .join(', ');
          showToast({
            title: 'Dependent modules disabled',
            description: `${names} turned off because a required module was removed.`,
            variant: 'warning',
          });
        }
        return {
          ...current,
          selections: resolution.selections,
        };
      });
    },
    [catalog, showToast]
  );

  const updateFeatureOptions = useCallback(
    (featureId: string, options: Record<string, unknown>) => {
      setDraft((current) => {
        const selections = current.selections.map((selection) =>
          selection.featureId === featureId ? { ...selection, options } : selection
        );
        return { ...current, selections };
      });
      showToast({
        title: 'Options saved',
        description: `${catalog.find((item) => item.id === featureId)?.name ?? 'Feature'} updated.`,
        variant: 'success',
      });
    },
    [catalog, showToast]
  );

  const updatePlan = useCallback((plan: PlanTier) => {
    setDraft((current) => ({ ...current, plan }));
  }, []);

  const updateSeats = useCallback((seats: number | undefined) => {
    setDraft((current) => ({ ...current, seats }));
  }, []);

  const updateLocations = useCallback((locations: number | undefined) => {
    setDraft((current) => ({ ...current, locations }));
  }, []);

  const setCouponCode = useCallback((couponCode?: string) => {
    setDraft((current) => ({ ...current, couponCode }));
  }, []);

  const updateLayout = useCallback((items: LayoutItem[]) => {
    setDraft((current) => ({ ...current, layout: items }));
  }, []);

  const goToStep = useCallback((key: InstallerStepKey) => {
    const index = steps.findIndex((step) => step.key === key);
    if (index >= 0) {
      setActiveStepIndex(index);
    }
  }, []);

  const goNext = useCallback(() => {
    if (steps[activeStepIndex]?.key === 'LAYOUT' && layoutValidation.length) {
      showToast({
        title: 'Layout needs attention',
        description: layoutValidation.join(' • '),
        variant: 'warning',
      });
      return;
    }
    setActiveStepIndex((index) => Math.min(index + 1, steps.length - 1));
  }, [activeStepIndex, layoutValidation, showToast]);

  const goPrev = useCallback(() => {
    setActiveStepIndex((index) => Math.max(index - 1, 0));
  }, []);

  const handleApply = useCallback(async () => {
    const outcome = await applyChanges();
    showToast({
      title: 'Configuration applied',
      description: outcome.message,
      variant: 'success',
    });
  }, [applyChanges, showToast]);

  const summaryHighlights = useMemo<ReactNode[]>(() => {
    const plan = getPlanDefinition(draft.plan);
    return [
      <span key="plan">Plan: {plan.name}</span>,
      <span key="seats">Seats: {draft.seats ?? '—'}</span>,
      <span key="locations">Locations: {draft.locations ?? '—'}</span>,
      <span key="features">Features: {selectedFeatureIds.length}</span>,
    ];
  }, [draft.plan, draft.seats, draft.locations, selectedFeatureIds.length]);

  const selectionOptions = useMemo(() => {
    return draft.selections.reduce<Record<string, Record<string, unknown> | undefined>>((acc, selection) => {
      if (selection.options) acc[selection.featureId] = selection.options;
      return acc;
    }, {});
  }, [draft.selections]);

  useInstallerShortcuts({
    focusSearch: searchFocus ?? undefined,
    goToStep: (index) => {
      if (index >= 0 && index < steps.length) setActiveStepIndex(index);
    },
    apply: () => {
      if (steps[activeStepIndex]?.key === 'REVIEW') {
        void handleApply();
      }
    },
  });

  const contextValue: InstallerContextValue = {
    draft,
    steps: steps.map((step) => ({ ...step })),
    activeStepIndex,
    catalog,
    selectedFeatureIds,
    toggleFeature,
    updateFeatureOptions,
    updatePlan,
    updateSeats,
    updateLocations,
    setCouponCode,
    setActiveStep: setActiveStepIndex,
    goToStep,
    goNext,
    goPrev,
    priceBreakdown,
    layoutItems: draft.layout,
    updateLayout,
    validation: {
      dependencies: dependencySummary.dependencies,
      conflicts: dependencySummary.conflicts,
      layout: layoutValidation,
    },
    billingVisible,
    applyChanges: handleApply,
    applying,
    lastApplyResult: result,
    resetApplyResult: reset,
    planDefinitions,
    billingRole: activeRole,
    seatRange: { min: 1, max: 1000 },
    locationRange: { min: 1, max: 250 },
    toastRegionProps: { id: 'installer-live-region', role: 'status', 'aria-live': 'polite' },
    summaryHighlights,
  };

  return (
    <InstallerContext.Provider value={contextValue}>
      <div
        className="min-h-screen bg-gradient-to-br from-[#0a0d16] via-[#101726] to-[#0f1f2f]"
        style={{ fontFamily: theme.font }}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10">
          <InstallerStepper
            steps={steps.map((step) => ({ key: step.key, label: step.label, description: step.description }))}
            activeIndex={activeStepIndex}
            onStepClick={setActiveStepIndex}
          />
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr),280px]">
            <div className="space-y-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={steps[activeStepIndex]?.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.18 }}
                >
                  {renderStep(steps[activeStepIndex]?.key ?? 'WELCOME', {
                    onRegisterSearchFocus: setSearchFocus,
                    selectionOptions,
                  })}
                </motion.div>
              </AnimatePresence>
            </div>
            <aside className="space-y-4 rounded-3xl border border-border/50 bg-background/30 p-5 shadow-inner shadow-primary/5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-muted">Snapshot</h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {summaryHighlights.map((node, index) => (
                  <li key={index} className="rounded-2xl bg-surface/50 px-3 py-2 text-foreground">
                    {node}
                  </li>
                ))}
              </ul>
              {result && (
                <div className="rounded-2xl border border-success/60 bg-success/10 p-3 text-xs text-success">
                  {result.message}
                </div>
              )}
            </aside>
          </div>
        </div>
        <footer className="sticky bottom-0 left-0 right-0 border-t border-border/40 bg-background/70 backdrop-blur">
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Step {activeStepIndex + 1} of {steps.length}</span>
              <span aria-hidden>•</span>
              <span>{steps[activeStepIndex]?.description}</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={goPrev} disabled={activeStepIndex === 0}>
                Back
              </Button>
              {steps[activeStepIndex]?.key === 'REVIEW' ? (
                <Button onClick={() => void handleApply()} disabled={applying}>
                  {applying ? 'Applying…' : 'Apply & launch'}
                </Button>
              ) : (
                <Button variant="primary" onClick={goNext}>
                  Next
                </Button>
              )}
            </div>
          </div>
        </footer>
      </div>
    </InstallerContext.Provider>
  );
};

const renderStep = (
  key: InstallerStepKey,
  extras: { onRegisterSearchFocus: (fn: (() => void) | null) => void; selectionOptions: Record<string, Record<string, unknown> | undefined> }
) => {
  switch (key) {
    case 'WELCOME':
      return <StepWelcome />;
    case 'FEATURES':
      return <StepSelectFeatures onRegisterSearchFocus={extras.onRegisterSearchFocus} selectionOptions={extras.selectionOptions} />;
    case 'CONFIGURE':
      return <StepConfigure selectionOptions={extras.selectionOptions} />;
    case 'PRICING':
      return <StepPricing />;
    case 'LAYOUT':
      return <StepLayoutMapping />;
    case 'REVIEW':
      return <StepReview />;
    default:
      return <StepWelcome />;
  }
};

export const InstallerApp = () => (
  <ToastProvider>
    <InstallerLayout />
  </ToastProvider>
);
