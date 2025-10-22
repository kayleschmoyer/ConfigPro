import type { Bill, PO, Receiving } from './types';

export type Variance = {
  kind: 'qty' | 'price' | 'tax' | 'freight';
  expected: number;
  actual: number;
  tolerance: number;
};

export type MatchAssessment = {
  status: 'MATCHED' | 'REVIEW' | 'BLOCKED';
  variances: Variance[];
  withinTolerance: boolean;
};

const DEFAULT_TOLERANCE = {
  qty: 0.02,
  price: 0.03,
  tax: 0.01,
  freight: 0.05,
};

export const assessThreeWayMatch = (bill: Bill, po?: PO, receiving?: Receiving): MatchAssessment => {
  if (!po || !receiving) {
    return { status: 'REVIEW', variances: [], withinTolerance: false };
  }

  const variances: Variance[] = [];
  const billQty = sum(bill.lines.map((line) => line.qty));
  const receivedQty = sum(receiving.lines.map((line) => line.qty));

  if (!withinToleranceRatio(billQty, receivedQty, DEFAULT_TOLERANCE.qty)) {
    variances.push({ kind: 'qty', expected: receivedQty, actual: billQty, tolerance: DEFAULT_TOLERANCE.qty });
  }

  const billPrice = sum(bill.lines.map((line) => line.unitPrice.value * line.qty));
  const poPrice = sum(po.lines.map((line) => line.unitPrice.value * line.qty));
  if (!withinToleranceRatio(billPrice, poPrice, DEFAULT_TOLERANCE.price)) {
    variances.push({ kind: 'price', expected: poPrice, actual: billPrice, tolerance: DEFAULT_TOLERANCE.price });
  }

  if (bill.tax && !withinToleranceRatio(bill.tax.value, po.lines.reduce((acc, line) => acc + (line.tax?.value ?? 0), 0), DEFAULT_TOLERANCE.tax)) {
    variances.push({
      kind: 'tax',
      expected: po.lines.reduce((acc, line) => acc + (line.tax?.value ?? 0), 0),
      actual: bill.tax.value,
      tolerance: DEFAULT_TOLERANCE.tax,
    });
  }

  const withinTolerance = variances.length === 0;
  const status: MatchAssessment['status'] = withinTolerance ? 'MATCHED' : variances.some((variance) => variance.kind === 'qty') ? 'BLOCKED' : 'REVIEW';

  return { status, variances, withinTolerance };
};

const withinToleranceRatio = (actual: number, expected: number, tolerance: number) => {
  if (expected === 0) return Math.abs(actual) <= tolerance;
  return Math.abs(actual - expected) / expected <= tolerance;
};

const sum = (values: number[]) => values.reduce((acc, value) => acc + value, 0);
