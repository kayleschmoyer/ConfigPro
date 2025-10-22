import { motion } from 'framer-motion';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { formatCurrency, formatPercent } from '../lib/format';

const METRICS = [
  { label: 'Fill Rate', value: formatPercent(96.4), helper: '+1.2 pts vs last month' },
  { label: 'Inventory Turns', value: '9.4x', helper: 'Rolling 12 months' },
  { label: 'Carrying Cost', value: formatCurrency(184000), helper: 'Down 6% MoM' },
  { label: 'Forecast Accuracy', value: formatPercent(92.1), helper: 'Weighted WAPE' }
];

export const Reports = () => {
  return (
    <section className="space-y-8">
      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
        <h2 className="text-2xl font-semibold text-foreground">Reports</h2>
        <p className="text-sm text-muted">
          Executive-ready analytics across service levels, stockouts, carrying costs, and supplier performance. Export CSV or PDF and save custom views.
        </p>
      </motion.header>
      <motion.div
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {METRICS.map((metric) => (
          <Card key={metric.label} className="bg-surface/80 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">{metric.label}</p>
            <p className="mt-4 text-3xl font-semibold text-primary">{metric.value}</p>
            <p className="mt-2 text-xs text-muted">{metric.helper}</p>
          </Card>
        ))}
      </motion.div>
      <Card className="space-y-4 bg-surface/80 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Exports</p>
        <p className="text-sm text-muted">Schedule recurring exports to finance, supply chain, or Slack.</p>
        <div className="flex flex-wrap gap-3">
          <Button size="sm">Export CSV</Button>
          <Button size="sm" variant="outline">
            Export PDF
          </Button>
        </div>
      </Card>
    </section>
  );
};
