import type { Money } from './types';

export const formatMoney = (money: Money, options: Intl.NumberFormatOptions = {}) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  });

  return formatter.format(money.value / 100);
};

export const formatPercent = (value: number, digits = 1) => `${value.toFixed(digits)}%`;

export const formatDate = (iso?: string, options: Intl.DateTimeFormatOptions = {}) => {
  if (!iso) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(new Date(iso));
};

export const relativeDate = (iso?: string) => {
  if (!iso) return 'No due date';
  const date = new Date(iso).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);
  const diff = (date - today) / (1000 * 60 * 60 * 24);

  if (diff === 0) return 'Due today';
  if (diff > 0) return `Due in ${diff} day${diff === 1 ? '' : 's'}`;
  return `Overdue by ${Math.abs(diff)} day${diff === -1 ? '' : 's'}`;
};
