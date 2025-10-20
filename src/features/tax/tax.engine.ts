export type TaxMode = 'VAT' | 'SALES_TAX' | 'GST' | 'CONSUMPTION_TAX';

export interface TaxJurisdiction {
  /** Stable identifier for the jurisdiction, e.g. ISO country code or composite key */
  id: string;
  /** Regional grouping used for reporting (AMER, EMEA, APAC, LATAM, etc.) */
  region: string;
  /** ISO 3166-1 alpha-2 country code */
  countryCode: string;
  /** Optional ISO 3166-2 subdivision code when state or province level is required */
  subdivisionCode?: string;
  /** Type of taxation model enforced by the jurisdiction */
  mode: TaxMode;
}

export interface TaxLineItemInput {
  /** Unique identifier referencing the transaction line item */
  id: string;
  /** Net amount that should be evaluated for tax purposes */
  amount: number;
  /** Quantity associated to the line; used by some engines for unit thresholds */
  quantity: number;
  /** Product or service tax code understood by downstream engines */
  taxCode: string;
  /** Whether the supplied amount already includes tax */
  taxInclusive?: boolean;
  /** Optional metadata to pass through to the engine */
  metadata?: Record<string, unknown>;
}

export interface TaxCalculationContext {
  /** Currency in ISO 4217 format */
  currency: string;
  /** Transaction type that may influence nexus or exemptions */
  transactionType: 'SALE' | 'REFUND' | 'SUBSCRIPTION' | 'TRANSFER';
  /** Customer classification for B2B/B2C or government specific rules */
  customerType: 'B2B' | 'B2C' | 'GOVERNMENT' | 'NON_PROFIT';
  /** RFC 3339 timestamp of when the taxable event occurred */
  eventDate: string;
  /** Destination details used to determine place of supply */
  destination: {
    countryCode: string;
    subdivisionCode?: string;
    postalCode?: string;
    city?: string;
  };
  /** List of nexus locations applicable for the seller */
  nexusLocations?: Array<{
    countryCode: string;
    subdivisionCode?: string;
  }>;
  /** Additional configuration flags forwarded to the engine */
  options?: Record<string, unknown>;
}

export interface TaxCalculationRequest {
  jurisdiction: TaxJurisdiction;
  context: TaxCalculationContext;
  lines: TaxLineItemInput[];
  /** Optional identifier for the source system requesting tax */
  sourceSystem?: string;
}

export interface TaxComponentBreakdown {
  /** Specific tax type applied (state, county, VAT, GST, etc.) */
  type: string;
  /** Jurisdiction level for reporting */
  level: 'country' | 'state' | 'county' | 'city' | 'special';
  /** Percentage rate expressed as a decimal (e.g. 0.2 for 20%) */
  rate: number;
  /** Monetary amount applied for the component */
  amount: number;
  /** Optional descriptive information from the engine */
  metadata?: Record<string, unknown>;
}

export interface TaxLineItemResult {
  id: string;
  taxableAmount: number;
  /** Total tax applied to the line item */
  taxAmount: number;
  /** Effective blended tax rate */
  effectiveRate: number;
  components: TaxComponentBreakdown[];
}

export interface TaxTotals {
  taxable: number;
  tax: number;
  grandTotal: number;
}

export interface TaxCalculationResult {
  engineId: string;
  currency: string;
  timestamp: string;
  totals: TaxTotals;
  lines: TaxLineItemResult[];
  /** Pass-through data from the engine, e.g. reporting identifiers */
  metadata?: Record<string, unknown>;
}

export interface TaxEngineCapabilities {
  supportsTaxModes: TaxMode[];
  supportsRealTime: boolean;
  supportsDocumentReturn?: boolean;
  notes?: string;
}

export interface TaxEngineMetadata {
  id: string;
  label: string;
  version: string;
  description?: string;
  capabilities: TaxEngineCapabilities;
}

export interface TaxEngine {
  /** Describes the adapter implementation */
  readonly meta: TaxEngineMetadata;
  /** Whether the engine can service the provided jurisdiction */
  supportsJurisdiction: (jurisdiction: TaxJurisdiction) => boolean;
  /** Execute the tax calculation and return the standardised result */
  calculate: (request: TaxCalculationRequest) => Promise<TaxCalculationResult> | TaxCalculationResult;
}

export class TaxEngineRegistry {
  private engines = new Map<string, TaxEngine>();

  register(engine: TaxEngine) {
    if (this.engines.has(engine.meta.id)) {
      throw new Error(`Tax engine with id "${engine.meta.id}" is already registered.`);
    }

    this.engines.set(engine.meta.id, engine);
  }

  unregister(engineId: string) {
    this.engines.delete(engineId);
  }

  list() {
    return Array.from(this.engines.values());
  }

  resolve(jurisdiction: TaxJurisdiction, preferredEngineId?: string) {
    if (preferredEngineId) {
      const engine = this.engines.get(preferredEngineId);
      if (engine && engine.supportsJurisdiction(jurisdiction)) {
        return engine;
      }
    }

    return this.list().find((engine) => engine.supportsJurisdiction(jurisdiction));
  }
}

const defaultRegistry = new TaxEngineRegistry();

export const registerTaxEngine = (engine: TaxEngine) => {
  defaultRegistry.register(engine);
};

export const unregisterTaxEngine = (engineId: string) => {
  defaultRegistry.unregister(engineId);
};

export const listRegisteredTaxEngines = () => {
  return defaultRegistry.list();
};

export const resolveTaxEngine = (
  jurisdiction: TaxJurisdiction,
  preferredEngineId?: string,
): TaxEngine | undefined => {
  return defaultRegistry.resolve(jurisdiction, preferredEngineId);
};

export const calculateTax = async (
  request: TaxCalculationRequest,
  preferredEngineId?: string,
): Promise<TaxCalculationResult> => {
  const engine = resolveTaxEngine(request.jurisdiction, preferredEngineId);

  if (!engine) {
    throw new Error(
      `No tax engine registered that supports jurisdiction ${request.jurisdiction.id} (${request.jurisdiction.mode}).`,
    );
  }

  const result = await Promise.resolve(engine.calculate(request));

  return {
    ...result,
    engineId: result.engineId ?? engine.meta.id,
  };
};
