import { baseTheme } from '../../../../app/config/theme';
import type { Money } from './types';

export const formatMoney = (money: Money, locale = 'en-US') => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: money.currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(money.value / 100);
  } catch (error) {
    console.warn('Failed to format money', error);
    return `${money.currency} ${(money.value / 100).toFixed(2)}`;
  }
};

export const formatDate = (iso: string, options?: Intl.DateTimeFormatOptions, locale = 'en-US') => {
  try {
    return new Intl.DateTimeFormat(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      ...options
    }).format(new Date(iso));
  } catch (error) {
    console.warn('Failed to format date', error);
    return iso;
  }
};

export const formatDateTime = (iso: string, locale = 'en-US') =>
  formatDate(iso, { hour: 'numeric', minute: '2-digit' }, locale);

export const badgeToneForStatus = (status: string) => {
  switch (status) {
    case 'OVERDUE':
    case 'PAST DUE':
      return 'bg-red-500/10 text-red-400 border border-red-500/30';
    case 'PAID':
    case 'COMPLETED':
      return 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30';
    case 'BOOKED':
    case 'OPEN':
      return 'bg-primary/10 text-primary border border-primary/30';
    default:
      return 'bg-surface/70 text-muted border border-surface/40';
  }
};

export const maskEmail = (email?: string | null) => {
  if (!email) return '';
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const maskedLocal = `${local.slice(0, 2)}${'*'.repeat(Math.max(local.length - 2, 1))}`;
  return `${maskedLocal}@${domain}`;
};

export const heroGradient = `radial-gradient(circle at top left, ${baseTheme.primary}22, transparent 60%), radial-gradient(circle at top right, ${baseTheme.accent}22, transparent 55%)`;
