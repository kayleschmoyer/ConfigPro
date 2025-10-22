import { useCallback, useMemo, useState } from 'react';
import type { WebhookEndpoint } from '../lib/types';
import { formatRelative } from '../lib/format';
import { buildSamplePayload, buildSignature, verifySignature, webhookTemplates } from '../lib/webhooks';

const initial: WebhookEndpoint[] = [
  {
    id: 'whk-1',
    url: 'https://hooks.configpro.dev/invoices',
    description: 'Invoice sync handler',
    environment: 'PROD',
    signing: { algo: 'HMAC_SHA256', secretPrefix: 'sk_live_', rotatedAt: new Date().toISOString() },
    enabled: true,
    version: '2024-01'
  },
  {
    id: 'whk-2',
    url: 'https://hooks.configpro.dev/test',
    description: 'Sandbox listener',
    environment: 'SANDBOX',
    signing: { algo: 'HMAC_SHA256', secretPrefix: 'sk_test_', rotatedAt: new Date().toISOString() },
    enabled: false,
    version: '2023-11'
  }
];

export function useWebhooks() {
  const [endpoints, setEndpoints] = useState(initial);
  const [testResult, setTestResult] = useState<{
    payload: string;
    headers: Record<string, string>;
    verification: { valid: boolean; reason?: string };
  } | null>(null);

  const createEndpoint = useCallback((payload: Omit<WebhookEndpoint, 'id'>) => {
    const endpoint: WebhookEndpoint = { ...payload, id: `whk-${Date.now()}` };
    setEndpoints((list) => [endpoint, ...list]);
    return endpoint;
  }, []);

  const updateEndpoint = useCallback((id: string, patch: Partial<WebhookEndpoint>) => {
    setEndpoints((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const deleteEndpoint = useCallback((id: string) => {
    setEndpoints((list) => list.filter((item) => item.id !== id));
  }, []);

  const runTest = useCallback(async (id: string, templateId: string, secret: string) => {
    const payload = JSON.stringify(buildSamplePayload(templateId), null, 2);
    const timestamp = Date.now();
    const { headers } = await buildSignature(payload, secret, timestamp);
    const verification = await verifySignature(payload, secret, headers);
    setTestResult({ payload, headers, verification });
  }, []);

  const summary = useMemo(() => {
    const active = endpoints.filter((endpoint) => endpoint.enabled).length;
    const disabled = endpoints.length - active;
    return { active, disabled };
  }, [endpoints]);

  const enriched = useMemo(
    () =>
      endpoints.map((endpoint) => ({
        ...endpoint,
        rotatedRelative: formatRelative(endpoint.signing.rotatedAt)
      })),
    [endpoints]
  );

  return {
    endpoints: enriched,
    summary,
    createEndpoint,
    updateEndpoint,
    deleteEndpoint,
    runTest,
    testResult,
    webhookTemplates
  };
}
