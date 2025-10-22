import { differenceInCalendarDays } from './utils/date';
import { formatMoney } from './format';
import type { Bill, Money } from './types';

type CashPlanInput = {
  bills: Bill[];
  cashLimit: Money;
  today?: Date;
};

export type PlannedPayment = {
  billId: string;
  scheduled: string;
  amount: Money;
  rationale: string;
};

export type CashPlan = {
  planned: PlannedPayment[];
  total: Money;
  notes: string[];
};

export const buildCashPlan = ({ bills, cashLimit, today = new Date() }: CashPlanInput): CashPlan => {
  const sorted = [...bills].sort((a, b) => scoreBill(b, today) - scoreBill(a, today));
  const planned: PlannedPayment[] = [];
  let spend = 0;
  const notes: string[] = [];

  for (const bill of sorted) {
    if (spend + bill.balance.value > cashLimit.value) {
      notes.push(`Hold ${bill.number ?? bill.id} to stay within ${formatMoney(cashLimit)}`);
      continue;
    }

    spend += bill.balance.value;
    planned.push({
      billId: bill.id,
      scheduled: bill.dueDate ?? bill.issueDate,
      amount: bill.balance,
      rationale: buildRationale(bill, today),
    });
  }

  return {
    planned,
    total: { currency: cashLimit.currency, value: spend },
    notes,
  };
};

const scoreBill = (bill: Bill, today: Date) => {
  const dueDays = differenceInCalendarDays(new Date(bill.dueDate ?? bill.issueDate), today);
  const discountWeight = bill.discount?.percent ? 1.2 : 1;
  const riskWeight = bill.flags?.includes('FRAUD') ? 0.6 : 1;
  return (100 - dueDays) * discountWeight * riskWeight + (bill.discount?.percent ?? 0) * 10;
};

const buildRationale = (bill: Bill, today: Date) => {
  if (bill.discount?.percent) {
    const daysLeft = differenceInCalendarDays(new Date(bill.discount.dueBy ?? bill.dueDate ?? bill.issueDate), today);
    return `Capture ${bill.discount.percent}% discount in ${daysLeft} days`;
  }
  if (bill.flags?.includes('CRITICAL_VENDOR')) {
    return 'Critical vendor priority';
  }
  return 'Scheduled to meet terms';
};
