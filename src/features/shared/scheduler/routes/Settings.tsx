import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';

export const Settings = () => (
  <div className="space-y-6">
    <header className="space-y-2">
      <h2 className="text-2xl font-semibold text-foreground">Scheduler settings</h2>
      <p className="max-w-2xl text-sm text-muted-foreground">
        Configure planner defaults, time increments, and notification channels for your organisation.
      </p>
    </header>
    <section className="grid gap-4 rounded-2xl border border-border bg-surface/70 p-6 md:grid-cols-2">
      <Input label="Default time increment (minutes)" type="number" min={5} step={5} defaultValue={15} />
      <Select label="Default view">
        <option value="week">Week</option>
        <option value="day">Day</option>
        <option value="month">Month</option>
      </Select>
      <Select label="Notification channel">
        <option value="email">Email summaries</option>
        <option value="sms">SMS alerts</option>
        <option value="webhook">Webhook</option>
      </Select>
      <Select label="Fairness baseline">
        <option value="hours">Hours scheduled</option>
        <option value="shifts">Shifts scheduled</option>
      </Select>
    </section>
    <Button size="sm" className="self-start">
      Save settings
    </Button>
  </div>
);
