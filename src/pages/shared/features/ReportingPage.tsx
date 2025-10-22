import { Card, CardDescription, CardTitle } from '@/shared/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/ui/Table';
import { reportingSearchIndex } from './search.config';

const savedReportCollections = [
  {
    id: 'executive-finance',
    name: 'Executive finance workspace',
    description:
      'Normalised P&L snapshots, cash movement indicators, and forecast variances tailored for revenue, finance, and leadership teams.',
    defaultFilters: ['Global roll-up', 'Multi-currency netting', 'Exclude sandbox organisations'],
    reports: [
      {
        title: 'Week-to-date revenue pulse',
        cadence: 'Daily · 06:00 UTC',
        audience: 'CFO, FP&A partners',
        highlights: [
          'Gross vs net revenue deltas by channel',
          'Discount leakage heat map by product family',
          'Top five variance drivers flagged by anomaly detection',
        ],
      },
      {
        title: 'Cash capture & settlement outlook',
        cadence: 'Every weekday · 14:00 UTC',
        audience: 'Treasury, Payments operations',
        highlights: [
          'Authorisation success trends and exception queues',
          'Upcoming payout batches grouped by provider',
          'Reserve balances with configurable alerting thresholds',
        ],
      },
    ],
  },
  {
    id: 'workforce-operations',
    name: 'Workforce operations cockpit',
    description:
      'Scheduling performance, coverage health, and exception remediation surfaced for operations leadership and frontline managers.',
    defaultFilters: ['Region: North America', 'Location tier: Flagship', 'Active scheduling programs only'],
    reports: [
      {
        title: 'Coverage adherence & variance',
        cadence: 'Hourly refresh',
        audience: 'Regional operations directors',
        highlights: [
          'Forecast vs actual labour variance by daypart',
          'Open compliance exceptions and ageing',
          'Top opportunity locations by productivity gap',
        ],
      },
      {
        title: 'Labour investment scorecard',
        cadence: 'Weekly · Mondays 12:00 local',
        audience: 'People partners, Finance business partners',
        highlights: [
          'Overtime exposure with blended cost impact',
          'Agency and contractor spend by market',
          'Hiring pipeline signals integrated from ATS',
        ],
      },
    ],
  },
  {
    id: 'customer-experience',
    name: 'Customer experience observability',
    description:
      'Retention, satisfaction, and resolution quality indicators connected across support tooling, surveys, and product signals.',
    defaultFilters: ['Account segment: Enterprise', 'Product surface: Web & Mobile'],
    reports: [
      {
        title: 'Experience health pulse',
        cadence: 'Nightly · 02:00 UTC',
        audience: 'CX leadership, Voice of customer council',
        highlights: [
          'Rolling 7-day NPS and CSAT trend with alert thresholds',
          'Contact drivers correlated with release calendar events',
          'Escalation backlog with SLA breach forecasts',
        ],
      },
      {
        title: 'Adoption & churn indicators',
        cadence: 'Weekly · Fridays 17:00 UTC',
        audience: 'Product operations, Lifecycle marketing',
        highlights: [
          'License activation and seat utilisation by cohort',
          'Early-warning churn signals aligned to account health',
          'Recommended playbooks surfaced for CSM follow-up',
        ],
      },
    ],
  },
];

const exportPlaybooks = [
  {
    id: 'snowflake-finance',
    destination: 'Snowflake finance mart',
    cadence: 'Hourly incremental sync with nightly compaction',
    ownership: 'Finance data engineering',
    payloads: [
      'Order, invoice, and settlement fact tables with soft-deletes',
      'Dimensional data for customer, catalog, and location hierarchies',
      'Ledger-ready tax breakdowns mapped to statutory codes',
    ],
    safeguards: [
      'Schema drift contract enforced via dbt tests',
      'Row-level watermarking with replay support',
      'Backfill orchestrations tracked in incident dashboard',
    ],
  },
  {
    id: 'bigquery-operations',
    destination: 'BigQuery operations sandbox',
    cadence: 'Every 30 minutes',
    ownership: 'Operations analytics guild',
    payloads: [
      'Scheduling coverage aggregates enriched with demand projections',
      'Exception queues, alerts, and acknowledgements for compliance reviews',
      'Labour cost exposures aligned to finance planning dimensions',
    ],
    safeguards: [
      'Row-level security mirrored from ConfigPro RBAC groups',
      'Automated load validation with fallbacks to warm storage',
      'Materialised views refreshed post load to reduce BI latency',
    ],
  },
  {
    id: 's3-customer-insights',
    destination: 'S3 customer insights lake',
    cadence: 'Nightly bulk export',
    ownership: 'Customer insights & lifecycle',
    payloads: [
      'Unified customer timelines with product usage instrumentation',
      'Survey responses, metadata, and calculated sentiment',
      'Support transcript embeddings for experimentation',
    ],
    safeguards: [
      'PII redaction policy executed during extraction',
      'Data retention enforcement with automated purge schedules',
      'Manifest tracking for consumption observability',
    ],
  },
];

export const ReportingPage = () => {
  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Shared platform</p>
        <h1 className="text-3xl font-semibold text-foreground">Reporting intelligence</h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Saved workspaces, governed exports, and search-ready datasets that standardise how ConfigPro tells
          the operating story. Curate these building blocks so teams answer questions faster without
          rebuilding plumbing.
        </p>
      </header>

      <section aria-labelledby="saved-reports" className="space-y-6">
        <header className="space-y-2">
          <h2 id="saved-reports" className="text-2xl font-semibold text-foreground">
            Saved reporting workspaces
          </h2>
          <p className="text-sm text-muted-foreground">
            Opinionated collections with default filters, schedules, and audiences. Use these as the
            reusable backbone for leadership reviews and frontline operations.
          </p>
        </header>

        <div className="grid gap-6 xl:grid-cols-3">
          {savedReportCollections.map((collection) => (
            <article
              key={collection.id}
              className="flex h-full flex-col gap-5 rounded-lg border border-border bg-card p-6 shadow-sm"
            >
              <div className="space-y-3">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-foreground">{collection.name}</h3>
                  <p className="text-sm text-muted-foreground">{collection.description}</p>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <span className="font-semibold uppercase tracking-wide text-muted-foreground/80">
                    Default filters
                  </span>
                  <p>{collection.defaultFilters.join(' · ')}</p>
                </div>
              </div>

              <div className="space-y-4">
                {collection.reports.map((report) => (
                  <div key={report.title} className="space-y-2 rounded-md border border-dashed border-border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{report.title}</p>
                        <p className="text-xs text-muted-foreground">{report.audience}</p>
                      </div>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {report.cadence}
                      </span>
                    </div>

                    <ul className="space-y-1 text-sm text-muted-foreground">
                      {report.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-start gap-2">
                          <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="exports" className="space-y-6">
        <header className="space-y-2">
          <h2 id="exports" className="text-2xl font-semibold text-foreground">
            Export &amp; data sharing playbooks
          </h2>
          <p className="text-sm text-muted-foreground">
            Governed data movements with clear ownership, cadence, and safeguards. Align stakeholders on
            how ConfigPro feeds downstream analytics, data science, and partner ecosystems.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-3">
          {exportPlaybooks.map((playbook) => (
            <article key={playbook.id} className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
              <header className="space-y-2">
                <div className="flex flex-col gap-1">
                  <h3 className="text-lg font-semibold text-foreground">{playbook.destination}</h3>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground/80">{playbook.cadence}</p>
                </div>
                <p className="text-sm text-muted-foreground">Owned by {playbook.ownership}</p>
              </header>

              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                    Payload coverage
                  </p>
                  <ul className="space-y-1">
                    {playbook.payloads.map((payload) => (
                      <li key={payload} className="flex items-start gap-2">
                        <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{payload}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/80">
                    Safeguards
                  </p>
                  <ul className="space-y-1">
                    {playbook.safeguards.map((safeguard) => (
                      <li key={safeguard} className="flex items-start gap-2">
                        <span aria-hidden className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{safeguard}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="search-index" className="space-y-6">
        <header className="space-y-2">
          <h2 id="search-index" className="text-2xl font-semibold text-foreground">
            Search indexable datasets
          </h2>
          <p className="text-sm text-muted-foreground">
            Reference map of fields included in the ConfigPro search index so product, analytics, and
            enablement teams know what context is available out-of-the-box.
          </p>
        </header>

        <div className="space-y-6">
          {reportingSearchIndex.map((entry) => (
            <Card key={entry.id} className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle>{entry.module}</CardTitle>
                  <CardDescription>{entry.description}</CardDescription>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground text-right">
                  <p className="font-semibold uppercase tracking-wide text-muted-foreground/80">Dataset</p>
                  <p className="font-mono text-foreground/80">{entry.dataset}</p>
                  <p>{entry.refreshCadence}</p>
                  <p>Owner: {entry.owner}</p>
                  <p>{entry.retention}</p>
                </div>
              </div>

              <TableContainer className="border border-dashed border-border">
                <Table>
                  <TableHeader className="bg-muted/60">
                    <TableRow>
                      <TableHead scope="col">Field</TableHead>
                      <TableHead scope="col">Classification</TableHead>
                      <TableHead scope="col">Description</TableHead>
                      <TableHead scope="col">Sources</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entry.indexableFields.map((field) => (
                      <TableRow key={field.id} className="align-top">
                        <TableCell>
                          <div className="space-y-1">
                            <p className="font-medium text-foreground">{field.label}</p>
                            {field.sampleValue ? (
                              <p className="text-xs font-mono text-muted-foreground">Sample: {field.sampleValue}</p>
                            ) : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs uppercase tracking-wide text-muted-foreground/80">
                          {field.classification}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{field.description}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {field.sources.join(', ')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ReportingPage;
