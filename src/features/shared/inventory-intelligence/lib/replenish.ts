import { Money, ReorderProposal, SKU, StockSnapshot } from './types';

const Z_TABLE: Record<number, number> = {
  0.8: 0.8416,
  0.85: 1.0364,
  0.9: 1.2816,
  0.95: 1.6449,
  0.97: 1.8808,
  0.98: 2.0537,
  0.99: 2.3263,
  0.995: 2.5758
};

const getZScore = (serviceLevel: number) => {
  const sorted = Object.keys(Z_TABLE)
    .map((key) => Number.parseFloat(key))
    .sort((a, b) => a - b);
  for (const level of sorted) {
    if (serviceLevel <= level) {
      return Z_TABLE[level as keyof typeof Z_TABLE];
    }
  }
  return Z_TABLE[sorted[sorted.length - 1] as keyof typeof Z_TABLE];
};

export const safetyStock = (
  demandStdDev: number,
  leadTimeDays: number,
  serviceLevel = 0.95
) => {
  const z = getZScore(serviceLevel);
  const sigmaL = demandStdDev * Math.sqrt(Math.max(leadTimeDays, 1));
  return Math.max(Math.round(z * sigmaL), 0);
};

export const reorderPoint = (
  meanDemand: number,
  leadTimeDays: number,
  demandStdDev: number,
  serviceLevel = 0.95
) => {
  const safety = safetyStock(demandStdDev, leadTimeDays, serviceLevel);
  const muL = meanDemand * leadTimeDays;
  return Math.round(muL + safety);
};

export const economicOrderQuantity = (
  annualDemand: number,
  orderCost: number,
  holdingCostPerUnit: number,
  options?: { moq?: number; lotSize?: number }
) => {
  if (annualDemand <= 0 || orderCost <= 0 || holdingCostPerUnit <= 0) return 0;
  const raw = Math.sqrt((2 * annualDemand * orderCost) / holdingCostPerUnit);
  const { moq, lotSize } = options ?? {};
  let quantity = Math.ceil(raw);
  if (lotSize && lotSize > 0) {
    quantity = Math.ceil(quantity / lotSize) * lotSize;
  }
  if (moq && moq > 0) {
    quantity = Math.max(quantity, moq);
  }
  return quantity;
};

export const minMaxPolicy = (
  snapshot: StockSnapshot,
  demandMean: number,
  demandStdDev: number,
  leadTimeDays: number
) => {
  const safety = safetyStock(demandStdDev, leadTimeDays, 0.95);
  const targetMax = snapshot.max ?? Math.round((demandMean + demandStdDev) * (leadTimeDays + 7));
  const reorderLevel = snapshot.min ?? reorderPoint(demandMean, leadTimeDays, demandStdDev, 0.95);
  const projected = snapshot.onHand + snapshot.onOrder - snapshot.allocated;
  const deficit = targetMax - projected;
  return {
    safety,
    reorderLevel,
    reorderQty: deficit > 0 ? deficit : 0
  };
};

export const periodicReviewPolicy = (
  snapshot: StockSnapshot,
  demandMean: number,
  demandStdDev: number,
  reviewPeriodDays: number,
  leadTimeDays: number,
  serviceLevel = 0.95
) => {
  const totalCoverage = reviewPeriodDays + leadTimeDays;
  const z = getZScore(serviceLevel);
  const sigma = demandStdDev * Math.sqrt(totalCoverage);
  const targetLevel = demandMean * totalCoverage + z * sigma;
  const projected = snapshot.onHand + snapshot.onOrder - snapshot.allocated;
  const reorderQty = Math.max(Math.round(targetLevel - projected), 0);
  return { targetLevel: Math.round(targetLevel), reorderQty };
};

export type ProposalInput = {
  sku: SKU;
  snapshot: StockSnapshot;
  demandMean: number;
  demandStdDev: number;
  leadTimeDays: number;
  serviceLevel?: number;
  annualDemand?: number;
  orderCost?: number;
  holdingCostPerUnit?: number;
};

export const buildReorderLine = (
  input: ProposalInput
): ReorderProposal['lines'][number] | null => {
  const {
    sku,
    snapshot,
    demandMean,
    demandStdDev,
    leadTimeDays,
    serviceLevel = 0.95,
    annualDemand = demandMean * 365,
    orderCost = sku.orderCost?.value ?? 0,
    holdingCostPerUnit = (sku.cost?.value ?? 0) * (sku.holdingCostPctYr ?? 0.25)
  } = input;

  const safety = safetyStock(demandStdDev, leadTimeDays, serviceLevel);
  const rop = reorderPoint(demandMean, leadTimeDays, demandStdDev, serviceLevel);
  const projected = snapshot.onHand + snapshot.onOrder - snapshot.allocated;
  const eoq = economicOrderQuantity(annualDemand, orderCost, holdingCostPerUnit, {
    moq: sku.moq,
    lotSize: sku.lotSize
  });
  const reorderQty = Math.max(rop + safety - projected, 0);

  if (reorderQty <= 0 && projected > rop) {
    return null;
  }

  return {
    skuId: sku.id,
    qty: Math.max(reorderQty, eoq || reorderQty),
    reason: projected <= snapshot.safety ? 'BELOW_SAFETY' : 'UNDER_ROP',
    method: 'ROP',
    calc: {
      eoq,
      rop,
      safety,
      leadTimeDays,
      serviceLevel
    },
    notes: projected <= snapshot.safety ? 'Projected coverage below safety stock.' : undefined
  };
};

export const groupProposalsBySupplier = (
  lines: ReorderProposal['lines'],
  supplierId: string,
  locationId: string,
  currency: Money['currency'] = 'USD'
): ReorderProposal => {
  const estCost = lines.reduce((acc, line) => acc + line.qty, 0);
  return {
    id: `${supplierId}-${locationId}-${Date.now()}`,
    supplierId,
    locationId,
    lines,
    totals: { lineCount: lines.length, estCost: { currency, value: estCost } },
    createdAt: new Date().toISOString(),
    status: 'DRAFT'
  };
};
