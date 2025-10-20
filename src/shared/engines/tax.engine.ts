export interface TaxEngine {
  id: string;
  calc(input: {
    subtotal: number;
    shipTo: { country: string; region?: string; postal?: string };
  }): Promise<{ tax: number }>;
}

const registry = new Map<string, TaxEngine>();

export const registerTaxEngine = (engine: TaxEngine) =>
  registry.set(engine.id, engine);

export const useTax = (id: string) => registry.get(id)!;
