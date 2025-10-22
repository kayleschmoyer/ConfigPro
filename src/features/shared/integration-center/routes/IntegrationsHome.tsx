import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../../../shared/ui/Button';
import { useConnectors } from '../hooks/useConnectors';
import { useSyncJobs } from '../hooks/useSyncJobs';
import { useWebhooks } from '../hooks/useWebhooks';

const actions = [
  { label: 'Add Connector', description: 'OAuth, service accounts and API keys', to: 'connectors' },
  { label: 'Manage API Keys', description: 'Create, rotate and revoke access', to: 'api-keys' },
  { label: 'Set Webhooks', description: 'Endpoints, signing and retries', to: 'webhooks' },
  { label: 'View Syncs', description: 'Schedules, backfills and runs', to: 'sync-jobs' },
  { label: 'View Logs', description: 'Filter, export and replay events', to: 'logs' },
  { label: 'Settings', description: 'IP allowlist, policies and retention', to: 'settings' }
];

export function IntegrationsHome() {
  const navigate = useNavigate();
  const { summary: connectorSummary } = useConnectors();
  const { summary: jobsSummary } = useSyncJobs();
  const { summary: webhookSummary } = useWebhooks();

  return (
    <div className="space-y-10">
      <motion.section
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden rounded-4xl border border-primary/30 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-10 text-foreground shadow-2xl shadow-primary/20"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.4em] text-primary">ConfigPro</p>
            <h2 className="mt-4 text-4xl font-semibold text-foreground">Integration Center</h2>
            <p className="mt-4 max-w-xl text-base text-foreground/80">
              One secure command center to control connectors, secrets and sync pipelines. Visibility meets velocity.
            </p>
          </div>
          <div className="rounded-3xl bg-background/60 p-5 text-sm text-muted">
            <p className="text-xs uppercase tracking-[0.3em] text-muted/70">Smart cues</p>
            <ul className="mt-3 space-y-1">
              <li>{connectorSummary.active} active connectors</li>
              <li>{jobsSummary.failing} failing jobs • {jobsSummary.running} running</li>
              <li>{webhookSummary.disabled} webhook disabled</li>
            </ul>
          </div>
        </div>
      </motion.section>
      <section className="grid gap-4 md:grid-cols-3">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => navigate(action.to)}
            className="group flex h-full flex-col justify-between rounded-3xl border border-border/60 bg-surface/70 p-6 text-left shadow-lg shadow-primary/10 transition hover:border-primary/50 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <div>
              <h3 className="text-lg font-semibold text-foreground">{action.label}</h3>
              <p className="mt-2 text-sm text-muted">{action.description}</p>
            </div>
            <Button variant="ghost" className="mt-6 self-start">
              Go →
            </Button>
          </button>
        ))}
      </section>
    </div>
  );
}
