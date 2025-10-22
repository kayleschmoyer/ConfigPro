import { useState } from 'react';
import { Button } from '../../shared/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../shared/ui/Card';
import { Input } from '../../shared/ui/Input';
import { Select } from '../../shared/ui/Select';
import { useToast } from '../../shared/ui/Toast';
import { useAccountsReceivable } from './context';
import { AutomationIcon } from './components/Icons';

const triggers = [
  'Invoice due in X days',
  'Partial payment posted',
  'Dispute opened',
  'Dispute resolved'
];

const actions = [
  'Send reminder email',
  'Tag invoice',
  'Create task',
  'Notify Slack channel',
  'Apply fee or discount'
];

export const ARAutomation = () => {
  const { data } = useAccountsReceivable();
  const { showToast } = useToast();
  const [ruleName, setRuleName] = useState('');
  const [trigger, setTrigger] = useState(triggers[0]);
  const [action, setAction] = useState(actions[0]);
  const [condition, setCondition] = useState('');
  const [days, setDays] = useState('3');

  const addRule = () => {
    showToast({
      variant: 'success',
      title: 'Rule drafted',
      description: `${ruleName || 'Untitled rule'} saved as draft. Review before activating.`
    });
    setRuleName('');
    setCondition('');
    setDays('3');
  };

  const runSimulation = () => {
    showToast({
      variant: 'info',
      title: 'Simulation complete',
      description: '5 invoices matched. No conflicts detected.'
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          <AutomationIcon className="h-4 w-4 text-primary" />
          Automation & rules
        </span>
        <h2 className="text-3xl font-semibold">Design proactive AR automations</h2>
        <p className="text-sm text-muted">
          Trigger reminders, workflows, and notifications with guardrails baked in.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.1fr]">
        <Card className="bg-background/80">
          <CardHeader>
            <CardTitle>Rule builder</CardTitle>
            <CardDescription>Simple, safe automation with clear conditions.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Input
              label="Rule name"
              placeholder="e.g. Day -3 payment reminder"
              value={ruleName}
              onChange={(event) => setRuleName(event.target.value)}
            />
            <Select label="Trigger" value={trigger} onChange={(event) => setTrigger(event.target.value)}>
              {triggers.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
            {trigger === 'Invoice due in X days' && (
              <Input
                label="Days before due date"
                type="number"
                min={1}
                value={days}
                onChange={(event) => setDays(event.target.value)}
              />
            )}
            <Input
              label="Condition (optional)"
              placeholder="e.g. Balance > $500"
              value={condition}
              onChange={(event) => setCondition(event.target.value)}
            />
            <Select label="Action" value={action} onChange={(event) => setAction(event.target.value)}>
              {actions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="ghost" onClick={runSimulation}>
              Run on sample
            </Button>
            <Button onClick={addRule}>Save rule</Button>
          </CardFooter>
        </Card>

        <Card className="bg-background/80">
          <CardHeader>
            <CardTitle>Active rules</CardTitle>
            <CardDescription>Monitor last run and outcomes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.automationRules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-start justify-between gap-4 rounded-2xl border border-border/60 bg-surface/60 p-4"
              >
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{rule.name}</p>
                  <p className="text-xs text-muted">{rule.trigger}</p>
                  {rule.condition && <p className="text-xs text-muted">Condition · {rule.condition}</p>}
                  <p className="text-xs text-muted">
                    Last run {rule.lastRunAt ? new Date(rule.lastRunAt).toLocaleString() : 'n/a'} · {rule.status}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => showToast({
                    variant: 'info',
                    title: 'Rule execution report',
                    description: 'Downloaded last 30 days of automation activity.'
                  })}
                >
                  Download log
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
