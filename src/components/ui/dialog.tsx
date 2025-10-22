import type { HTMLAttributes, ReactNode } from 'react';

export type DialogProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
};

export const Dialog = ({ children }: DialogProps) => <div>{children}</div>;

export const DialogContent = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div role="dialog" {...props}>
    {children}
  </div>
);

export const DialogHeader = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>{children}</div>
);

export const DialogFooter = ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>{children}</div>
);

export const DialogTitle = ({ children, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h2 {...props}>{children}</h2>
);

export const DialogDescription = ({ children, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p {...props}>{children}</p>
);
