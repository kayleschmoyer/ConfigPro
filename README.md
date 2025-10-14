# ConfigPro POS UI

ConfigPro is a modular, themeable point-of-sale experience built with React, Vite, TypeScript, Tailwind CSS, Radix UI, and shadcn-style primitives. The initial release focuses on the authentication surface while providing a flexible design system for future POS modules.

## Getting started

```bash
pnpm install
pnpm dev
```

The dev server launches the animated login experience with live theming via the top bar controls.

## Project structure

```
src/
  app/           Application shell, providers, and configuration
  components/    Atomic UI building blocks (ui, layout, elements)
  features/      Domain-specific modules (login, transactions, etc.)
  hooks/         Reusable React hooks
  lib/           Utilities (cn helper, formatting, etc.)
  pages/         Route-level pages
  router/        React Router configuration
  styles/        Tailwind and design tokens
```

## Theming

Tokens live in `src/app/config/theme.ts`. Use the top bar preset dropdown or extend `themePresets` with industry variations. Theme selections persist via `localStorage` and flow into Tailwind via CSS variables.

## Component generator

Create a new UI widget with:

```bash
pnpm create:component FancyWidget ui
```

The CLI scaffolds a typed component in the requested atomic bucket.
