import { Select } from '../../../shared/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../shared/ui/Table';
import { useBills } from '../hooks/useBills';
import { useApprovals } from '../hooks/useApprovals';
import { formatDate, formatMoney } from '../lib/format';

export const Approvals = () => {
  const { bills } = useBills();
  const { workflows, selectedWorkflow, setSelectedWorkflow, inFlight } = useApprovals(bills);

  return (
    <div className="space-y-8">
      <Select
        label="Workflow"
        value={selectedWorkflow.id}
        onChange={(event) => {
          const workflow = workflows.find((item) => item.id === event.target.value);
          if (workflow) setSelectedWorkflow(workflow);
        }}
        className="w-72"
      >
        {workflows.map((workflow) => (
          <option key={workflow.id} value={workflow.id}>
            {workflow.name}
          </option>
        ))}
      </Select>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">Workflow steps</h3>
          <ol className="mt-4 space-y-3 text-sm text-foreground/80">
            {selectedWorkflow.steps.map((step, index) => (
              <li key={index} className="flex items-center justify-between rounded-2xl border border-border/50 bg-surface/70 px-4 py-3">
                <span>{step.role}</span>
                <span className="text-xs text-muted/80">≥ ${step.threshold.toLocaleString()} · Escalate {step.escalation}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">In-flight approvals</h3>
          <Table aria-label="Approvals">
            <TableHeader>
              <TableRow>
                <TableHead>Bill</TableHead>
                <TableHead>Pending approvers</TableHead>
                <TableHead>Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inFlight.map((item) => (
                <TableRow key={item.bill.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold">{item.bill.number ?? item.bill.id}</span>
                      <span className="text-xs text-muted">Due {formatDate(item.bill.dueDate)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <ul className="space-y-1 text-xs text-foreground/80">
                      {item.pending.map((approval) => (
                        <li key={approval.approverId}>{approval.approverId}</li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell>{formatMoney(item.bill.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};
