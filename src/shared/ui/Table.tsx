import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

export const TableContainer = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'overflow-x-auto rounded-3xl border border-border/60 bg-surface/80 shadow-lg shadow-primary/5 backdrop-blur',
        className
      )}
      {...props}
    />
  )
);

TableContainer.displayName = 'TableContainer';

export const Table = forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <table
      ref={ref}
      className={cn('w-full border-collapse text-left text-sm text-foreground', className)}
      {...props}
    />
  )
);

Table.displayName = 'Table';

export const TableHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead
    className={cn('bg-surface/60 text-xs font-semibold uppercase tracking-[0.25em] text-muted', className)}
    {...props}
  />
);

export const TableBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn('divide-y divide-border/50 text-sm text-foreground/90', className)} {...props} />
);

export const TableFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tfoot className={cn('bg-surface/70 text-sm font-semibold text-foreground', className)} {...props} />
);

export const TableRow = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr
    className={cn(
      'transition hover:bg-primary/5 data-[state=selected]:bg-primary/10',
      className
    )}
    {...props}
  />
);

export const TableHead = ({
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableHeaderCellElement>) => (
  <th
    className={cn('px-5 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-muted', className)}
    {...props}
  />
);

export const TableCell = ({
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn('px-5 py-4 align-middle text-sm text-foreground/90', className)} {...props} />
);

export const TableCaption = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement>) => (
  <caption
    className={cn('px-6 py-4 text-left text-xs text-muted', className)}
    {...props}
  />
);
