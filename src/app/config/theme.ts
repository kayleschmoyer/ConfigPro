export interface ThemeConfig {
  name: string;
  primary: string;
  accent: string;
  background: string;
  foreground: string;
  surface: string;
  muted: string;
  font: string;
  radii: { base: string; card: string };
  shadows: { sm: string; md: string; lg: string };
  logo: string;
}

export const THEME_STORAGE_KEY = 'configpro.theme', MODE_STORAGE_KEY = 'configpro.mode';

type ThemeName = 'default' | 'daycare' | 'construction';

const shared = {
  font: '"Inter", "SF Pro Display", system-ui, sans-serif',
  radii: { base: '0.75rem', card: '1rem' },
  shadows: {
    sm: '0 1px 2px rgba(15, 23, 42, 0.08)',
    md: '0 10px 30px rgba(15, 23, 42, 0.12)',
    lg: '0 30px 60px rgba(15, 23, 42, 0.16)'
  }
} satisfies Pick<ThemeConfig, 'font' | 'radii' | 'shadows'>;

const paletteData: Record<ThemeName, string> = {
  default: '#2563eb,#f97316,#0f172a,#f8fafc,#1e293b,#94a3b8,/brand-logo.svg',
  daycare: '#ec4899,#facc15,#fdf2f8,#111827,#f8fafc,#fb7185,/brand-logo-daycare.svg',
  construction: '#f97316,#2563eb,#111827,#f8fafc,#1f2937,#f59e0b,/brand-logo-construction.svg'
};

const composeTheme = (name: ThemeName): ThemeConfig => {
  const [primary, accent, background, foreground, surface, muted, logo] = paletteData[name].split(',');
  return { name, primary, accent, background, foreground, surface, muted, logo, ...shared };
};

export const baseTheme = composeTheme('default');

export const themePresets: Record<string, ThemeConfig> = {
  daycare: composeTheme('daycare'),
  construction: composeTheme('construction')
};

const hexToRgb = (hex: string) => {
  const value = hex.replace('#', '');
  const chunk = value.length === 3 ? 1 : 2;
  const pairs = value.match(new RegExp(`.{${chunk}}`, 'g')) ?? ['00', '00', '00'];
  return pairs.map(pair => parseInt(pair.length === 1 ? pair.repeat(2) : pair, 16)).join(' ');
};

const setColor = (root: HTMLElement, key: string, value: string) => {
  const rgb = hexToRgb(value);
  root.style.setProperty(`--color-${key}`, `rgb(${rgb})`);
  root.style.setProperty(`--color-${key}-rgb`, rgb);
};

const colorKeys = ['primary', 'accent', 'background', 'foreground', 'surface', 'muted'] as const;

export const resolveTheme = (name?: string) => (name && themePresets[name]) || baseTheme;

export const applyTheme = (theme: ThemeConfig) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  colorKeys.forEach(key => setColor(root, key, theme[key]));
  (
    [
      ['font-family-base', theme.font],
      ['radius-base', theme.radii.base],
      ['radius-card', theme.radii.card],
      ['shadow-sm', theme.shadows.sm],
      ['shadow-md', theme.shadows.md],
      ['shadow-lg', theme.shadows.lg]
    ] as const
  ).forEach(([token, value]) => root.style.setProperty(`--${token}`, value));
};
