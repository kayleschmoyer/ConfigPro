import { useEffect, useMemo, useState } from 'react';
import { Drawer } from '../../../shared/ui/Drawer';
import { Input } from '../../../shared/ui/Input';
import { Switch } from '../../../components/ui/Switch';
import { Button } from '../../../shared/ui/Button';
import type { PricingSheet } from '../lib/admin';

interface PricingEditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  draft: PricingSheet;
  published: PricingSheet;
  lastPublishedAt?: string;
  onSaveDraft: (next: PricingSheet) => Promise<void>;
  onPublish: () => Promise<void>;
}

const formatCurrency = (value: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);

export const PricingEditorDrawer = ({
  isOpen,
  onClose,
  draft,
  published,
  lastPublishedAt,
  onSaveDraft,
  onPublish,
}: PricingEditorDrawerProps) => {
  const [form, setForm] = useState<PricingSheet>(draft);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm(draft);
      setError(null);
    }
  }, [draft, isOpen]);

  const hasChanges = useMemo(() => JSON.stringify(form) !== JSON.stringify(draft), [draft, form]);

  const handleNumberChange = (key: keyof PricingSheet, value: string) => {
    const numeric = Number.parseFloat(value || '0');
    setForm((current) => ({ ...current, [key]: Number.isFinite(numeric) ? numeric : 0 }));
  };

  const handleToggle = (key: keyof PricingSheet, value: boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSaveDraft(form);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save draft.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      setPublishing(true);
      await onPublish();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to publish pricing.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Inline pricing editor"
      description="Adjust draft pricing before pushing updates live."
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            <p>Live pricing: {formatCurrency(published.monthly, published.currency)} monthly • {formatCurrency(published.annual, published.currency)} annual</p>
            {lastPublishedAt && <p>Published {new Date(lastPublishedAt).toLocaleString()}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
            <Button variant="outline" disabled={!hasChanges || saving} onClick={handleSave}>
              {saving ? 'Saving…' : 'Save draft'}
            </Button>
            <Button variant="primary" onClick={handlePublish} disabled={publishing}>
              {publishing ? 'Publishing…' : 'Publish live'}
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="Monthly recurring"
            type="number"
            value={form.monthly}
            onChange={(event) => handleNumberChange('monthly', event.target.value)}
            helperText={`Currently ${formatCurrency(published.monthly, published.currency)} live.`}
          />
          <Input
            label="Annual recurring"
            type="number"
            value={form.annual}
            onChange={(event) => handleNumberChange('annual', event.target.value)}
            helperText={`Currently ${formatCurrency(published.annual, published.currency)} live.`}
          />
          <Input
            label="One-time setup"
            type="number"
            value={form.oneTime}
            onChange={(event) => handleNumberChange('oneTime', event.target.value)}
            helperText={`One-time fees are ${formatCurrency(published.oneTime, published.currency)} live.`}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch
              checked={form.perSeat}
              onCheckedChange={(checked) => handleToggle('perSeat', checked)}
              aria-label="Charge per seat"
            />
            <span className="text-sm text-muted-foreground">Charge per seat</span>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={form.perLocation}
              onCheckedChange={(checked) => handleToggle('perLocation', checked)}
              aria-label="Charge per location"
            />
            <span className="text-sm text-muted-foreground">Charge per location</span>
          </div>
        </div>
        {error && <p className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>}
        <div className="rounded-2xl border border-border/60 bg-surface/60 p-4 text-xs text-muted-foreground">
          <p>Publishing pushes the current draft to the live installer immediately. Use the full Pricing Admin for approvals and staged releases.</p>
          <a
            href="/admin/pricing"
            className="mt-2 inline-flex text-primary underline-offset-4 hover:underline"
          >
            Open Pricing Admin →
          </a>
        </div>
      </div>
    </Drawer>
  );
};
