import { Fragment } from 'react';

import { documentBrandingGuidelines, documentTemplatePlaceholders, documentTemplates } from './documentTemplates.data';

export const DocumentsAndBrandingPage = () => {
  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Shared platform</p>
        <h1 className="text-3xl font-semibold text-foreground">Documents &amp; Branding System</h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Reusable templates that power ConfigPro quotes, invoices, and receipts. Pair the HTML
          blueprints with our Handlebars helpers to deliver branded documents across PDF exports,
          transactional email, and the customer portal without sacrificing consistency.
        </p>
      </header>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Branding directives</h2>
          <p className="text-sm text-muted-foreground">
            Guardrails for typography, spacing, and accessibility that keep every financial artefact
            unmistakably ConfigPro.
          </p>
        </header>

        <div className="grid gap-4 lg:grid-cols-2">
          {documentBrandingGuidelines.map((guideline) => (
            <article
              key={guideline.id}
              className="flex h-full flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm"
            >
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">{guideline.title}</h3>
                <p className="text-sm text-muted-foreground">{guideline.summary}</p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  System tokens
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {guideline.tokens.map((token) => (
                    <li key={token.name} className="rounded-md border border-dashed border-border p-3">
                      <p className="font-medium text-foreground">{token.name}</p>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground/80">
                        {token.usage}
                      </p>
                      <p className="mt-1">{token.guidance}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Best practices
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {guideline.bestPractices.map((practice) => (
                    <li key={practice} className="flex items-start gap-2">
                      <span aria-hidden className="mt-1 text-primary">•</span>
                      <span>{practice}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Document templates</h2>
          <p className="text-sm text-muted-foreground">
            HTML scaffolds ready for the document service. Use alongside shared helpers for currency,
            dates, and localized numbers.
          </p>
        </header>

        <div className="space-y-10">
          {documentTemplates.map((template) => (
            <article
              key={template.id}
              className="space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm"
            >
              <header className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-xl font-semibold text-foreground">{template.title}</h3>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {template.id}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{template.summary}</p>
              </header>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Recommended use
                  </p>
                  <ul className="space-y-1">
                    {template.metadata.recommendedUse.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span aria-hidden className="mt-1 text-primary">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Delivery channels
                  </p>
                  <ul className="space-y-1">
                    {template.metadata.deliveryChannels.map((channel) => (
                      <li key={channel} className="flex items-start gap-2">
                        <span aria-hidden className="mt-1 text-primary">•</span>
                        <span>{channel}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Brand note
                  </p>
                  <p>{template.metadata.brandNotes}</p>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Handlebars &amp; HTML blueprint
                </p>
                <div className="overflow-hidden rounded-md border border-border bg-muted/40">
                  <pre className="max-h-96 overflow-x-auto overflow-y-auto p-4 text-xs leading-relaxed text-muted-foreground">
                    <code>{template.htmlTemplate}</code>
                  </pre>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Placeholder reference
                </p>
                <ul className="grid gap-3 md:grid-cols-2">
                  {documentTemplatePlaceholders
                    .filter((placeholder) => placeholder.appliesTo.includes(template.id))
                    .map((placeholder) => (
                      <li key={`${template.id}-${placeholder.token}`} className="space-y-2 rounded-md border border-border bg-background p-4">
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">{placeholder.label}</p>
                          <p className="text-xs font-mono text-muted-foreground">{placeholder.token}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{placeholder.description}</p>
                        <p className="text-xs text-muted-foreground/80">
                          <span className="font-semibold text-foreground">Example:</span> {placeholder.example}
                        </p>
                      </li>
                    ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Global placeholder catalogue</h2>
          <p className="text-sm text-muted-foreground">
            Quick lookup for tokens that appear across multiple document types. Reference during
            schema design or when adding helpers.
          </p>
        </header>

        <div className="overflow-hidden rounded-lg border border-border">
          <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-4 md:divide-x md:divide-y-0">
            <div className="hidden bg-muted/60 p-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:block">
              Token
            </div>
            <div className="hidden bg-muted/60 p-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:block">
              Label
            </div>
            <div className="hidden bg-muted/60 p-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:block">
              Applies to
            </div>
            <div className="hidden bg-muted/60 p-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:block">
              Example
            </div>

            {documentTemplatePlaceholders.map((placeholder) => (
              <Fragment key={placeholder.token}>
                <div className="p-4 text-xs font-mono text-muted-foreground">{placeholder.token}</div>
                <div className="p-4 text-sm text-foreground">{placeholder.label}</div>
                <div className="p-4 text-sm text-muted-foreground">
                  {placeholder.appliesTo.map((item) => item.toUpperCase()).join(', ')}
                </div>
                <div className="p-4 text-sm text-muted-foreground">{placeholder.example}</div>
              </Fragment>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default DocumentsAndBrandingPage;
