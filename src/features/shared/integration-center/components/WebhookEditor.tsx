import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/Table';
import type { WebhookEndpoint } from '../lib/types';
import { EnvBadge } from './EnvBadge';

interface WebhookEditorProps {
  endpoints: Array<WebhookEndpoint & { rotatedRelative: string }>;
  summary: { active: number; disabled: number };
  onCreate: (payload: Omit<WebhookEndpoint, 'id'>) => void;
  onUpdate: (id: string, patch: Partial<WebhookEndpoint>) => void;
  onDelete: (id: string) => void;
}

export function WebhookEditor({ endpoints, summary, onCreate, onUpdate, onDelete }: WebhookEditorProps) {
  const [form, setForm] = useState<Omit<WebhookEndpoint, 'id'>>({
    url: '',
    description: '',
    environment: 'PROD',
    signing: { algo: 'HMAC_SHA256', secretPrefix: 'whsec_', rotatedAt: new Date().toISOString() },
    enabled: true,
    version: 'latest'
  });

  const handleSubmit = () => {
    if (!form.url) return;
    onCreate(form);
    setForm({
      url: '',
      description: '',
      environment: form.environment,
      signing: { ...form.signing, rotatedAt: new Date().toISOString() },
      enabled: true,
      version: 'latest'
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/60 bg-surface/70 p-6 shadow-lg shadow-primary/5">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Create endpoint</h3>
            <p className="text-sm text-muted">Endpoints sign every delivery, rotate secrets often.</p>
          </div>
          <EnvBadge environment={form.environment} />
        </header>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Input
            label="Destination URL"
            value={form.url}
            onChange={(event) => setForm((state) => ({ ...state, url: event.target.value }))}
            placeholder="https://api.yourservice.dev/webhooks"
          />
          <Input
            label="Description"
            value={form.description ?? ''}
            onChange={(event) => setForm((state) => ({ ...state, description: event.target.value }))}
            placeholder="Invoice sync listener"
          />
          <Select
            label="Environment"
            value={form.environment}
            onChange={(event) => setForm((state) => ({ ...state, environment: event.target.value as WebhookEndpoint['environment'] }))}
          >
            <option value="PROD">Production</option>
            <option value="SANDBOX">Sandbox</option>
          </Select>
          <Input
            label="Signing secret prefix"
            value={form.signing.secretPrefix}
            onChange={(event) =>
              setForm((state) => ({ ...state, signing: { ...state.signing, secretPrefix: event.target.value } }))
            }
          />
          <Input
            label="Version"
            value={form.version ?? ''}
            onChange={(event) => setForm((state) => ({ ...state, version: event.target.value }))}
            placeholder="2024-01"
          />
          <Select
            label="Status"
            value={form.enabled ? 'enabled' : 'disabled'}
            onChange={(event) => setForm((state) => ({ ...state, enabled: event.target.value === 'enabled' }))}
          >
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </Select>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleSubmit}>Save endpoint</Button>
        </div>
      </section>
      <section className="rounded-3xl border border-border/60 bg-surface/70 p-6 shadow-lg shadow-primary/5">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Endpoints</h3>
            <p className="text-sm text-muted">{summary.active} active • {summary.disabled} disabled</p>
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-muted">{endpoints.length} total</span>
        </header>
        <div className="mt-6 overflow-hidden rounded-3xl border border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Environment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Secret</TableHead>
                <TableHead>Rotated</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {endpoints.map((endpoint) => (
                <TableRow key={endpoint.id}>
                  <TableCell className="max-w-[240px] truncate text-sm text-foreground/80">{endpoint.url}</TableCell>
                  <TableCell>
                    <EnvBadge environment={endpoint.environment} />
                  </TableCell>
                  <TableCell>{endpoint.enabled ? 'Enabled' : 'Disabled'}</TableCell>
                  <TableCell>{endpoint.version ?? '—'}</TableCell>
                  <TableCell>{endpoint.signing.secretPrefix}••••</TableCell>
                  <TableCell>{endpoint.rotatedRelative}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => onUpdate(endpoint.id, { enabled: !endpoint.enabled })}>
                      {endpoint.enabled ? 'Pause' : 'Resume'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => onDelete(endpoint.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
