import { useState } from 'react';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { ConsentEditor } from '../components/ConsentEditor';
import { usePortal } from '../hooks/usePortal';

export const PortalProfile = () => {
  const { snapshot } = usePortal();
  const [customer, setCustomer] = useState(snapshot.customer);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-foreground">Profile & preferences</h2>
        <p className="text-sm text-muted">Keep your contact information and communication choices up to date.</p>
      </header>

      <section className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="First name" value={customer.firstName} onChange={() => undefined} readOnly />
          <Input label="Last name" value={customer.lastName} onChange={() => undefined} readOnly />
          <Input label="Email" value={customer.email ?? ''} onChange={() => undefined} readOnly />
          <Input label="Phone" value={customer.phone ?? ''} onChange={() => undefined} readOnly />
        </div>
        <div className="mt-6 flex justify-end">
          <Button variant="outline">Request profile update</Button>
        </div>
      </section>

      <ConsentEditor customer={customer} onUpdate={setCustomer} />
    </div>
  );
};

export default PortalProfile;
