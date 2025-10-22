export type Money = { currency: string; value: number };

export type InvoiceStatus =
  | 'UNPAID'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'OVERDUE'
  | 'DISPUTED'
  | 'VOID';

export type AgingBucket = '0_30' | '31_60' | '61_90' | '90_PLUS';

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  issueDate: string;
  dueDate: string;
  terms: string;
  subtotal: Money;
  tax: Money;
  total: Money;
  amountPaid: Money;
  balance: Money;
  status: InvoiceStatus;
  agingBucket: AgingBucket;
  tags?: string[];
  salesRep?: string;
}

export type PaymentMethod = 'CASH' | 'CHECK' | 'ACH' | 'CARD';

export interface PaymentAllocation {
  invoiceId: string;
  amount: Money;
}

export interface Payment {
  id: string;
  customerId: string;
  method: PaymentMethod;
  amount: Money;
  date: string;
  reference?: string;
  memo?: string;
  allocations: PaymentAllocation[];
}

export interface Customer {
  id: string;
  name: string;
  creditLimit?: Money;
  balance: Money;
  avgDaysToPay?: number;
  lastPaymentDate?: string;
  onHold?: boolean;
  terms?: string;
  accountOwner?: string;
}

export type Reminder = {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  actionLabel?: string;
  href?: string;
};

export type DisputeStage =
  | 'NEW'
  | 'UNDER_REVIEW'
  | 'WAITING_ON_CUSTOMER'
  | 'RESOLVED';

export interface Dispute {
  id: string;
  invoiceIds: string[];
  customerId: string;
  amount: Money;
  reason: string;
  notes?: string;
  owner: string;
  stage: DisputeStage;
  openedAt: string;
  slaDueAt: string;
}

export interface AutomationRule {
  id: string;
  name: string;
  trigger: string;
  condition?: string;
  actions: string[];
  lastRunAt?: string;
  status: 'ACTIVE' | 'DRAFT';
}

export interface ReportDefinition {
  id: string;
  name: string;
  description: string;
  cadence: 'Ad hoc' | 'Daily' | 'Weekly' | 'Monthly';
}
