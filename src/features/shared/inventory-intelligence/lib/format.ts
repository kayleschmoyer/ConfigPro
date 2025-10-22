export const formatCurrency = (value: number, currency: string = 'USD') =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: value >= 100 ? 0 : 2
  }).format(value);

export const formatPercent = (value: number, fractionDigits = 1) =>
  `${value.toFixed(fractionDigits)}%`;

export const formatDate = (value: string | number | Date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric'
  }).format(new Date(value));

export const formatConfidence = (low?: number, high?: number) => {
  if (low == null || high == null) return '—';
  return `${Math.round(low)} – ${Math.round(high)}`;
};
