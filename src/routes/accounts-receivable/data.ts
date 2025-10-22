import { baseTheme } from '../../app/config/theme';
import type {
  AutomationRule,
  Customer,
  Dispute,
  DisputeStage,
  Invoice,
  Money,
  Payment,
  Reminder
} from './types';

type AgingBucket = Invoice['agingBucket'];

const CURRENCY = 'USD';

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const differenceInCalendarDays = (dateLeft: Date, dateRight: Date) => {
  const startOfDay = (value: Date) => new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const left = startOfDay(dateLeft).getTime();
  const right = startOfDay(dateRight).getTime();
  const diff = left - right;
  const DAY_MS = 1000 * 60 * 60 * 24;
  return Math.round(diff / DAY_MS);
};

export const createMoney = (value: number, currency: string = CURRENCY): Money => ({
  currency,
  value
});

export const formatMoney = (money: Money, options?: Intl.NumberFormatOptions) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options
  }).format(money.value);

const today = new Date();

const baseCustomers: Customer[] = [
  {
    id: 'cust-001',
    name: 'Acme Manufacturing',
    creditLimit: createMoney(150_000),
    balance: createMoney(42_750),
    avgDaysToPay: 32,
    lastPaymentDate: addDays(today, -12).toISOString(),
    onHold: false,
    terms: 'Net 30',
    accountOwner: 'Maya Patel'
  },
  {
    id: 'cust-002',
    name: 'Northwind Traders',
    creditLimit: createMoney(95_000),
    balance: createMoney(18_420),
    avgDaysToPay: 28,
    lastPaymentDate: addDays(today, -7).toISOString(),
    terms: 'Net 30',
    accountOwner: 'Jordan Lee'
  },
  {
    id: 'cust-003',
    name: 'Contoso Retail Group',
    creditLimit: createMoney(120_000),
    balance: createMoney(68_930),
    avgDaysToPay: 44,
    lastPaymentDate: addDays(today, -21).toISOString(),
    onHold: true,
    terms: 'Net 45',
    accountOwner: 'Jordan Lee'
  },
  {
    id: 'cust-004',
    name: 'Globex Aerospace',
    creditLimit: createMoney(250_000),
    balance: createMoney(154_200),
    avgDaysToPay: 52,
    lastPaymentDate: addDays(today, -4).toISOString(),
    terms: 'Net 60',
    accountOwner: 'Sasha Ortiz'
  },
  {
    id: 'cust-005',
    name: 'Adventure Works',
    creditLimit: createMoney(80_000),
    balance: createMoney(22_615),
    avgDaysToPay: 26,
    lastPaymentDate: addDays(today, -30).toISOString(),
    terms: 'Net 30',
    accountOwner: 'Maya Patel'
  }
];

const salesReps = ['Maya Patel', 'Jordan Lee', 'Sasha Ortiz'];
const availableTags = ['Enterprise', 'Priority', 'Subscription', 'Hardware', 'SLA'];

interface InvoiceSeedOptions {
  baseIssueDate: Date;
  customerId: string;
  amount: number;
  taxRate: number;
  terms: 'Net 30' | 'Net 45' | 'Net 60';
  paidRatio: number;
  tags: string[];
  salesRep: string;
}

const determineAgingBucket = (dueDate: string, balance: number): AgingBucket => {
  if (balance <= 0) return '0_30';
  const daysPastDue = differenceInCalendarDays(new Date(), new Date(dueDate));
  if (daysPastDue <= 30) return '0_30';
  if (daysPastDue <= 60) return '31_60';
  if (daysPastDue <= 90) return '61_90';
  return '90_PLUS';
};

const deriveStatus = (
  dueDate: string,
  total: number,
  amountPaid: number,
  tags: string[]
): Invoice['status'] => {
  const balance = total - amountPaid;
  if (tags.includes('Disputed')) return 'DISPUTED';
  if (balance <= 0.01) return 'PAID';
  if (amountPaid > 0 && amountPaid < total) return 'PARTIALLY_PAID';
  const isOverdue = differenceInCalendarDays(new Date(), new Date(dueDate)) > 0;
  if (isOverdue) return 'OVERDUE';
  return 'UNPAID';
};

const createInvoice = (index: number, seed: InvoiceSeedOptions): Invoice => {
  const { baseIssueDate, amount, taxRate, terms, paidRatio, customerId, tags, salesRep } = seed;
  const issueDate = addDays(baseIssueDate, index * 7);
  const dueDate = addDays(issueDate, terms === 'Net 30' ? 30 : terms === 'Net 45' ? 45 : 60);
  const subtotal = amount;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  const amountPaid = Number((total * paidRatio).toFixed(2));
  const balance = Number((total - amountPaid).toFixed(2));
  const normalizedTags =
    paidRatio < 1 && balance > 0 && differenceInCalendarDays(new Date(), dueDate) > 5
      ? [...new Set([...tags, 'At Risk'])]
      : tags;
  const status = deriveStatus(dueDate.toISOString(), total, amountPaid, normalizedTags);

  return {
    id: `inv-${customerId}-${index}`,
    number: `INV-${String(index + 1).padStart(5, '0')}`,
    customerId,
    issueDate: issueDate.toISOString(),
    dueDate: dueDate.toISOString(),
    terms,
    subtotal: createMoney(Number(subtotal.toFixed(2))),
    tax: createMoney(Number(tax.toFixed(2))),
    total: createMoney(Number(total.toFixed(2))),
    amountPaid: createMoney(amountPaid),
    balance: createMoney(balance),
    status,
    agingBucket: determineAgingBucket(dueDate.toISOString(), balance),
    tags: normalizedTags,
    salesRep
  };
};

const invoiceSeeds: InvoiceSeedOptions[] = baseCustomers.flatMap((customer, idx) => {
  const baseIssueDate = addDays(today, -90 - idx * 11);
  const baseAmount = 4200 + idx * 900;
  const taxRate = 0.085;
  const paidRatios = [0, 0.35, 0.6, 1];
  return paidRatios.map((ratio, ratioIndex) => ({
    baseIssueDate,
    customerId: customer.id,
    amount: baseAmount + ratioIndex * 700,
    taxRate,
    terms: (customer.terms as InvoiceSeedOptions['terms']) ?? 'Net 30',
    paidRatio: ratio,
    tags:
      ratioIndex % 2 === 0
        ? [availableTags[(idx + ratioIndex) % availableTags.length]]
        : ['Priority'],
    salesRep: salesReps[(idx + ratioIndex) % salesReps.length]
  }));
});

const invoices: Invoice[] = invoiceSeeds.flatMap((seed, index) =>
  Array.from({ length: 5 }).map((_, offset) => createInvoice(index * 5 + offset, seed))
);

const payments: Payment[] = invoices
  .filter((invoice) => invoice.amountPaid.value > 0)
  .slice(0, 18)
  .map((invoice, idx) => ({
    id: `pay-${idx + 1}`,
    customerId: invoice.customerId,
    method: idx % 4 === 0 ? 'ACH' : idx % 4 === 1 ? 'CARD' : idx % 4 === 2 ? 'CHECK' : 'CASH',
    amount: createMoney(invoice.amountPaid.value),
    date: addDays(new Date(invoice.issueDate), 14).toISOString(),
    reference: `REF-${invoice.number}`,
    memo: idx % 3 === 0 ? 'Auto-applied via portal' : undefined,
    allocations: [
      {
        invoiceId: invoice.id,
        amount: createMoney(invoice.amountPaid.value)
      }
    ]
  }));

const reminders: Reminder[] = [
  {
    id: 'rem-1',
    message: '3 invoices due today — send reminders now',
    severity: 'warning',
    actionLabel: 'Review due invoices',
    href: '/ar/invoices?filter=due-today'
  },
  {
    id: 'rem-2',
    message: '2 disputes will breach SLA in < 8 hours',
    severity: 'critical',
    actionLabel: 'Escalate owners',
    href: '/ar/disputes'
  },
  {
    id: 'rem-3',
    message: 'Cash application backlog: 12 payments unallocated',
    severity: 'info',
    actionLabel: 'Apply cash',
    href: '/ar/payments'
  }
];

const disputes: Dispute[] = [
  {
    id: 'disp-001',
    invoiceIds: [invoices[3].id],
    customerId: invoices[3].customerId,
    amount: createMoney(1140),
    reason: 'Pricing discrepancy on PO 4591',
    notes: 'Pending confirmation from sales',
    owner: 'Lena Torres',
    stage: 'NEW',
    openedAt: addDays(today, -3).toISOString(),
    slaDueAt: addDays(today, 1).toISOString()
  },
  {
    id: 'disp-002',
    invoiceIds: [invoices[11].id],
    customerId: invoices[11].customerId,
    amount: createMoney(2980),
    reason: 'Damaged goods returned',
    owner: 'Mason Reed',
    stage: 'UNDER_REVIEW',
    openedAt: addDays(today, -9).toISOString(),
    slaDueAt: addDays(today, 2).toISOString()
  },
  {
    id: 'disp-003',
    invoiceIds: [invoices[15].id, invoices[16].id],
    customerId: invoices[15].customerId,
    amount: createMoney(5420),
    reason: 'Service level penalty assessment',
    owner: 'Priya Narayanan',
    stage: 'WAITING_ON_CUSTOMER',
    openedAt: addDays(today, -14).toISOString(),
    slaDueAt: addDays(today, -1).toISOString()
  },
  {
    id: 'disp-004',
    invoiceIds: [invoices[8].id],
    customerId: invoices[8].customerId,
    amount: createMoney(780),
    reason: 'Duplicate billing',
    owner: 'Lena Torres',
    stage: 'RESOLVED',
    openedAt: addDays(today, -26).toISOString(),
    slaDueAt: addDays(today, -18).toISOString()
  }
];

const automationRules: AutomationRule[] = [
  {
    id: 'rule-001',
    name: 'Send day-3 reminder',
    trigger: 'Invoice due in 3 days',
    condition: 'Balance > $0',
    actions: ['Send reminder email to billing contact', 'Notify account owner in Slack'],
    lastRunAt: addDays(today, -1).toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'rule-002',
    name: 'Escalate disputes > 7 days',
    trigger: 'Dispute opened',
    condition: 'SLA breach risk',
    actions: ['Assign task to collections lead', 'Tag invoice with "Disputed"'],
    lastRunAt: addDays(today, -2).toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'rule-003',
    name: 'Auto apply recurring ACH',
    trigger: 'Partial payment posted',
    actions: ['Auto-apply to oldest invoice', 'Email receipt to customer'],
    status: 'DRAFT'
  }
];

export const arData = {
  theme: baseTheme,
  customers: baseCustomers,
  invoices,
  payments,
  reminders,
  disputes,
  automationRules,
  tags: availableTags,
  salesReps
};

export const mapDisputesByStage = (items: Dispute[]) =>
  items.reduce<Record<DisputeStage, Dispute[]>>(
    (acc, item) => {
      acc[item.stage].push(item);
      return acc;
    },
    {
      NEW: [],
      UNDER_REVIEW: [],
      WAITING_ON_CUSTOMER: [],
      RESOLVED: []
    }
  );
