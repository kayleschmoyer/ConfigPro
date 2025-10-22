import { useMemo, useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { BillTable } from '../components/BillTable';
import { BillDrawer } from '../components/BillDrawer';
import { useBills } from '../hooks/useBills';
import { useVendors } from '../hooks/useVendors';

const statusOptions = ['ALL', 'DRAFT', 'REVIEW', 'APPROVAL', 'APPROVED', 'SCHEDULED', 'PAID', 'VOID', 'HOLD'] as const;

export const Bills = () => {
  const { filtered, setSearch, search, statusFilter, setStatusFilter, bulkTransition, capture, enrichments, bills, risks } =
    useBills();
  const { vendors } = useVendors();
  const [selected, setSelected] = useState<string[]>([]);
  const [activeBillId, setActiveBillId] = useState<string | undefined>();
  const activeBill = useMemo(() => bills.find((bill) => bill.id === activeBillId), [activeBillId, bills]);
  const vendorMap = useMemo(() => new Map(vendors.map((vendor) => [vendor.id, vendor])), [vendors]);

  const handleToggle = (id: string) => {
    setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const handleToggleAll = (ids: string[]) => {
    setSelected((current) => (current.length === ids.length ? [] : ids));
  };

  const appliedMeta = useMemo(() => enrichments, [enrichments]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-6 rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
        <div className="flex flex-wrap items-center gap-4">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Filter bills"
            className="w-64"
          />
          <Select
            label="Status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as (typeof statusOptions)[number])}
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
          <Button variant="outline" onClick={() => capture('import.pdf')}>
            Capture via OCR
          </Button>
          <Button variant="ghost" disabled={selected.length === 0} onClick={() => bulkTransition(selected, 'APPROVED')}>
            Bulk approve ({selected.length})
          </Button>
        </div>
        <dl className="grid gap-6 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">In review</dt>
            <dd className="text-2xl font-semibold text-foreground">{filtered.filter((bill) => bill.status === 'REVIEW').length}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Discounts expiring 7d</dt>
            <dd className="text-2xl font-semibold text-foreground">
              {filtered.filter((bill) => enrichments.get(bill.id)?.discount && (enrichments.get(bill.id)?.discount?.expiresIn ?? 0) <= 7).length}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Exceptions flagged</dt>
            <dd className="text-2xl font-semibold text-foreground">
              {filtered.filter((bill) => bill.flags?.length).length}
            </dd>
          </div>
        </dl>
      </header>
      <BillTable
        rows={filtered}
        meta={appliedMeta}
        selected={selected}
        onToggle={handleToggle}
        onToggleAll={handleToggleAll}
        onOpen={(bill) => setActiveBillId(bill.id)}
      />
      <BillDrawer
        bill={activeBill}
        isOpen={Boolean(activeBill)}
        onClose={() => setActiveBillId(undefined)}
        discount={activeBill ? enrichments.get(activeBill.id)?.discount : undefined}
        match={activeBill ? enrichments.get(activeBill.id)?.match : undefined}
        risks={(() => {
          if (!activeBill) return undefined;
          const vendor = vendorMap.get(activeBill.vendorId);
          return vendor ? risks(activeBill, vendor) : undefined;
        })()}
      />
    </div>
  );
};
