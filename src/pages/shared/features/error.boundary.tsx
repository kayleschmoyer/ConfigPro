import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow
} from '../../../shared/ui/Table';

type RecoveryCard = {
  id: string;
  title: string;
  description: string;
  cues: string[];
};

type Signal = {
  id: string;
  name: string;
  description: string;
  owner: string;
};

type PlaybookStep = {
  id: string;
  title: string;
  details: string;
};

const recoveryExperiences: RecoveryCard[] = [
  {
    id: 'inline',
    title: 'Inline reset',
    description:
      'Surface when the boundary surrounds a single module. Keeps the user in context and offers a retry without losing work.',
    cues: [
      'Show compact card with icon, summary, and retry action',
      'Preserve user input locally and confirm before clearing state',
      'Auto-dismiss when a retry succeeds so the flow feels resilient',
    ],
  },
  {
    id: 'page',
    title: 'Full page fallback',
    description:
      'Used for fatal rendering errors on primary routes. Provides a confident headline, human copy, and a navigation escape hatch.',
    cues: [
      'Match layout spacing of marketing / auth pages for familiarity',
      'Include contact and status page links for enterprise users',
      'Offer a contextual action (reload, go to dashboard) as the primary CTA',
    ],
  },
  {
    id: 'modal',
    title: 'Session blocking modal',
    description:
      'Appears when data corruption requires users to refresh before continuing. Coordinates with auto-logout timers.',
    cues: [
      'Lock the background with a translucent scrim to signal severity',
      'Display unique incident code tied to observability for faster support',
      'Force acknowledgement before closing so compliance audits capture intent',
    ],
  },
];

const observabilitySignals: Signal[] = [
  {
    id: 'fingerprint',
    name: 'Error fingerprint',
    description:
      'Stable identifier generated from stack + release metadata. Powers deduplicated rollups and SLA alerting.',
    owner: 'Platform Reliability',
  },
  {
    id: 'last-good-event',
    name: 'Last good interaction',
    description:
      'Captures the route, feature flag state, and active org/location when the user last interacted successfully.',
    owner: 'Product Analytics',
  },
  {
    id: 'client-environment',
    name: 'Client environment snapshot',
    description:
      'Browser, OS, SDK version, and network tier appended to error payloads for frontline support triage.',
    owner: 'Support Engineering',
  },
];

const recoveryPlaybook: PlaybookStep[] = [
  {
    id: 'acknowledge',
    title: 'Acknowledge incident',
    details:
      'Trigger a Slack webhook with the fingerprint, release channel, and tenant scope. Auto-open PagerDuty if three incidents occur in 15 minutes.',
  },
  {
    id: 'stabilise',
    title: 'Stabilise user experience',
    details:
      'Promote the full-page fallback if inline retries fail more than twice. Post status-page message when the blast radius crosses multiple tenants.',
  },
  {
    id: 'resolve',
    title: 'Resolve and communicate',
    details:
      'Deploy the patch, link the commit to the incident, and notify affected orgs with recovery details and compensating actions.',
  },
];

export const ErrorBoundaryPage = () => {
  return (
    <div className="space-y-12">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Shared platform</p>
        <h1 className="text-3xl font-semibold text-foreground">Runtime error boundary</h1>
        <p className="max-w-3xl text-base text-muted-foreground">
          Shared fallback experience used whenever a ConfigPro surface hits an unexpected runtime failure. Keeps users informed,
          protects data, and gives operations instant telemetry to triage.
        </p>
      </header>

      <section aria-labelledby="fallback-patterns" className="space-y-6">
        <header className="space-y-1">
          <h2 id="fallback-patterns" className="text-xl font-semibold text-foreground">
            Recovery experiences
          </h2>
          <p className="text-sm text-muted-foreground">
            Choose the interaction pattern that best matches the scope of the failure and the user&apos;s need to recover.
          </p>
        </header>

        <div className="grid gap-5 md:grid-cols-3">
          {recoveryExperiences.map((experience) => (
            <article
              key={experience.id}
              className="flex h-full flex-col gap-4 rounded-lg border border-border bg-card p-6 shadow-sm"
            >
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-foreground">{experience.title}</h3>
                <p className="text-sm text-muted-foreground">{experience.description}</p>
              </div>
              <ul className="space-y-2 text-xs text-muted-foreground">
                {experience.cues.map((cue) => (
                  <li key={cue} className="flex gap-2">
                    <span aria-hidden className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    <span>{cue}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="fallback-copy" className="space-y-4">
        <header className="space-y-1">
          <h2 id="fallback-copy" className="text-xl font-semibold text-foreground">
            Canonical copy blocks
          </h2>
          <p className="text-sm text-muted-foreground">
            Use tone that pairs accountability with practical next steps. Tailor the primary CTA to the surface.
          </p>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <article className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
            <h3 className="text-base font-semibold text-foreground">Primary message</h3>
            <p className="rounded-md bg-muted p-4 text-sm text-muted-foreground">
              <span className="block text-sm font-semibold text-foreground">We hit a snag loading this workspace.</span>
              Our engineers have been notified and are already investigating. Try reloading the page — your recent changes are saved.
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Primary CTA:</span>
              <span>Reload workspace</span>
              <span aria-hidden className="text-muted-foreground">•</span>
              <span className="font-semibold text-foreground">Secondary:</span>
              <span>Contact support</span>
            </div>
          </article>

          <article className="space-y-3 rounded-lg border border-border bg-card p-5 shadow-sm">
            <h3 className="text-base font-semibold text-foreground">Status footer</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <span className="font-semibold text-foreground">Incident code:</span> <code>CFG-RB-{`{fingerprint}`}</code>
              </li>
              <li>
                <span className="font-semibold text-foreground">Status page:</span>{' '}
                <Link
                  to="https://status.configpro.app"
                  className="text-primary underline-offset-2 hover:underline"
                >
                  status.configpro.app
                </Link>
              </li>
              <li>
                <span className="font-semibold text-foreground">Contact:</span> on-call@configpro.app
              </li>
            </ul>
          </article>
        </div>
      </section>

      <section aria-labelledby="observability" className="space-y-6">
        <header className="space-y-1">
          <h2 id="observability" className="text-xl font-semibold text-foreground">
            Observability payload
          </h2>
          <p className="text-sm text-muted-foreground">
            Structured fields automatically attached to every boundary capture so downstream systems stay aligned.
          </p>
        </header>

        <TableContainer>
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead scope="col">Signal</TableHead>
                <TableHead scope="col">Description</TableHead>
                <TableHead scope="col">Owner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {observabilitySignals.map((signal) => (
                <TableRow key={signal.id} className="bg-card">
                  <TableCell className="text-sm font-medium text-foreground">{signal.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{signal.description}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{signal.owner}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </section>

      <section aria-labelledby="playbook" className="space-y-6">
        <header className="space-y-1">
          <h2 id="playbook" className="text-xl font-semibold text-foreground">
            Incident response playbook
          </h2>
          <p className="text-sm text-muted-foreground">
            Step-by-step actions our on-call teams follow whenever the boundary fires for production tenants.
          </p>
        </header>

        <ol className="space-y-4">
          {recoveryPlaybook.map((step, index) => (
            <li key={step.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <div className="flex items-baseline justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">Step {index + 1}</p>
                  <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                </div>
                <span className="text-sm font-medium text-muted-foreground">SLA: {index === 0 ? 'Immediate' : index === 1 ? '15 minutes' : '60 minutes'}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{step.details}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
};

export default ErrorBoundaryPage;
