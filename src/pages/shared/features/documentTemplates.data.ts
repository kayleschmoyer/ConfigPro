export type DocumentTemplateIdentifier = 'quote' | 'invoice' | 'receipt';

export interface DocumentTemplateMetadata {
  deliveryChannels: string[];
  recommendedUse: string[];
  brandNotes: string;
}

export interface DocumentTemplate {
  id: DocumentTemplateIdentifier;
  title: string;
  summary: string;
  htmlTemplate: string;
  metadata: DocumentTemplateMetadata;
}

export interface DocumentTemplatePlaceholder {
  token: string;
  label: string;
  appliesTo: DocumentTemplateIdentifier[];
  description: string;
  example: string;
}

export interface DocumentBrandingGuideline {
  id: string;
  title: string;
  summary: string;
  tokens: {
    name: string;
    usage: string;
    guidance: string;
  }[];
  bestPractices: string[];
}

export const documentTemplates: DocumentTemplate[] = [
  {
    id: 'quote',
    title: 'ConfigPro Sales Quote',
    summary:
      'Baseline template for presenting configurable service packages, pricing assumptions, and acceptance windows to prospects.',
    htmlTemplate: String.raw`<section class="cp-document cp-document--quote">
  <header class="cp-document__header">
    <img class="cp-document__logo" src="{{organization.logoUrl}}" alt="{{organization.name}} logo" />
    <div>
      <h1>{{organization.name}}</h1>
      <p>{{organization.tagline}}</p>
    </div>
    <div class="cp-document__meta">
      <p><strong>Quote #</strong> {{document.number}}</p>
      <p><strong>Issued</strong> {{document.issueDate}}</p>
      <p><strong>Valid Until</strong> {{document.validUntil}}</p>
    </div>
  </header>

  <section class="cp-document__parties">
    <div>
      <h2>Prepared for</h2>
      <p>{{client.company}}</p>
      <p>{{client.contactName}}</p>
      <p>{{client.email}}</p>
    </div>
    <div>
      <h2>Prepared by</h2>
      <p>{{organization.quoteOwner}}</p>
      <p>{{organization.email}}</p>
      <p>{{organization.phone}}</p>
    </div>
  </section>

  <table class="cp-document__line-items">
    <thead>
      <tr>
        <th>Description</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th>Subtotal</th>
      </tr>
    </thead>
    <tbody>
      {{#each lineItems}}
        <tr>
          <td>{{name}}<br /><span class="muted">{{summary}}</span></td>
          <td>{{quantity}}</td>
          <td>{{currency unitPrice}}</td>
          <td>{{currency subtotal}}</td>
        </tr>
      {{/each}}
    </tbody>
  </table>

  <section class="cp-document__totals">
    <p><span>Subtotal</span><span>{{currency totals.subtotal}}</span></p>
    <p><span>Discounts</span><span>{{currency totals.discounts}}</span></p>
    <p class="accent"><span>Investment</span><span>{{currency totals.total}}</span></p>
  </section>

  <section class="cp-document__terms">
    <h2>Acceptance</h2>
    <p>{{acceptance.instructions}}</p>
    <p class="muted">{{acceptance.terms}}</p>
    <div class="cp-document__signature">
      <p>Accepted by: _________________________</p>
      <p>Date: ________________________________</p>
    </div>
  </section>
</section>`,
    metadata: {
      deliveryChannels: ['PDF export', 'Email attachment', 'In-app share link'],
      recommendedUse: [
        'Bundle service catalog line items with optional upsell packages.',
        'Include discount modelling and expiry reminders to keep urgency visible.',
        'Pair with Configure-Price-Quote workflow automation for faster approvals.',
      ],
      brandNotes: 'Lean into accent color for totals and acceptance headers while keeping copy-dense sections muted for readability.',
    },
  },
  {
    id: 'invoice',
    title: 'ConfigPro Invoice',
    summary:
      'Official billing artifact aligning with finance integrations and downstream ERP exports.',
    htmlTemplate: String.raw`<section class="cp-document cp-document--invoice">
  <header class="cp-document__header">
    <div>
      <img class="cp-document__logo" src="{{organization.logoUrl}}" alt="{{organization.name}} logo" />
      <h1>Invoice</h1>
    </div>
    <div class="cp-document__meta">
      <p><strong>Invoice #</strong> {{document.number}}</p>
      <p><strong>PO #</strong> {{document.purchaseOrder}}</p>
      <p><strong>Issued</strong> {{document.issueDate}}</p>
      <p><strong>Due</strong> {{document.dueDate}}</p>
    </div>
  </header>

  <section class="cp-document__parties">
    <div>
      <h2>Bill to</h2>
      <p>{{client.company}}</p>
      <p>{{client.billingAddress.street}}</p>
      <p>{{client.billingAddress.city}}, {{client.billingAddress.region}} {{client.billingAddress.postalCode}}</p>
      <p>{{client.taxId}}</p>
    </div>
    <div>
      <h2>Remit to</h2>
      <p>{{organization.name}}</p>
      <p>{{organization.address.street}}</p>
      <p>{{organization.address.city}}, {{organization.address.region}} {{organization.address.postalCode}}</p>
      <p>{{organization.taxId}}</p>
    </div>
  </section>

  <table class="cp-document__line-items">
    <thead>
      <tr>
        <th>Description</th>
        <th>Qty</th>
        <th>Unit Price</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      {{#each lineItems}}
        <tr>
          <td>{{name}}<br /><span class="muted">{{servicePeriod}}</span></td>
          <td>{{quantity}}</td>
          <td>{{currency unitPrice}}</td>
          <td>{{currency amount}}</td>
        </tr>
      {{/each}}
    </tbody>
  </table>

  <section class="cp-document__totals">
    <p><span>Subtotal</span><span>{{currency totals.subtotal}}</span></p>
    <p><span>Tax</span><span>{{currency totals.tax}}</span></p>
    <p><span>Credits</span><span>{{currency totals.credits}}</span></p>
    <p class="accent"><span>Amount Due</span><span>{{currency totals.balanceDue}}</span></p>
  </section>

  <section class="cp-document__payment">
    <h2>Payment details</h2>
    <p>{{payment.instructions}}</p>
    <ul>
      {{#each payment.methods}}
        <li><strong>{{label}}:</strong> {{value}}</li>
      {{/each}}
    </ul>
  </section>

  <footer class="cp-document__footer">
    <p>{{organization.supportEmail}} • {{organization.supportPhone}}</p>
    <p class="muted">{{organization.footerNote}}</p>
  </footer>
</section>`,
    metadata: {
      deliveryChannels: ['PDF export', 'Email automation', 'Accounts receivable portal'],
      recommendedUse: [
        'Mirror ERP cost centres via custom Handlebars helpers on line items.',
        'Highlight balance due with accent badges for overdue logic.',
        'Embed payment rails and remittance references to reduce questions for finance.',
      ],
      brandNotes:
        'Keep totals right-aligned with strong contrast while body copy follows base neutral palette for accessibility.',
    },
  },
  {
    id: 'receipt',
    title: 'ConfigPro Payment Receipt',
    summary:
      'Customer-facing acknowledgement for completed payments across ConfigPro billing channels.',
    htmlTemplate: String.raw`<section class="cp-document cp-document--receipt">
  <header class="cp-document__header">
    <div>
      <img class="cp-document__logo" src="{{organization.logoUrl}}" alt="{{organization.name}} logo" />
      <h1>Payment Receipt</h1>
      <p>{{organization.tagline}}</p>
    </div>
    <div class="cp-document__meta">
      <p><strong>Receipt #</strong> {{document.number}}</p>
      <p><strong>Received</strong> {{document.receivedDate}}</p>
      <p><strong>Payment Method</strong> {{payment.method}}</p>
    </div>
  </header>

  <section class="cp-document__parties">
    <div>
      <h2>Customer</h2>
      <p>{{client.company}}</p>
      <p>{{client.contactName}}</p>
      <p>{{client.email}}</p>
    </div>
    <div>
      <h2>Reference</h2>
      <p>Invoice: {{payment.invoiceNumber}}</p>
      <p>Transaction ID: {{payment.transactionId}}</p>
    </div>
  </section>

  <section class="cp-document__totals cp-document__totals--receipt">
    <p><span>Amount Paid</span><span>{{currency totals.amountPaid}}</span></p>
    <p><span>Outstanding Balance</span><span>{{currency totals.remainingBalance}}</span></p>
  </section>

  <section class="cp-document__details">
    <h2>Payment breakdown</h2>
    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Amount</th>
        </tr>
      </thead>
      <tbody>
        {{#each payment.breakdown}}
          <tr>
            <td>{{label}}</td>
            <td>{{currency value}}</td>
          </tr>
        {{/each}}
      </tbody>
    </table>
    <p class="muted">{{organization.footerNote}}</p>
  </section>
</section>`,
    metadata: {
      deliveryChannels: ['Transactional email', 'Self-service portal download', 'SMS link to hosted page'],
      recommendedUse: [
        'Trigger from payment processor webhook to ensure instant acknowledgment.',
        'Surface outstanding balance for cross-sell or auto-enrolment in autopay.',
        'Keep layout compact for mobile viewing while maintaining brand hierarchy.',
      ],
      brandNotes: 'Use subtle neutrals with a single accent highlight on paid amounts to reinforce trust and clarity.',
    },
  },
];

export const documentTemplatePlaceholders: DocumentTemplatePlaceholder[] = [
  {
    token: '{{organization.name}}',
    label: 'Organization name',
    appliesTo: ['quote', 'invoice', 'receipt'],
    description: 'Legal or brand name that should match external registrations.',
    example: 'ConfigPro Workforce Systems',
  },
  {
    token: '{{organization.logoUrl}}',
    label: 'Logo asset',
    appliesTo: ['quote', 'invoice', 'receipt'],
    description: 'Hosted SVG/PNG that renders at high resolution across PDF and email outputs.',
    example: 'https://cdn.configpro.app/assets/logo.svg',
  },
  {
    token: '{{client.company}}',
    label: 'Client company',
    appliesTo: ['quote', 'invoice', 'receipt'],
    description: 'Customer organization receiving the document.',
    example: 'Northwind Marketplaces',
  },
  {
    token: '{{document.number}}',
    label: 'Document number',
    appliesTo: ['quote', 'invoice', 'receipt'],
    description: 'Unique identifier for audit trails and quick lookup inside ConfigPro.',
    example: 'INV-2024-1098',
  },
  {
    token: '{{document.issueDate}}',
    label: 'Issue date',
    appliesTo: ['quote', 'invoice'],
    description: 'Primary date for document issuance, shown in locale format.',
    example: 'May 22, 2024',
  },
  {
    token: '{{document.validUntil}}',
    label: 'Quote expiration',
    appliesTo: ['quote'],
    description: 'Communicates when pricing or configuration expires.',
    example: 'June 5, 2024',
  },
  {
    token: '{{document.dueDate}}',
    label: 'Invoice due date',
    appliesTo: ['invoice'],
    description: 'Required payment deadline, adjusted for customer terms.',
    example: 'Net 30 (June 21, 2024)',
  },
  {
    token: '{{totals.balanceDue}}',
    label: 'Balance due total',
    appliesTo: ['invoice'],
    description: 'Amount remaining after credits, discounts, and prior payments.',
    example: '$12,480.00',
  },
  {
    token: '{{totals.amountPaid}}',
    label: 'Amount paid',
    appliesTo: ['receipt'],
    description: 'Total payment applied to the reference invoice.',
    example: '$6,245.00',
  },
  {
    token: '{{#each lineItems}} ... {{/each}}',
    label: 'Line item loop',
    appliesTo: ['quote', 'invoice'],
    description: 'Iterates over configurable packages or services with quantity, price, and subtotal helpers.',
    example: '{{#each lineItems}}<tr><td>{{name}}</td><td>{{quantity}}</td><td>{{currency unitPrice}}</td><td>{{currency subtotal}}</td></tr>{{/each}}',
  },
  {
    token: '{{currency totals.total}}',
    label: 'Quote investment',
    appliesTo: ['quote'],
    description: 'Final quoted amount using the shared currency helper for localization.',
    example: '$18,350.00',
  },
  {
    token: '{{payment.methods}}',
    label: 'Payment method collection',
    appliesTo: ['invoice'],
    description: 'Array of label/value pairs for ACH, wire, or credit card payment instructions.',
    example: 'ACH • Routing 011000028 • Account 872349503',
  },
  {
    token: '{{payment.transactionId}}',
    label: 'Transaction identifier',
    appliesTo: ['receipt'],
    description: 'Processor reference needed for reconciliation research.',
    example: 'ch_3NQWjzLH1zGJm7',
  },
];

export const documentBrandingGuidelines: DocumentBrandingGuideline[] = [
  {
    id: 'visual-hierarchy',
    title: 'Visual hierarchy system',
    summary:
      'Establish consistent typography, spacing, and accent usage so finance artefacts feel unified across every channel.',
    tokens: [
      {
        name: 'Heading 1 / 32px',
        usage: 'Document titles (Quote, Invoice, Receipt).',
        guidance: 'Set in primary brand color (#2451FF) with 120% line height.',
      },
      {
        name: 'Body / 16px',
        usage: 'General copy, addresses, payment notes.',
        guidance: 'Use neutral 700 (#1F2933) with 160% line height for readability.',
      },
      {
        name: 'Caption / 13px',
        usage: 'Secondary hints, tagline, and muted support copy.',
        guidance: 'Render in neutral 500 (#6B7280) with uppercase tracking when used for labels.',
      },
    ],
    bestPractices: [
      'Reserve accent color for monetary totals, due dates, and acceptance actions.',
      'Maintain minimum 24px spacing between major sections (header, parties, totals).',
      'Keep payment details in a boxed section with background tint (#F3F4F6) for clarity.',
    ],
  },
  {
    id: 'brand-application',
    title: 'Brand application & accessibility',
    summary:
      'Ensure exported PDFs and responsive emails meet contrast and localization standards while preserving ConfigPro identity.',
    tokens: [
      {
        name: 'Logo safe area',
        usage: 'Header placement for PNG/SVG marks.',
        guidance: 'Provide 24px padding around the lockup and fallback alt text.',
      },
      {
        name: 'Accent border',
        usage: 'Section dividers and totals callouts.',
        guidance: '2px border using primary color or gradient for high-visibility totals.',
      },
      {
        name: 'Locale-aware helper',
        usage: 'Dates, currency, and numbering.',
        guidance: 'Use shared Handlebars helpers (currency, date, percentage) to mirror customer locale.',
      },
    ],
    bestPractices: [
      'Test PDF renderings against WCAG AA color contrast thresholds.',
      'Embed brand typefaces or provide fallbacks ("Inter", system sans-serif) for email clients.',
      'Deliver plain-text receipts alongside HTML to support screen readers.',
    ],
  },
];
