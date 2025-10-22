import { motion } from 'framer-motion';
import { SupplierCard } from '../components/SupplierCard';
import { useSuppliers } from '../hooks/useSuppliers';

export const Suppliers = () => {
  const { suppliers, stats } = useSuppliers();

  return (
    <section className="space-y-8">
      <motion.header initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
        <h2 className="text-2xl font-semibold text-foreground">Suppliers & Lead Times</h2>
        <p className="text-sm text-muted">
          Track reliability, service level adherence, and price breaks. ConfigPro surfaces composite supplier scores with on-time, lead time variance, and defect rates.
        </p>
      </motion.header>
      <motion.div
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
      >
        {suppliers.map((supplier) => (
          <SupplierCard
            key={supplier.id}
            supplier={supplier}
            stats={stats.find((stat) => stat.supplierId === supplier.id)}
          />
        ))}
      </motion.div>
    </section>
  );
};
