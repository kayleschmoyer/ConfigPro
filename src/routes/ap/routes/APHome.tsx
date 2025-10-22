import { motion } from 'framer-motion';
import { Button } from '../../../shared/ui/Button';
import { cn } from '../../../lib/cn';

const actions = [
  { label: 'Capture Bill', description: 'Drag & drop or email-inbox', to: '/ap/bills' },
  { label: 'Review Bills', description: 'OCR confidence, duplicates', to: '/ap/bills' },
  { label: '3-Way Match', description: 'Variance tolerance cockpit', to: '/ap/match' },
  { label: 'Start Payment Run', description: 'Optimize cash & discounts', to: '/ap/payments' },
  { label: 'Vendors', description: 'Profiles, documents, risk', to: '/ap/vendors' },
  { label: 'Purchase Orders', description: 'Budgets, receiving log', to: '/ap/purchase-orders' },
  { label: 'Exceptions', description: 'Fraud & policy queue', to: '/ap/exceptions' },
  { label: 'Reports', description: 'DPO, cycle time, cash', to: '/ap/reports' },
  { label: 'Settings', description: 'Terms, tolerances, NACHA', to: '/ap/settings' },
];

export const APHome = () => {
  return (
    <div className="space-y-10">
      <section className="rounded-4xl bg-gradient-to-br from-primary/40 via-background/70 to-background/90 p-[1px]">
        <div className="rounded-4xl bg-[radial-gradient(circle_at_top,_rgba(12,15,30,0.9),_rgba(12,15,30,0.65))] p-10 shadow-2xl shadow-primary/20">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary/70">ConfigPro AP</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Accounts Payable</h1>
          <p className="mt-3 max-w-2xl text-base text-white/70">
            Master cash flow, guard against fraud, and deliver zero-friction payment runs. ConfigPro AP orchestrates OCR capture,
            3-way match, approvals, and remittance from a single, delightful cockpit.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/70">
            <span className="rounded-full border border-white/30 bg-white/5 px-4 py-1">$124,300 due next 7 days</span>
            <span className="rounded-full border border-white/30 bg-white/5 px-4 py-1">4 exceptions</span>
            <span className="rounded-full border border-white/30 bg-white/5 px-4 py-1">Early-pay discounts expiring: 3</span>
          </div>
        </div>
      </section>
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">Quick actions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {actions.map((action, index) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, delay: index * 0.04 }}
              className={cn(
                'group relative overflow-hidden rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10 backdrop-blur transition',
                'focus-within:ring-2 focus-within:ring-primary/60'
              )}
            >
              <div className="flex h-full flex-col justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary/70">{action.label}</p>
                  <p className="mt-3 text-base text-foreground/90">{action.description}</p>
                </div>
                <Button asChild variant="ghost" className="mt-6 self-start">
                  <a href={action.to} className="text-sm">
                    Launch
                  </a>
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
