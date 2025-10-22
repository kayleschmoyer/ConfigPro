import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/lib/cn';
import type { ConnectorCatalogItem } from '../lib/types';

interface ConnectorCardProps {
  connector: ConnectorCatalogItem;
  active?: boolean;
  onSelect?: (connector: ConnectorCatalogItem) => void;
}

const brandColors: Record<ConnectorCatalogItem['kind'], string> = {
  QUICKBOOKS: 'from-emerald-500/60 via-emerald-400/30 to-emerald-300/20',
  GOOGLE: 'from-sky-500/60 via-sky-400/30 to-sky-300/20',
  STRIPE: 'from-indigo-500/60 via-indigo-400/30 to-indigo-300/20',
  TWILIO: 'from-rose-500/60 via-rose-400/30 to-rose-300/20',
  SLACK: 'from-violet-500/60 via-violet-400/30 to-violet-300/20',
  CUSTOM: 'from-gray-500/60 via-gray-400/30 to-gray-300/20'
};

export function ConnectorCard({ connector, active, onSelect }: ConnectorCardProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect?.(connector)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        'flex h-full w-full flex-col justify-between rounded-3xl border border-border/60 bg-surface/80 p-6 text-left shadow-lg shadow-primary/5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
        active && 'border-primary/60 bg-primary/10'
      )}
    >
      <div>
        <div
          className={cn(
            'mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-lg font-semibold text-white shadow-lg',
            brandColors[connector.kind]
          )}
          aria-hidden
        >
          {connector.name.slice(0, 2)}
        </div>
        <h3 className="text-lg font-semibold text-foreground">{connector.name}</h3>
        <p className="mt-2 text-sm text-muted">{connector.description}</p>
      </div>
      <div className="mt-6 flex flex-wrap gap-2 text-xs text-muted">
        {connector.scopes.slice(0, 4).map((scope) => (
          <span key={scope} className="rounded-full bg-surface px-3 py-1">
            {scope}
          </span>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <span className="text-xs uppercase tracking-[0.3em] text-muted">{connector.domains.join(' • ')}</span>
        <Button size="sm" variant={active ? 'primary' : 'outline'}>
          {active ? 'Selected' : 'Connect'}
        </Button>
      </div>
    </motion.button>
  );
}
