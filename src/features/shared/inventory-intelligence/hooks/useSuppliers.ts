import { useMemo } from 'react';
import { calculateLeadTimeStats, updateLeadTimeScore } from '../lib/leadtime';
import { LeadTimeStats, Supplier } from '../lib/types';

const DEMO_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-001',
    name: 'Northwind Plastics',
    terms: 'Net 30',
    defaultLeadTimeDays: 21,
    priceBreaks: [
      { qty: 25, unitCost: { currency: 'USD', value: 118 } },
      { qty: 50, unitCost: { currency: 'USD', value: 110 } }
    ],
    score: 86,
    onTimePct: 92,
    defectRatePct: 1.2,
    contact: { email: 'supply@northwind.com' }
  },
  {
    id: 'sup-002',
    name: 'Atlas Service Parts',
    terms: 'Net 45',
    defaultLeadTimeDays: 14,
    priceBreaks: [{ qty: 100, unitCost: { currency: 'USD', value: 16 } }],
    score: 78,
    onTimePct: 88,
    defectRatePct: 2.8,
    contact: { email: 'orders@atlasparts.io', phone: '+1-555-120-1200' }
  }
];

const DEMO_LEAD_TIMES: Record<string, number[]> = {
  'sup-001': [22, 21, 20, 24, 19, 26, 21],
  'sup-002': [14, 15, 18, 17, 16, 17, 20]
};

export type UseSuppliersResult = {
  suppliers: Supplier[];
  stats: LeadTimeStats[];
  updateScore: (supplierId: string, samples: number[]) => number;
};

export const useSuppliers = (): UseSuppliersResult => {
  const stats = useMemo(
    () =>
      DEMO_SUPPLIERS.map((supplier) => {
        const sample = DEMO_LEAD_TIMES[supplier.id];
        const baseStats = calculateLeadTimeStats(sample, {
          onTimeThreshold: supplier.defaultLeadTimeDays ?? 0
        });
        return {
          supplierId: supplier.id,
          medianDays: baseStats.medianDays,
          p95Days: baseStats.p95Days,
          onTimePct: baseStats.onTimePct,
          lastUpdated: new Date().toISOString()
        } satisfies LeadTimeStats;
      }),
    []
  );

  const updateScore = (supplierId: string, samples: number[]) => {
    const current = stats.find((stat) => stat.supplierId === supplierId);
    if (!current) return 0;
    return updateLeadTimeScore(current, samples);
  };

  return { suppliers: DEMO_SUPPLIERS, stats, updateScore };
};
