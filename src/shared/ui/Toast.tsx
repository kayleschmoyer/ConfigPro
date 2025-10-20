import { AnimatePresence, motion } from 'framer-motion';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { createPortal } from 'react-dom';
import { Button } from './Button';
import { cn } from '../../lib/cn';

export type ToastVariant = 'default' | 'success' | 'info' | 'warning' | 'destructive';

export interface ToastOptions {
  id?: string;
  title?: string;
  description?: string;
  duration?: number;
  variant?: ToastVariant;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastMessage extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 5000;

const variantStyles: Record<ToastVariant, string> = {
  default: 'border border-border/50 bg-background/95 text-foreground shadow-primary/10',
  success: 'border border-emerald-500/60 bg-emerald-500/10 text-emerald-100',
  info: 'border border-sky-500/60 bg-sky-500/10 text-sky-100',
  warning: 'border border-amber-500/60 bg-amber-500/10 text-amber-100',
  destructive: 'border border-red-500/60 bg-red-500/10 text-red-100'
};

const createToastId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `toast-${Math.random().toString(36).slice(2, 9)}`;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ id, duration = DEFAULT_DURATION, ...options }: ToastOptions) => {
      const nextId = id ?? createToastId();
      setToasts((current) => [
        ...current.filter((toast) => toast.id !== nextId),
        {
          id: nextId,
          duration,
          variant: 'default',
          ...options
        }
      ]);
      return nextId;
    },
    []
  );

  useEffect(() => {
    const timers = toasts.map((toast) => {
      if (!toast.duration || toast.duration === Infinity) return null;
      const timer = window.setTimeout(() => dismissToast(toast.id), toast.duration);
      return timer;
    });

    return () => {
      timers.forEach((timer) => {
        if (timer) {
          window.clearTimeout(timer);
        }
      });
    };
  }, [toasts, dismissToast]);

  const contextValue = useMemo(
    () => ({
      showToast,
      dismissToast
    }),
    [showToast, dismissToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {mounted && (
        <ToastViewport toasts={toasts} onDismiss={dismissToast} />
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a <ToastProvider>.');
  }
  return context;
};

interface ToastViewportProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

const ToastViewport = ({ toasts, onDismiss }: ToastViewportProps) => {
  if (!toasts.length) return null;

  return createPortal(
    <div className="pointer-events-none fixed bottom-6 right-6 z-[60] flex w-full max-w-sm flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const variant = toast.variant ?? 'default';
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className={cn(
                'pointer-events-auto flex flex-col gap-3 rounded-2xl px-5 py-4 shadow-lg backdrop-blur-xl',
                variantStyles[variant]
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  {toast.title && (
                    <p className="text-sm font-semibold text-foreground">
                      {toast.title}
                    </p>
                  )}
                  {toast.description && (
                    <p className="text-sm text-foreground/80">
                      {toast.description}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDismiss(toast.id)}
                >
                  Close
                </Button>
              </div>
              {toast.action && (
                <div className="flex items-center justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      toast.action?.onClick();
                      onDismiss(toast.id);
                    }}
                  >
                    {toast.action.label}
                  </Button>
                </div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>,
    document.body
  );
};
