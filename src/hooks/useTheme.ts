import { useThemeContext } from '../app/providers/ThemeProvider';

export const useTheme = () => {
  const { theme, themeName, mode, setThemeName, toggleMode } =
    useThemeContext();
  return {
    theme,
    themeName,
    mode,
    setTheme: setThemeName,
    toggleMode
  };
};
