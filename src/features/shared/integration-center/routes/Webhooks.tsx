import { useWebhooks } from '../hooks/useWebhooks';
import { WebhookEditor } from '../components/WebhookEditor';
import { WebhookTestPanel } from '../components/WebhookTestPanel';

export function WebhooksRoute() {
  const { endpoints, summary, createEndpoint, updateEndpoint, deleteEndpoint, runTest, testResult, webhookTemplates } =
    useWebhooks();

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-xl font-semibold text-foreground">Webhooks</h2>
        <p className="text-sm text-muted">Manage endpoints, signing secrets, retries and test payloads.</p>
      </header>
      <WebhookEditor
        endpoints={endpoints}
        summary={summary}
        onCreate={createEndpoint}
        onUpdate={updateEndpoint}
        onDelete={deleteEndpoint}
      />
      <WebhookTestPanel endpoints={endpoints} templates={webhookTemplates} onRunTest={runTest} result={testResult} />
    </div>
  );
}
