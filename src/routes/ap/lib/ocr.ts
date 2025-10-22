import type { Bill } from './types';

type BillOCRFields = NonNullable<Bill['ocr']>['fields'];

export type OCRResult = {
  fields: BillOCRFields;
  confidence: number;
  lowConfidence: Array<keyof BillOCRFields>;
};

const FIELD_WEIGHTS: Record<string, number> = {
  vendor: 0.3,
  number: 0.2,
  total: 0.3,
  dueDate: 0.2,
};

export const runOCRStub = (fileName: string): OCRResult => {
  const pseudoRandom = Math.abs(hashCode(fileName)) % 100;
  const confidence = 0.7 + (pseudoRandom / 500);
  const fields: BillOCRFields = {
    vendor: 'ACME Supplies',
    number: `INV-${pseudoRandom.toString().padStart(5, '0')}`,
    total: (pseudoRandom * 231).toString(),
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
  };

  const lowConfidence = (Object.keys(fields) as Array<keyof BillOCRFields>).filter(
    (field) => confidence * (FIELD_WEIGHTS[field] ?? 0.25) < 0.75
  );

  return { fields, confidence: Math.min(confidence, 0.98), lowConfidence };
};

const hashCode = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return hash;
};
