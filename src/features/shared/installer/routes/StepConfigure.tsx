import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings } from 'lucide-react';
import { Button } from '../../../shared/ui/Button';
import { useInstaller } from './InstallerLayout';
import { FeatureOptionsDrawer } from '../components/FeatureOptionsDrawer';

interface StepConfigureProps {
  selectionOptions: Record<string, Record<string, unknown> | undefined>;
}

export const StepConfigure = ({ selectionOptions }: StepConfigureProps) => {
  const { catalog, selectedFeatureIds, updateFeatureOptions } = useInstaller();
  const [activeFeatureId, setActiveFeatureId] = useState<string | null>(null);

  const selectedFeatures = useMemo(
    () => catalog.filter((feature) => selectedFeatureIds.includes(feature.id)),
    [catalog, selectedFeatureIds]
  );

  const activeFeature = useMemo(
    () => catalog.find((feature) => feature.id === activeFeatureId) ?? null,
    [catalog, activeFeatureId]
  );

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Configure feature options</h2>
        <p className="text-sm text-muted-foreground">
          Review each selected module and adjust controls before rollout. Options save instantly to your installer state.
        </p>
      </header>
      <AnimatePresence mode="wait">
        {selectedFeatures.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="rounded-3xl border border-border/60 bg-surface/80 p-6 text-center text-sm text-muted-foreground"
          >
            Pick at least one feature to configure.
          </motion.div>
        ) : (
          <motion.ul
            key="list"
            layout
            className="space-y-4"
          >
            {selectedFeatures.map((feature) => {
              const options = selectionOptions[feature.id];
              const configured = options && Object.keys(options).length > 0;
              return (
                <motion.li key={feature.id} layout>
                  <article className="flex flex-col gap-3 rounded-3xl border border-border/60 bg-surface/70 p-5 shadow-sm">
                    <header className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{feature.name}</h3>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveFeatureId(feature.id)}
                      >
                        <Settings className="h-4 w-4" aria-hidden />
                        Configure
                      </Button>
                    </header>
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted">
                      {configured ? (
                        <span className="rounded-full bg-primary/15 px-3 py-1 text-primary">Configured</span>
                      ) : (
                        <span className="rounded-full bg-muted/20 px-3 py-1 text-muted-foreground">Uses defaults</span>
                      )}
                      {feature.optionsSchema && (
                        <span className="rounded-full bg-surface/50 px-3 py-1 text-muted-foreground">Advanced schema</span>
                      )}
                    </div>
                  </article>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
      <FeatureOptionsDrawer
        feature={activeFeature}
        isOpen={Boolean(activeFeature)}
        onClose={() => setActiveFeatureId(null)}
        value={activeFeature ? selectionOptions[activeFeature.id] : undefined}
        onSave={(options) => {
          if (activeFeature) {
            updateFeatureOptions(activeFeature.id, options);
          }
        }}
      />
    </section>
  );
};
