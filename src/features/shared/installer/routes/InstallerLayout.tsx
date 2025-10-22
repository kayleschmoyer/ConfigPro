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
import { baseTheme, resolveTheme } from '@/app/config/theme';
import { Button } from '@/shared/ui/Button';
import { ToastProvider, useToast } from '@/shared/ui/Toast';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { coreRoleDefinitions } from '@/pages/shared/features/permissions.model';
import { useCurrentUser } from '@/shared/state/auth';
import { isAdmin, isConfigPro, type User as GuardUser } from '@/lib/authz';
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
import { AdminToolbar } from '../components/AdminToolbar';
import { PricingEditorDrawer } from '../components/PricingEditorDrawer';
import { CatalogEditorDrawer } from '../components/CatalogEditorDrawer';
import { DepsEditorModal } from '../components/DepsEditorModal';
import { AuditDrawer } from '../components/AuditDrawer';
import {
  applyAdminCatalogAdjustments,
  markFeaturePinned,
  publishPricing,
  resetLayoutToDefault,
  saveCatalogOverride,
  saveDependencyOverride,
  savePricingDraft,
  useAdminState,
  type CatalogOverride,
  type DependencyOverride,
  type PricingSheet,
} from '../lib/admin';

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
  const baseCatalog = useInstallerCatalog();
  const [draft, setDraft] = useState<InstallerDraft>(initialDraft);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [searchFocus, setSearchFocus] = useState<(() => void) | null>(null);
  const [activeRole] = useLocalStorage<string>('configpro.activeRole', 'org-admin');
  const { showToast } = useToast();
  const currentUser = useCurrentUser();
  const guardUser = useMemo<GuardUser | null>(
    () =>
      currentUser
        ? {
            id: currentUser.id,
            email: currentUser.email,
            org: currentUser.org,
            roles: currentUser.roles,
          }
        : null,
    [currentUser],
  );
  const isInternalUser = isConfigPro(guardUser);
  const isAdminUser = isAdmin(guardUser);
  const [adminMode, setAdminMode] = useLocalStorage<boolean>('configpro.installer.adminMode', isAdminUser);
  const adminState = useAdminState((state) => state);

  useEffect(() => {
    if (!isAdminUser && adminMode) {
      setAdminMode(false);
    }
  }, [adminMode, isAdminUser, setAdminMode]);

  const catalog = useMemo(
    () => applyAdminCatalogAdjustments(baseCatalog, adminState, { includeHidden: isAdminUser && adminMode }),
    [adminMode, adminState, baseCatalog, isAdminUser],
  );
  const pinnedFeatureIds = adminState.pinned;

  const billingVisible = useMemo(() => {
    const role = coreRoleDefinitions.find((definition) => definition.id === activeRole);
    const roleAllows = role?.permissions.some((permission) => /billing|financial|revenue/i.test(permission));
    return Boolean(roleAllows) || (isAdminUser && adminMode);
  }, [activeRole, adminMode, isAdminUser]);

  const selectedFeatureIds = useMemo(
    () => draft.selections.filter((selection) => selection.enabled).map((selection) => selection.featureId),
    [draft.selections]
  );

  const [isPricingDrawerOpen, setPricingDrawerOpen] = useState(false);
  const [isCatalogEditorOpen, setCatalogEditorOpen] = useState(false);
  const [catalogEditorFeatureId, setCatalogEditorFeatureId] = useState<string | null>(null);
  const [isDepsModalOpen, setDepsModalOpen] = useState(false);
  const [isAuditDrawerOpen, setAuditDrawerOpen] = useState(false);

  useEffect(() => {
    setDraft((current) => {
      const pinned = new Set(pinnedFeatureIds);
      let changed = false;
      const selections = current.selections.map((selection) => {
        if (pinned.has(selection.featureId) && !selection.enabled) {
          changed = true;
          return { ...selection, enabled: true };
        }
        return selection;
      });
      pinned.forEach((featureId) => {
        if (!selections.some((selection) => selection.featureId === featureId)) {
          selections.push({ featureId, enabled: true });
          changed = true;
        }
      });
      return changed ? { ...current, selections } : current;
    });
  }, [pinnedFeatureIds]);

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
      const pinned = new Set(pinnedFeatureIds);
      if (!enabled && pinned.has(featureId) && (!isAdminUser || !adminMode)) {
        showToast({
          title: 'Pinned by ConfigPro admin',
          description: 'This feature is locked in the bundle. Contact an admin to remove it.',
          variant: 'warning',
        });
        return;
      }
      setDraft((current) => {
        const resolution = toggleFeatureWithDependencies(catalog, current.selections, featureId, enabled);
        if (resolution.blockedBy) {
          const conflict = catalog.find((item) => item.id === resolution.blockedBy?.conflictingWith);
          showToast({
            title: 'Selection blocked',
            description: `${catalog.find((item) => item.id === featureId)?.name ?? featureId} conflicts with ${
              conflict?.name ?? resolution.blockedBy?.conflictingWith
            }.`,
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
        const ensuredSelections = resolution.selections.map((selection) =>
          pinned.has(selection.featureId) ? { ...selection, enabled: true } : selection,
        );
        pinned.forEach((id) => {
          if (!ensuredSelections.some((selection) => selection.featureId === id)) {
            ensuredSelections.push({ featureId: id, enabled: true });
          }
        });
        return {
          ...current,
          selections: ensuredSelections,
        };
      });
    },
    [adminMode, catalog, isAdminUser, pinnedFeatureIds, showToast]
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

  const openPricingEditor = useCallback(() => {
    if (!isAdminUser) return;
    setPricingDrawerOpen(true);
  }, [isAdminUser]);
  const closePricingEditor = useCallback(() => setPricingDrawerOpen(false), []);
  const openCatalogEditor = useCallback(
    (featureId?: string) => {
      if (!isAdminUser) return;
      const targetId = featureId ?? catalog[0]?.id ?? null;
      setCatalogEditorFeatureId(targetId);
      setCatalogEditorOpen(true);
    },
    [catalog, isAdminUser]
  );
  const closeCatalogEditor = useCallback(() => {
    setCatalogEditorOpen(false);
    setCatalogEditorFeatureId(null);
  }, []);
  const openDependenciesModal = useCallback(() => {
    if (!isAdminUser) return;
    setDepsModalOpen(true);
  }, [isAdminUser]);
  const closeDependenciesModal = useCallback(() => setDepsModalOpen(false), []);
  const openAuditDrawer = useCallback(() => {
    if (!isAdminUser) return;
    setAuditDrawerOpen(true);
  }, [isAdminUser]);
  const closeAuditDrawer = useCallback(() => setAuditDrawerOpen(false), []);

  const handleMarkPinned = useCallback(
    async (featureId: string, pinned: boolean) => {
      try {
        await markFeaturePinned(guardUser, featureId, pinned);
        showToast({
          title: pinned ? 'Feature pinned' : 'Feature unpinned',
          description: pinned
            ? 'Pinned features stay in every customer bundle until you remove the override.'
            : 'Feature can now be removed by customers.',
          variant: pinned ? 'info' : 'success',
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to update pin state.';
        showToast({
          title: 'Permission required',
          description: message,
          variant: 'warning',
        });
      }
    },
    [guardUser, showToast]
  );

  const handleResetLayout = useCallback(async () => {
    try {
      const resetLayout = await resetLayoutToDefault(guardUser, catalog, selectedFeatureIds);
      setDraft((current) => ({ ...current, layout: resetLayout }));
      showToast({
        title: 'Layout reset',
        description: 'Navigation placement restored to ConfigPro defaults.',
        variant: 'info',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Reset failed. Try again or contact an admin.';
      showToast({
        title: 'Unable to reset layout',
        description: message,
        variant: 'warning',
      });
    }
  }, [catalog, guardUser, selectedFeatureIds, showToast]);

  const handleSavePricing = useCallback(
    async (next: PricingSheet) => {
      try {
        await savePricingDraft(guardUser, next);
        showToast({
          title: 'Draft pricing saved',
          description: 'Draft pricing is ready for review before publishing.',
          variant: 'success',
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to save draft pricing.';
        showToast({
          title: 'Save failed',
          description: message,
          variant: 'warning',
        });
      }
    },
    [guardUser, showToast]
  );

  const handlePublishPricing = useCallback(async () => {
    try {
      await publishPricing(guardUser);
      showToast({
        title: 'Pricing published',
        description: 'Customers now see the updated live pricing.',
        variant: 'info',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to publish pricing.';
      showToast({
        title: 'Publish failed',
        description: message,
        variant: 'warning',
      });
    }
  }, [guardUser, showToast]);

  const handleSaveCatalog = useCallback(
    async (featureId: string, override: CatalogOverride) => {
      try {
        await saveCatalogOverride(guardUser, featureId, override);
        showToast({
          title: 'Catalog updated',
          description: 'Feature metadata saved to the shared catalog.',
          variant: 'success',
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to save catalog changes.';
        showToast({
          title: 'Catalog update blocked',
          description: message,
          variant: 'warning',
        });
      }
    },
    [guardUser, showToast]
  );

  const handleSaveDependencies = useCallback(
    async (featureId: string, override: DependencyOverride) => {
      try {
        await saveDependencyOverride(guardUser, featureId, override);
        showToast({
          title: 'Dependencies updated',
          description: 'Dependency graph saved successfully.',
          variant: 'success',
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to update dependencies.';
        showToast({
          title: 'Update blocked',
          description: message,
          variant: 'warning',
        });
      }
    },
    [guardUser, showToast]
  );

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
    admin: {
      isInternal: isInternalUser,
      isAdmin: isAdminUser,
      adminMode,
      setAdminMode,
      openPricingEditor,
      openCatalogEditor,
      openDependenciesModal,
      openAuditDrawer,
      pinnedFeatureIds,
      markPinned: handleMarkPinned,
      lastPublishedPricingAt: adminState.pricing.lastPublishedAt,
      resetLayout: handleResetLayout,
    },
  };

  return (
    <InstallerContext.Provider value={contextValue}>
      <div
        className="min-h-screen bg-gradient-to-br from-[#0a0d16] via-[#101726] to-[#0f1f2f]"
        style={{ fontFamily: theme.font }}
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10">
          {isAdminUser && (
            <AdminToolbar
              adminMode={adminMode}
              onAdminModeChange={setAdminMode}
              onEditPricing={openPricingEditor}
              onEditCatalog={() => openCatalogEditor()}
              onEditDependencies={openDependenciesModal}
              onViewAudit={openAuditDrawer}
              isConfigPro={isInternalUser}
              lastPublishedAt={adminState.pricing.lastPublishedAt}
            />
          )}
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
      <PricingEditorDrawer
        isOpen={isPricingDrawerOpen}
        onClose={closePricingEditor}
        draft={adminState.pricing.draft}
        published={adminState.pricing.published}
        lastPublishedAt={adminState.pricing.lastPublishedAt}
        onSaveDraft={handleSavePricing}
        onPublish={handlePublishPricing}
      />
      <CatalogEditorDrawer
        isOpen={isCatalogEditorOpen}
        onClose={closeCatalogEditor}
        featureId={catalogEditorFeatureId}
        catalog={catalog}
        onSelectFeature={setCatalogEditorFeatureId}
        onSave={handleSaveCatalog}
        pinnedFeatureIds={pinnedFeatureIds}
        onTogglePinned={handleMarkPinned}
      />
      <DepsEditorModal
        isOpen={isDepsModalOpen}
        onClose={closeDependenciesModal}
        catalog={catalog}
        overrides={adminState.dependencyOverrides}
        onSave={handleSaveDependencies}
      />
      <AuditDrawer isOpen={isAuditDrawerOpen} onClose={closeAuditDrawer} />
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
