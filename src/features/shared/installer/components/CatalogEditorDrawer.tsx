import { useEffect, useMemo, useState } from 'react';
import { Drawer } from '@/shared/ui/Drawer';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/shared/ui/Button';
import type { FeatureCatalogItem, LayoutRegion } from '../lib';
import type { CatalogOverride } from '../lib/admin';

interface CatalogEditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  featureId: string | null;
  catalog: FeatureCatalogItem[];
  onSelectFeature: (featureId: string | null) => void;
  onSave: (featureId: string, override: CatalogOverride) => Promise<void>;
  pinnedFeatureIds?: string[];
  onTogglePinned: (featureId: string, pinned: boolean) => Promise<void>;
}

const visibilityOptions = [
  { value: 'visible', label: 'Visible to customers' },
  { value: 'hidden', label: 'Hidden (admins only)' },
];

export const CatalogEditorDrawer = ({
  isOpen,
  onClose,
  featureId,
  catalog,
  onSelectFeature,
  onSave,
  pinnedFeatureIds,
  onTogglePinned,
}: CatalogEditorDrawerProps) => {
  const [override, setOverride] = useState<CatalogOverride | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pinnedSet = useMemo(() => new Set(pinnedFeatureIds), [pinnedFeatureIds]);

  const feature = useMemo(() => catalog.find((item) => item.id === featureId) ?? null, [catalog, featureId]);

  useEffect(() => {
    if (isOpen && feature) {
      setOverride({
        description: feature.description,
        defaultIcon: feature.defaultIcon,
        defaultRegion: feature.defaultRegion,
        defaultVisibility: feature.adminMeta?.hidden ? 'hidden' : 'visible',
      });
      setError(null);
    }
  }, [feature, isOpen]);

  const handleSave = async () => {
    if (!feature || !override) return;
    try {
      setSaving(true);
      await onSave(feature.id, override);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save catalog changes.');
    } finally {
      setSaving(false);
    }
  };

  const handlePinnedToggle = async (checked: boolean) => {
    if (!feature) return;
    try {
      await onTogglePinned(feature.id, checked);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update pinned state.');
    }
  };

  const regions: LayoutRegion[] = ['SIDEBAR', 'HOME_BUTTON', 'TOPBAR', 'HIDDEN'];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Catalog editor"
      description="Adjust metadata that powers the shared installer catalog."
      footer={
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={!feature || saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Select
          label="Feature"
          value={feature?.id ?? ''}
          onChange={(event) => onSelectFeature(event.target.value || null)}
        >
          <option value="" disabled>
            Select a feature
          </option>
          {catalog.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
        {feature && override && (
          <div className="space-y-4">
            <Input
              label="Customer description"
              value={override.description ?? ''}
              onChange={(event) => setOverride((current) => ({ ...current, description: event.target.value }))}
            />
            <Input
              label="Icon name"
              value={override.defaultIcon ?? ''}
              onChange={(event) => setOverride((current) => ({ ...current, defaultIcon: event.target.value }))}
            />
            <Select
              label="Default region"
              value={override.defaultRegion ?? ''}
              onChange={(event) =>
                setOverride((current) => ({ ...current, defaultRegion: event.target.value as LayoutRegion }))
              }
            >
              <option value="" disabled>
                Choose region
              </option>
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </Select>
            <Select
              label="Visibility"
              value={override.defaultVisibility ?? 'visible'}
              onChange={(event) =>
                setOverride((current) => ({ ...current, defaultVisibility: event.target.value as 'visible' | 'hidden' }))
              }
            >
              {visibilityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-surface/70 p-4">
              <Switch
                checked={pinnedSet.has(feature.id)}
                onCheckedChange={(checked: boolean) => void handlePinnedToggle(checked)}
                aria-label="Toggle pinned"
              />
              <div className="text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Pin feature to bundle</p>
                <p>Pinned features stay enabled for all customers even when admin mode is off.</p>
              </div>
            </div>
          </div>
        )}
        {error && <p className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>}
      </div>
    </Drawer>
  );
};
