import { useState } from 'react';
import { Button } from '../../../../shared/ui/Button';
import { Input } from '../../../../shared/ui/Input';
import { Select } from '../../../../shared/ui/Select';
import { useSettings } from '../hooks/useSettings';
import { EnvBadge } from '../components/EnvBadge';

export function SettingsRoute() {
  const { settings, updateSettings, addIp, removeIp } = useSettings();
  const [ip, setIp] = useState('');

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-xl font-semibold text-foreground">Integration settings</h2>
        <p className="text-sm text-muted">Global controls for environments, retries and data retention.</p>
      </header>
      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-border/60 bg-surface/70 p-6 shadow-lg shadow-primary/5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Environment</h3>
            <EnvBadge environment={settings.environment} />
          </div>
          <Select
            label="Active environment"
            value={settings.environment}
            onChange={(event) => updateSettings({ environment: event.target.value as typeof settings.environment })}
          >
            <option value="PROD">Production</option>
            <option value="SANDBOX">Sandbox</option>
          </Select>
          <Select
            label="Retry policy"
            value={settings.retryPolicy}
            onChange={(event) => updateSettings({ retryPolicy: event.target.value as typeof settings.retryPolicy })}
          >
            <option value="STANDARD">Standard (exponential)</option>
            <option value="AGGRESSIVE">Aggressive (faster retries)</option>
            <option value="RELAXED">Relaxed (longer tail)</option>
          </Select>
          <Input
            label="Secret rotation (days)"
            type="number"
            value={settings.rotationDays}
            onChange={(event) => updateSettings({ rotationDays: Number(event.target.value) })}
          />
          <Input
            label="Retention (days)"
            type="number"
            value={settings.retentionDays}
            onChange={(event) => updateSettings({ retentionDays: Number(event.target.value) })}
          />
        </div>
        <div className="space-y-4 rounded-3xl border border-border/60 bg-surface/70 p-6 shadow-lg shadow-primary/5">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">IP allowlist</h3>
            <span className="text-xs uppercase tracking-[0.3em] text-muted">{settings.ipAllowlist.length} entries</span>
          </div>
          <div className="flex gap-2">
            <Input
              label="Add IP or CIDR"
              value={ip}
              onChange={(event) => setIp(event.target.value)}
              placeholder="34.102.200.5"
            />
            <Button onClick={() => { addIp(ip); setIp(''); }} disabled={!ip}>
              Add
            </Button>
          </div>
          <ul className="space-y-2 text-sm text-foreground/80">
            {settings.ipAllowlist.map((entry) => (
              <li key={entry} className="flex items-center justify-between rounded-2xl bg-surface/80 px-4 py-2">
                <span>{entry}</span>
                <Button size="sm" variant="ghost" onClick={() => removeIp(entry)}>
                  Remove
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
