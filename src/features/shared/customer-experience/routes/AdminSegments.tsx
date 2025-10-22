import { useState } from 'react';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { SegmentBuilder } from '../components/SegmentBuilder';
import { useSegmentBuilder, useSegments } from '../hooks/useSegments';

export const AdminSegments = () => {
  const { fields, previews, addSegment } = useSegments();
  const { draft, updateName, updateRules } = useSegmentBuilder();
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Segments & targeting</h2>
          <p className="text-sm text-muted">Build AND/OR logic powered by core and custom fields.</p>
        </div>
        <div className="flex items-center gap-3">
          <Input value={draft.name} onChange={event => updateName(event.target.value)} />
          <Button
            onClick={() => {
              addSegment(draft.name, draft.rules);
              setLastSaved(new Date().toISOString());
            }}
          >
            Save segment
          </Button>
        </div>
      </header>

      {lastSaved && (
        <div className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
          Segment saved at {new Date(lastSaved).toLocaleTimeString()}.
        </div>
      )}

      <SegmentBuilder fields={fields} segment={draft} onChange={updateRules} />

      <section className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/10">
        <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-muted">Live segments</h3>
        <ul className="mt-4 space-y-3 text-sm text-foreground/90">
          {previews.map(({ segment, preview }) => (
            <li key={segment.id} className="flex items-center justify-between rounded-2xl border border-border/50 bg-surface/70 px-4 py-3">
              <div>
                <p className="font-semibold">{segment.name}</p>
                <p className="text-xs text-muted">{segment.rules.type} logic</p>
              </div>
              <span className="rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary">
                {preview.total} members
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default AdminSegments;
