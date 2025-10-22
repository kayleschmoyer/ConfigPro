import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { useReplenishment } from '../hooks/useReplenishment';
import { ReplenishmentPlanner } from '../components/ReplenishmentPlanner';
import { ProposalDrawer } from '../components/ProposalDrawer';

export const Replenishment = () => {
  const { proposals, policies, reviewPolicy, skus } = useReplenishment();
  const [activeProposal, setActiveProposal] = useState<typeof proposals[number] | null>(null);

  return (
    <section className="space-y-8">
      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
        <h2 className="text-2xl font-semibold text-foreground">Replenishment Planner</h2>
        <p className="text-sm text-muted">
          Service-level aligned ordering with EOQ, ROP, and periodic review policies. Draft proposals are grouped by supplier and ready for PO handoff.
        </p>
      </motion.header>

      <motion.section className="grid gap-6 lg:grid-cols-3" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
        <Card className="bg-surface/80 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Min / Max Policy</p>
          <p className="mt-3 text-sm text-muted">Safety {policies.safety} • Reorder level {policies.reorderLevel}</p>
          <p className="mt-4 text-sm font-semibold text-primary">Recommended qty {policies.reorderQty}</p>
        </Card>
        <Card className="bg-surface/80 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Periodic Review</p>
          <p className="mt-3 text-sm text-muted">Target level {reviewPolicy.targetLevel}</p>
          <p className="mt-4 text-sm font-semibold text-primary">Order qty {reviewPolicy.reorderQty}</p>
        </Card>
        <Card className="bg-surface/80 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Draft Proposals</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            {proposals.map((proposal) => (
              <li key={proposal.id} className="flex items-center justify-between">
                <span>{proposal.supplierId}</span>
                <Button size="sm" variant="ghost" onClick={() => setActiveProposal(proposal)}>
                  View
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      </motion.section>

      <ReplenishmentPlanner proposals={proposals} skus={skus} onCreate={() => setActiveProposal(null)} />

      <ProposalDrawer proposal={activeProposal} onClose={() => setActiveProposal(null)} onConfirm={() => setActiveProposal(null)} />
    </section>
  );
};
