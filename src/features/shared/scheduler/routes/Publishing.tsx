import { Button } from '@/shared/ui/Button';
import { sampleShifts } from '../lib/constants';
import { usePublishing } from '../hooks/usePublishing';

export const Publishing = () => {
  const publishing = usePublishing(sampleShifts);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Publishing & notifications</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Publish snapshots to notify employees. ConfigPro keeps a version history so you can revert or audit any release.
        </p>
      </header>
      <div className="flex items-center gap-3">
        <Button size="sm" variant="primary" onClick={() => publishing.publish(sampleShifts)}>
          Publish latest draft
        </Button>
        {publishing.status === 'PUBLISHED' && (
          <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-500">
            Live · {publishing.latestSnapshot?.createdAt && new Date(publishing.latestSnapshot.createdAt).toLocaleString()}
          </span>
        )}
        <Button size="sm" variant="ghost" onClick={publishing.revertToDraft}>
          Return to draft
        </Button>
      </div>
      <section className="space-y-3 rounded-2xl border border-border bg-surface/70 p-5 backdrop-blur">
        <h3 className="text-sm font-semibold text-foreground">Snapshots</h3>
        {publishing.snapshots.length === 0 && <p className="text-sm text-muted-foreground">No snapshots yet.</p>}
        <ul className="space-y-2 text-sm text-muted-foreground">
          {publishing.snapshots.map((snapshot) => (
            <li key={snapshot.id} className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 px-4 py-3">
              <div>
                <p className="font-semibold text-foreground">{snapshot.label}</p>
                <p>{new Date(snapshot.createdAt).toLocaleString()}</p>
              </div>
              <Button size="sm" variant="ghost">
                Export .ics
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};
