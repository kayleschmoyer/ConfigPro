import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

export type SelectProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children?: ReactNode;
};

export const Select = ({ children }: SelectProps) => <div>{children}</div>;

export type SelectTriggerProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const SelectTrigger = ({ children, ...props }: SelectTriggerProps) => (
  <button type="button" {...props}>
    {children}
  </button>
);

export type SelectValueProps = {
  placeholder?: string;
  children?: ReactNode;
};

export const SelectValue = ({ children, placeholder }: SelectValueProps) => (
  <span>{children ?? placeholder}</span>
);

export type SelectContentProps = HTMLAttributes<HTMLDivElement>;

export const SelectContent = ({ children, ...props }: SelectContentProps) => (
  <div {...props}>{children}</div>
);

export type SelectItemProps = HTMLAttributes<HTMLDivElement> & {
  value: string;
};

export const SelectItem = ({ children, value, ...props }: SelectItemProps) => (
  <div data-value={value} role="option" {...props}>
    {children}
  </div>
);
