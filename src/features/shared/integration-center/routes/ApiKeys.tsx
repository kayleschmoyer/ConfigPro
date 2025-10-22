import { ApiKeyEditor } from '../components/ApiKeyEditor';

export function ApiKeysRoute() {
  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-xl font-semibold text-foreground">API keys</h2>
        <p className="text-sm text-muted">Create scoped tokens, rotate secrets and audit access history.</p>
      </header>
      <ApiKeyEditor />
    </div>
  );
}
