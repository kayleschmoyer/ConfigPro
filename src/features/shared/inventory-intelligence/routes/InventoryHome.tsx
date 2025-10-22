import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { formatCurrency } from '../lib/format';
import { useForecasts } from '../hooks/useForecasts';
import { useReplenishment } from '../hooks/useReplenishment';

const ACTIONS = [
  { label: 'Run Forecasts', description: 'Refresh horizon and pick best methods', to: '/inventory/forecasts' },
  { label: 'Plan Reorders', description: 'EOQ + ROP optimized batches', to: '/inventory/replenishment' },
  { label: 'Review Exceptions', description: 'Triage risk and quick fixes', to: '/inventory/exceptions' },
  { label: 'Balance Stock', description: 'Propose transfers before POs', to: '/inventory/balancer' },
  { label: 'Supplier Insights', description: 'Lead time trends & scorecards', to: '/inventory/suppliers' },
  { label: 'Kits / BOM', description: 'Component health & propagation', to: '/inventory/kits' },
  { label: 'Reports', description: 'Fill rates, turns, savings', to: '/inventory/reports' },
  { label: 'Settings', description: 'Policies, defaults, automation', to: '/inventory/settings' }
];

export const InventoryHome = () => {
  const { forecasts } = useForecasts();
  const { proposals } = useReplenishment();

  const cues = [
    { label: 'SKUs below safety', value: 142 },
    { label: 'Supplier delays', value: 28 },
    { label: 'Kits blocked', value: 5 }
  ];

  return (
    <section className="space-y-10">
      <motion.header
        className="relative overflow-hidden rounded-4xl border border-primary/40 bg-gradient-to-br from-[#0B1120] via-[#0B1120]/90 to-[#05080f] p-10 text-white shadow-2xl shadow-primary/20"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18 }}
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary/60">Inventory Intelligence</p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight">Command Center</h2>
            <p className="mt-4 max-w-xl text-sm text-white/70">
              Forecast faster, replenish smarter, and stay ahead of supply chain turbulence. ConfigPro unifies forecast accuracy,
              supplier truth, and replenishment automation in one disciplined flow.
            </p>
          </div>
          <div className="rounded-3xl border border-primary/40 bg-white/5 p-6 text-sm text-white/80">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/60">Active Drafts</p>
            <p className="mt-2 text-3xl font-semibold text-white">{proposals.length}</p>
            <p className="mt-2 text-xs text-white/60">
              {proposals.reduce((acc, proposal) => acc + (proposal.lines.length ?? 0), 0)} lines staged across suppliers.
            </p>
          </div>
        </div>
        <div className="mt-8 grid gap-4 text-xs text-white/70 sm:grid-cols-3">
          {cues.map((cue) => (
            <div key={cue.label} className="rounded-3xl border border-white/10 bg-white/5 px-6 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">{cue.label}</p>
              <p className="mt-2 text-2xl font-semibold text-white">{cue.value}</p>
            </div>
          ))}
        </div>
      </motion.header>

      <motion.section
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
      >
        {ACTIONS.map((action) => (
          <Card key={action.label} className="group/action flex flex-col justify-between bg-surface/80 p-6 transition hover:-translate-y-1">
            <div>
              <p className="text-sm font-semibold text-foreground">{action.label}</p>
              <p className="mt-2 text-xs text-muted">{action.description}</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="mt-6 self-start">
              <Link to={action.to}>Open</Link>
            </Button>
          </Card>
        ))}
      </motion.section>

      <motion.section
        className="grid gap-6 lg:grid-cols-2"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, delay: 0.08 }}
      >
        <Card className="bg-surface/80 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Forecast Pulse</p>
          <p className="mt-3 text-sm text-muted">{forecasts.length} SKUs tracked • auto-pick best method</p>
          <ul className="mt-4 space-y-3 text-xs text-muted">
            {forecasts.slice(0, 3).map((forecast) => (
              <li key={forecast.skuId} className="flex items-center justify-between rounded-2xl border border-border/60 bg-background/40 px-4 py-3">
                <span className="text-foreground/80">{forecast.skuId}</span>
                <span className="text-primary">{forecast.error?.wape?.toFixed(1) ?? '—'}% WAPE</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="bg-surface/80 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Working Capital</p>
          <p className="mt-3 text-sm text-muted">Projected spend in draft proposals</p>
          <p className="mt-6 text-3xl font-semibold text-primary">
            {formatCurrency(
              proposals.reduce((acc, proposal) => acc + (proposal.totals?.estCost.value ?? 0), 0)
            )}
          </p>
        </Card>
      </motion.section>
    </section>
  );
};
