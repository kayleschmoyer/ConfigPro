import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/Table';

const tolerances = [
  { category: 'Quantity', percent: 2 },
  { category: 'Price', percent: 3 },
  { category: 'Tax', percent: 1 },
];

export const Settings = () => {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">Terms library</h2>
          <div className="mt-4 space-y-3">
            <Input label="Default terms" value="Net 30" readOnly />
            <Input label="Early-pay discount" value="2/10 Net 30" readOnly />
          </div>
        </div>
        <div className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
          <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">Payment providers</h2>
          <div className="mt-4 flex flex-col gap-3 text-sm text-foreground/80">
            <div className="rounded-2xl border border-border/50 bg-surface/70 px-4 py-3">
              ACH · Enabled · Last synced 3h ago
            </div>
            <div className="rounded-2xl border border-border/50 bg-surface/70 px-4 py-3">
              Virtual card · Enabled · 1.2% rebates
            </div>
          </div>
          <Button variant="ghost" className="mt-4 self-start">
            Configure NACHA
          </Button>
        </div>
      </section>
      <section className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">Variance tolerances</h2>
        <Table className="mt-4" aria-label="Variance tolerances">
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead>Tolerance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tolerances.map((tolerance) => (
              <TableRow key={tolerance.category}>
                <TableCell>{tolerance.category}</TableCell>
                <TableCell>{tolerance.percent}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Button variant="ghost" className="mt-4">
          Edit tolerances
        </Button>
      </section>
    </div>
  );
};
