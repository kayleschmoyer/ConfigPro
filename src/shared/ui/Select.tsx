import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, containerClassName, label, helperText, error, id, name, children, ...props },
    ref
  ) => {
    const fieldId = id ?? name;

    return (
      <label
        className={cn(
          'flex flex-col gap-2 text-sm font-medium text-muted',
          containerClassName
        )}
        htmlFor={fieldId}
      >
        {label && <span>{label}</span>}
        <select
          id={fieldId}
          ref={ref}
          name={name}
          className={cn(
            'h-11 rounded-full border border-surface/50 bg-surface/70 px-4 text-base text-foreground shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/60',
            error && 'border-red-400/80 focus:border-red-400 focus:ring-red-400/60',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {(helperText || error) && (
          <span className={cn('text-xs', error ? 'text-red-400' : 'text-muted/90')}>
            {error ?? helperText}
          </span>
        )}
      </label>
    );
  }
);

Select.displayName = 'Select';
