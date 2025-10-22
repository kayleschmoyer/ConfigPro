import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ExceptionRow } from '../components/ExceptionRow';
import { detectInventoryExceptions, detectLeadTimeExceptions, sortExceptions } from '../lib/exceptions';
import { LeadTimeStats, StockSnapshot } from '../lib/types';

const SNAPSHOTS: StockSnapshot[] = [
  { skuId: 'sku-001', locationId: 'loc-nyc', onHand: 20, onOrder: 0, allocated: 10, safety: 40, reorderPoint: 55 },
  { skuId: 'sku-002', locationId: 'loc-nyc', onHand: 12, onOrder: 0, allocated: 6, safety: 18, reorderPoint: 25 }
];

const LEADTIME: LeadTimeStats = {
  supplierId: 'sup-001',
  medianDays: 21,
  p95Days: 30,
  onTimePct: 92,
  lastUpdated: new Date().toISOString()
};

export const Exceptions = () => {
  const exceptions = useMemo(() => {
    const inventory = SNAPSHOTS.flatMap((snapshot) => detectInventoryExceptions(snapshot));
    const lead = detectLeadTimeExceptions(LEADTIME, [21, 22, 24, 30, 32]);
    return sortExceptions(lead ? [...inventory, lead] : inventory);
  }, []);

  return (
    <section className="space-y-8">
      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
        <h2 className="text-2xl font-semibold text-foreground">Exceptions</h2>
        <p className="text-sm text-muted">
          Unified queue for risk across safety stock, lead time spikes, and method performance. Quick actions let you raise safety, adjust methods, or escalate suppliers.
        </p>
      </motion.header>
      <div className="space-y-4" role="list">
        {exceptions.map((exception) => (
          <ExceptionRow key={exception.id} exception={exception} />
        ))}
      </div>
    </section>
  );
};
