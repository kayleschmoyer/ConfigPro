import { useCallback, useMemo } from 'react';

import type { Money } from '../types';

import { useCurrentOrg } from './useCurrentOrg';

export interface UseCurrencyFormatOptions {
  currency?: string;
  locale?: string;
  numberFormatOptions?: Intl.NumberFormatOptions;
}

const isMoney = (value: number | Money): value is Money =>
  typeof value === 'object' && value !== null && 'amount' in value;

const DEFAULT_NUMBER_OPTIONS: Intl.NumberFormatOptions = {
  style: 'currency',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
};

export const useCurrencyFormat = (options: UseCurrencyFormatOptions = {}) => {
  const { org } = useCurrentOrg();
  const locale = options.locale ?? 'en-US';
  const fallbackCurrency = options.currency ?? org?.currency ?? 'USD';
  const baseOptions = useMemo(
    () => ({ ...DEFAULT_NUMBER_OPTIONS, ...options.numberFormatOptions }),
    [options.numberFormatOptions],
  );

  const defaultFormatter = useMemo(
    () => new Intl.NumberFormat(locale, { ...baseOptions, currency: fallbackCurrency }),
    [baseOptions, fallbackCurrency, locale],
  );

  const resolveAmount = useCallback((value: number | Money) => (isMoney(value) ? value.amount : value), []);

  const format = useCallback(
    (value: number | Money, override?: Intl.NumberFormatOptions) => {
      const amount = resolveAmount(value);
      const currency = isMoney(value) && value.currency ? value.currency : fallbackCurrency;
      const formatter = override
        ? new Intl.NumberFormat(locale, { ...baseOptions, currency, ...override })
        : currency === fallbackCurrency
        ? defaultFormatter
        : new Intl.NumberFormat(locale, { ...baseOptions, currency });

      return formatter.format(amount);
    },
    [baseOptions, defaultFormatter, fallbackCurrency, locale, resolveAmount],
  );

  const formatToParts = useCallback(
    (value: number | Money, override?: Intl.NumberFormatOptions) => {
      const amount = resolveAmount(value);
      const currency = isMoney(value) && value.currency ? value.currency : fallbackCurrency;
      const formatter = override
        ? new Intl.NumberFormat(locale, { ...baseOptions, currency, ...override })
        : currency === fallbackCurrency
        ? defaultFormatter
        : new Intl.NumberFormat(locale, { ...baseOptions, currency });

      return formatter.formatToParts(amount);
    },
    [baseOptions, defaultFormatter, fallbackCurrency, locale, resolveAmount],
  );

  return {
    currency: fallbackCurrency,
    locale,
    format,
    formatCurrency: format,
    formatToParts,
    numberFormat: defaultFormatter,
  };
};
