import type { FieldMapping } from './types';

// eslint-disable-next-line no-useless-escape
const SAFE_EXPRESSION = /^[\w\s.+\-*/():'",?|&!<>\[\]]+$/;

export type MappingEvaluation = {
  output: unknown;
  error?: string;
};

export function evaluateTransform(mapping: FieldMapping, input: unknown): MappingEvaluation {
  if (!mapping.transform) {
    return { output: input };
  }

  if (!SAFE_EXPRESSION.test(mapping.transform)) {
    return { output: input, error: 'Transform contains unsupported characters' };
  }

  try {
    const fn = new Function('value', `"use strict"; return (${mapping.transform});`);
    const output = fn(input);
    return { output };
  } catch (error) {
    return { output: input, error: error instanceof Error ? error.message : 'Transform failed' };
  }
}

export function describeDomain(domain: FieldMapping['domain']) {
  switch (domain) {
    case 'CUSTOMERS':
      return 'Customer profiles and contact information';
    case 'INVOICES':
      return 'Invoices, billing and payable records';
    case 'PAYMENTS':
      return 'Payments, charges and settlements';
    case 'FILES':
      return 'File metadata and document artifacts';
    case 'MESSAGING':
      return 'Messaging threads and notifications';
    case 'CALENDAR':
      return 'Events, availability and scheduling blocks';
    default:
      return domain as never;
  }
}
