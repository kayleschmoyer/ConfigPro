import { useMemo } from 'react';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { cronPresets, formatCron } from '../lib/sync';

interface ScheduleInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function ScheduleInput({ value, onChange }: ScheduleInputProps) {
  const preset = useMemo(() => cronPresets.find((item) => item.cron === value)?.id ?? 'custom', [value]);

  return (
    <div className="grid gap-3 md:grid-cols-[200px,1fr]">
      <Select
        value={preset}
        onChange={(event) => {
          const next = cronPresets.find((item) => item.id === event.target.value);
          onChange(next ? next.cron : value);
        }}
        label="Schedule Preset"
      >
        {cronPresets.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label} — {item.description}
          </option>
        ))}
        <option value="custom">Custom cron</option>
      </Select>
      <div className="space-y-2">
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-label="Cron expression"
          label="Cron expression"
          helperText={formatCron(value)}
        />
        <p className="text-xs text-muted">Use five-field cron format. We validate client-side only.</p>
      </div>
    </div>
  );
}
