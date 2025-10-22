import { useState } from 'react';
import { motion } from 'framer-motion';
import { Drawer } from '../../../shared/ui/Drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../shared/ui/Tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/ui/Table';
import { Button } from '../../../shared/ui/Button';
import { DiscountChip } from './DiscountChip';
import { MatchPanel } from './MatchPanel';
import { ApprovalTrail } from './ApprovalTrail';
import type { DiscountInsight } from '../lib/discounts';
import type { MatchAssessment } from '../lib/match';
import type { RiskSignal } from '../lib/risk';
import { formatDate, formatMoney, relativeDate } from '../lib/format';
import type { Bill } from '../lib/types';

const tabs = ['overview', 'lines', 'match', 'approvals', 'activity', 'files'] as const;

export type BillDrawerProps = {
  bill?: Bill;
  isOpen: boolean;
  onClose: () => void;
  discount?: DiscountInsight;
  match?: MatchAssessment;
  risks?: RiskSignal[];
};

export const BillDrawer = ({ bill, isOpen, onClose, discount, match, risks }: BillDrawerProps) => {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('overview');

  if (!bill) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={bill.number ?? bill.id}
      description={`${formatMoney(bill.total)} · ${bill.vendorId}`}
      footer={
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button variant="ghost">Export</Button>
            <Button variant="outline">Assign approver</Button>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost">Schedule</Button>
            <Button>Approve</Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {bill.status}
          </span>
          <span className="text-sm text-muted">{relativeDate(bill.dueDate)}</span>
          <DiscountChip insight={discount} />
          {risks?.map((risk) => (
            <motion.span
              key={risk.kind}
              layout
              className="inline-flex items-center gap-2 rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-warning"
            >
              {risk.kind} · {risk.note}
            </motion.span>
          ))}
        </div>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof tabs[number])}>
          <TabsList aria-label="Bill details">
            {tabs.map((tab) => (
              <TabsTrigger key={tab} value={tab}>
                {tab}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
            <TabsContent value="overview">
              <dl className="grid grid-cols-2 gap-6 text-sm text-foreground/80">
                <div>
                  <dt className="font-semibold uppercase tracking-[0.2em] text-muted">Vendor</dt>
                  <dd>{bill.vendorId}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-[0.2em] text-muted">PO</dt>
                  <dd>{bill.poId ?? '—'}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-[0.2em] text-muted">Issue</dt>
                  <dd>{formatDate(bill.issueDate)}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-[0.2em] text-muted">Due</dt>
                  <dd>{formatDate(bill.dueDate)}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-[0.2em] text-muted">Subtotal</dt>
                  <dd>{formatMoney(bill.subtotal)}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-[0.2em] text-muted">Tax</dt>
                  <dd>{bill.tax ? formatMoney(bill.tax) : '—'}</dd>
                </div>
                <div>
                  <dt className="font-semibold uppercase tracking-[0.2em] text-muted">Total</dt>
                  <dd className="text-lg font-semibold text-foreground">{formatMoney(bill.total)}</dd>
                </div>
              </dl>
            </TabsContent>
            <TabsContent value="lines">
              <Table aria-label="Bill lines">
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bill.lines.map((line) => (
                    <TableRow key={line.id}>
                      <TableCell>{line.description ?? line.sku ?? 'Line item'}</TableCell>
                      <TableCell>{line.qty}</TableCell>
                      <TableCell>{formatMoney(line.unitPrice)}</TableCell>
                      <TableCell>{formatMoney({ currency: line.unitPrice.currency, value: line.unitPrice.value * line.qty })}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
            <TabsContent value="match">
              <MatchPanel assessment={match} />
            </TabsContent>
            <TabsContent value="approvals">
              <ApprovalTrail approvals={bill.approvals} />
            </TabsContent>
            <TabsContent value="activity">
              <ul className="space-y-3 text-sm text-foreground/80">
                {bill.audit.map((entry, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary/70" aria-hidden="true" />
                    <div>
                      <p className="font-semibold">{entry.change}</p>
                      <p className="text-xs text-muted/80">
                        {formatDate(entry.at)} · {entry.by}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="files">
              <ul className="space-y-2 text-sm text-primary">
                {bill.attachments?.length ? (
                  bill.attachments.map((file) => (
                    <li key={file}>
                      <a href="#" className="hover:underline">
                        {file}
                      </a>
                    </li>
                  ))
                ) : (
                  <li className="text-muted">No attachments yet.</li>
                )}
              </ul>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Drawer>
  );
};
