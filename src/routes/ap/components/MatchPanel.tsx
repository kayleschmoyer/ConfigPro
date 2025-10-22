import { VarianceBadge } from './VarianceBadge';
import type { MatchAssessment } from '../lib/match';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/Table';

export const MatchPanel = ({ assessment }: { assessment?: MatchAssessment }) => {
  if (!assessment) {
    return <p className="text-sm text-muted">No match information available.</p>;
  }

  return (
    <div className="space-y-6">
      <VarianceBadge assessment={assessment} />
      {assessment.variances.length > 0 && (
        <div className="rounded-3xl border border-border/60 bg-surface/70 p-4 shadow-sm">
          <Table aria-label="Match variances">
            <TableHeader>
              <TableRow>
                <TableHead>Variance</TableHead>
                <TableHead>Expected</TableHead>
                <TableHead>Actual</TableHead>
                <TableHead>Tolerance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessment.variances.map((variance) => (
                <TableRow key={variance.kind}>
                  <TableCell className="font-semibold uppercase tracking-[0.2em]">
                    {variance.kind}
                  </TableCell>
                  <TableCell>{variance.expected.toLocaleString()}</TableCell>
                  <TableCell>{variance.actual.toLocaleString()}</TableCell>
                  <TableCell>{(variance.tolerance * 100).toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
