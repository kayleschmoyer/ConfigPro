import { motion } from 'framer-motion';
import { TransferPlanner } from '../components/TransferPlanner';
import { useBalancer } from '../hooks/useBalancer';

export const Balancer = () => {
  const { plans } = useBalancer();

  return (
    <section className="space-y-8">
      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
        <h2 className="text-2xl font-semibold text-foreground">Multi-Location Balancer</h2>
        <p className="text-sm text-muted">
          Resolve surplus and deficit across the network before issuing purchase orders. Transfer proposals respect priorities, display minimums, and transfer costs.
        </p>
      </motion.header>
      <TransferPlanner plans={plans} />
    </section>
  );
};
