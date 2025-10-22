import { useBills } from '../hooks/useBills';
import { usePayments } from '../hooks/usePayments';
import { PaymentRunPlanner } from '../components/PaymentRunPlanner';

export const Payments = () => {
  const { bills } = useBills();
  const { cashLimit, setCashLimit, candidates, plan, paymentInstructions } = usePayments(bills);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">Scheduled instructions</h2>
        <ul className="mt-4 grid gap-3 text-sm text-foreground/80">
          {paymentInstructions.map((instruction) => (
            <li key={instruction.id} className="flex items-center justify-between rounded-2xl border border-border/50 bg-surface/70 px-4 py-3">
              <span>
                {instruction.method} · {instruction.reference ?? 'Pending ref'}
              </span>
              <span className="text-xs text-muted/80">Executes {new Date(instruction.scheduledFor).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      </section>
      <PaymentRunPlanner
        candidates={candidates}
        plan={plan}
        cashLimit={cashLimit}
        onCashLimitChange={setCashLimit}
      />
    </div>
  );
};
