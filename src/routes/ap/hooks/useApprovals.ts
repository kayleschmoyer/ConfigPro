import { useMemo, useState } from 'react';
import type { Bill } from '../lib/types';

const workflow = [
  {
    id: 'wf-1',
    name: 'Standard Under $25K',
    steps: [
      { role: 'Requester Manager', threshold: 10_000, escalation: '24h' },
      { role: 'Finance Controller', threshold: 25_000, escalation: '48h' },
    ],
  },
  {
    id: 'wf-2',
    name: 'CapEx',
    steps: [
      { role: 'Department VP', threshold: 100_000, escalation: '72h' },
      { role: 'CFO', threshold: 250_000, escalation: 'Immediate' },
    ],
  },
];

export const useApprovals = (bills: Bill[]) => {
  const [selectedWorkflow, setSelectedWorkflow] = useState(workflow[0]);

  const inFlight = useMemo(
    () =>
      bills
        .filter((bill) => ['REVIEW', 'APPROVAL'].includes(bill.status))
        .map((bill) => ({
          bill,
          pending: bill.approvals?.filter((approval) => approval.status === 'PENDING') ?? [],
          completed: bill.approvals?.filter((approval) => approval.status !== 'PENDING') ?? [],
        })),
    [bills]
  );

  return {
    workflows: workflow,
    selectedWorkflow,
    setSelectedWorkflow,
    inFlight,
  };
};
