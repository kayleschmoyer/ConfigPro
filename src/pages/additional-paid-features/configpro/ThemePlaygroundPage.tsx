import { motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { baseTheme, type ThemeConfig } from '@/app/config/theme';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { cn } from '@/lib/cn';

type PaletteKey = 'primary' | 'accent' | 'background' | 'foreground' | 'surface' | 'muted';

type CuratedTheme = {
  name: string;
  description: string;
  values: Pick<ThemeConfig, PaletteKey | 'font' | 'logo' | 'radii'> & {
    elevation: number;
  };
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const formatHex = (value: string, fallback: string) => {
  const trimmed = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  if (/^#[0-9A-Fa-f]{3}$/.test(trimmed)) {
    const expanded = trimmed
      .slice(1)
      .split('')
      .map((char) => char + char)
      .join('');
    return `#${expanded}`.toUpperCase();
  }
  return fallback.toUpperCase();
};

const parseRem = (value: string, fallback: number) => {
  const parsed = parseFloat(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toComponentHex = (component: number) => component.toString(16).padStart(2, '0');

const rgbToHex = (r: number, g: number, b: number) =>
  `#${toComponentHex(r)}${toComponentHex(g)}${toComponentHex(b)}`.toUpperCase();

const hexToRgb = (hex: string) => {
  const normalized = formatHex(hex, '#000000');
  const r = parseInt(normalized.slice(1, 3), 16);
  const g = parseInt(normalized.slice(3, 5), 16);
  const b = parseInt(normalized.slice(5, 7), 16);
  return { r, g, b };
};

const rgbToHsl = (r: number, g: number, b: number) => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      default:
        h = (rNorm - gNorm) / d + 4;
    }
    h /= 6;
  }

  return { h, s, l };
};

const hslToRgb = (h: number, s: number, l: number) => {
  if (s === 0) {
    const value = Math.round(l * 255);
    return { r: value, g: value, b: value };
  }

  const hueToRgb = (p: number, q: number, t: number) => {
    let temp = t;
    if (temp < 0) temp += 1;
    if (temp > 1) temp -= 1;
    if (temp < 1 / 6) return p + (q - p) * 6 * temp;
    if (temp < 1 / 2) return q;
    if (temp < 2 / 3) return p + (q - p) * (2 / 3 - temp) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;

  const r = hueToRgb(p, q, h + 1 / 3);
  const g = hueToRgb(p, q, h);
  const b = hueToRgb(p, q, h - 1 / 3);

  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
};

const adjustLuminance = (hex: string, delta: number) => {
  const { r, g, b } = hexToRgb(hex);
  const { h, s, l } = rgbToHsl(r, g, b);
  const nextL = clamp(l + delta, 0, 1);
  const { r: rOut, g: gOut, b: bOut } = hslToRgb(h, s, nextL);
  return rgbToHex(rOut, gOut, bOut);
};

const relativeLuminance = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (value: number) => {
    const channel = value / 255;
    return channel <= 0.03928
      ? channel / 12.92
      : Math.pow((channel + 0.055) / 1.055, 2.4);
  };
  const rLin = toLinear(r);
  const gLin = toLinear(g);
  const bLin = toLinear(b);
  return 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
};

const contrastRatio = (a: string, b: string) => {
  const lumA = relativeLuminance(a);
  const lumB = relativeLuminance(b);
  const [bright, dark] = lumA > lumB ? [lumA, lumB] : [lumB, lumA];
  return (bright + 0.05) / (dark + 0.05);
};

const createShadows = (intensity: number, foreground: string) => {
  const { r, g, b } = hexToRgb(foreground);
  const shadowColor = `${r}, ${g}, ${b}`;
  const scale = clamp(intensity, 0, 1);

  const shadow = (y: number, blur: number, alpha: number) =>
    `0 ${y}px ${blur}px rgba(${shadowColor}, ${alpha.toFixed(2)})`;

  return {
    sm: shadow(2 + Math.round(scale * 2), 6 + Math.round(scale * 4), 0.10 + scale * 0.08),
    md: shadow(10 + Math.round(scale * 6), 30 + Math.round(scale * 10), 0.12 + scale * 0.10),
    lg: shadow(30 + Math.round(scale * 10), 60 + Math.round(scale * 18), 0.16 + scale * 0.12)
  } satisfies ThemeConfig['shadows'];
};

const curatedThemes: CuratedTheme[] = [
  {
    name: 'Aurora Ops',
    description: 'Bright blues with citrus accents for high-visibility control rooms.',
    values: {
      primary: '#2563EB',
      accent: '#F97316',
      background: '#0F172A',
      foreground: '#F8FAFC',
      surface: '#1E293B',
      muted: '#94A3B8',
      font: baseTheme.font,
      logo: '/brand-logo.svg',
      radii: { base: '0.75rem', card: '1rem' },
      elevation: 0.8
    }
  },
  {
    name: 'Field Teams',
    description: 'Sunrise warmth with confident navy for field enablement tablets.',
    values: {
      primary: '#E879F9',
      accent: '#38BDF8',
      background: '#0B1120',
      foreground: '#F5F3FF',
      surface: '#1E1B4B',
      muted: '#A5B4FC',
      font: '"Satoshi", "Inter", "SF Pro Display", system-ui, sans-serif',
      logo: '/brand-logo-daycare.svg',
      radii: { base: '0.85rem', card: '1.15rem' },
      elevation: 0.65
    }
  },
  {
    name: 'Industrial Clarity',
    description: 'High-contrast amber and charcoal for rugged manufacturing dashboards.',
    values: {
      primary: '#F97316',
      accent: '#22D3EE',
      background: '#0F172A',
      foreground: '#F8FAFC',
      surface: '#111827',
      muted: '#64748B',
      font: '"Space Grotesk", "Inter", "SF Pro Display", system-ui, sans-serif',
      logo: '/brand-logo-construction.svg',
      radii: { base: '0.70rem', card: '0.95rem' },
      elevation: 0.9
    }
  },
  {
    name: 'Executive Calm',
    description: 'Soft neutrals with jade highlights for calm, decision-ready reports.',
    values: {
      primary: '#0EA5E9',
      accent: '#34D399',
      background: '#F8FAFC',
      foreground: '#0F172A',
      surface: '#FFFFFF',
      muted: '#CBD5F5',
      font: '"Cal Sans", "Inter", "SF Pro Display", system-ui, sans-serif',
      logo: '/brand-logo.svg',
      radii: { base: '0.9rem', card: '1.25rem' },
      elevation: 0.55
    }
  }
];

const fontOptions = [
  { label: 'Inter', value: baseTheme.font },
  {
    label: 'Satoshi',
    value: '"Satoshi", "Inter", "SF Pro Display", system-ui, sans-serif'
  },
  {
    label: 'Cal Sans',
    value: '"Cal Sans", "Inter", "SF Pro Display", system-ui, sans-serif'
  },
  {
    label: 'Space Grotesk',
    value: '"Space Grotesk", "Inter", "SF Pro Display", system-ui, sans-serif'
  }
];

const logoOptions = [
  { label: 'ConfigPro', value: '/brand-logo.svg' },
  { label: 'Daycare', value: '/brand-logo-daycare.svg' },
  { label: 'Construction', value: '/brand-logo-construction.svg' }
];

const PreviewButton = ({
  children,
  variant = 'primary',
  theme,
  accent
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  theme: ThemeConfig;
  accent?: string;
}) => {
  const palette = {
    primary: theme.primary,
    accent: accent ?? theme.accent,
    foreground: theme.foreground,
    background: theme.background
  };

  const styles: Record<typeof variant, CSSProperties> = {
    primary: {
      background: palette.primary,
      color: theme.foreground,
      border: 'none'
    },
    secondary: {
      background: palette.accent,
      color: theme.background,
      border: 'none'
    },
    ghost: {
      background: 'transparent',
      color: palette.foreground,
      border: `1px solid ${adjustLuminance(theme.surface, -0.2)}`
    }
  };

  return (
    <button
      type="button"
      style={{
        ...styles[variant],
        borderRadius: theme.radii.base,
        padding: '0.65rem 1.6rem',
        fontWeight: 600,
        fontSize: '0.95rem',
        boxShadow: theme.shadows.sm,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
      onMouseEnter={(event) => {
        event.currentTarget.style.transform = 'translateY(-2px)';
        event.currentTarget.style.boxShadow = theme.shadows.md;
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.transform = 'translateY(0)';
        event.currentTarget.style.boxShadow = theme.shadows.sm;
      }}
    >
      {children}
    </button>
  );
};

export const ThemePlaygroundPage = () => {
  const [palette, setPalette] = useState<Record<PaletteKey, string>>({
    primary: baseTheme.primary.toUpperCase(),
    accent: baseTheme.accent.toUpperCase(),
    background: baseTheme.background.toUpperCase(),
    foreground: baseTheme.foreground.toUpperCase(),
    surface: baseTheme.surface.toUpperCase(),
    muted: baseTheme.muted.toUpperCase()
  });
  const [font, setFont] = useState<string>(baseTheme.font);
  const [logo, setLogo] = useState<string>(baseTheme.logo);
  const [radiusBase, setRadiusBase] = useState<number>(() => parseRem(baseTheme.radii.base, 0.75));
  const [radiusCard, setRadiusCard] = useState<number>(() => parseRem(baseTheme.radii.card, 1));
  const [elevation, setElevation] = useState<number>(0.75);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const normalizedTheme = useMemo<ThemeConfig>(() => {
    const sanitized = (key: PaletteKey) => formatHex(palette[key], baseTheme[key]);
    const theme: ThemeConfig = {
      name: 'theme-lab',
      primary: sanitized('primary'),
      accent: sanitized('accent'),
      background: sanitized('background'),
      foreground: sanitized('foreground'),
      surface: sanitized('surface'),
      muted: sanitized('muted'),
      font,
      radii: {
        base: `${radiusBase.toFixed(2)}rem`,
        card: `${radiusCard.toFixed(2)}rem`
      },
      shadows: createShadows(elevation, sanitized('foreground')),
      logo: logo || baseTheme.logo
    };
    return theme;
  }, [font, logo, palette, radiusBase, radiusCard, elevation]);

  const themeJson = useMemo(
    () => JSON.stringify(normalizedTheme, null, 2),
    [normalizedTheme]
  );

  const accentGlow = useMemo(
    () => adjustLuminance(normalizedTheme.accent, 0.26),
    [normalizedTheme.accent]
  );
  const accentShade = useMemo(
    () => adjustLuminance(normalizedTheme.accent, -0.18),
    [normalizedTheme.accent]
  );
  const primaryTint = useMemo(
    () => adjustLuminance(normalizedTheme.primary, 0.14),
    [normalizedTheme.primary]
  );
  const primaryShade = useMemo(
    () => adjustLuminance(normalizedTheme.primary, -0.22),
    [normalizedTheme.primary]
  );

  const ratio = useMemo(
    () => contrastRatio(normalizedTheme.primary, normalizedTheme.background),
    [normalizedTheme.primary, normalizedTheme.background]
  );
  const ratioLabel = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : ratio >= 3 ? 'AA Large' : 'Needs attention';

  const handleCopy = useCallback(async () => {
    try {
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        throw new Error('Clipboard unavailable');
      }
      await navigator.clipboard.writeText(themeJson);
      setCopyState('copied');
    } catch (error) {
      console.warn('ConfigPro Theme Lab: unable to copy theme', error);
      setCopyState('failed');
    }
  }, [themeJson]);

  useEffect(() => {
    if (copyState === 'idle') return;
    const timeout = setTimeout(() => setCopyState('idle'), 2600);
    return () => clearTimeout(timeout);
  }, [copyState]);

  const handleApplyCurated = (curated: CuratedTheme) => {
    setPalette({
      primary: curated.values.primary.toUpperCase(),
      accent: curated.values.accent.toUpperCase(),
      background: curated.values.background.toUpperCase(),
      foreground: curated.values.foreground.toUpperCase(),
      surface: curated.values.surface.toUpperCase(),
      muted: curated.values.muted.toUpperCase()
    });
    setFont(curated.values.font);
    setLogo(curated.values.logo);
    setRadiusBase(parseRem(curated.values.radii.base, radiusBase));
    setRadiusCard(parseRem(curated.values.radii.card, radiusCard));
    setElevation(curated.values.elevation);
  };

  const handleColorBlur = (key: PaletteKey) => {
    setPalette((previous) => ({
      ...previous,
      [key]: formatHex(previous[key], baseTheme[key])
    }));
  };

  const previewStyles = useMemo(
    () => ({
      '--preview-primary': normalizedTheme.primary,
      '--preview-accent': normalizedTheme.accent,
      '--preview-surface': normalizedTheme.surface,
      '--preview-muted': normalizedTheme.muted,
      '--preview-foreground': normalizedTheme.foreground,
      '--preview-background': normalizedTheme.background,
      '--preview-shadow-lg': normalizedTheme.shadows.lg
    }) as CSSProperties,
    [normalizedTheme]
  );

  const curatedHighlight = useMemo(
    () =>
      curatedThemes.find(
        (theme) =>
          theme.values.primary.toUpperCase() === normalizedTheme.primary &&
          theme.values.accent.toUpperCase() === normalizedTheme.accent &&
          theme.values.background.toUpperCase() === normalizedTheme.background
      )?.name ?? 'Custom palette',
    [normalizedTheme]
  );

  const colorSwatches = [
    { label: 'Accent glow', value: accentGlow },
    { label: 'Accent shade', value: accentShade },
    { label: 'Primary tint', value: primaryTint },
    { label: 'Primary shade', value: primaryShade }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background/98 to-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(56,189,248,0.12),transparent_60%)]" />
      </div>
      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 pb-16 pt-12 sm:px-10 lg:px-14">
        <header className="flex flex-col gap-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-primary">
            Theme Lab
          </div>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
                Design a signature ConfigPro experience
              </h1>
              <p className="max-w-3xl text-base text-muted sm:text-lg">
                Play with colors, typography, and elevation to craft a UI that feels unmistakably yours.
                Every change updates the live preview instantly&mdash;then export the theme JSON for your
                workspace rollout.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={() => handleApplyCurated(curatedThemes[Math.floor(Math.random() * curatedThemes.length)])}>
                Surprise me with a palette
              </Button>
              <Button onClick={handleCopy}>
                {copyState === 'copied' ? 'Copied!' : copyState === 'failed' ? 'Copy failed' : 'Copy theme JSON'}
              </Button>
            </div>
          </div>
        </header>

        <div className="grid gap-10 xl:grid-cols-[380px_1fr] xl:gap-14">
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="flex flex-col gap-8 rounded-3xl border border-foreground/10 bg-background/80 p-6 shadow-xl shadow-primary/10 backdrop-blur"
          >
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Brand palette</h2>
              <p className="text-sm text-muted">
                Adjust the hex values or use the color pickers for immediate feedback. We keep values
                normalized so your exported theme is production ready.
              </p>
              <div className="grid gap-3">
                {(Object.keys(palette) as PaletteKey[]).map((key) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 rounded-2xl border border-foreground/10 bg-surface/60 p-3 text-sm shadow-sm"
                  >
                    <div
                      aria-hidden
                      className="h-10 w-10 rounded-xl border border-white/20 shadow-inner"
                      style={{ backgroundColor: formatHex(palette[key], baseTheme[key]) }}
                    />
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
                        {key}
                      </p>
                      <Input
                        value={palette[key]}
                        onChange={(event) =>
                          setPalette((previous) => ({
                            ...previous,
                            [key]: event.target.value.toUpperCase()
                          }))
                        }
                        onBlur={() => handleColorBlur(key)}
                        className="h-9 rounded-xl border-none bg-transparent px-0 font-mono text-sm uppercase text-foreground focus:ring-0"
                      />
                    </div>
                    <input
                      type="color"
                      value={formatHex(palette[key], baseTheme[key])}
                      onChange={(event) =>
                        setPalette((previous) => ({
                          ...previous,
                          [key]: event.target.value.toUpperCase()
                        }))
                      }
                      className="h-10 w-10 cursor-pointer rounded-xl border border-foreground/10 bg-transparent p-1"
                      aria-label={`Select ${key} color`}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Typography & spacing</h2>
              <div className="space-y-3">
                <label className="flex flex-col gap-2 text-sm font-medium text-muted">
                  Font stack
                  <Input
                    value={font}
                    onChange={(event) => setFont(event.target.value)}
                    className="h-10 rounded-xl border border-foreground/10 bg-surface/60 text-sm"
                    placeholder="Custom font stack"
                  />
                </label>
                <div className="flex flex-wrap gap-2">
                  {fontOptions.map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setFont(option.value)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] transition',
                        font === option.value
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-foreground/10 text-muted hover:text-foreground'
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                  Base radius
                  <input
                    type="range"
                    min={0.4}
                    max={1.4}
                    step={0.05}
                    value={radiusBase}
                    onChange={(event) => setRadiusBase(parseFloat(event.target.value))}
                    className="accent-primary"
                  />
                  <span className="text-sm text-foreground">{radiusBase.toFixed(2)} rem</span>
                </label>
                <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                  Card radius
                  <input
                    type="range"
                    min={0.6}
                    max={1.6}
                    step={0.05}
                    value={radiusCard}
                    onChange={(event) => setRadiusCard(parseFloat(event.target.value))}
                    className="accent-primary"
                  />
                  <span className="text-sm text-foreground">{radiusCard.toFixed(2)} rem</span>
                </label>
              </div>
              <label className="flex flex-col gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
                Elevation feel
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={elevation}
                  onChange={(event) => setElevation(parseFloat(event.target.value))}
                  className="accent-primary"
                />
                <span className="text-sm text-foreground">
                  {elevation < 0.3
                    ? 'Subtle surface blending'
                    : elevation < 0.7
                    ? 'Balanced depth'
                    : 'Bold, elevated modules'}
                </span>
              </label>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Logos</h2>
              <div className="grid gap-3">
                {logoOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setLogo(option.value)}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition',
                      logo === option.value
                        ? 'border-primary/50 bg-primary/10 text-primary'
                        : 'border-foreground/10 bg-surface/60 text-muted hover:text-foreground'
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-background/80 p-1 shadow-inner">
                      <img src={option.value} alt="" className="h-8 w-8 object-contain" />
                    </div>
                    <span className="text-sm font-semibold uppercase tracking-[0.28em]">{option.label}</span>
                  </button>
                ))}
                <label className="flex flex-col gap-2 text-sm font-medium text-muted">
                  Custom logo path
                  <Input
                    value={logo}
                    onChange={(event) => setLogo(event.target.value)}
                    placeholder="/brand-logo.svg"
                    className="h-10 rounded-xl border border-foreground/10 bg-surface/60 text-sm"
                  />
                </label>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Accessibility insights</h2>
              <div className="rounded-2xl border border-foreground/10 bg-surface/70 p-4 text-sm shadow-inner shadow-black/5">
                <div className="flex items-baseline justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Primary vs. background</p>
                  <span className="text-lg font-semibold">{ratio.toFixed(2)}:1</span>
                </div>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary">{ratioLabel}</p>
                <p className="mt-3 text-muted">
                  {ratio >= 4.5
                    ? 'Great contrast for body copy, icons, and interactive elements.'
                    : 'Increase contrast or adjust background for long-form content.'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {colorSwatches.map((swatch) => (
                  <div
                    key={swatch.label}
                    className="flex items-center gap-3 rounded-2xl border border-foreground/10 bg-surface/60 p-3 shadow-sm"
                  >
                    <span
                      className="h-9 w-9 rounded-xl border border-white/10 shadow-inner"
                      style={{ backgroundColor: swatch.value }}
                    />
                    <div>
                      <p className="font-semibold uppercase tracking-[0.28em] text-muted">{swatch.label}</p>
                      <p className="font-mono text-xs text-foreground">{swatch.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Curated foundations</h2>
              <p className="text-sm text-muted">
                Start from a recommended palette tuned for specific industries. Each one carries a unique
                energy profile across color, typography, and elevation.
              </p>
              <div className="space-y-3">
                {curatedThemes.map((curated) => (
                  <button
                    key={curated.name}
                    type="button"
                    onClick={() => handleApplyCurated(curated)}
                    className={cn(
                      'flex w-full flex-col gap-2 rounded-2xl border px-4 py-3 text-left transition',
                      curated.values.primary.toUpperCase() === normalizedTheme.primary &&
                        curated.values.background.toUpperCase() === normalizedTheme.background
                        ? 'border-primary/60 bg-primary/10 text-foreground'
                        : 'border-foreground/10 bg-surface/60 text-muted hover:text-foreground'
                    )}
                  >
                    <span className="text-sm font-semibold text-foreground">{curated.name}</span>
                    <span className="text-xs text-muted">{curated.description}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.aside>

          <motion.section
            style={{
              ...previewStyles,
              borderRadius: `calc(1.35 * ${normalizedTheme.radii.card})`
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="flex flex-col gap-8 border border-foreground/5 bg-background/70 p-8 shadow-[var(--preview-shadow-lg)] backdrop-blur"
          >
            <div
              className="relative overflow-hidden border border-white/5 bg-foreground/5 p-8 shadow-[var(--preview-shadow-lg)]"
              style={{
                borderRadius: `calc(1.2 * ${normalizedTheme.radii.card})`,
                background: `radial-gradient(circle at top left, ${primaryTint} 0%, transparent 65%), radial-gradient(circle at bottom right, ${accentGlow} 0%, transparent 70%), ${normalizedTheme.background}`,
                fontFamily: normalizedTheme.font
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/6 via-transparent to-black/30" />
              <div className="relative z-10 flex flex-col gap-6 text-left" style={{ color: normalizedTheme.foreground }}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="flex h-12 w-12 items-center justify-center border border-white/10 bg-white/10 p-2 shadow-inner"
                      style={{ borderRadius: `calc(${normalizedTheme.radii.card} / 1.6)` }}
                    >
                      <img src={normalizedTheme.logo} alt="ConfigPro brand" className="h-8 w-8 object-contain" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/80">{curatedHighlight}</p>
                      <h2 className="text-2xl font-semibold">Ops control center</h2>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <PreviewButton theme={normalizedTheme}>Launch workspace</PreviewButton>
                    <PreviewButton theme={normalizedTheme} variant="secondary">
                      Share rollout kit
                    </PreviewButton>
                    <PreviewButton theme={normalizedTheme} variant="ghost">
                      Draft later
                    </PreviewButton>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    {
                      title: 'Blueprint coverage',
                      value: '86%',
                      trend: '+6.4%',
                      tone: primaryTint
                    },
                    {
                      title: 'Automation readiness',
                      value: '12 / 15 flows',
                      trend: 'QA review',
                      tone: accentGlow
                    },
                    {
                      title: 'Team adoption',
                      value: '63 active',
                      trend: '+18 this week',
                      tone: accentShade
                    }
                  ].map((stat) => (
                    <div
                      key={stat.title}
                      className="rounded-3xl border border-white/10 p-4 shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${stat.tone}20, transparent)`
                      }}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
                        {stat.title}
                      </p>
                      <p className="mt-2 text-2xl font-semibold">{stat.value}</p>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-white/70">
                        {stat.trend}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div
              className="grid gap-6 border border-foreground/8 bg-surface/80 p-8 shadow-[var(--preview-shadow-lg)]"
              style={{
                fontFamily: normalizedTheme.font,
                borderRadius: `calc(1.15 * ${normalizedTheme.radii.card})`
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Experience guide</p>
                  <h3 className="text-2xl font-semibold text-foreground">Live preview modules</h3>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-semibold uppercase tracking-[0.28em] text-primary">
                    {ratioLabel}
                  </span>
                  <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-semibold uppercase tracking-[0.28em] text-accent">
                    {normalizedTheme.radii.card} cards
                  </span>
                </div>
              </div>

              <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
                <div className="flex flex-col gap-4">
                  {[0, 1, 2].map((index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-foreground/10 bg-background/80 p-4 shadow-[var(--preview-shadow-lg)]"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
                        Launch track {index + 1}
                      </p>
                      <p className="mt-2 text-sm text-foreground">
                        Align teams on rollout milestones, automations, and communication cadences with
                        a shared operational rhythm.
                      </p>
                      <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                        <span
                          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-semibold text-primary"
                        >
                          <span className="h-2 w-2 rounded-full bg-primary" />
                          Ready to launch
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-semibold text-accent">
                          <span className="h-2 w-2 rounded-full bg-accent" />
                          Stakeholder sync
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-4 rounded-2xl border border-foreground/10 bg-background/90 p-4 shadow-[var(--preview-shadow-lg)]">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">
                    Color harmonics
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    {colorSwatches.map((swatch) => (
                      <div key={swatch.label} className="rounded-xl border border-foreground/10 bg-surface/70 p-3">
                        <span
                          className="mb-2 block h-10 rounded-lg border border-white/10"
                          style={{ backgroundColor: swatch.value }}
                        />
                        <p className="font-semibold uppercase tracking-[0.28em] text-muted">{swatch.label}</p>
                        <p className="font-mono text-[11px] text-foreground">{swatch.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-foreground/8 bg-surface/80 p-4 text-xs text-muted shadow-inner">
                    <p>
                      Typography: <span className="font-semibold text-foreground">{fontOptions.find((option) => option.value === font)?.label ?? 'Custom'}</span>
                    </p>
                    <p>
                      Elevation: <span className="font-semibold text-foreground">{elevation.toFixed(2)}</span>
                    </p>
                    <p>
                      Surface: <span className="font-semibold text-foreground">{normalizedTheme.surface}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="border border-foreground/8 bg-background/80 p-6 shadow-[var(--preview-shadow-lg)]"
              style={{
                fontFamily: normalizedTheme.font,
                borderRadius: `calc(1.1 * ${normalizedTheme.radii.card})`
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Theme export</p>
                  <h3 className="text-lg font-semibold">Drop this JSON into your ConfigPro workspace</h3>
                </div>
                <Button variant="outline" onClick={handleCopy} className="h-10 rounded-full px-4 text-sm">
                  {copyState === 'copied' ? 'Copied!' : copyState === 'failed' ? 'Copy failed' : 'Copy JSON'}
                </Button>
              </div>
              <pre className="mt-4 max-h-64 overflow-auto rounded-2xl bg-black/80 p-4 text-xs text-emerald-200 shadow-inner">
                {themeJson}
              </pre>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
};
