import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { formatDateTime } from '../lib/format';
import type { Appointment } from '../lib/types';

interface AppointmentBookerProps {
  appointments: Array<Appointment & { window: string }>;
  onReschedule: (appointmentId: string, startsAt: string, endsAt: string) => void;
  onCancel: (appointmentId: string) => void;
}

const slots = Array.from({ length: 5 }, (_, index) => {
  const start = new Date(Date.now() + (index + 1) * 24 * 60 * 60 * 1000);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return {
    id: `slot-${index}`,
    label: `${formatDateTime(start.toISOString())} – ${formatDateTime(end.toISOString())}`,
    value: { start: start.toISOString(), end: end.toISOString() }
  };
});

export const AppointmentBooker = ({ appointments, onReschedule, onCancel }: AppointmentBookerProps) => {
  const [selectedSlot, setSelectedSlot] = useState(slots[0]);

  if (!appointments.length) {
    return (
      <div className="rounded-3xl border border-dashed border-border/60 bg-surface/60 p-6 text-center text-sm text-muted">
        No appointments yet. Use the scheduler to book your first visit.
      </div>
    );
  }

  const upcoming = appointments[0];

  return (
    <div className="space-y-6">
      <motion.section
        layout
        className="rounded-3xl border border-border/60 bg-surface/80 p-6 shadow-lg shadow-primary/5"
      >
        <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Next appointment</h3>
            <p className="text-sm text-muted">{upcoming.window}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => onCancel(upcoming.id)}>
              Cancel
            </Button>
          </div>
        </header>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Select
            label="Pick a new slot"
            value={selectedSlot.id}
            onChange={event => {
              const slot = slots.find(candidate => candidate.id === event.target.value);
              if (slot) setSelectedSlot(slot);
            }}
          >
            {slots.map(slot => (
              <option key={slot.id} value={slot.id}>
                {slot.label}
              </option>
            ))}
          </Select>
          <Input label="Notes" placeholder="Add access info or preferences" />
        </div>
        <div className="mt-6 flex justify-end">
          <Button
            onClick={() =>
              onReschedule(upcoming.id, selectedSlot.value.start, selectedSlot.value.end)
            }
          >
            Reschedule
          </Button>
        </div>
      </motion.section>
    </div>
  );
};
