import { Button } from '@/shared/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/Table';
import { useBills } from '../hooks/useBills';

const buckets = [
  'Duplicate',
  'Unmatched PO',
  'Variance > Tolerance',
  'Fraud/Risk',
  'Missing W-9',
  'Bank Change Pending',
  'Policy/Budget Breach',
];

export const Exceptions = () => {
  const { filtered } = useBills();

  return (
    <div className="space-y-6">
      <header className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
        <h2 className="text-lg font-semibold text-foreground">Exception queue</h2>
        <p className="text-sm text-muted">Investigate and resolve risk signals with audit-ready notes.</p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
        {buckets.map((bucket) => (
          <div key={bucket} className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">{bucket}</h3>
                <p className="text-xs text-muted/80">SLA 48h</p>
              </div>
              <Button variant="ghost" size="sm">
                Quick resolve
              </Button>
            </div>
            <Table aria-label={`${bucket} exceptions`} className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Bill</TableHead>
                  <TableHead>Age</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered
                  .filter((bill) => bill.flags?.some((flag) => bucket.toUpperCase().includes(flag)))
                  .slice(0, 4)
                  .map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell>{bill.number ?? bill.id}</TableCell>
                      <TableCell>{new Date(bill.issueDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                <TableRow>
                  <TableCell colSpan={2} className="text-center text-xs text-muted">
                    View all
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ))}
      </div>
    </div>
  );
};
