import { differenceInCalendarDays } from './utils/date';
import { formatPercent } from './format';
import type { Bill } from './types';

export type DiscountInsight = {
  apr: number;
  expiresIn: number;
  label: string;
};

export const buildDiscountInsight = (bill: Bill): DiscountInsight | undefined => {
  const discount = bill.discount;
  if (!discount?.percent || !discount.dueBy) return undefined;

  const termDays = differenceInCalendarDays(new Date(bill.dueDate ?? bill.issueDate), new Date(bill.issueDate));
  if (termDays <= 0) return undefined;

  const discountDays = differenceInCalendarDays(new Date(discount.dueBy), new Date(bill.issueDate));
  if (discountDays <= 0) return undefined;

  const rate = discount.percent / 100;
  const apr = (rate / (termDays - discountDays)) * 365 * 100;

  return {
    apr,
    expiresIn: differenceInCalendarDays(new Date(discount.dueBy), new Date()),
    label: `${formatPercent(discount.percent, 0)} • ${formatPercent(apr, 0)} APR`,
  };
};
