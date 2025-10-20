import { forwardRef, useCallback } from 'react';
import type { ButtonHTMLAttributes, KeyboardEvent, MouseEvent } from 'react';
import { cn } from '../../lib/cn';

export interface SwitchProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  (
    { checked = false, disabled, onCheckedChange, className, onClick, onKeyDown, ...props },
    ref,
  ) => {
    const toggle = useCallback(
      () => {
        if (disabled) {
          return;
        }
        onCheckedChange?.(!checked);
      },
      [checked, disabled, onCheckedChange],
    );

    const handleClick = useCallback(
      (event: MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        if (event.defaultPrevented) {
          return;
        }
        toggle();
      },
      [onClick, toggle],
    );

    const handleKeyDown = useCallback(
      (event: KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) {
          return;
        }
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          toggle();
        }
      },
      [onKeyDown, toggle],
    );

    return (
      <button
        ref={ref}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        data-state={checked ? 'checked' : 'unchecked'}
        data-disabled={disabled ? '' : undefined}
        className={cn(
          'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
          checked ? 'bg-primary' : 'bg-muted',
          className,
        )}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-background shadow transition-all',
            checked ? 'translate-x-5' : 'translate-x-1',
          )}
        />
      </button>
    );
  },
);

Switch.displayName = 'Switch';
