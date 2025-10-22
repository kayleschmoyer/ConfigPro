import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow
} from '@/shared/ui/Table';
import { cn } from '@/lib/cn';
import { badgeToneForStatus, formatDate, formatMoney } from '../lib/format';
import type { InvoiceRef } from '../lib';

const ROW_HEIGHT = 72;
const OVERSCAN = 4;

type InvoiceListProps = {
  invoices: InvoiceRef[];
  isLoading?: boolean;
  activeInvoiceId?: string;
  onSelect?: (invoice: InvoiceRef) => void;
  onPay?: (invoice: InvoiceRef) => void;
  onDownload?: (invoice: InvoiceRef) => void;
};

export const InvoiceList: React.FC<InvoiceListProps> = ({
  invoices,
  isLoading,
  activeInvoiceId,
  onSelect,
  onPay,
  onDownload
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState(400);
  const [scrollTop, setScrollTop] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        setViewportHeight(entry.contentRect.height);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => setScrollTop(container.scrollTop);
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  const { items, offsetTop } = useMemo(() => {
    if (!viewportHeight) return { items: invoices, offsetTop: 0 };
    const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const visibleCount = Math.ceil(viewportHeight / ROW_HEIGHT) + OVERSCAN * 2;
    const sliced = invoices.slice(startIndex, startIndex + visibleCount);
    return { items: sliced, offsetTop: startIndex * ROW_HEIGHT };
  }, [invoices, scrollTop, viewportHeight]);

  const totalHeight = useMemo(() => invoices.length * ROW_HEIGHT, [invoices]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border border-border/50 bg-surface/70">
        <span className="animate-pulse text-sm text-muted">Loading invoices…</span>
      </div>
    );
  }

  if (!invoices.length) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 bg-surface/60 text-center">
        <h3 className="text-lg font-semibold text-foreground">No invoices yet</h3>
        <p className="mt-2 max-w-xs text-sm text-muted">
          When invoices are issued they will appear here for fast payment and downloading.
        </p>
      </div>
    );
  }

  return (
    <TableContainer ref={containerRef} className="max-h-[480px]">
      <Table aria-label="Invoices">
        <TableHeader>
          <TableRow>
            <TableHead scope="col">Invoice</TableHead>
            <TableHead scope="col">Issued</TableHead>
            <TableHead scope="col">Due</TableHead>
            <TableHead scope="col">Total</TableHead>
            <TableHead scope="col">Balance</TableHead>
            <TableHead scope="col" className="text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <tr aria-hidden className="h-0" />
          <tr aria-hidden style={{ height: offsetTop }} />
          {items.map(invoice => {
            const isActive = invoice.id === activeInvoiceId;
            const statusTone = badgeToneForStatus(invoice.status);
            return (
              <TableRow
                key={invoice.id}
                data-state={isActive ? 'selected' : undefined}
                className="cursor-pointer"
                onClick={() => onSelect?.(invoice)}
              >
                <TableCell className="font-semibold text-foreground">
                  <div className="flex flex-col">
                    <span>{invoice.number}</span>
                    <motion.span
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.18 }}
                      className={cn(
                        'mt-1 inline-flex w-max items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide',
                        statusTone
                      )}
                    >
                      {invoice.status}
                    </motion.span>
                  </div>
                </TableCell>
                <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                <TableCell>{formatMoney(invoice.total)}</TableCell>
                <TableCell className="font-semibold text-foreground">
                  {formatMoney(invoice.balance)}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={event => {
                        event.stopPropagation();
                        onDownload?.(invoice);
                      }}
                    >
                      PDF
                    </Button>
                    <Button
                      size="sm"
                      onClick={event => {
                        event.stopPropagation();
                        onPay?.(invoice);
                      }}
                    >
                      Pay
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
          <tr aria-hidden style={{ height: Math.max(0, totalHeight - (offsetTop + items.length * ROW_HEIGHT)) }} />
        </TableBody>
      </Table>
    </TableContainer>
  );
};
