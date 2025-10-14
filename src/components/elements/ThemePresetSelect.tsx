import { useMemo } from 'react';
import { themePresets } from '../../app/config/theme';
import { useTheme } from '../../hooks/useTheme';

export const ThemePresetSelect = () => {
  const { themeName, setTheme } = useTheme();
  const options = useMemo(() => Object.keys(themePresets), []);

  return (
    <label className="flex items-center gap-2 text-xs font-medium text-muted">
      Theme
      <select
        className="button-shadow rounded-full border border-surface/40 bg-surface/70 px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        value={themeName}
        onChange={(event) => setTheme(event.target.value)}
      >
        <option value="default">Default</option>
        {options.map((name) => (
          <option key={name} value={name}>
            {name.charAt(0).toUpperCase() + name.slice(1)}
          </option>
        ))}
      </select>
    </label>
  );
};
