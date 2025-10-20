import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { cn } from '../../lib/cn';

interface TabsContextValue {
  value: string;
  setValue: (next: string) => void;
  orientation: 'horizontal' | 'vertical';
}

const TabsContext = createContext<TabsContextValue | null>(null);

const toDomId = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '-');

export interface TabsProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  orientation?: 'horizontal' | 'vertical';
  children: ReactNode;
  className?: string;
}

export const Tabs = ({
  value,
  defaultValue,
  onValueChange,
  orientation = 'horizontal',
  children,
  className
}: TabsProps) => {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const setValue = useCallback(
    (next: string) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange]
  );

  const contextValue = useMemo(
    () => ({
      value: currentValue,
      setValue,
      orientation
    }),
    [currentValue, orientation, setValue]
  );

  return (
    <TabsContext.Provider value={contextValue}>
      <div
        className={cn(
          'flex w-full gap-6',
          orientation === 'vertical' ? 'flex-row' : 'flex-col',
          className
        )}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs components must be used within a <Tabs> root.');
  }
  return context;
};

export interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export const TabsList = ({ children, className }: TabsListProps) => {
  const { orientation } = useTabsContext();
  return (
    <div
      className={cn(
        'inline-flex gap-2 rounded-full border border-border/60 bg-surface/80 p-1 shadow-sm shadow-primary/5',
        orientation === 'vertical'
          ? 'flex-col self-start'
          : 'flex-row self-auto',
        className
      )}
      role="tablist"
      aria-orientation={orientation}
    >
      {children}
    </div>
  );
};

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = ({
  value,
  className,
  children,
  ...props
}: TabsTriggerProps) => {
  const { value: currentValue, setValue } = useTabsContext();
  const isActive = currentValue === value;
  const domValue = toDomId(value);
  const triggerId = `tab-${domValue}`;
  const panelId = `${triggerId}-panel`;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      aria-controls={panelId}
      id={triggerId}
      className={cn(
        'rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
        isActive
          ? 'bg-primary text-background shadow-md shadow-primary/30'
          : 'text-muted hover:text-foreground',
        className
      )}
      onClick={() => setValue(value)}
      {...props}
    >
      {children}
    </button>
  );
};

export interface TabsContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = ({
  value,
  className,
  children,
  ...props
}: TabsContentProps) => {
  const { value: currentValue } = useTabsContext();
  const isActive = currentValue === value;
  const domValue = toDomId(value);
  const triggerId = `tab-${domValue}`;
  const panelId = `${triggerId}-panel`;

  return (
    <div
      role="tabpanel"
      id={panelId}
      aria-labelledby={triggerId}
      hidden={!isActive}
      className={cn('w-full', className)}
      {...props}
    >
      {isActive ? children : null}
    </div>
  );
};
