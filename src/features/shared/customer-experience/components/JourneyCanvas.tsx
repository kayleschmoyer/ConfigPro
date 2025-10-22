import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/lib/cn';
import { journeyActions, journeyTriggerCatalog } from '../lib/journeys';
import type { Journey, JourneySimulationResult } from '../lib/types';

interface JourneyCanvasProps {
  journey: Journey;
  dryRun?: JourneySimulationResult[];
  onSimulate?: () => void;
}

export const JourneyCanvas = ({ journey, dryRun, onSimulate }: JourneyCanvasProps) => {
  const triggerLabel = journeyTriggerCatalog.find(trigger => trigger.kind === journey.trigger.kind)?.label;

  return (
    <section className="space-y-5 rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{journey.name}</h3>
          <p className="text-sm text-muted">Trigger: {triggerLabel ?? journey.trigger.kind}</p>
        </div>
        <Button variant="outline" onClick={onSimulate}>
          Run dry simulation
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 rounded-2xl border border-border/50 bg-surface/70 px-4 py-3 text-sm text-foreground"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">⏱️</span>
          <div>
            <p className="font-semibold">Trigger</p>
            <p className="text-xs uppercase tracking-[0.2em] text-muted">{journey.trigger.kind}</p>
          </div>
        </motion.div>
        {journey.steps.map(step => {
          const action = journeyActions.find(candidate => candidate.id === step.action);
          const state = dryRun?.find(result => result.stepId === step.id);
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className={cn(
                'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm shadow-sm',
                state?.executed
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                  : 'border-border/60 bg-surface/70 text-foreground'
              )}
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                {action?.label.slice(0, 1) ?? '•'}
              </span>
              <div>
                <p className="font-semibold">{action?.label ?? step.action}</p>
                <p className="text-xs text-muted">{state?.reason ?? 'Awaiting simulation'}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {dryRun && (
        <footer className="rounded-2xl border border-border/50 bg-surface/60 p-4 text-sm text-muted">
          <p className="font-semibold text-foreground">Simulation log</p>
          <ul className="mt-2 space-y-1">
            {dryRun.map(entry => (
              <li key={entry.stepId}>
                <span className="font-semibold text-foreground">{entry.stepId}:</span> {entry.reason}
              </li>
            ))}
          </ul>
        </footer>
      )}
    </section>
  );
};
