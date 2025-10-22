import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

export type SheetProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
};

export const Sheet = ({ children }: SheetProps) => <div>{children}</div>;

export type SheetTriggerProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};

export const SheetTrigger = ({ children, ...props }: SheetTriggerProps) => (
  <button type="button" {...props}>
    {children}
  </button>
);

export type SheetContentProps = HTMLAttributes<HTMLDivElement> & {
  side?: 'left' | 'right' | 'top' | 'bottom';
};

export const SheetContent = ({ children, ...props }: SheetContentProps) => (
  <div {...props}>{children}</div>
);

export const SheetHeader = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>{children}</div>
);

export const SheetFooter = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>{children}</div>
);

export const SheetTitle = ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h2 {...props}>{children}</h2>
);
