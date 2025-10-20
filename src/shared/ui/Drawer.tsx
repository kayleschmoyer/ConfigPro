import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { cn } from '../../lib/cn';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  side?: 'left' | 'right';
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  showCloseButton?: boolean;
}

const panelVariants = {
  left: {
    initial: { x: '-100%' },
    animate: { x: 0 },
    exit: { x: '-100%' }
  },
  right: {
    initial: { x: '100%' },
    animate: { x: 0 },
    exit: { x: '100%' }
  }
} as const;

export const Drawer = ({
  isOpen,
  onClose,
  title,
  description,
  side = 'right',
  children,
  footer,
  className,
  showCloseButton = true
}: DrawerProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = original;
      };
    }
    return undefined;
  }, [isOpen, mounted]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const variants = useMemo(() => panelVariants[side], [side]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="drawer"
          className="fixed inset-0 z-50 flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            className={cn(
              'relative ml-auto flex h-full w-full max-w-xl flex-col overflow-hidden border-l border-border/60 bg-background/95 shadow-2xl shadow-primary/10 backdrop-blur-xl',
              side === 'left' && 'ml-0 mr-auto border-l-0 border-r',
              className
            )}
            initial={variants.initial}
            animate={variants.animate}
            exit={variants.exit}
            transition={{ type: 'spring', stiffness: 260, damping: 30 }}
          >
            <div className="flex items-center justify-between border-b border-border/50 px-6 py-5">
              <div className="flex flex-col gap-1">
                {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
                {description && (
                  <p className="text-sm text-muted/90">{description}</p>
                )}
              </div>
              {showCloseButton && (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  Close
                </Button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
            {footer && (
              <div className="border-t border-border/50 bg-surface/60 px-6 py-4">{footer}</div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
