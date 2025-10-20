import { brandColorTokens, brandLogos, receiptBrandingGuidelines } from './branding.data';

export const BrandingPage = () => {
  return (
    <div className="space-y-12">
      <header className="space-y-4">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Shared platform</p>
        <h1 className="text-3xl font-semibold text-foreground">Brand Identity Kit</h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Logos, tokens, and document scaffolds that guarantee ConfigPro shows up with the same
          energy across product, billing exports, and transactional email. Pair these assets with
          the receipt header/footer snippets to keep every channel aligned.
        </p>
      </header>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Logo system</h2>
          <p className="text-sm text-muted-foreground">
            Lockups and glyphs with guardrails on minimum sizing, spacing, and usage. Embed the
            asset URLs or re-export within your preferred design tooling.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {brandLogos.map((logo) => (
            <article
              key={logo.id}
              className="flex h-full flex-col gap-5 rounded-lg border border-border bg-card p-6 shadow-sm"
            >
              <div
                className="flex h-40 items-center justify-center rounded-md border border-dashed border-border"
                style={{ background: logo.preview.background }}
              >
                <span className="text-3xl font-semibold" style={{ color: logo.preview.foreground }}>
                  {logo.preview.text}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-foreground">{logo.title}</h3>
                <p className="text-sm text-muted-foreground">{logo.summary}</p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground/80">Spacing</p>
                <p className="text-sm text-muted-foreground">{logo.safeArea}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Usage
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {logo.usage.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span aria-hidden className="mt-1 text-primary">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {logo.assets.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Asset links
                  </p>
                  <ul className="space-y-1 text-sm">
                    {logo.assets.map((asset) => (
                      <li key={`${logo.id}-${asset.label}`}>
                        <a
                          href={asset.url}
                          className="inline-flex items-center gap-1 text-primary transition hover:text-primary/80"
                        >
                          {asset.label}
                          <span aria-hidden>→</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Brand color tokens</h2>
          <p className="text-sm text-muted-foreground">
            The definitive palette for ConfigPro product, marketing, and transactional artefacts.
            Reference tokens in CSS variables or theme objects so engineering and design stay in
            lockstep.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {brandColorTokens.map((color) => (
            <article
              key={color.id}
              className="flex h-full flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{color.token}</p>
                  <h3 className="text-xl font-semibold text-foreground">{color.name}</h3>
                  <p className="text-sm text-muted-foreground">{color.hex}</p>
                </div>
                <div
                  className="h-16 w-16 shrink-0 rounded-md border border-border"
                  style={{ background: color.hex }}
                />
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                  Usage guidance
                </p>
                <ul className="space-y-1">
                  {color.usage.map((item) => (
                    <li key={`${color.id}-${item}`} className="flex items-start gap-2">
                      <span aria-hidden className="mt-1 text-primary">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-md border border-dashed border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">On-color</span>
                  <span>{color.onHex}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Contrast on white</span>
                  <span>{color.contrastOnWhite}</span>
                </div>
                <div
                  className="mt-3 rounded-md px-3 py-2 text-sm font-semibold"
                  style={{ background: color.hex, color: color.onHex }}
                >
                  Sample CTA
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <header className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">Receipt header &amp; footer</h2>
          <p className="text-sm text-muted-foreground">
            Drop-in scaffolds for ConfigPro receipts. Use these snippets to align PDF templates,
            MJML email renders, and in-product previews.
          </p>
        </header>

        <div className="space-y-6">
          {receiptBrandingGuidelines.map((guideline) => (
            <article
              key={guideline.id}
              className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm"
            >
              <header className="space-y-2">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-xl font-semibold text-foreground">{guideline.title}</h3>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {guideline.tokens.length} tokens
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{guideline.summary}</p>
              </header>

              <div className="space-y-3 text-sm text-muted-foreground">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                  Checklist
                </p>
                <ul className="space-y-1">
                  {guideline.checklist.map((item) => (
                    <li key={`${guideline.id}-${item}`} className="flex items-start gap-2">
                      <span aria-hidden className="mt-1 text-primary">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                  Token dependencies
                </p>
                <div className="flex flex-wrap gap-2">
                  {guideline.tokens.map((token) => (
                    <span
                      key={`${guideline.id}-${token}`}
                      className="inline-flex items-center rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground"
                    >
                      {token}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                  Reference snippet
                </p>
                <div className="overflow-hidden rounded-md border border-border bg-muted/40">
                  <pre className="max-h-96 overflow-x-auto overflow-y-auto p-4 text-xs leading-relaxed text-muted-foreground">
                    <code>{guideline.codeSample}</code>
                  </pre>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
