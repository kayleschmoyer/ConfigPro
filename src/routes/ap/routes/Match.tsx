import { useMemo, useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/Table';
import { useBills } from '../hooks/useBills';
import { usePOs } from '../hooks/usePOs';
import { useMatch } from '../hooks/useMatch';
import { MatchPanel } from '../components/MatchPanel';

export const Match = () => {
  const { bills } = useBills();
  const { byId, receivings } = usePOs();
  const [selectedId, setSelectedId] = useState<string | undefined>(bills[0]?.id);
  const selectedBill = useMemo(() => bills.find((bill) => bill.id === selectedId), [bills, selectedId]);
  const receivingMap = useMemo(() => new Map(receivings.map((item) => [item.poId, item])), [receivings]);
  const assessment = useMatch(
    selectedBill,
    selectedBill ? byId.get(selectedBill.poId ?? '') : undefined,
    selectedBill ? receivingMap.get(selectedBill.poId ?? '') : undefined
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
      <div className="rounded-3xl border border-border/60 bg-surface/80 p-4 shadow-lg shadow-primary/10">
        <Table aria-label="Bills needing match">
          <TableHeader>
            <TableRow>
              <TableHead>Bill</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bills.map((bill) => (
              <TableRow
                key={bill.id}
                className={bill.id === selectedId ? 'bg-primary/5' : undefined}
                onClick={() => setSelectedId(bill.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    setSelectedId(bill.id);
                  }
                }}
              >
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold">{bill.number ?? bill.id}</span>
                    <span className="text-xs text-muted">PO {bill.poId ?? '—'}</span>
                  </div>
                </TableCell>
                <TableCell>{bill.match?.withinTolerance ? 'In tolerance' : 'Variance'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">3-way match review</h2>
          <div className="flex gap-3">
            <Button variant="ghost">Request revision</Button>
            <Button>Accept variance</Button>
          </div>
        </div>
        <MatchPanel
          assessment={
            assessment.assessment ??
            (selectedBill?.match
              ? {
                  status: selectedBill.match.withinTolerance ? 'MATCHED' : 'REVIEW',
                  variances:
                    selectedBill.match.variance
                      ? (Object.entries(selectedBill.match.variance) as Array<[
                          'qty' | 'price' | 'tax' | 'freight',
                          number
                        ]>).map(([kind, value]) => ({
                          kind,
                          expected: 0,
                          actual: value,
                          tolerance: 0.02,
                        }))
                      : [],
                  withinTolerance: selectedBill.match.withinTolerance ?? false,
                }
              : undefined)
          }
        />
      </div>
    </div>
  );
};
