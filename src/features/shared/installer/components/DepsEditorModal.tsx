import { useEffect, useMemo, useState } from 'react';
import { Modal } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import type { FeatureCatalogItem } from '../lib/types';
import type { DependencyOverride } from '../lib/admin';

interface DepsEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  catalog: FeatureCatalogItem[];
  overrides: Record<string, DependencyOverride>;
  onSave: (featureId: string, override: DependencyOverride) => Promise<void>;
}

const detectCycle = (graph: Map<string, string[]>): string | null => {
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (node: string, stack: string[]): boolean => {
    if (visiting.has(node)) {
      return true;
    }
    if (visited.has(node)) return false;
    visiting.add(node);
    stack.push(node);
    for (const neighbor of graph.get(node) ?? []) {
      if (visit(neighbor, stack)) {
        return true;
      }
    }
    visiting.delete(node);
    visited.add(node);
    stack.pop();
    return false;
  };

  for (const node of graph.keys()) {
    if (!visited.has(node)) {
      const stack: string[] = [];
      if (visit(node, stack)) {
        return [...stack, node].join(' → ');
      }
    }
  }

  return null;
};

export const DepsEditorModal = ({ isOpen, onClose, catalog, overrides, onSave }: DepsEditorModalProps) => {
  const [featureId, setFeatureId] = useState<string>('');
  const [dependsOn, setDependsOn] = useState<string[]>([]);
  const [conflictsWith, setConflictsWith] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const initialId = catalog[0]?.id ?? '';
    setFeatureId(initialId);
    setDependsOn([]);
    setConflictsWith([]);
    setError(null);
  }, [catalog, isOpen]);

  const graph = useMemo(() => {
    const map = new Map<string, string[]>();
    catalog.forEach((item) => {
      const override = overrides[item.id];
      map.set(item.id, override?.dependsOn ?? item.dependsOn ?? []);
    });
    return map;
  }, [catalog, overrides]);

  const activeFeature = useMemo(() => catalog.find((item) => item.id === featureId) ?? null, [catalog, featureId]);

  useEffect(() => {
    if (!activeFeature) return;
    const override = overrides[activeFeature.id];
    setDependsOn(override?.dependsOn ?? activeFeature.dependsOn ?? []);
    setConflictsWith(override?.conflictsWith ?? activeFeature.conflictsWith ?? []);
  }, [activeFeature, overrides]);

  const availableOptions = useMemo(() => catalog.filter((item) => item.id !== featureId), [catalog, featureId]);

  const cyclePreview = useMemo(() => {
    if (!featureId) return null;
    const nextGraph = new Map(graph);
    nextGraph.set(featureId, dependsOn);
    return detectCycle(nextGraph);
  }, [dependsOn, featureId, graph]);

  const handleCheckbox = (list: string[], value: string, setter: (values: string[]) => void) => {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  };

  const handleSave = async () => {
    if (!featureId) {
      setError('Select a feature to edit.');
      return;
    }
    if (cyclePreview) {
      setError(`Dependency cycle detected: ${cyclePreview}`);
      return;
    }
    try {
      setSaving(true);
      await onSave(featureId, { dependsOn, conflictsWith });
      setError(null);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update dependencies.');
    } finally {
      setSaving(false);
    }
  };

  const impactPreview = useMemo(() => {
    if (!featureId) return [];
    const enabled = dependsOn.map((id) => catalog.find((item) => item.id === id)?.name ?? id);
    const disabled = conflictsWith.map((id) => catalog.find((item) => item.id === id)?.name ?? id);
    return [
      enabled.length ? `Will auto-enable: ${enabled.join(', ')}` : 'No auto-enables',
      disabled.length ? `Will disable when selected: ${disabled.join(', ')}` : 'No conflicts configured',
    ];
  }, [catalog, conflictsWith, dependsOn, featureId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Advanced dependencies"
      description="Fine-tune dependency and conflict relationships across features."
      size="xl"
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <label className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span>Select feature</span>
          <select
            value={featureId}
            onChange={(event) => {
              setFeatureId(event.target.value);
              setError(null);
            }}
            className="h-11 rounded-full border border-border/60 bg-background/60 px-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <option value="" disabled>
              Choose feature…
            </option>
            {catalog.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        {activeFeature && (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">Depends on</p>
              <ul className="space-y-2 rounded-2xl border border-border/60 bg-surface/60 p-3 text-sm text-muted-foreground">
                {availableOptions.map((item) => (
                  <li key={`depends-${item.id}`} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`depends-${item.id}`}
                      checked={dependsOn.includes(item.id)}
                      onChange={() => handleCheckbox(dependsOn, item.id, setDependsOn)}
                    />
                    <label htmlFor={`depends-${item.id}`} className="flex-1 cursor-pointer">
                      {item.name}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-foreground">Conflicts with</p>
              <ul className="space-y-2 rounded-2xl border border-border/60 bg-surface/60 p-3 text-sm text-muted-foreground">
                {availableOptions.map((item) => (
                  <li key={`conflicts-${item.id}`} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`conflicts-${item.id}`}
                      checked={conflictsWith.includes(item.id)}
                      onChange={() => handleCheckbox(conflictsWith, item.id, setConflictsWith)}
                    />
                    <label htmlFor={`conflicts-${item.id}`} className="flex-1 cursor-pointer">
                      {item.name}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {impactPreview.length > 0 && (
          <div className="rounded-2xl border border-border/60 bg-surface/60 p-4 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Impact preview</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {impactPreview.map((line, index) => (
                <li key={index}>{line}</li>
              ))}
            </ul>
          </div>
        )}
        {cyclePreview && (
          <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100">
            Cycle detected: {cyclePreview}. Adjust dependencies to remove circular references.
          </p>
        )}
        {error && <p className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>}
      </div>
    </Modal>
  );
};
