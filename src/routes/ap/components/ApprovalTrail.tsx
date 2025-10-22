import { motion } from 'framer-motion';
import type { Bill } from '../lib/types';
import { formatDate } from '../lib/format';

export const ApprovalTrail = ({ approvals }: { approvals?: Bill['approvals'] }) => {
  if (!approvals?.length) return <p className="text-sm text-muted">No approval history yet.</p>;

  return (
    <ol className="space-y-4" aria-label="Approval trail">
      {approvals.map((approval, index) => (
        <motion.li
          key={`${approval.approverId}-${index}`}
          className="rounded-2xl border border-border/60 bg-surface/70 p-4 shadow-sm"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18, delay: index * 0.04 }}
        >
          <div className="flex items-center justify-between text-sm font-semibold uppercase tracking-[0.2em]">
            <span>{approval.approverId}</span>
            <span className="text-muted">{approval.status}</span>
          </div>
          <p className="mt-2 text-sm text-foreground/80">
            {approval.note ?? 'Awaiting decision'}
          </p>
          <p className="mt-1 text-xs text-muted/80">{approval.at ? formatDate(approval.at) : 'Not yet actioned'}</p>
        </motion.li>
      ))}
    </ol>
  );
};
