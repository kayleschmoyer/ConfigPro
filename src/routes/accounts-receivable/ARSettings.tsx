import { useState } from 'react';
import { Button } from '../../shared/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../shared/ui/Card';
import { Input } from '../../shared/ui/Input';
import { Select } from '../../shared/ui/Select';
import { useToast } from '../../shared/ui/Toast';
import { useAccountsReceivable } from './context';
import { SettingsIcon } from './components/Icons';

export const ARSettings = () => {
  useAccountsReceivable();
  const { showToast } = useToast();
  const [defaultTerms, setDefaultTerms] = useState('Net 30');
  const [reminderCadence, setReminderCadence] = useState('3,7,14');
  const [statementTemplate, setStatementTemplate] = useState('Standard');
  const [senderName, setSenderName] = useState('AR@configpro.com');
  const [branding, setBranding] = useState('Default');

  const saveSettings = () => {
    showToast({
      variant: 'success',
      title: 'Settings saved',
      description: 'Preferences applied to future invoices and statements.'
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          <SettingsIcon className="h-4 w-4 text-primary" />
          AR workspace settings
        </span>
        <h2 className="text-3xl font-semibold">Govern defaults and brand touchpoints</h2>
        <p className="text-sm text-muted">
          Configure payment terms, reminder cadence, PDF branding, and email senders.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="bg-background/80">
          <CardHeader>
            <CardTitle>Terms & cadence</CardTitle>
            <CardDescription>Defaults apply to new invoices unless overridden.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select label="Default payment terms" value={defaultTerms} onChange={(event) => setDefaultTerms(event.target.value)}>
              <option value="Net 15">Net 15</option>
              <option value="Net 30">Net 30</option>
              <option value="Net 45">Net 45</option>
              <option value="Net 60">Net 60</option>
            </Select>
            <Input
              label="Reminder cadence (days)"
              helperText="Comma-separated days after invoice issue to send reminders."
              value={reminderCadence}
              onChange={(event) => setReminderCadence(event.target.value)}
            />
          </CardContent>
          <CardFooter>
            <Button onClick={saveSettings}>Save</Button>
          </CardFooter>
        </Card>

        <Card className="bg-background/80">
          <CardHeader>
            <CardTitle>Statements & branding</CardTitle>
            <CardDescription>Customize documents and from-address defaults.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select label="Statement template" value={statementTemplate} onChange={(event) => setStatementTemplate(event.target.value)}>
              <option value="Standard">Standard</option>
              <option value="Detailed">Detailed aging</option>
              <option value="Collections">Collections tone</option>
            </Select>
            <Input
              label="Statement sender"
              value={senderName}
              onChange={(event) => setSenderName(event.target.value)}
            />
            <Select label="PDF branding" value={branding} onChange={(event) => setBranding(event.target.value)}>
              <option value="Default">Default</option>
              <option value="Dark">Dark theme</option>
              <option value="Minimal">Minimal</option>
            </Select>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" onClick={() => showToast({
              variant: 'info',
              title: 'Preview generated',
              description: 'Statement preview opened in a new tab.'
            })}>
              Preview statement
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
