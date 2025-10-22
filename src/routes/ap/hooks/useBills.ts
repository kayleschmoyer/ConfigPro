import { useCallback, useMemo, useState } from 'react';
import { runOCRStub } from '../lib/ocr';
import { assessThreeWayMatch } from '../lib/match';
import { detectBillRisks } from '../lib/risk';
import { buildDiscountInsight } from '../lib/discounts';
import type { Bill, ID, Money, Vendor } from '../lib/types';

const currency: Money['currency'] = 'USD';
const statuses: Bill['status'][] = ['DRAFT', 'REVIEW', 'APPROVAL', 'APPROVED', 'SCHEDULED', 'PAID', 'VOID', 'HOLD'];

const seedBills = (): Bill[] =>
  Array.from({ length: 42 }, (_, index) => {
    const id = `bill-${index + 1}`;
    const issue = new Date();
    issue.setDate(issue.getDate() - index * 2);
    const due = new Date(issue);
    due.setDate(issue.getDate() + 30 - (index % 5) * 3);

    const subtotal = 125000 + index * 7500;
    const tax = Math.round(subtotal * 0.0825);

    return {
      id,
      number: `AP-${2024}${index.toString().padStart(4, '0')}`,
      vendorId: `vendor-${(index % 6) + 1}`,
      poId: index % 2 === 0 ? `po-${(index % 4) + 1}` : undefined,
      issueDate: issue.toISOString(),
      dueDate: due.toISOString(),
      subtotal: { currency, value: subtotal },
      tax: { currency, value: tax },
      freight: index % 3 === 0 ? { currency, value: 2500 } : undefined,
      total: { currency, value: subtotal + tax + (index % 3 === 0 ? 2500 : 0) },
      status: statuses[index % statuses.length],
      balance: { currency, value: subtotal + tax },
      discount: index % 5 === 0 ? { percent: 2, dueBy: due.toISOString() } : undefined,
      lines: [
        {
          id: `${id}-1`,
          description: 'Office supplies restock',
          qty: 10 + (index % 4),
          unitPrice: { currency, value: 12500 },
          tax: { currency, value: 1030 },
        },
      ],
      attachments: [],
      ocr: { confidence: 0.92, fields: { vendor: 'ACME Supplies', number: 'INV-1029', total: '1,389.50', dueDate: due.toISOString() } },
      match: { variance: index % 7 === 0 ? { qty: 2 } : undefined, withinTolerance: index % 7 !== 0 },
      approvals: [
        { approverId: 'approver-1', status: index % 3 === 0 ? 'APPROVED' : 'PENDING', at: issue.toISOString() },
        { approverId: 'approver-2', status: 'PENDING' },
      ],
      audit: [
        { at: issue.toISOString(), by: 'maria.garcia', change: 'Captured via OCR' },
        { at: due.toISOString(), by: 'system', change: 'Synced terms from vendor record' },
      ],
      flags: index % 8 === 0 ? ['DUPLICATE'] : undefined,
    } satisfies Bill;
  });

export const useBills = () => {
  const [bills, setBills] = useState<Bill[]>(() => seedBills());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Bill['status'] | 'ALL'>('ALL');

  const filtered = useMemo(() => {
    const lowered = search.trim().toLowerCase();
    return bills.filter((bill) => {
      const matchesStatus = statusFilter === 'ALL' || bill.status === statusFilter;
      if (!matchesStatus) return false;
      if (!lowered) return true;
      return [bill.number, bill.id, bill.vendorId, bill.poId]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(lowered));
    });
  }, [bills, search, statusFilter]);

  const transition = useCallback(
    (id: ID, next: Bill['status']) => {
      setBills((current) =>
        current.map((bill) =>
          bill.id === id
            ? {
                ...bill,
                status: next,
                audit: [
                  { at: new Date().toISOString(), by: 'you', change: `Status → ${next}` },
                  ...bill.audit,
                ],
              }
            : bill
        )
      );
    },
    []
  );

  const bulkTransition = useCallback(
    (ids: ID[], next: Bill['status']) => {
      setBills((current) =>
        current.map((bill) =>
          ids.includes(bill.id)
            ? {
                ...bill,
                status: next,
                audit: [
                  { at: new Date().toISOString(), by: 'you', change: `Bulk status → ${next}` },
                  ...bill.audit,
                ],
              }
            : bill
        )
      );
    },
    []
  );

  const capture = useCallback(
    (fileName: string) => {
      const { fields, confidence } = runOCRStub(fileName);
      const id = `bill-${bills.length + 1}`;
      const total = 138950;
      const newBill: Bill = {
        id,
        number: fields.number,
        vendorId: 'vendor-1',
        issueDate: new Date().toISOString(),
        dueDate: fields.dueDate,
        subtotal: { currency, value: total - 11000 },
        tax: { currency, value: 11000 },
        total: { currency, value: total },
        balance: { currency, value: total },
        status: 'DRAFT',
        terms: 'Net 30',
        lines: [
          { id: `${id}-1`, description: 'OCR captured line', qty: 5, unitPrice: { currency, value: 15000 } },
        ],
        attachments: [fileName],
        ocr: { confidence, fields },
        audit: [{ at: new Date().toISOString(), by: 'ocr', change: 'Captured new bill' }],
      };

      setBills((current) => [newBill, ...current]);
      return newBill;
    },
    [bills.length]
  );

  const enrichments = useMemo(
    () =>
      new Map(
        bills.map((bill) => [
          bill.id,
          {
            discount: buildDiscountInsight(bill),
            match: assessThreeWayMatch(bill, undefined, undefined),
          },
        ])
      ),
    [bills]
  );

  const risks = useCallback((bill: Bill, vendor: Vendor) => detectBillRisks(bill, vendor, bills), [bills]);

  return {
    bills,
    filtered,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    transition,
    bulkTransition,
    capture,
    enrichments,
    risks,
  };
};
