import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';

export const Settings = () => {
  return (
    <div className="flex flex-col gap-6 p-6 lg:p-10">
      <header>
        <h2 className="text-2xl font-semibold text-white">Time Clock settings</h2>
        <p className="text-sm text-muted-foreground">Global defaults for pay periods, retention, and integrations.</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <Input label="Default pay period" placeholder="e.g. Bi-weekly" />
        <Select label="Time zone" defaultValue="America/Los_Angeles">
          <option value="America/Los_Angeles">Pacific</option>
          <option value="America/Denver">Mountain</option>
          <option value="America/Chicago">Central</option>
          <option value="America/New_York">Eastern</option>
        </Select>
        <Input label="Offline queue size" type="number" min={10} defaultValue={250} />
        <Input label="Photo retention days" type="number" min={1} defaultValue={30} />
        <Input label="Webhook endpoint" placeholder="https://payroll.example.com/hooks/timeclock" className="md:col-span-2" />
        <Input label="SSO domain" placeholder="company.com" />
        <Input label="Trusted SSIDs" placeholder="ConfigPro-5G, Warehouse-IoT" />
      </section>

      <div className="flex items-center justify-between rounded-3xl border border-white/10 bg-surface/80 p-6 shadow-xl shadow-black/30">
        <div>
          <h3 className="text-lg font-semibold text-white">Webhook test</h3>
          <p className="text-sm text-muted-foreground">Send a sample punch payload to validate downstream integrations.</p>
        </div>
        <Button variant="outline">Send test event</Button>
      </div>
    </div>
  );
};
