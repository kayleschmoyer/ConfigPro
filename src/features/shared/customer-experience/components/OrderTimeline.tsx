import { motion } from 'framer-motion';
import { cn } from '../../../lib/cn';
import { formatDate } from '../lib/format';
import type { OrderRef } from '../lib/types';

interface OrderTimelineProps {
  orders: Array<OrderRef & { statusTone?: string; formattedDate?: string }>;
  emptyLabel?: string;
}

export const OrderTimeline = ({ orders, emptyLabel = 'No orders yet' }: OrderTimelineProps) => {
  if (!orders.length) {
    return (
      <div className="flex h-48 items-center justify-center rounded-3xl border border-dashed border-border/60 bg-surface/50">
        <span className="text-sm text-muted">{emptyLabel}</span>
      </div>
    );
  }

  return (
    <ol className="relative space-y-6 border-l border-border/40 pl-6">
      {orders.map((order, index) => (
        <motion.li
          key={order.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05, duration: 0.18 }}
          className="relative ml-2 rounded-2xl border border-border/40 bg-surface/70 p-5 shadow-sm shadow-primary/5"
        >
          <span
            aria-hidden
            className="absolute -left-[1.65rem] top-6 flex h-3 w-3 items-center justify-center rounded-full border border-primary/60 bg-background"
          >
            <span className="h-2 w-2 rounded-full bg-primary" />
          </span>
          <header className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">{order.number}</h3>
              <p className="text-xs text-muted">{formatDate(order.date)}</p>
            </div>
            <span
              className={cn(
                'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]',
                order.statusTone === 'success'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-primary/40 bg-primary/10 text-primary'
              )}
            >
              {order.status}
            </span>
          </header>
          {order.total && (
            <p className="mt-3 text-sm text-muted">
              Value {order.total.currency} {(order.total.value / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          )}
        </motion.li>
      ))}
    </ol>
  );
};
