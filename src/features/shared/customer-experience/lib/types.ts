import type { ThemeConfig } from '@/app/config/theme';

export type ID = string;
export type ISO = string;

export type Money = { currency: string; value: number };

export type Customer = {
  id: ID;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  custom?: Record<string, unknown>;
  addresses?: {
    kind: 'BILLING' | 'SHIPPING';
    line1: string;
    city: string;
    state?: string;
    postal?: string;
  }[];
  preferences?: { channel?: 'PORTAL' | 'EMAIL' | 'SMS'; locale?: string; timezone?: string };
  consents?: { marketing?: boolean; privacyAcceptedAt?: ISO };
  guardians?: { id: ID; relation?: string }[];
  orgId?: ID;
};

export type InvoiceRef = {
  id: ID;
  number: string;
  issueDate: ISO;
  dueDate: ISO;
  total: Money;
  balance: Money;
  status: 'OPEN' | 'PAID' | 'OVERDUE' | 'PARTIAL';
};

export type OrderRef = { id: ID; number: string; date: ISO; status: string; total?: Money };

export type Appointment = {
  id: ID;
  startsAt: ISO;
  endsAt: ISO;
  locationId?: ID;
  status: 'BOOKED' | 'CANCELLED' | 'COMPLETED';
  notes?: string;
};

export type Message = {
  id: ID;
  threadId: ID;
  from: 'CUSTOMER' | 'STAFF';
  at: ISO;
  text?: string;
  fileUrl?: string;
  read?: boolean;
};

export type SurveyQuestion = {
  id: ID;
  kind: 'SCALE' | 'CHOICE' | 'TEXT';
  prompt: string;
  options?: string[];
};

export type Survey = {
  id: ID;
  name: string;
  type: 'NPS' | 'CSAT' | 'MICRO';
  questions: SurveyQuestion[];
  anonymity?: boolean;
  rewardPoints?: number;
  trigger?: { kind: string; params?: Record<string, unknown> };
};

export type SurveyResponse = {
  id: ID;
  surveyId: ID;
  customerId: ID;
  at: ISO;
  answers: Record<ID, unknown>;
  npsScore?: number;
  csat?: number;
};

export type LoyaltyHistoryItem = {
  at: ISO;
  delta: number;
  reason: string;
  refId?: ID;
};

export type Loyalty = {
  customerId: ID;
  points: number;
  pending?: number;
  tier?: string;
  expiresAt?: ISO;
  history: LoyaltyHistoryItem[];
};

export type Reward = {
  id: ID;
  name: string;
  pointsCost: number;
  kind: 'COUPON' | 'CREDIT' | 'GIFT';
  meta?: Record<string, unknown>;
};

export type Segment = {
  id: ID;
  name: string;
  rules: SegmentExpression;
  estimatedCount?: number;
  lastEvaluatedAt?: ISO;
};

export type JourneyStep = {
  id: ID;
  action: string;
  params?: Record<string, unknown>;
};

export type Journey = {
  id: ID;
  name: string;
  trigger: { kind: string; params?: Record<string, unknown> };
  steps: JourneyStep[];
  enabled: boolean;
};

export type PortalSnapshot = {
  customer: Customer;
  theme: ThemeConfig;
  invoices: InvoiceRef[];
  orders: OrderRef[];
  appointments: Appointment[];
  messages?: Message[];
  loyalty: Loyalty;
  rewards: Reward[];
  surveys: Survey[];
  responses: SurveyResponse[];
  documents: Array<{
    id: ID;
    name: string;
    type: string;
    uploadedAt: ISO;
    size: number;
    url: string;
  }>;
};

export type SegmentOperator =
  | 'EQ'
  | 'NEQ'
  | 'GT'
  | 'GTE'
  | 'LT'
  | 'LTE'
  | 'INCLUDES'
  | 'NOT_INCLUDES'
  | 'EXISTS'
  | 'NOT_EXISTS';

export type SegmentField = {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  source: 'core' | 'custom' | 'behavior' | 'event';
};

export type SegmentLeaf = {
  type: 'LEAF';
  field: string;
  operator: SegmentOperator;
  value?: unknown;
};

export type SegmentGroup = {
  type: 'GROUP';
  condition: 'AND' | 'OR';
  children: SegmentExpression[];
};

export type SegmentExpression = SegmentLeaf | SegmentGroup;

export type SegmentPreview = {
  members: Customer[];
  total: number;
};

export type JourneySimulationResult = {
  stepId: ID;
  executed: boolean;
  reason: string;
};

export type JourneyDryRun = {
  journeyId: ID;
  customerId: ID;
  results: JourneySimulationResult[];
};
