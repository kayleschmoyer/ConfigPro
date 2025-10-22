import { useMemo, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/Table';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { POEditor } from '../components/POEditor';
import { usePOs } from '../hooks/usePOs';
import { formatDate, formatMoney } from '../lib/format';

export const PurchaseOrders = () => {
  const { filtered, search, setSearch, receivings } = usePOs();
  const [selectedId, setSelectedId] = useState<string | undefined>(filtered[0]?.id);
  const selected = useMemo(() => filtered.find((po) => po.id === selectedId), [filtered, selectedId]);
  const receivingMap = useMemo(() => new Map(receivings.map((item) => [item.poId, item])), [receivings]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-4">
        <Input
          label="Search POs"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-64"
        />
        <Button>New PO</Button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
        <div className="rounded-3xl border border-border/60 bg-surface/80 p-4 shadow-lg shadow-primary/10">
          <Table aria-label="Purchase orders" className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>PO</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((po) => (
                <TableRow
                  key={po.id}
                  className={po.id === selectedId ? 'bg-primary/5' : undefined}
                  onClick={() => setSelectedId(po.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      setSelectedId(po.id);
                    }
                  }}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground">{po.number}</span>
                      <span className="text-xs text-muted">{formatDate(po.issueDate)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{po.status}</TableCell>
                  <TableCell>{formatMoney(po.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {selected && (
          <div className="space-y-6">
            <POEditor po={selected} />
            <div className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">Receiving log</h3>
              <ul className="mt-4 space-y-3 text-sm text-foreground/80">
                {receivingMap.get(selected.id) ? (
                  receivingMap.get(selected.id)!.lines.map((line) => (
                    <li key={line.poLineId} className="flex items-center justify-between">
                      <span>Line {line.poLineId}</span>
                      <span className="text-muted">{line.qty} received</span>
                    </li>
                  ))
                ) : (
                  <li>No receiving entries yet.</li>
                )}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
