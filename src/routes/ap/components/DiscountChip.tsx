import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import type { DiscountInsight } from '../lib/discounts';

export const DiscountChip = ({ insight }: { insight?: DiscountInsight }) => {
  if (!insight) return null;
  const tone = insight.expiresIn <= 3 ? 'bg-error/10 text-error border-error/40' : 'bg-primary/10 text-primary border-primary/30';

  return (
    <motion.span
      layout
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em]',
        tone
      )}
    >
      <span>{insight.label}</span>
      <span className="font-medium text-foreground/70">{insight.expiresIn > 0 ? `${insight.expiresIn}d left` : 'Expires today'}</span>
    </motion.span>
  );
};
