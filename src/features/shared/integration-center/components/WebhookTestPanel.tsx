import { useState } from 'react';
import { Button } from '../../../../shared/ui/Button';
import { Select } from '../../../../shared/ui/Select';
import { cn } from '../../../../lib/cn';
import type { WebhookEndpoint } from '../lib/types';

interface WebhookTestPanelProps {
  endpoints: Array<WebhookEndpoint & { rotatedRelative: string }>;
  templates: Array<{ id: string; description?: string; url: string }>;
  onRunTest: (endpointId: string, templateId: string, secret: string) => void;
  result: {
    payload: string;
    headers: Record<string, string>;
    verification: { valid: boolean; reason?: string };
  } | null;
}

export function WebhookTestPanel({ endpoints, templates, onRunTest, result }: WebhookTestPanelProps) {
  const [endpointId, setEndpointId] = useState(endpoints[0]?.id ?? '');
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? '');
  const [secret, setSecret] = useState('sh_test_123456');

  const handleTest = () => {
    if (!endpointId || !templateId) return;
    onRunTest(endpointId, templateId, secret);
  };

  return (
    <section className="space-y-5 rounded-3xl border border-border/60 bg-surface/70 p-6 shadow-lg shadow-primary/5">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Test delivery</h3>
        <p className="text-sm text-muted">Fire sample events with real signature headers. Secrets never persist.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Select label="Endpoint" value={endpointId} onChange={(event) => setEndpointId(event.target.value)}>
          {endpoints.map((endpoint) => (
            <option key={endpoint.id} value={endpoint.id}>
              {endpoint.url}
            </option>
          ))}
        </Select>
        <Select label="Payload" value={templateId} onChange={(event) => setTemplateId(event.target.value)}>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.description ?? template.id}
            </option>
          ))}
        </Select>
        <label className="flex flex-col gap-2 text-sm font-medium text-muted">
          <span>Signing secret</span>
          <textarea
            value={secret}
            onChange={(event) => setSecret(event.target.value)}
            rows={3}
            className={cn(
              'rounded-3xl border border-surface/60 bg-surface/80 p-4 text-sm text-foreground shadow-inner transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/60'
            )}
          />
          <span className="text-xs text-muted/80">We sign request payload + timestamp.</span>
        </label>
      </div>
      <Button onClick={handleTest} className="ml-auto block">
        Send test event
      </Button>
      {result && (
        <div className="grid gap-4 rounded-3xl border border-primary/40 bg-primary/5 p-4 text-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Payload</p>
            <pre className="mt-2 max-h-48 overflow-auto rounded-2xl bg-surface/80 p-4 text-xs text-foreground/80">
              {result.payload}
            </pre>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Headers</p>
            <pre className="mt-2 overflow-auto rounded-2xl bg-surface/80 p-4 text-xs text-foreground/80">
              {JSON.stringify(result.headers, null, 2)}
            </pre>
          </div>
          <div className="text-sm text-foreground">
            Verification: {result.verification.valid ? 'VALID' : `FAILED — ${result.verification.reason ?? ''}`}
          </div>
        </div>
      )}
    </section>
  );
}
