import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/ui/Table';
import { useAutomation } from '../hooks/useAutomation';

export const Automation = () => {
  const { rules, selectedRule, setSelectedRule, simulator } = useAutomation();

  return (
    <div className="space-y-8">
      <header className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
        <h2 className="text-lg font-semibold text-foreground">Automation & rules</h2>
        <p className="text-sm text-muted">Trigger precision workflows on capture, risk, and payment events.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {rules.map((rule) => (
            <Button
              key={rule.id}
              variant={selectedRule?.id === rule.id ? 'primary' : 'ghost'}
              onClick={() => setSelectedRule(rule)}
            >
              {rule.name}
            </Button>
          ))}
        </div>
      </header>
      <section className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <div className="space-y-4 rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
          <Input label="Rule name" value={selectedRule?.name ?? ''} readOnly />
          <Input label="Trigger" value={selectedRule?.trigger ?? ''} readOnly />
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Actions</h3>
            <ul className="mt-2 space-y-2 text-sm text-foreground/80">
              {selectedRule?.actions.map((action, index) => (
                <li key={index} className="rounded-2xl border border-border/50 bg-surface/70 px-4 py-2">
                  {action.type} · {Object.keys(action.params).length} params
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">Dry-run simulator</h3>
          <Table aria-label="Rule simulator" className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Rule</TableHead>
                <TableHead>Result</TableHead>
                <TableHead>Explanation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {simulator.map((result) => (
                <TableRow key={result.rule.id}>
                  <TableCell>{result.rule.name}</TableCell>
                  <TableCell>{result.wouldTrigger ? 'Would trigger' : 'No action'}</TableCell>
                  <TableCell className="text-sm text-muted/80">{result.explanation}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
};
