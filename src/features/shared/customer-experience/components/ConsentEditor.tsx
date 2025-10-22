import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Select } from '../../../shared/ui/Select';
import { describeConsent } from '../lib/privacy';
import type { Customer } from '../lib/types';

interface ConsentEditorProps {
  customer: Customer;
  onUpdate: (customer: Customer) => void;
}

export const ConsentEditor = ({ customer, onUpdate }: ConsentEditorProps) => {
  const consent = describeConsent(customer);

  const toggleMarketing = () => {
    onUpdate({
      ...customer,
      consents: { ...customer.consents, marketing: !customer.consents?.marketing }
    });
  };

  return (
    <section className="space-y-4 rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
      <header className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">Consents</h3>
          <p className="text-sm text-muted">Preferred channel: {consent.preferredChannel}</p>
        </div>
        <Button variant="outline" onClick={toggleMarketing}>
          {customer.consents?.marketing ? 'Disable marketing' : 'Enable marketing'}
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Email" value={customer.email ?? ''} onChange={() => undefined} readOnly />
        <Input label="Phone" value={customer.phone ?? ''} onChange={() => undefined} readOnly />
        <Select label="Preferred channel" value={customer.preferences?.channel} onChange={() => undefined} disabled>
          <option value="PORTAL">Portal</option>
          <option value="EMAIL">Email</option>
          <option value="SMS">SMS</option>
        </Select>
        <Input
          label="Privacy acceptance"
          value={customer.consents?.privacyAcceptedAt ?? 'Pending'}
          onChange={() => undefined}
          readOnly
        />
      </div>

      <footer className="rounded-2xl border border-border/50 bg-surface/60 p-4 text-sm text-muted">
        <p className="font-semibold text-foreground">Signals</p>
        <p>{consent.signals}</p>
      </footer>
    </section>
  );
};
