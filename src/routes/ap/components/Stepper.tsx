import { cn } from '../../../lib/cn';

type StepperProps = {
  steps: string[];
  activeStep: number;
  className?: string;
};

export const Stepper = ({ steps, activeStep, className }: StepperProps) => (
  <ol
    className={cn(
      'flex items-center justify-between gap-4 rounded-3xl border border-border/60 bg-surface/80 p-4 text-sm font-semibold uppercase tracking-[0.25em]',
      className
    )}
  >
    {steps.map((step, index) => {
      const isActive = index === activeStep;
      const isComplete = index < activeStep;
      return (
        <li key={step} className="flex flex-1 items-center gap-3">
          <span
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-full border text-xs',
              isActive && 'border-primary bg-primary text-white shadow shadow-primary/30',
              isComplete && !isActive && 'border-success bg-success/20 text-success',
              !isActive && !isComplete && 'border-border/60 bg-surface text-muted'
            )}
            aria-hidden="true"
          >
            {index + 1}
          </span>
          <span className={cn('text-xs', isActive ? 'text-foreground' : 'text-muted')}>{step}</span>
        </li>
      );
    })}
  </ol>
);
