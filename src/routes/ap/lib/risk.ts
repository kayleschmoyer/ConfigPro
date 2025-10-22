import type { Bill, Vendor } from './types';

export type RiskSignal = {
  kind: 'DUPLICATE' | 'BANK_CHANGE' | 'VARIANCE_HIGH' | 'MISSING_W9' | 'OUTLIER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  note: string;
};

export const detectBillRisks = (bill: Bill, vendor: Vendor, history: Bill[]): RiskSignal[] => {
  const signals: RiskSignal[] = [];

  if (bill.flags?.includes('DUPLICATE')) {
    signals.push({ kind: 'DUPLICATE', severity: 'HIGH', note: 'Potential duplicate submission detected' });
  }

  if (bill.flags?.includes('BANK_CHANGE')) {
    signals.push({ kind: 'BANK_CHANGE', severity: 'HIGH', note: 'Bank change pending verification' });
  }

  if (!vendor.docs?.some((doc) => doc.kind === 'W9')) {
    signals.push({ kind: 'MISSING_W9', severity: 'MEDIUM', note: 'Missing W-9 on file' });
  }

  const vendorMedian = computeMedian(
    history.filter((item) => item.vendorId === vendor.id).map((item) => item.total.value)
  );
  if (vendorMedian > 0 && bill.total.value > vendorMedian * 1.8) {
    signals.push({ kind: 'OUTLIER', severity: 'MEDIUM', note: 'Amount exceeds 90-day median' });
  }

  if (bill.match?.variance && !bill.match.withinTolerance) {
    signals.push({ kind: 'VARIANCE_HIGH', severity: 'MEDIUM', note: 'Variance exceeds tolerance' });
  }

  return signals;
};

export const rankVendorRisk = (vendor: Vendor) => {
  const score = vendor.riskScore ?? 50;
  if (score > 75) return { level: 'High', tone: 'text-error', description: 'Heightened monitoring in place' } as const;
  if (score > 55) return { level: 'Medium', tone: 'text-warning', description: 'Moderate risk; keep documents current' } as const;
  return { level: 'Low', tone: 'text-success', description: 'Verified supplier with strong performance' } as const;
};

const computeMedian = (values: number[]) => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
};
