import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/Table';
import { useApiKeys } from '../hooks/useApiKeys';
import { SecretMasked } from './SecretMasked';
import { EnvBadge } from './EnvBadge';

const scopesOptions = ['payments:read', 'payments:write', 'invoices:read', 'webhooks:manage'];

export function ApiKeyEditor() {
  const { keys, createKey, rotateKey, revokeKey, revealMask, resetReveal } = useApiKeys();
  const [scopeSelection, setScopeSelection] = useState<string[]>(['payments:read']);
  const [expiresAt, setExpiresAt] = useState('');
  const [env, setEnv] = useState<'SANDBOX' | 'PROD'>('PROD');

  const handleCreate = () => {
    const mask = createKey(scopeSelection, expiresAt || undefined);
    resetForm();
    return mask;
  };

  const resetForm = () => {
    setScopeSelection(['payments:read']);
    setExpiresAt('');
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-border/60 bg-surface/70 p-6 shadow-lg shadow-primary/5">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Create access key</h3>
            <p className="text-sm text-muted">Keys are masked, copy immediately after reveal. Audit trails fire automatically.</p>
          </div>
          <EnvBadge environment={env} />
        </header>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Select
            label="Environment"
            value={env}
            onChange={(event) => setEnv(event.target.value as 'SANDBOX' | 'PROD')}
          >
            <option value="PROD">Production</option>
            <option value="SANDBOX">Sandbox</option>
          </Select>
          <Input
            type="date"
            label="Expiry"
            value={expiresAt}
            onChange={(event) => setExpiresAt(event.target.value)}
            helperText="Optional. Rotations run automatically after expiry."
          />
          <Select
            label="Add scope"
            value=""
            onChange={(event) => {
              const scope = event.target.value;
              if (!scope) return;
              setScopeSelection((list) => (list.includes(scope) ? list : [...list, scope]));
            }}
            helperText="Scopes enforce least privilege."
          >
            <option value="" disabled>
              Select scope
            </option>
            {scopesOptions.map((scope) => (
              <option key={scope} value={scope}>
                {scope}
              </option>
            ))}
          </Select>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-sm text-muted">
          {scopeSelection.map((scope) => (
            <button
              key={scope}
              type="button"
              onClick={() => setScopeSelection((list) => list.filter((item) => item !== scope))}
              className="rounded-full bg-primary/10 px-4 py-1 text-primary transition hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
            >
              {scope} ×
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={handleCreate}>Generate key</Button>
        </div>
        {revealMask && (
          <motion.div
            layout
            className="mt-6 rounded-3xl border border-primary/50 bg-primary/5 p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <SecretMasked secret={revealMask} label="New key" onReveal={resetReveal} />
          </motion.div>
        )}
      </section>
      <section className="rounded-3xl border border-border/60 bg-surface/70 p-6 shadow-lg shadow-primary/5">
        <header className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Existing keys</h3>
            <p className="text-sm text-muted">Rotate frequently and revoke unused keys. Copy tokens are redacted.</p>
          </div>
          <span className="text-xs uppercase tracking-[0.3em] text-muted">{keys.length} keys</span>
        </header>
        <div className="mt-6 overflow-hidden rounded-3xl border border-border/50">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prefix</TableHead>
                <TableHead>Scopes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {keys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-mono text-sm">{key.masked}</TableCell>
                  <TableCell className="max-w-xs text-xs text-muted">{key.scopes.join(', ')}</TableCell>
                  <TableCell>{key.status}</TableCell>
                  <TableCell>{key.createdAtRelative}</TableCell>
                  <TableCell>{key.expiresAtRelative}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => rotateKey(key.id)}>
                      Rotate
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => revokeKey(key.id)}>
                      Revoke
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
