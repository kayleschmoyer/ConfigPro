import { Button } from '../../../shared/ui/Button';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '../../../shared/ui/Table';
import { useFeedback } from '../hooks/useFeedback';
import { useLoyalty } from '../hooks/useLoyalty';
import { usePortal } from '../hooks/usePortal';

export const AdminReports = () => {
  const { nps } = useFeedback();
  const { loyalty } = useLoyalty();
  const { snapshot } = usePortal();

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Reports</h2>
          <p className="text-sm text-muted">Export engagement, redemption, and satisfaction analytics.</p>
        </div>
        <Button variant="outline">Download CSV</Button>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
          <h3 className="text-xs uppercase tracking-[0.3em] text-muted">Engagement rate</h3>
          <p className="mt-3 text-3xl font-semibold text-primary">82%</p>
        </article>
        <article className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
          <h3 className="text-xs uppercase tracking-[0.3em] text-muted">NPS</h3>
          <p className="mt-3 text-3xl font-semibold text-primary">{nps.score}</p>
        </article>
        <article className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
          <h3 className="text-xs uppercase tracking-[0.3em] text-muted">Points issued (30d)</h3>
          <p className="mt-3 text-3xl font-semibold text-primary">{loyalty.history.reduce((sum, entry) => sum + Math.max(entry.delta, 0), 0)}</p>
        </article>
      </section>
      <TableContainer>
        <Table aria-label="Recent activity">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Event</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {snapshot.loyalty.history.map(entry => (
              <TableRow key={entry.at}>
                <TableCell>{new Date(entry.at).toLocaleDateString()}</TableCell>
                <TableCell>{entry.delta > 0 ? 'Points earned' : 'Points redeemed'}</TableCell>
                <TableCell>{entry.reason}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default AdminReports;
