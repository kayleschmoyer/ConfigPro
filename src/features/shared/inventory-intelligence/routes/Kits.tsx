import { motion } from 'framer-motion';
import { KitBreakdown } from '../components/KitBreakdown';
import { ExceptionRow } from '../components/ExceptionRow';
import { useKits } from '../hooks/useKits';

export const Kits = () => {
  const { kits, exceptions, snapshots } = useKits();

  return (
    <section className="space-y-8">
      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
        <h2 className="text-2xl font-semibold text-foreground">Kits & BOM</h2>
        <p className="text-sm text-muted">
          Monitor kit availability and component constraints. ConfigPro explodes demand to components and flags single-point blockers automatically.
        </p>
      </motion.header>
      <div className="grid gap-6 lg:grid-cols-2">
        {kits.map((kit) => (
          <KitBreakdown key={kit.id} kit={kit} snapshots={snapshots} />
        ))}
      </div>
      <div className="space-y-4" role="list">
        {exceptions.map((exception) => (
          <ExceptionRow key={exception.id} exception={exception} />
        ))}
      </div>
    </section>
  );
};
