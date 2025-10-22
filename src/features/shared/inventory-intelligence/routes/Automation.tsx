import { motion } from 'framer-motion';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { useAutomation } from '../hooks/useAutomation';

export const Automation = () => {
  const { rules, toggleRule, simulate, simulations } = useAutomation();

  return (
    <section className="space-y-8">
      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
        <h2 className="text-2xl font-semibold text-foreground">Automation & Rules</h2>
        <p className="text-sm text-muted">
          No-code automation for forecast, inventory, and supplier triggers. Dry-run simulations explain which conditions fire before activating.
        </p>
      </motion.header>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 bg-surface/80 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Rules</p>
          {rules.map((rule) => (
            <div key={rule.id} className="rounded-2xl border border-border/60 bg-background/40 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-foreground">{rule.name}</p>
                  <p className="text-xs text-muted">Trigger: {rule.trigger}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => toggleRule(rule.id)}>
                    {rule.enabled ? 'Disable' : 'Enable'}
                  </Button>
                  <Button size="sm" onClick={() => simulate(rule.id)}>
                    Dry Run
                  </Button>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted">{rule.actions.length} actions configured.</p>
            </div>
          ))}
        </Card>
        <Card className="space-y-4 bg-surface/80 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Simulation Log</p>
          <ul className="space-y-3 text-xs text-muted">
            {simulations.map((simulation, index) => (
              <li key={`${simulation.ruleId}-${index}`} className="rounded-2xl border border-border/50 bg-background/40 px-4 py-3">
                <p className="font-semibold text-foreground">{simulation.ruleId}</p>
                <p>{simulation.explanation}</p>
              </li>
            ))}
            {simulations.length === 0 && <li>No simulations yet.</li>}
          </ul>
        </Card>
      </div>
    </section>
  );
};
