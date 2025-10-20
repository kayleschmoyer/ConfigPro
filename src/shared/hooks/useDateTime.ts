import { useCallback, useMemo } from 'react';

import { useCurrentOrg } from './useCurrentOrg';

export interface UseDateTimeOptions {
  locale?: string;
  timeZone?: string;
  formatOptions?: Intl.DateTimeFormatOptions;
}

export interface DateTimeFormatter {
  locale: string;
  timeZone: string;
  format: (value: Date | string | number, override?: Intl.DateTimeFormatOptions) => string;
  formatRange: (
    start: Date | string | number,
    end: Date | string | number,
    override?: Intl.DateTimeFormatOptions,
  ) => string;
  formatRelative: (value: Date | string | number, reference?: Date | string | number) => string;
}

const DEFAULT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
};

const getBrowserTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
  } catch (error) {
    console.warn('ConfigPro: unable to resolve browser timezone', error);
    return 'UTC';
  }
};

const toDate = (value: Date | string | number) =>
  value instanceof Date ? value : new Date(value);

const toSafeDate = (value: Date | string | number) => {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date value provided: ${value}`);
  }
  return date;
};

export const useDateTime = (options: UseDateTimeOptions = {}): DateTimeFormatter => {
  const { org, location } = useCurrentOrg();

  const locale = options.locale ?? 'en-US';
  const timeZone = options.timeZone ?? location?.tz ?? org?.timeZone ?? getBrowserTimeZone();
  const baseOptions = useMemo(
    () => ({ ...DEFAULT_OPTIONS, ...(options.formatOptions ?? {}) }),
    [options.formatOptions],
  );

  const baseFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { ...baseOptions, timeZone }),
    [baseOptions, locale, timeZone],
  );

  const format = useCallback(
    (value: Date | string | number, override?: Intl.DateTimeFormatOptions) => {
      const formatter = override
        ? new Intl.DateTimeFormat(locale, { ...baseOptions, timeZone, ...override })
        : baseFormatter;
      return formatter.format(toSafeDate(value));
    },
    [baseFormatter, baseOptions, locale, timeZone],
  );

  const formatRange = useCallback(
    (
      start: Date | string | number,
      end: Date | string | number,
      override?: Intl.DateTimeFormatOptions,
    ) => {
      const formatter = override
        ? new Intl.DateTimeFormat(locale, { ...baseOptions, timeZone, ...override })
        : baseFormatter;
      const startDate = toSafeDate(start);
      const endDate = toSafeDate(end);

      if (typeof formatter.formatRange === 'function') {
        return formatter.formatRange(startDate, endDate);
      }

      return `${formatter.format(startDate)} – ${formatter.format(endDate)}`;
    },
    [baseFormatter, baseOptions, locale, timeZone],
  );

  const formatRelative = useCallback(
    (value: Date | string | number, reference: Date | string | number = new Date()) => {
      const target = toSafeDate(value);
      const baseline = toSafeDate(reference);
      const diff = target.getTime() - baseline.getTime();
      const diffInMinutes = Math.round(diff / 60000);

      if (diffInMinutes === 0) return 'now';
      if (diffInMinutes === 1) return 'in 1 minute';
      if (diffInMinutes === -1) return '1 minute ago';
      if (diffInMinutes > 1 && diffInMinutes < 60) return `in ${diffInMinutes} minutes`;
      if (diffInMinutes < -1 && diffInMinutes > -60) return `${Math.abs(diffInMinutes)} minutes ago`;

      const diffInHours = Math.round(diff / 3600000);
      if (diffInHours === 1) return 'in 1 hour';
      if (diffInHours === -1) return '1 hour ago';
      if (diffInHours > 1 && diffInHours < 24) return `in ${diffInHours} hours`;
      if (diffInHours < -1 && diffInHours > -24) return `${Math.abs(diffInHours)} hours ago`;

      const diffInDays = Math.round(diff / 86400000);
      if (diffInDays === 1) return 'tomorrow';
      if (diffInDays === -1) return 'yesterday';
      if (diffInDays > 1) return `in ${diffInDays} days`;
      if (diffInDays < -1) return `${Math.abs(diffInDays)} days ago`;

      return format(target);
    },
    [format],
  );

  return {
    locale,
    timeZone,
    format,
    formatRange,
    formatRelative,
  };
};
