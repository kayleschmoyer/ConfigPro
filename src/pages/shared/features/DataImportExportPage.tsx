import {
  csvImportMappings,
  excelImportMappings,
  importValidators,
  sampleImportFiles,
} from './import.mappings';

const mappingGroups = [
  {
    id: 'csv',
    title: 'CSV import blueprints',
    description:
      'Lean CSV layouts built for rapid iteration and quick validation when onboarding teams to ConfigPro.',
    items: csvImportMappings,
  },
  {
    id: 'excel',
    title: 'Excel workbooks',
    description:
      'Workbook templates with tab-aware logic, approvals, and richer formulas for enterprise scale imports.',
    items: excelImportMappings,
  },
];

export const DataImportExportPage = () => {
  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Shared platform</p>
        <h1 className="text-3xl font-semibold text-foreground">Data import &amp; export</h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Bring critical catalog, pricing, and customer data into ConfigPro with guided mapping kits, validators, and
          sample files that accelerate adoption. Equip operations and revenue teams with trustworthy loading patterns
          before integrations are live.
        </p>
      </header>

      <section aria-labelledby="import-mappings" className="space-y-6">
        <header className="space-y-1">
          <h2 id="import-mappings" className="text-xl font-semibold text-foreground">
            Import mapping catalog
          </h2>
          <p className="text-sm text-muted-foreground">
            Reusable field mappings shaped by the shared data model ensure downstream systems can rely on consistent
            semantics regardless of source file format.
          </p>
        </header>

        <div className="space-y-10">
          {mappingGroups.map((group) => (
            <section key={group.id} aria-labelledby={`${group.id}-mappings`} className="space-y-4">
              <header className="space-y-1">
                <h3 id={`${group.id}-mappings`} className="text-lg font-semibold text-foreground">
                  {group.title}
                </h3>
                <p className="text-sm text-muted-foreground">{group.description}</p>
              </header>

              <div className="grid gap-6 lg:grid-cols-2">
                {group.items.map((mapping) => (
                  <article
                    key={mapping.id}
                    className="flex h-full flex-col rounded-lg border border-border bg-card p-6 shadow-sm"
                  >
                    <header className="space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <h4 className="text-base font-semibold text-foreground">{mapping.name}</h4>
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
                          {mapping.format}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{mapping.description}</p>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Primary object: <span className="font-medium text-foreground">{mapping.object}</span>
                      </p>
                    </header>

                    <div className="mt-4 space-y-3">
                      <h5 className="text-sm font-semibold text-foreground">Field mappings</h5>
                      <ul className="space-y-3 text-sm text-muted-foreground">
                        {mapping.fields.map((field) => (
                          <li key={`${mapping.id}-${field.column}`} className="space-y-1 rounded-md bg-muted/40 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-medium text-foreground">{field.column}</span>
                              <span className="text-xs uppercase tracking-wide text-muted-foreground">
                                {field.required ? 'Required' : 'Optional'}
                              </span>
                            </div>
                            <p>
                              Maps to <span className="font-medium text-foreground">{field.targetField}</span>
                              {field.notes ? ` — ${field.notes}` : ''}
                            </p>
                            <p className="text-xs text-muted-foreground/80">
                              Validators: {field.validators.join(', ')}
                              {field.example ? ` • Example: ${field.example}` : ''}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-6 space-y-2">
                      <h5 className="text-sm font-semibold text-foreground">Transformation notes</h5>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {mapping.transformationNotes.map((note) => (
                          <li key={note} className="flex gap-2">
                            <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section aria-labelledby="import-validators" className="space-y-6">
        <header className="space-y-1">
          <h2 id="import-validators" className="text-xl font-semibold text-foreground">
            Validator coverage
          </h2>
          <p className="text-sm text-muted-foreground">
            These checks run before data is persisted so teams can resolve issues before they impact downstream
            workflows.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {importValidators.map((validator) => (
            <article key={validator.id} className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground">{validator.title}</h3>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                    validator.severity === 'error'
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-amber-200/30 text-amber-700'
                  }`}
                >
                  {validator.severity}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{validator.description}</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {validator.scenarios.map((scenario) => (
                  <li key={scenario} className="flex gap-2">
                    <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{scenario}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="sample-files" className="space-y-6">
        <header className="space-y-1">
          <h2 id="sample-files" className="text-xl font-semibold text-foreground">
            Sample files &amp; enablement kits
          </h2>
          <p className="text-sm text-muted-foreground">
            Share these curated files with field teams so they can explore mappings, formulas, and validator behaviour
            without touching production data.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-3">
          {sampleImportFiles.map((sample) => (
            <article key={sample.id} className="flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-sm">
              <header className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold text-foreground">{sample.name}</h3>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
                    {sample.format}
                  </span>
                </div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Uses mapping: <span className="font-medium text-foreground">{sample.mappingId}</span>
                </p>
                <p className="text-sm text-muted-foreground">{sample.summary}</p>
              </header>

              <div className="mt-4 space-y-3">
                <p className="text-sm font-medium text-foreground">Use case</p>
                <p className="text-sm text-muted-foreground">{sample.useCase}</p>
              </div>

              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium text-foreground">What&apos;s inside</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {sample.highlights.map((highlight) => (
                    <li key={highlight} className="flex gap-2">
                      <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};
