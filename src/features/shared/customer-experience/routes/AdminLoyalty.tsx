import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '../../../shared/ui/Table';
import { useLoyalty } from '../hooks/useLoyalty';
import { projectAccrual } from '../lib/loyalty';

export const AdminLoyalty = () => {
  const { loyalty, rewards } = useLoyalty();
  const projection = projectAccrual(loyalty, { eventType: 'purchase', spend: 5000, channel: 'web' });

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-foreground">Loyalty rules</h2>
        <p className="text-sm text-muted">Review earn and burn configurations to maintain healthy economics.</p>
      </header>
      <section className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">Projected earn</h3>
        <p className="mt-3 text-sm text-foreground/90">
          A $50 purchase earns {projection.projectedPoints} points across {projection.awards.length} active rules.
        </p>
      </section>
      <TableContainer>
        <Table aria-label="Rewards">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Kind</TableHead>
              <TableHead>Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rewards.map(reward => (
              <TableRow key={reward.id}>
                <TableCell>{reward.name}</TableCell>
                <TableCell>{reward.kind}</TableCell>
                <TableCell>{reward.pointsCost}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default AdminLoyalty;
