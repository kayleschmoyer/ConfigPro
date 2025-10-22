import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/Table';
import { Stepper } from './Stepper';
import { formatMoney } from '../lib/format';
import type { CashPlan } from '../lib/cashPlan';
import type { Bill, Money } from '../lib/types';

const steps = ['Select Bills', 'Optimize', 'Confirm', 'Generate'];

export const PaymentRunPlanner = ({
  candidates,
  plan,
  cashLimit,
  onCashLimitChange,
}: {
  candidates: Bill[];
  plan: CashPlan;
  cashLimit: Money;
  onCashLimitChange: (value: Money) => void;
}) => {
  return (
    <div className="space-y-6">
      <Stepper steps={steps} activeStep={2} className="bg-surface/70" />
      <div className="grid gap-6 rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
        <div className="flex items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Cash guardrail</h3>
            <p className="text-sm text-muted">
              Balance discount capture with liquidity. Adjust the cash envelope for this run.
            </p>
          </div>
          <Input
            type="number"
            label="Cash limit (USD)"
            value={(cashLimit.value / 100).toString()}
            onChange={(event) =>
              onCashLimitChange({ currency: cashLimit.currency, value: Math.round(Number(event.target.value) * 100) })
            }
            className="w-40"
          />
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted">Optimization summary</h4>
          <ul className="mt-3 grid gap-2 text-sm text-foreground/80">
            <li>
              {plan.planned.length} payments scheduled · {formatMoney(plan.total)} planned spend
            </li>
            {plan.notes.map((note, index) => (
              <li key={index} className="text-warning">
                {note}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-border/50 bg-surface/70">
          <Table aria-label="Payment run candidates" className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Bill</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Rationale</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plan.planned.map((payment) => {
                const bill = candidates.find((candidate) => candidate.id === payment.billId);
                if (!bill) return null;
                return (
                  <TableRow key={bill.id}>
                    <TableCell>{bill.number ?? bill.id}</TableCell>
                    <TableCell>{bill.vendorId}</TableCell>
                    <TableCell>
                      <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        {bill.status}
                      </span>
                    </TableCell>
                    <TableCell>{formatMoney(payment.amount)}</TableCell>
                    <TableCell>{payment.rationale}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost">Dry run remittance</Button>
          <Button asChild>
            <motion.span initial={{ scale: 0.98 }} animate={{ scale: 1 }} transition={{ duration: 0.18 }}>
              Generate NACHA stub
            </motion.span>
          </Button>
        </div>
      </div>
    </div>
  );
};
