import type { ComponentPropsWithoutRef } from 'react';

export type CheckboxProps = Omit<ComponentPropsWithoutRef<'input'>, 'type' | 'onChange'> & {
  onCheckedChange?: (value: boolean) => void;
};

export const Checkbox = ({ onCheckedChange, ...props }: CheckboxProps) => (
  <input
    type="checkbox"
    {...props}
    onChange={(event) => onCheckedChange?.(event.target.checked)}
  />
);
