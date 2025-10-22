import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import type { InstallerStep } from '../lib';

interface InstallerStepperProps {
  steps: InstallerStep[];
  activeIndex: number;
  onStepClick?: (index: number) => void;
}

export const InstallerStepper = ({ steps, activeIndex, onStepClick }: InstallerStepperProps) => {
  return (
    <ol
      className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/60 bg-surface/70 p-4 text-sm uppercase tracking-[0.12em]"
    >
      {steps.map((step, index) => {
        const isActive = index === activeIndex;
        const isComplete = index < activeIndex;
        return (
          <li key={step.key} className="flex flex-1 min-w-[160px] items-center gap-3">
            <button
              type="button"
              onClick={() => onStepClick?.(index)}
              className={cn(
                'group flex w-full items-center gap-3 rounded-full px-2 py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}
              aria-current={isActive ? 'step' : undefined}
            >
              <span
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full border border-border/50 bg-background/80 text-xs font-semibold transition',
                  isComplete && !isActive && 'border-success/70 bg-success/20 text-success-foreground',
                  isActive && 'border-primary bg-primary text-white shadow shadow-primary/40'
                )}
              >
                {isComplete ? (
                  <motion.span
                    layoutId="installer-step-complete"
                    className="block text-base"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.18 }}
                  >
                    ✓
                  </motion.span>
                ) : (
                  index + 1
                )}
              </span>
              <span className="flex flex-col">
                <span className="text-[0.72rem] font-semibold tracking-[0.18em] text-muted/80">
                  STEP {index + 1}
                </span>
                <span className="text-xs font-medium normal-case tracking-tight text-foreground">
                  {step.label}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
};
