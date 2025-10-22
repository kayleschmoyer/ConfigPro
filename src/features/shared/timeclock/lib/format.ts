const pad = (value: number) => value.toString().padStart(2, '0');

const getLocale = () =>
  (typeof navigator !== 'undefined' && navigator.language) ||
  (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().locale) ||
  'en-US';

export const formatClockTime = (iso: string | Date) => {
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat(getLocale(), {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

export const formatDate = (iso: string | Date, options?: Intl.DateTimeFormatOptions) => {
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  return new Intl.DateTimeFormat(getLocale(), {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  }).format(date);
};

export const formatDateTime = (iso: string | Date) =>
  `${formatDate(iso, { month: 'short', day: 'numeric' })} at ${formatClockTime(iso)}`;

export const formatDuration = (minutes: number) => {
  const sign = minutes < 0 ? '-' : '';
  const absolute = Math.abs(minutes);
  const hours = Math.floor(absolute / 60);
  const mins = absolute % 60;
  if (hours === 0) {
    return `${sign}${mins}m`;
  }
  return `${sign}${hours}h ${pad(mins)}m`;
};

export const formatRelative = (iso: string | Date) => {
  const date = typeof iso === 'string' ? new Date(iso) : iso;
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const rtf = new Intl.RelativeTimeFormat(getLocale(), { numeric: 'auto' });
  const absDiff = Math.abs(diff);
  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 1000 * 60 * 60 * 24 * 365],
    ['month', 1000 * 60 * 60 * 24 * 30],
    ['week', 1000 * 60 * 60 * 24 * 7],
    ['day', 1000 * 60 * 60 * 24],
    ['hour', 1000 * 60 * 60],
    ['minute', 1000 * 60],
    ['second', 1000],
  ];
  for (const [unit, value] of units) {
    if (absDiff >= value || unit === 'second') {
      return rtf.format(Math.round(diff / value), unit);
    }
  }
  return rtf.format(0, 'second');
};

export const formatMoney = (value: number, currency = 'USD') =>
  new Intl.NumberFormat(getLocale(), {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value);
