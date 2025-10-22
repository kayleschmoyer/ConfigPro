import { useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/Table';
import type { PO } from '../lib/types';
import { formatDate, formatMoney } from '../lib/format';

export const POEditor = ({ po }: { po: PO }) => {
  const [notes, setNotes] = useState('Ensure receiving photos captured');

  return (
    <div className="space-y-6">
      <div className="grid gap-6 rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
        <div className="grid grid-cols-2 gap-4 text-sm text-foreground/80">
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-muted">PO number</p>
            <p className="text-lg text-foreground">{po.number}</p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-muted">Vendor</p>
            <p>{po.vendorId}</p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-muted">Status</p>
            <p>{po.status}</p>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-[0.2em] text-muted">Issue date</p>
            <p>{formatDate(po.issueDate)}</p>
          </div>
        </div>
        <Table aria-label="PO lines">
          <TableHeader>
            <TableRow>
              <TableHead>Line</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Unit price</TableHead>
              <TableHead>Extended</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {po.lines.map((line) => (
              <TableRow key={line.id}>
                <TableCell>{line.description ?? line.sku ?? 'Line item'}</TableCell>
                <TableCell>{line.qty}</TableCell>
                <TableCell>{formatMoney(line.unitPrice)}</TableCell>
                <TableCell>{formatMoney({ currency: line.unitPrice.currency, value: line.unitPrice.value * line.qty })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex items-center justify-between gap-3">
          <Input
            label="Receiving notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="w-full"
          />
          <Button variant="outline">Attach proof</Button>
          <Button>Log receipt</Button>
        </div>
      </div>
    </div>
  );
};
