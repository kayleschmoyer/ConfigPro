import { motion } from 'framer-motion';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';

const SETTINGS = [
  { label: 'Default Forecast Method', value: 'Croston for Intermittent', helper: 'Category overrides available' },
  { label: 'Service Level Targets', value: 'A: 98% • B: 95% • C: 90%', helper: 'Translates to safety stock' },
  { label: 'Review Cadence', value: 'Weekly (Monday)', helper: 'Auto-generates proposals' },
  { label: 'Promo Calendar', value: '12 active events', helper: 'Uplift applied to demand' }
];

export const Settings = () => {
  return (
    <section className="space-y-8">
      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
        <h2 className="text-2xl font-semibold text-foreground">Inventory Settings</h2>
        <p className="text-sm text-muted">
          Define policy defaults, review cadence, and automation thresholds. Changes sync instantly across forecasts, replenishment, and alerts.
        </p>
      </motion.header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SETTINGS.map((item) => (
          <Card key={item.label} className="bg-surface/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">{item.label}</p>
            <p className="mt-3 text-sm font-semibold text-foreground">{item.value}</p>
            <p className="mt-2 text-xs text-muted">{item.helper}</p>
          </Card>
        ))}
      </div>
      <Button size="sm">Edit Policies</Button>
    </section>
  );
};
