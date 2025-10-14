import { createContext, useContext, useEffect, useMemo } from 'react';
import {
  applyTheme,
  baseTheme,
  MODE_STORAGE_KEY,
  resolveTheme,
  THEME_STORAGE_KEY,
  type ThemeConfig
} from '../config/theme';
import { useLocalStorage } from '../../hooks/useLocalStorage';

type Mode = 'light' | 'dark';

interface ThemeContextValue {
  theme: ThemeConfig;
  themeName: string;
  mode: Mode;
  setThemeName: (name: string) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeName, setThemeName] = useLocalStorage(
    THEME_STORAGE_KEY,
    baseTheme.name
  );
  const [mode, setMode] = useLocalStorage<Mode>(MODE_STORAGE_KEY, 'dark');
  const theme = useMemo(() => resolveTheme(themeName), [themeName]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.dataset.mode = mode;
    root.classList.toggle('dark', mode === 'dark');
  }, [mode]);

  const value = useMemo(
    () => ({
      theme,
      themeName,
      mode,
      setThemeName,
      toggleMode: () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'))
    }),
    [mode, setMode, setThemeName, theme, themeName]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useThemeContext = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx)
    throw new Error('useThemeContext must be used within ThemeProvider');
  return ctx;
};
