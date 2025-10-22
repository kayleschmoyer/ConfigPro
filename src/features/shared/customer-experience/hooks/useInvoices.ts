import { useCallback, useMemo, useState } from 'react';
import { buildPaymentIntent, rewardSavings } from '../lib/payments';
import { formatMoney } from '../lib/format';
import type { InvoiceRef, Reward } from '../lib';
import { usePortal } from './usePortal';

export const useInvoices = () => {
  const { snapshot, loading } = usePortal();
  const [selectedRewards, setSelectedRewards] = useState<Reward[]>([]);
  const invoices = snapshot.invoices;

  const totals = useMemo(() => {
    const balance = invoices.reduce((sum, invoice) => sum + invoice.balance.value, 0);
    const overdue = invoices.filter(invoice => invoice.status === 'OVERDUE').length;
    return {
      balance,
      formattedBalance: formatMoney({ currency: 'USD', value: balance }),
      overdue
    };
  }, [invoices]);

  const payInvoice = useCallback(
    (invoice: InvoiceRef, amountCents: number) =>
      buildPaymentIntent(invoice, amountCents, selectedRewards, {
        allowPartial: true,
        minimumAmount: 1000
      }),
    [selectedRewards]
  );

  const toggleReward = useCallback(
    (reward: Reward) => {
      setSelectedRewards(current => {
        const exists = current.some(item => item.id === reward.id);
        return exists ? current.filter(item => item.id !== reward.id) : [...current, reward];
      });
    },
    []
  );

  const savings = useMemo(() => rewardSavings(selectedRewards), [selectedRewards]);

  const downloadInvoice = useCallback((invoice: InvoiceRef) => {
    console.info('Downloading invoice', invoice.number);
  }, []);

  return {
    invoices,
    loading,
    totals,
    payInvoice,
    selectedRewards,
    toggleReward,
    savings,
    downloadInvoice
  };
};
