import { Button } from '../../../shared/ui/Button';

const requests = [
  {
    id: 'swap-1',
    employee: 'Anna Lopez',
    from: 'Mon · Front Desk · 8a – 4p',
    to: 'Camille Singh',
    status: 'Awaiting approval',
  },
  {
    id: 'swap-2',
    employee: 'Dylan Brooks',
    from: 'Tue · Kitchen · 9a – 3p',
    to: 'Gia Patel',
    status: 'Manager review',
  },
];

export const Swaps = () => (
  <div className="space-y-6">
    <header className="space-y-2">
      <h2 className="text-2xl font-semibold text-foreground">Shift swaps & time off</h2>
      <p className="max-w-2xl text-sm text-muted-foreground">
        Track swap offers, approvals, and paid time off in a single queue. Approved changes sync back to the schedule instantly.
      </p>
    </header>
    <div className="space-y-4">
      {requests.map((request) => (
        <div key={request.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface/70 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">{request.employee}</p>
            <p className="text-xs text-muted-foreground">Swap with {request.to}</p>
            <p className="text-xs text-muted-foreground">{request.from}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-500">{request.status}</span>
            <Button size="sm" variant="ghost">
              Approve
            </Button>
            <Button size="sm" variant="ghost">
              Decline
            </Button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
