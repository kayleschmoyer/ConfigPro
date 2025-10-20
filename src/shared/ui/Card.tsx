import { Slot } from '@radix-ui/react-slot';
import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  elevated?: boolean;
}

const paddingStyles: Record<NonNullable<CardProps['padding']>, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, asChild, padding = 'md', elevated = true, ...props }, ref) => {
    const Component = asChild ? Slot : 'div';

    return (
      <Component
        ref={ref}
        className={cn(
          'group/card relative rounded-3xl border border-border/60 bg-surface/80 backdrop-blur transition',
          elevated && 'shadow-xl shadow-primary/10',
          paddingStyles[padding],
          className
        )}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('mb-4 flex flex-col gap-2 text-left', className)}
    {...props}
  />
);

export const CardTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn('text-lg font-semibold text-foreground sm:text-xl', className)}
    {...props}
  />
);

export const CardDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-muted', className)} {...props} />
);

export const CardContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-4', className)} {...props} />
);

export const CardFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-4 flex items-center gap-3', className)} {...props} />
);
