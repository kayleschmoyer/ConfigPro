import { Button } from '../../../shared/ui/Button';
import { Select } from '../../../shared/ui/Select';
import { Input } from '../../../shared/ui/Input';

export const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-foreground">Settings</h2>
        <p className="text-sm text-muted">Configure authentication, privacy, and data export policies.</p>
      </header>
      <section className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
        <div className="grid gap-4 md:grid-cols-2">
          <Select label="Auth mode" defaultValue="magic-link">
            <option value="magic-link">Magic link (email)</option>
            <option value="sms">SMS one-time code</option>
            <option value="sso">SSO (SAML/OIDC)</option>
          </Select>
          <Select label="Consent enforcement" defaultValue="strict">
            <option value="strict">Strict — block surveys without consent</option>
            <option value="balanced">Balanced — anonymize analytics</option>
          </Select>
          <Input label="Data retention (days)" defaultValue="730" />
          <Input label="Webhook endpoint" placeholder="https://hooks.configpro.io/events" />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline">Export settings</Button>
          <Button>Save changes</Button>
        </div>
      </section>
    </div>
  );
};

export default AdminSettings;
