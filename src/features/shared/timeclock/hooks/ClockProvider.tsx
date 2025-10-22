import { createContext, useContext, type ReactNode } from 'react';
import { useClock } from './useClock';

const ClockContext = createContext<ReturnType<typeof useClock> | null>(null);

export const ClockProvider = ({ children }: { children: ReactNode }) => {
  const value = useClock();
  return <ClockContext.Provider value={value}>{children}</ClockContext.Provider>;
};

export const useClockContext = () => {
  const context = useContext(ClockContext);
  if (!context) {
    throw new Error('useClockContext must be used within a <ClockProvider>.');
  }
  return context;
};
