import { useMemo } from 'react';
import { themePresets } from '../../app/config/theme';
import { useTheme } from '../../hooks/useTheme';
import { Select } from '../../shared/ui/Select';

export const ThemePresetSelect = () => {
  const { themeName, setTheme } = useTheme();
  const options = useMemo(() => Object.keys(themePresets), []);

  return (
    <Select
      label="Theme"
      value={themeName}
      onChange={(event) => setTheme(event.target.value)}
      className="h-10 rounded-full px-3 text-sm"
      containerClassName="text-xs"
    >
      <option value="default">Default</option>
      {options.map((name) => (
        <option key={name} value={name}>
          {name.charAt(0).toUpperCase() + name.slice(1)}
        </option>
      ))}
    </Select>
  );
};
