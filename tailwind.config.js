const withAlpha =
  (colorVar, rgbVar) =>
  ({ opacityValue }) =>
    opacityValue === undefined
      ? `var(${colorVar})`
      : `rgb(var(${rgbVar}) / ${opacityValue})`;

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: withAlpha('--color-background', '--color-background-rgb'),
        foreground: withAlpha('--color-foreground', '--color-foreground-rgb'),
        primary: withAlpha('--color-primary', '--color-primary-rgb'),
        accent: withAlpha('--color-accent', '--color-accent-rgb'),
        surface: withAlpha('--color-surface', '--color-surface-rgb'),
        muted: withAlpha('--color-muted', '--color-muted-rgb')
      },
      borderRadius: {
        DEFAULT: 'var(--radius-base)',
        card: 'var(--radius-card)'
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)'
      },
      fontFamily: {
        sans: 'var(--font-family-base)'
      }
    }
  },
  plugins: []
};
