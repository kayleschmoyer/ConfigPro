import { useMemo, useState } from 'react';
import type { PO, Receiving } from '../lib/types';

const pos: PO[] = [
  {
    id: 'po-1',
    number: 'PO-1001',
    vendorId: 'vendor-1',
    issueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    status: 'SENT',
    lines: [
      { id: 'po-1-1', description: 'Printer paper', qty: 25, unitPrice: { currency: 'USD', value: 4500 } },
      { id: 'po-1-2', description: 'Pens', qty: 50, unitPrice: { currency: 'USD', value: 1200 } },
    ],
    total: { currency: 'USD', value: 25 * 4500 + 50 * 1200 },
  },
  {
    id: 'po-2',
    number: 'PO-1002',
    vendorId: 'vendor-2',
    issueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    status: 'PARTIAL_RECEIVED',
    lines: [
      { id: 'po-2-1', description: 'Freight services', qty: 5, unitPrice: { currency: 'USD', value: 30500 } },
    ],
    total: { currency: 'USD', value: 5 * 30500 },
  },
];

const receivings: Receiving[] = [
  {
    id: 'rec-1',
    poId: 'po-1',
    at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    lines: [
      { poLineId: 'po-1-1', qty: 25 },
      { poLineId: 'po-1-2', qty: 50 },
    ],
    files: ['receiving-log.pdf'],
    receivedBy: 'Casey Bloom',
  },
  {
    id: 'rec-2',
    poId: 'po-2',
    at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    lines: [{ poLineId: 'po-2-1', qty: 3 }],
    receivedBy: 'Alex Chan',
  },
];

export const usePOs = () => {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    const lowered = search.trim().toLowerCase();
    if (!lowered) return pos;
    return pos.filter((po) => po.number.toLowerCase().includes(lowered));
  }, [search]);

  const byId = useMemo(() => new Map(filtered.map((po) => [po.id, po])), [filtered]);

  return { pos, filtered, search, setSearch, receivings, byId };
};
