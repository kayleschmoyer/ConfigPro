import { useEffect, useMemo, useRef, useState, type UIEvent } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableContainer } from '@/shared/ui/Table';
import { DiscountChip } from './DiscountChip';
import { VarianceBadge } from './VarianceBadge';
import type { DiscountInsight } from '../lib/discounts';
import type { MatchAssessment } from '../lib/match';
import { formatDate, formatMoney, relativeDate } from '../lib/format';
import type { Bill } from '../lib/types';

const ROW_HEIGHT = 76;

export type BillRowMeta = {
  discount?: DiscountInsight;
  match?: MatchAssessment;
};

export type BillTableProps = {
  rows: Bill[];
  meta: Map<string, BillRowMeta>;
  selected: string[];
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[]) => void;
  onOpen: (bill: Bill) => void;
};

export const BillTable = ({ rows, meta, selected, onToggle, onToggleAll, onOpen }: BillTableProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState(560);
  const [scrollTop, setScrollTop] = useState(0);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      setViewportHeight(element.clientHeight);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const totalHeight = rows.length * ROW_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 5);
  const endIndex = Math.min(rows.length, Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + 5);
  const virtualRows = rows.slice(startIndex, endIndex);
  const paddingTop = startIndex * ROW_HEIGHT;
  const paddingBottom = Math.max(totalHeight - endIndex * ROW_HEIGHT, 0);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    setScrollTop(event.currentTarget.scrollTop);
  };

  const allIds = useMemo(() => rows.map((row) => row.id), [rows]);
  const allSelected = selected.length > 0 && selected.length === rows.length;

  return (
    <TableContainer ref={containerRef} className="max-h-[70vh]" onScroll={handleScroll}>
      <Table aria-label="Bills table">
        <TableHeader className="sticky top-0 z-10 bg-background/95 backdrop-blur">
          <TableRow>
            <TableHead>
              <input
                type="checkbox"
                aria-label="Select all bills"
                checked={allSelected}
                onChange={() => onToggleAll(allIds)}
                className="h-4 w-4 rounded border-border/60 bg-surface"
              />
            </TableHead>
            <TableHead>Bill</TableHead>
            <TableHead>Vendor</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Signals</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <tr style={{ height: paddingTop }} aria-hidden="true" />
          {virtualRows.map((bill) => {
            const info = meta.get(bill.id);
            const isSelected = selected.includes(bill.id);
            return (
              <motion.tr
                key={bill.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15 }}
                className={cn('cursor-pointer', isSelected && 'bg-primary/5')}
                onClick={() => onOpen(bill)}
                tabIndex={0}
                role="button"
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpen(bill);
                  }
                }}
              >
                <TableCell>
                  <input
                    type="checkbox"
                    aria-label={`Select bill ${bill.number ?? bill.id}`}
                    checked={isSelected}
                    onChange={(event) => {
                      event.stopPropagation();
                      onToggle(bill.id);
                    }}
                    className="h-4 w-4 rounded border-border/60 bg-surface"
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{bill.number ?? bill.id}</span>
                    <span className="text-xs text-muted">Captured {formatDate(bill.issueDate)}</span>
                  </div>
                </TableCell>
                <TableCell>{bill.vendorId}</TableCell>
                <TableCell>
                  <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                    {bill.status}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{formatDate(bill.dueDate)}</span>
                    <span className="text-xs text-muted/80">{relativeDate(bill.dueDate)}</span>
                  </div>
                </TableCell>
                <TableCell>{formatMoney(bill.total)}</TableCell>
                <TableCell className="space-y-2">
                  <DiscountChip insight={info?.discount} />
                  <VarianceBadge assessment={info?.match} />
                </TableCell>
              </motion.tr>
            );
          })}
          <tr style={{ height: paddingBottom }} aria-hidden="true" />
        </TableBody>
      </Table>
    </TableContainer>
  );
};
