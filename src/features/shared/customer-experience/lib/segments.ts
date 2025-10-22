import type {
  Customer,
  Loyalty,
  Segment,
  SegmentExpression,
  SegmentField,
  SegmentGroup,
  SegmentLeaf,
  SegmentOperator,
  SegmentPreview,
  SurveyResponse
} from './types';

export type SegmentEvaluationContext = {
  loyalty?: Loyalty;
  responses?: SurveyResponse[];
  behaviors?: {
    lastPurchaseDays?: number;
    totalSpend?: number;
    arAgingDays?: number;
    appointmentFrequency?: number;
    pointsExpiringInDays?: number;
  };
  events?: Record<string, boolean>;
};

const customFields: SegmentField[] = [
  { key: 'custom.preferred_name', label: 'Preferred name', type: 'string', source: 'custom' },
  {
    key: 'custom.communication_language',
    label: 'Communication language',
    type: 'string',
    source: 'custom'
  },
  {
    key: 'custom.relationship_owner',
    label: 'Relationship owner',
    type: 'string',
    source: 'custom'
  },
  {
    key: 'custom.identity_confidence',
    label: 'Identity confidence score',
    type: 'number',
    source: 'custom'
  },
  { key: 'custom.style_persona', label: 'Style persona', type: 'string', source: 'custom' },
  {
    key: 'custom.accessibility_needs',
    label: 'Accessibility considerations',
    type: 'string',
    source: 'custom'
  },
  {
    key: 'custom.loyalty_currency_wallet',
    label: 'Loyalty wallet ID',
    type: 'string',
    source: 'custom'
  }
];

const coreFields: SegmentField[] = [
  { key: 'firstName', label: 'First name', type: 'string', source: 'core' },
  { key: 'lastName', label: 'Last name', type: 'string', source: 'core' },
  { key: 'email', label: 'Email', type: 'string', source: 'core' },
  { key: 'phone', label: 'Phone', type: 'string', source: 'core' },
  { key: 'preferences.channel', label: 'Preferred channel', type: 'string', source: 'core' },
  { key: 'consents.marketing', label: 'Marketing consent', type: 'boolean', source: 'core' }
];

const behaviorFields: SegmentField[] = [
  { key: 'behaviors.lastPurchaseDays', label: 'Days since purchase', type: 'number', source: 'behavior' },
  { key: 'behaviors.totalSpend', label: 'Lifetime spend', type: 'number', source: 'behavior' },
  { key: 'behaviors.arAgingDays', label: 'AR aging (days)', type: 'number', source: 'behavior' },
  {
    key: 'behaviors.appointmentFrequency',
    label: 'Appointments per 90 days',
    type: 'number',
    source: 'behavior'
  },
  {
    key: 'behaviors.pointsExpiringInDays',
    label: 'Points expiring (days)',
    type: 'number',
    source: 'behavior'
  },
  { key: 'loyalty.tier', label: 'Loyalty tier', type: 'string', source: 'behavior' },
  { key: 'loyalty.points', label: 'Loyalty points', type: 'number', source: 'behavior' },
  { key: 'feedback.nps', label: 'Last NPS score', type: 'number', source: 'behavior' },
  { key: 'feedback.csat', label: 'Average CSAT', type: 'number', source: 'behavior' }
];

const eventFields: SegmentField[] = [
  { key: 'events.invoice_overdue', label: 'Invoice overdue', type: 'boolean', source: 'event' },
  {
    key: 'events.work_order_completed',
    label: 'Work order completed',
    type: 'boolean',
    source: 'event'
  },
  { key: 'events.new_ticket', label: 'New support ticket', type: 'boolean', source: 'event' },
  { key: 'events.points_expiring', label: 'Points expiring soon', type: 'boolean', source: 'event' }
];

export const segmentFields = [...coreFields, ...customFields, ...behaviorFields, ...eventFields];

const getByPath = (obj: unknown, path: string) => {
  if (!obj) return undefined;
  return path.split('.').reduce<unknown>((value, segment) => {
    if (value === undefined || value === null) return undefined;
    if (typeof value === 'object') {
      return (value as Record<string, unknown>)[segment];
    }
    return undefined;
  }, obj);
};

const getFieldValue = (
  customer: Customer,
  context: SegmentEvaluationContext,
  field: string
): unknown => {
  if (field.startsWith('behaviors.')) {
    return getByPath(context.behaviors ?? {}, field.replace('behaviors.', ''));
  }
  if (field.startsWith('events.')) {
    return context.events?.[field.replace('events.', '')] ?? false;
  }
  if (field.startsWith('loyalty.')) {
    return getByPath(context.loyalty ?? {}, field.replace('loyalty.', ''));
  }
  if (field.startsWith('feedback.')) {
    const key = field.replace('feedback.', '');
    if (key === 'nps') {
      return context.responses?.find(response => typeof response.npsScore === 'number')?.npsScore;
    }
    if (key === 'csat') {
      const csatScores = context.responses?.map(response => response.csat).filter(Boolean) as number[];
      if (!csatScores?.length) return undefined;
      return csatScores.reduce((sum, score) => sum + score, 0) / csatScores.length;
    }
  }

  if (field.startsWith('custom.')) {
    return getByPath(customer.custom ?? {}, field.replace('custom.', ''));
  }

  return getByPath(customer, field);
};

const operators: Record<SegmentOperator, (value: unknown, expected?: unknown) => boolean> = {
  EQ: (value, expected) => value === expected,
  NEQ: (value, expected) => value !== expected,
  GT: (value, expected) => typeof value === 'number' && typeof expected === 'number' && value > expected,
  GTE: (value, expected) => typeof value === 'number' && typeof expected === 'number' && value >= expected,
  LT: (value, expected) => typeof value === 'number' && typeof expected === 'number' && value < expected,
  LTE: (value, expected) => typeof value === 'number' && typeof expected === 'number' && value <= expected,
  INCLUDES: (value, expected) => {
    if (Array.isArray(value)) return value.includes(expected);
    if (typeof value === 'string' && typeof expected === 'string') return value.toLowerCase().includes(expected.toLowerCase());
    return false;
  },
  NOT_INCLUDES: (value, expected) => !operators.INCLUDES(value, expected),
  EXISTS: value => value !== undefined && value !== null && value !== '',
  NOT_EXISTS: value => value === undefined || value === null || value === ''
};

const evaluateLeaf = (leaf: SegmentLeaf, customer: Customer, context: SegmentEvaluationContext) => {
  const value = getFieldValue(customer, context, leaf.field);
  return operators[leaf.operator](value, leaf.value);
};

const evaluateGroup = (
  group: SegmentGroup,
  customer: Customer,
  context: SegmentEvaluationContext
): boolean => {
  const results = group.children.map(child => evaluateSegment(child, customer, context));
  return group.condition === 'AND' ? results.every(Boolean) : results.some(Boolean);
};

export const evaluateSegment = (
  expression: SegmentExpression,
  customer: Customer,
  context: SegmentEvaluationContext
): boolean => {
  if (expression.type === 'LEAF') {
    return evaluateLeaf(expression, customer, context);
  }
  return evaluateGroup(expression, customer, context);
};

export const previewSegment = (
  segment: Segment,
  customers: Customer[],
  contextFactory: (customer: Customer) => SegmentEvaluationContext
): SegmentPreview => {
  const members = customers.filter(customer => evaluateSegment(segment.rules, customer, contextFactory(customer)));
  return { members, total: members.length };
};

export const estimateSegment = (
  segment: Segment,
  customers: Customer[],
  contextFactory: (customer: Customer) => SegmentEvaluationContext
) => previewSegment(segment, customers, contextFactory).total;

export const buildEmptySegment = (): Segment => ({
  id: 'new',
  name: 'Untitled segment',
  rules: { type: 'GROUP', condition: 'AND', children: [] }
});
