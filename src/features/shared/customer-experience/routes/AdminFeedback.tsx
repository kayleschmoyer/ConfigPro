import { Table, TableBody, TableCell, TableContainer, TableHead, TableHeader, TableRow } from '@/shared/ui/Table';
import { useFeedback } from '../hooks/useFeedback';

export const AdminFeedback = () => {
  const { surveys, nps, csat, tags } = useFeedback();

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-foreground">Feedback & surveys</h2>
        <p className="text-sm text-muted">Design surveys, monitor response health, and surface top drivers.</p>
      </header>
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
          <h3 className="text-xs uppercase tracking-[0.3em] text-muted">NPS</h3>
          <p className="mt-3 text-3xl font-semibold text-primary">{nps.score}</p>
        </div>
        <div className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
          <h3 className="text-xs uppercase tracking-[0.3em] text-muted">CSAT</h3>
          <p className="mt-3 text-3xl font-semibold text-primary">{(csat.average || 0).toFixed(1)}</p>
        </div>
        <div className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
          <h3 className="text-xs uppercase tracking-[0.3em] text-muted">Promoters</h3>
          <p className="mt-3 text-3xl font-semibold text-primary">{nps.promoters}</p>
        </div>
      </section>
      <TableContainer>
        <Table aria-label="Surveys">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Reward</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {surveys.map(survey => (
              <TableRow key={survey.id}>
                <TableCell>{survey.name}</TableCell>
                <TableCell>{survey.type}</TableCell>
                <TableCell>{survey.questions.length}</TableCell>
                <TableCell>{survey.rewardPoints ?? 0} pts</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <section className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">Top drivers</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map(tag => (
            <span key={tag.keyword} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              {tag.keyword} ({tag.count})
            </span>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminFeedback;
