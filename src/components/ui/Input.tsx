import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const fieldId = id ?? props.name;

    return (
      <label
        className="flex flex-col gap-2 text-sm font-medium text-muted"
        htmlFor={fieldId}
      >
        {label}
        <input
          id={fieldId}
          ref={ref}
          className={cn(
            'h-11 rounded-full border border-surface/50 bg-surface/70 px-5 text-base text-foreground placeholder:text-muted/80 shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/60',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-red-400">{error}</span>}
      </label>
    );
  }
);

Input.displayName = 'Input';
