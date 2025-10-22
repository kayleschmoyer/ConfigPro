import { useMemo } from 'react';
import { Drawer } from '../../../shared/ui/Drawer';
import { useAuditLog } from '../lib/admin';

interface AuditDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditDrawer = ({ isOpen, onClose }: AuditDrawerProps) => {
  const entries = useAuditLog();

  const grouped = useMemo(() => {
    return entries.reduce<Record<string, typeof entries>>((acc, entry) => {
      const date = entry.timestamp.slice(0, 10);
      acc[date] = acc[date] ? [...acc[date], entry] : [entry];
      return acc;
    }, {});
  }, [entries]);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Admin audit log"
      description="Recent pricing, catalog, and layout changes."
      side="left"
      footer={
        <p className="text-xs text-muted-foreground">
          RBAC_DENY events indicate blocked attempts. Data is local to this demo environment.
        </p>
      }
    >
      <div className="space-y-6">
        {entries.length === 0 && (
          <p className="text-sm text-muted-foreground">No admin actions recorded yet.</p>
        )}
        {Object.entries(grouped)
          .sort(([a], [b]) => (a < b ? 1 : -1))
          .map(([date, items]) => (
            <section key={date} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-muted">{date}</h3>
              <ul className="space-y-2">
                {items.map((entry) => (
                  <li key={entry.id} className="rounded-2xl border border-border/60 bg-surface/60 p-4 text-sm text-muted-foreground">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground">{entry.summary}</span>
                      <span className="text-xs uppercase tracking-[0.2em] text-muted">{entry.type}</span>
                    </div>
                    <p className="text-xs text-muted-foreground/80">
                      {new Date(entry.timestamp).toLocaleTimeString()} • Actor {entry.actorEmail ?? entry.actorId}
                    </p>
                    {entry.details && (
                      <pre className="mt-2 rounded-xl bg-background/60 p-2 text-xs text-muted-foreground/90">
                        {JSON.stringify(entry.details, null, 2)}
                      </pre>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))}
      </div>
    </Drawer>
  );
};
