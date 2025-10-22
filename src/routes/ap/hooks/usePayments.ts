import { useMemo, useState } from 'react';
import { buildCashPlan } from '../lib/cashPlan';
import type { Bill, Money, PaymentInstruction } from '../lib/types';

const paymentInstructions: PaymentInstruction[] = [
  {
    id: 'pay-1',
    method: 'ACH',
    vendorId: 'vendor-1',
    bills: [{ billId: 'bill-2', amount: { currency: 'USD', value: 143_000 } }],
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    status: 'SCHEDULED',
    reference: 'ACH-20240210',
  },
];

export const usePayments = (bills: Bill[]) => {
  const [cashLimit, setCashLimit] = useState<Money>({ currency: 'USD', value: 1_000_000 });
  const candidates = useMemo(
    () => bills.filter((bill) => ['APPROVED', 'SCHEDULED'].includes(bill.status)),
    [bills]
  );

  const plan = useMemo(() => buildCashPlan({ bills: candidates, cashLimit }), [candidates, cashLimit]);

  return {
    cashLimit,
    setCashLimit,
    candidates,
    plan,
    paymentInstructions,
  };
};
