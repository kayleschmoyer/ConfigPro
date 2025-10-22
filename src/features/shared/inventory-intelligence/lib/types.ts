export type ID = string;
export type ISO = string;

export type Money = {
  currency: string;
  value: number;
};

export type Location = {
  id: ID;
  name: string;
  tz?: string;
  priority?: number;
};

export type SKU = {
  id: ID;
  sku: string;
  name: string;
  category?: string;
  uom?: string;
  supplierId?: ID;
  cost?: Money;
  holdingCostPctYr?: number;
  orderCost?: Money;
  moq?: number;
  lotSize?: number;
  shelfLifeDays?: number;
  isKit?: boolean;
  bom?: { childSkuId: ID; qty: number }[];
};

export type StockSnapshot = {
  skuId: ID;
  locationId: ID;
  onHand: number;
  onOrder: number;
  allocated: number;
  safety: number;
  min?: number;
  max?: number;
  reorderPoint?: number;
};

export type DemandPoint = {
  at: ISO;
  qty: number;
  tag?: 'PROMO' | 'OUTLIER';
};

export type DemandSeries = {
  skuId: ID;
  locationId: ID;
  points: DemandPoint[];
};

export type ForecastMethod = 'SMA' | 'SES' | 'HOLT' | 'SEASONAL' | 'CROSTON' | 'TSB';

export type Forecast = {
  skuId: ID;
  locationId: ID;
  method: ForecastMethod;
  horizonDays: number;
  period: 'DAY' | 'WEEK';
  values: { at: ISO; mean: number; low?: number; high?: number }[];
  error?: { mape?: number; wape?: number; smape?: number };
};

export type LeadTimeStats = {
  supplierId: ID;
  skuId?: ID;
  locationId?: ID;
  medianDays: number;
  p95Days: number;
  onTimePct: number;
  lastUpdated: ISO;
};

export type Supplier = {
  id: ID;
  name: string;
  terms?: string;
  defaultLeadTimeDays?: number;
  priceBreaks?: { qty: number; unitCost: Money }[];
  score?: number;
  onTimePct?: number;
  defectRatePct?: number;
  contact?: { email?: string; phone?: string };
};

export type ReorderProposal = {
  id: ID;
  supplierId: ID;
  locationId: ID;
  lines: {
    skuId: ID;
    qty: number;
    reason: 'BELOW_SAFETY' | 'UNDER_ROP' | 'KIT_COMPONENT' | 'TRANSFER_ALT';
    method: 'EOQ' | 'MINMAX' | 'ROP' | 'P-REVIEW';
    calc: {
      eoq?: number;
      rop?: number;
      safety?: number;
      leadTimeDays?: number;
      serviceLevel?: number;
    };
    notes?: string;
  }[];
  totals?: { lineCount: number; estCost: Money };
  createdAt: ISO;
  status: 'DRAFT' | 'READY' | 'CONFIRMED' | 'PO_CREATED';
};

export type TransferPlan = {
  id: ID;
  fromLocationId: ID;
  toLocationId: ID;
  lines: { skuId: ID; qty: number }[];
  leadTimeDays?: number;
  transferCost?: Money;
  status: 'DRAFT' | 'CONFIRMED';
};

export type Rule = {
  id: ID;
  name: string;
  trigger: string;
  conditions?: Record<string, unknown>;
  actions: { type: string; params: Record<string, unknown> }[];
  enabled: boolean;
};

export type ExceptionBucket =
  | 'BELOW_SAFETY'
  | 'UNDER_ROP'
  | 'STOCKOUT_RISK'
  | 'INTERMITTENT_DEMAND'
  | 'SUPPLIER_DELAY'
  | 'FORECAST_ERROR_HIGH'
  | 'KIT_BLOCKED'
  | 'LEAD_TIME_SPIKE';

export type Exception = {
  id: ID;
  skuId?: ID;
  locationId?: ID;
  supplierId?: ID;
  bucket: ExceptionBucket;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  message: string;
  detectedAt: ISO;
  actions?: { label: string; action: string }[];
};

export type SearchResult = {
  id: ID;
  type: 'SKU' | 'SUPPLIER' | 'CATEGORY';
  label: string;
  sublabel?: string;
};

export type PlannerStep = 'SELECT' | 'OPTIMIZE' | 'GROUP' | 'CONFIRM' | 'CREATE';

export type AutomationSimulation = {
  ruleId: ID;
  fired: boolean;
  explanation: string;
};
