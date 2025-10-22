import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader } from '@/shared/ui/Table';
import { StatusBadge } from './StatusBadge';

export type SkuTableRow = {
  id: string;
  sku: string;
  name: string;
  location: string;
  supplier?: string;
  onHand: number;
  onOrder: number;
  safety: number;
  reorderPoint?: number;
  status?: string[];
};

export type SkuTableProps = {
  rows: SkuTableRow[];
  height?: number;
};

const ROW_HEIGHT = 72;

export const SkuTable = ({ rows, height = 480 }: SkuTableProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const totalHeight = rows.length * ROW_HEIGHT;
  const startIndex = Math.max(Math.floor(scrollTop / ROW_HEIGHT) - 2, 0);
  const endIndex = Math.min(
    rows.length,
    Math.ceil((scrollTop + height) / ROW_HEIGHT) + 2
  );

  const visibleRows = useMemo(() => rows.slice(startIndex, endIndex), [rows, startIndex, endIndex]);

  const onScroll = () => {
    const node = containerRef.current;
    if (node) {
      setScrollTop(node.scrollTop);
    }
  };

  return (
    <TableContainer
      ref={containerRef}
      className="h-full max-h-full"
      style={{ height }}
      onScroll={onScroll}
      role="table"
      aria-label="SKU inventory table"
    >
      <Table className="relative" style={{ minHeight: height }}>
        <TableHeader>
          <TableRow>
            <TableHead className="w-48">SKU</TableHead>
            <TableHead className="w-64">Name</TableHead>
            <TableHead className="w-40">Location</TableHead>
            <TableHead className="w-36 text-right">On Hand</TableHead>
            <TableHead className="w-36 text-right">On Order</TableHead>
            <TableHead className="w-36 text-right">Safety</TableHead>
            <TableHead className="w-40 text-right">ROP</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <tr style={{ height: startIndex * ROW_HEIGHT }} />
          {visibleRows.map((row) => {
            const statuses = row.status ?? [];
            return (
              <motion.tr
                key={row.id}
                layout
                className="border-b border-border/40"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                role="row"
              >
                <TableCell className="font-semibold">{row.sku}</TableCell>
                <TableCell className="text-foreground/90">{row.name}</TableCell>
                <TableCell>{row.location}</TableCell>
                <TableCell className="text-right tabular-nums">{row.onHand}</TableCell>
                <TableCell className="text-right tabular-nums text-muted">{row.onOrder}</TableCell>
                <TableCell className="text-right tabular-nums">{row.safety}</TableCell>
                <TableCell className="text-right tabular-nums">{row.reorderPoint ?? '—'}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {statuses.map((status) => (
                      <StatusBadge key={status} status={status} />
                    ))}
                  </div>
                </TableCell>
              </motion.tr>
            );
          })}
          <tr style={{ height: Math.max(totalHeight - endIndex * ROW_HEIGHT, 0) }} />
        </TableBody>
      </Table>
    </TableContainer>
  );
};
