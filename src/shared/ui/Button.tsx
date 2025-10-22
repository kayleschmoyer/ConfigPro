import { Slot } from '@radix-ui/react-slot';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';
import { cn } from '../../lib/cn';

type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'destructive' | 'subtle' | 'secondary';
type ButtonSize = 'sm' | 'md' | 'lg';

type MotionButtonProps = HTMLMotionProps<'button'>;

export interface ButtonProps extends MotionButtonProps {
  asChild?: boolean;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-70';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white shadow-md shadow-primary/30 hover:bg-primary/90 focus-visible:ring-primary',
  secondary: 'bg-secondary/20 text-secondary-foreground hover:bg-secondary/30 focus-visible:ring-secondary/60',
  outline:
    'border border-primary/70 text-primary hover:bg-primary/10 focus-visible:ring-primary/60 bg-surface/80 backdrop-blur',
  ghost: 'text-foreground hover:bg-surface/60 focus-visible:ring-surface/70',
  destructive:
    'bg-red-500 text-white shadow-md shadow-red-400/20 hover:bg-red-500/90 focus-visible:ring-red-500',
  subtle:
    'bg-surface/80 text-foreground shadow-sm shadow-primary/10 hover:bg-surface focus-visible:ring-primary/30'
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-6 text-base',
  lg: 'h-12 px-8 text-lg'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    asChild,
    className,
    variant = 'primary',
    size = 'md',
    whileTap = { scale: 0.97 },
    ...props
  }, ref) => {
    const classes = cn(baseStyles, variantStyles[variant], sizeStyles[size], className);

    if (asChild) {
      return (
        <Slot
          ref={ref}
          className={classes}
          {...(props as React.ComponentPropsWithoutRef<'button'>)}
        />
      );
    }

    return <motion.button ref={ref} className={classes} whileTap={whileTap} {...props} />;
  }
);

Button.displayName = 'Button';
