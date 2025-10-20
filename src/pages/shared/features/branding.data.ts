export interface BrandLogoAsset {
  label: string;
  url: string;
}

export interface BrandLogo {
  id: string;
  title: string;
  summary: string;
  preview: {
    background: string;
    foreground: string;
    text: string;
  };
  usage: string[];
  assets: BrandLogoAsset[];
  safeArea: string;
}

export interface BrandColorToken {
  id: string;
  name: string;
  hex: string;
  token: string;
  onHex: string;
  contrastOnWhite: string;
  usage: string[];
}

export interface ReceiptBrandingGuideline {
  id: string;
  title: string;
  summary: string;
  tokens: string[];
  checklist: string[];
  codeSample: string;
}

export const brandLogos: BrandLogo[] = [
  {
    id: 'primary-lockup',
    title: 'Primary lockup',
    summary:
      'Default ConfigPro wordmark for product surfaces, transactional email, and marketing exports.',
    preview: {
      background: '#F1F4FF',
      foreground: '#1C3FE3',
      text: 'ConfigPro',
    },
    usage: [
      'Maintain a minimum rendered width of 120px in responsive layouts and 24px in height for dense UI placements.',
      'Always pair with white or cool-grey backgrounds (#F7F9FC) and keep 16px safe padding on every side.',
      'Avoid drop shadows, outlines, or color manipulation that alters the blue gradient identity.',
    ],
    assets: [
      { label: 'SVG', url: 'https://cdn.configpro.app/brand/configpro-logo.svg' },
      { label: 'PNG @2x', url: 'https://cdn.configpro.app/brand/configpro-logo@2x.png' },
    ],
    safeArea: 'Use the height of the letter "C" to measure clear space around the lockup across all placements.',
  },
  {
    id: 'monochrome-lockup',
    title: 'Monochrome lockup',
    summary: 'Fallback treatment for embossing, invoices with strict color limits, or high-contrast placements.',
    preview: {
      background: '#111827',
      foreground: '#FFFFFF',
      text: 'ConfigPro',
    },
    usage: [
      'Deploy when color reproduction cannot be guaranteed such as dot-matrix printers or partner portals.',
      'Ensure contrast ratio remains 4.5:1 or higher when set against tinted or photographic backgrounds.',
      'Use alongside single-color iconography to maintain a balanced hierarchy.',
    ],
    assets: [
      { label: 'SVG', url: 'https://cdn.configpro.app/brand/configpro-logo-monochrome.svg' },
      { label: 'PNG', url: 'https://cdn.configpro.app/brand/configpro-logo-monochrome.png' },
    ],
    safeArea: 'Lockup requires 20px breathing room when paired with receipt metadata or legal copy.',
  },
  {
    id: 'glyph-mark',
    title: 'CP glyph mark',
    summary: 'Compact avatar used for favicons, mobile launchers, and watermark accents in receipts.',
    preview: {
      background: 'linear-gradient(135deg, #0C1B5E 0%, #2451FF 60%, #63A1FF 100%)',
      foreground: '#FFFFFF',
      text: 'CP',
    },
    usage: [
      'Reserve for spaces smaller than 48px square or when circular treatments are required.',
      'Always center within circles or rounded squares with 6px inset padding.',
      'Pair with monochrome lockup when presenting side-by-side brand moments.',
    ],
    assets: [
      { label: 'SVG', url: 'https://cdn.configpro.app/brand/configpro-glyph.svg' },
      { label: 'PNG', url: 'https://cdn.configpro.app/brand/configpro-glyph.png' },
    ],
    safeArea: 'Keep a minimum of 8px padding around the glyph when used as a badge or avatar.',
  },
];

export const brandColorTokens: BrandColorToken[] = [
  {
    id: 'primary',
    name: 'Aurora Blue',
    hex: '#2451FF',
    token: '--cp-color-primary',
    onHex: '#FFFFFF',
    contrastOnWhite: '6.7:1',
    usage: [
      'Primary buttons, focused states, document totals, and acceptance modals.',
      'Link highlights and branded dividers within product UI and emails.',
    ],
  },
  {
    id: 'accent',
    name: 'Spectrum Sky',
    hex: '#63A1FF',
    token: '--cp-color-accent',
    onHex: '#061044',
    contrastOnWhite: '3.1:1',
    usage: [
      'Charts, gradients, and non-critical callouts supporting the Aurora Blue token.',
      'Progress indicators, charts, and hovered states within receipts.',
    ],
  },
  {
    id: 'ink',
    name: 'Noir Ink',
    hex: '#111827',
    token: '--cp-color-ink',
    onHex: '#FFFFFF',
    contrastOnWhite: '12.8:1',
    usage: [
      'Body copy, headings, and dense metadata on invoices and receipts.',
      'Accessible text treatments over light tints and backgrounds.',
    ],
  },
  {
    id: 'muted',
    name: 'Slate Mist',
    hex: '#6B7280',
    token: '--cp-color-muted',
    onHex: '#FFFFFF',
    contrastOnWhite: '4.3:1',
    usage: [
      'Secondary labels, table borders, and disclaimers within transactional documents.',
      'Icon strokes and neutral backgrounds across internal tooling.',
    ],
  },
  {
    id: 'background',
    name: 'Cloud Base',
    hex: '#F7F9FC',
    token: '--cp-surface-background',
    onHex: '#111827',
    contrastOnWhite: '1.2:1',
    usage: [
      'Page backgrounds, card fills, and large layout containers for PDFs.',
      'Email wrappers that need a subtle separation from system-level navigation.',
    ],
  },
  {
    id: 'success',
    name: 'Verdant Pulse',
    hex: '#12B76A',
    token: '--cp-color-success',
    onHex: '#FFFFFF',
    contrastOnWhite: '2.6:1',
    usage: [
      'Paid status chips, confirmation banners, and accepted totals on receipts.',
      'Charts, success icons, and banner accents within the billing workspace.',
    ],
  },
];

export const receiptBrandingGuidelines: ReceiptBrandingGuideline[] = [
  {
    id: 'receipt-header',
    title: 'Receipt header contract',
    summary:
      'Applies to PDF and email receipts. Establishes the brand handshake before financial metadata and actions.',
    tokens: ['--cp-color-primary', '--cp-surface-background', '--cp-brand-logo'],
    checklist: [
      'Lockup or glyph anchored top-left with 24px padding above the document body.',
      'Organization metadata (legal name, EIN, support contact) stacked beneath the logo in Noir Ink (#111827).',
      'Receipt headline set in Aurora Blue with 120% line height and letter-spacing of 0.02em.',
      'Optional accent divider using Spectrum Sky gradient spanning the full width.',
    ],
    codeSample: `<header class="cp-receipt__header">
  <img src="{{organization.logoUrl}}" alt="{{organization.name}} logo" class="cp-receipt__logo" />
  <div class="cp-receipt__identity">
    <h1 class="cp-receipt__title">Payment receipt</h1>
    <p class="cp-receipt__meta">{{organization.legalName}} · EIN {{organization.taxId}}</p>
    <p class="cp-receipt__meta">Support {{organization.supportEmail}}</p>
  </div>
  <hr class="cp-receipt__divider" />
</header>`,
  },
  {
    id: 'receipt-footer',
    title: 'Receipt footer contract',
    summary: 'Closes the document with compliance and next-steps messaging.',
    tokens: ['--cp-color-muted', '--cp-color-ink', '--cp-color-primary'],
    checklist: [
      'Provide customer service contacts and legal entity statement in Slate Mist (#6B7280).',
      'Display payment identifier and timestamp with 14px font size and 20px line height.',
      'Include CTA link styled as primary text for account management or portal login.',
      'Embed compliance statement referencing terms of service and refund policy.',
    ],
    codeSample: `<footer class="cp-receipt__footer">
  <p class="cp-receipt__support">Questions? Email support@configpro.app or call +1-800-CONFIG.</p>
  <p class="cp-receipt__details">Payment #{{payment.reference}} · Processed {{payment.processedAt}}</p>
  <a class="cp-receipt__cta" href="{{customer.portalUrl}}">View in customer portal →</a>
  <p class="cp-receipt__legal">ConfigPro, Inc. · Terms apply · VAT may be reclaimed where eligible.</p>
</footer>`,
  },
  {
    id: 'document-tokens',
    title: 'Shared receipt token map',
    summary: 'Token contract for engineering teams wiring the receipt experience in React, Handlebars, or MJML.',
    tokens: ['--cp-color-primary', '--cp-color-accent', '--cp-color-muted', '--cp-surface-background'],
    checklist: [
      'Expose brand tokens through theme context or CSS variables for both web and PDF renderers.',
      'Mirror typography scale between React UI and PDF generation to prevent visual drift.',
      'Share receipt partials (header/footer) across invoices, quotes, and statements to maintain parity.',
      'Document fallbacks for high-contrast mode and printers that ignore background fills.',
    ],
    codeSample: `:root {
  --cp-color-primary: #2451FF;
  --cp-color-accent: #63A1FF;
  --cp-color-muted: #6B7280;
  --cp-color-ink: #111827;
  --cp-surface-background: #F7F9FC;
}

.cp-receipt__title {
  color: var(--cp-color-primary);
  font-weight: 600;
}

.cp-receipt__meta {
  color: var(--cp-color-ink);
  font-size: 0.875rem;
}

.cp-receipt__legal {
  color: var(--cp-color-muted);
}`,
  },
];
