import { useEffect, useMemo, useState } from 'react';
import { Drawer } from '../../../shared/ui/Drawer';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Select } from '../../../shared/ui/Select';
import { Switch } from '../../../components/ui/Switch';
import type { FeatureCatalogItem } from '../lib/types';

type FieldType = 'string' | 'number' | 'select' | 'toggle';

interface OptionField {
  key: string;
  label: string;
  helperText?: string;
  type: FieldType;
  options?: { label: string; value: string }[];
  required?: boolean;
}

const optionLibrary: Record<string, OptionField[]> = {
  'feature-flags-control-service': [
    {
      key: 'rolloutStrategy',
      label: 'Default rollout strategy',
      helperText: 'Choose how new flags graduate across environments.',
      type: 'select',
      options: [
        { label: 'Org-wide instant', value: 'instant' },
        { label: 'Progressive by cohort', value: 'progressive' },
        { label: 'Manual approvals', value: 'manual' },
      ],
      required: true,
    },
    {
      key: 'requireChangeTicket',
      label: 'Require change ticket',
      helperText: 'Enforce audit notes when toggling to production.',
      type: 'toggle',
    },
  ],
  'payment-provider-control-plane': [
    {
      key: 'primaryProcessor',
      label: 'Primary processor',
      helperText: 'Select the default payment processor for new locations.',
      type: 'select',
      options: [
        { label: 'Stripe', value: 'stripe' },
        { label: 'Adyen', value: 'adyen' },
        { label: 'Checkout.com', value: 'checkout' },
      ],
      required: true,
    },
    {
      key: 'fraudMonitoring',
      label: 'Enable fraud monitoring',
      helperText: 'Adds velocity and device fingerprinting policies.',
      type: 'toggle',
    },
  ],
  'pricing-rules-control-center': [
    {
      key: 'defaultMarkup',
      label: 'Default markup %',
      helperText: 'Applied when a category override is missing.',
      type: 'number',
      required: true,
    },
    {
      key: 'autoSync',
      label: 'Sync with ERP pricing',
      type: 'toggle',
      helperText: 'Nightly sync pushes updates to ERP connectors.',
    },
  ],
  'reporting-intelligence': [
    {
      key: 'defaultDashboard',
      label: 'Default dashboard view',
      type: 'select',
      options: [
        { label: 'Executive KPIs', value: 'executive' },
        { label: 'Operational metrics', value: 'operational' },
        { label: 'Finance board pack', value: 'finance' },
      ],
    },
    {
      key: 'enableNarratives',
      label: 'Enable narrative insights',
      type: 'toggle',
      helperText: 'Adds AI-generated insight cards into dashboards.',
    },
  ],
};

const fallbackFields: OptionField[] = [
  {
    key: 'notes',
    label: 'Implementation notes',
    helperText: 'Document how this feature should be configured during rollout.',
    type: 'string',
  },
];

interface FeatureOptionsDrawerProps {
  feature: FeatureCatalogItem | null;
  isOpen: boolean;
  onClose: () => void;
  value?: Record<string, unknown>;
  onSave: (options: Record<string, unknown>) => void;
}

export const FeatureOptionsDrawer = ({ feature, isOpen, onClose, value, onSave }: FeatureOptionsDrawerProps) => {
  const fields = useMemo(() => {
    if (!feature) return [];
    return optionLibrary[feature.id] ?? fallbackFields;
  }, [feature]);

  const [formState, setFormState] = useState<Record<string, unknown>>(value ?? {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!feature) return;
    setFormState(value ?? {});
    setErrors({});
  }, [feature, value]);

  const updateField = (key: string, next: unknown) => {
    setFormState((prev) => ({ ...prev, [key]: next }));
  };

  const handleSave = () => {
    const nextErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (!field.required) return;
      const currentValue = formState[field.key];
      if (currentValue === undefined || currentValue === '' || currentValue === null) {
        nextErrors[field.key] = 'Required field';
      }
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    onSave(formState);
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={feature?.name ?? 'Feature options'}
      description={feature?.description}
      footer={
        <div className="flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} size="sm">
            Save options
          </Button>
        </div>
      }
    >
      {!feature ? (
        <p className="text-sm text-muted-foreground">Select a feature to configure.</p>
      ) : (
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            handleSave();
          }}
        >
          {fields.map((field) => {
            const currentValue = formState[field.key];
            switch (field.type) {
              case 'toggle':
                return (
                  <label key={field.key} className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-surface/70 p-4">
                    <div className="space-y-1">
                      <span className="text-sm font-medium text-foreground">{field.label}</span>
                      {field.helperText && <p className="text-xs text-muted-foreground">{field.helperText}</p>}
                    </div>
                    <Switch
                      checked={Boolean(currentValue)}
                      onCheckedChange={(checked) => updateField(field.key, checked)}
                    />
                  </label>
                );
              case 'select':
                return (
                  <Select
                    key={field.key}
                    label={field.label}
                    helperText={field.helperText}
                    value={(currentValue as string | undefined) ?? ''}
                    onChange={(event) => updateField(field.key, event.target.value)}
                    error={errors[field.key]}
                  >
                    <option value="" disabled>
                      Select an option
                    </option>
                    {(field.options ?? []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                );
              case 'number':
                return (
                  <Input
                    key={field.key}
                    label={field.label}
                    type="number"
                    helperText={field.helperText}
                    value={currentValue as number | undefined}
                    onChange={(event) => updateField(field.key, Number(event.target.value))}
                    error={errors[field.key]}
                  />
                );
              default:
                return (
                  <Input
                    key={field.key}
                    label={field.label}
                    helperText={field.helperText}
                    value={(currentValue as string | undefined) ?? ''}
                    onChange={(event) => updateField(field.key, event.target.value)}
                    error={errors[field.key]}
                  />
                );
            }
          })}
        </form>
      )}
    </Drawer>
  );
};
