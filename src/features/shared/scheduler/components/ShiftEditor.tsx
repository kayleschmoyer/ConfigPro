import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Modal } from '@/shared/ui/Modal';
import { Select } from '@/shared/ui/Select';
import type { Violation } from '../lib/types';
import type { ShiftWithMeta } from '../hooks/useSchedule';
import type { Employee, Location, Role, Shift } from '../lib/types';

const toISO = (date: string, time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const result = new Date(`${date}T00:00:00.000Z`);
  result.setUTCHours(hours, minutes, 0, 0);
  return result.toISOString();
};

const extractTime = (iso: string) => iso.slice(11, 16);

export type ShiftEditorProps = {
  shift: ShiftWithMeta | null;
  isOpen: boolean;
  employees: Employee[];
  roles: Role[];
  locations: Location[];
  onClose: () => void;
  onSave: (shift: Shift) => void;
  onDelete?: (shiftId: string) => void;
  onDuplicate?: (shiftId: string) => void;
  evaluate: (shift: Shift) => Violation[];
  preview: Violation[] | null;
  setPreview: (violations: Violation[] | null) => void;
  timeIncrement: number;
};

type FormState = {
  id: string;
  employeeId?: string;
  roleId: string;
  locationId: string;
  date: string;
  startTime: string;
  endTime: string;
  breakMin: number;
  notes?: string;
};

const defaultForm: FormState = {
  id: '',
  roleId: '',
  locationId: '',
  date: '',
  startTime: '08:00',
  endTime: '16:00',
  breakMin: 30,
};

export const ShiftEditor = ({
  shift,
  isOpen,
  employees,
  roles,
  locations,
  onClose,
  onSave,
  onDelete,
  onDuplicate,
  evaluate,
  preview,
  setPreview,
  timeIncrement,
}: ShiftEditorProps) => {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [errors, setErrors] = useState<string | null>(null);

  useEffect(() => {
    if (!shift) {
      setForm(defaultForm);
      setPreview(null);
      return;
    }
    setForm({
      id: shift.id,
      employeeId: shift.employee?.id,
      roleId: shift.role?.id ?? roles[0]?.id ?? '',
      locationId: shift.location?.id ?? locations[0]?.id ?? '',
      date: shift.start.slice(0, 10),
      startTime: extractTime(shift.start),
      endTime: extractTime(shift.end),
      breakMin: shift.breakMin ?? 30,
      notes: shift.notes,
    });
  }, [shift, roles, locations, setPreview]);

  const currentEmployee = useMemo(() => employees.find((employee) => employee.id === form.employeeId), [employees, form.employeeId]);

  useEffect(() => {
    if (!shift) return;
    const nextShift: Shift = {
      id: form.id,
      employeeId: form.employeeId,
      roleId: form.roleId,
      locationId: form.locationId,
      start: toISO(form.date, form.startTime),
      end: toISO(form.date, form.endTime),
      breakMin: form.breakMin,
      status: shift.status,
      notes: form.notes,
    };
    setPreview(evaluate(nextShift));
  }, [form, evaluate, setPreview, shift]);

  const handleChange = (key: keyof FormState, value: string | number | undefined) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!form.date || !form.startTime || !form.endTime || !form.roleId || !form.locationId) {
      setErrors('Complete all required fields');
      return;
    }
    const startISO = toISO(form.date, form.startTime);
    const endISO = toISO(form.date, form.endTime);
    if (new Date(endISO) <= new Date(startISO)) {
      setErrors('End time must be after start time');
      return;
    }
    const shiftPayload: Shift = {
      id: form.id,
      employeeId: form.employeeId,
      roleId: form.roleId,
      locationId: form.locationId,
      start: startISO,
      end: endISO,
      breakMin: form.breakMin,
      status: shift?.status ?? 'DRAFT',
      notes: form.notes,
    };
    onSave(shiftPayload);
    setErrors(null);
  };

  const footer = (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {preview?.length ? (
          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-amber-500">
            {preview.length} guardrail warning{preview.length > 1 ? 's' : ''}
          </span>
        ) : (
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-500">Compliant</span>
        )}
        {errors && <span className="text-red-400">{errors}</span>}
      </div>
      <div className="flex items-center gap-2">
        {shift && onDelete && (
          <Button variant="ghost" size="sm" onClick={() => onDelete(shift.id)}>
            Delete
          </Button>
        )}
        {shift && onDuplicate && (
          <Button variant="ghost" size="sm" onClick={() => onDuplicate(shift.id)}>
            Duplicate
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" onClick={handleSave}>
          Save shift
        </Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={shift ? 'Edit shift' : 'Create shift'}
      description="Adjust assignment, timing, and guardrail notes. Guardrail evaluation runs live as you make changes."
      size="lg"
      footer={footer}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(event) => handleChange('date', event.target.value)}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start"
              type="time"
              step={timeInputStep(timeIncrement)}
              value={form.startTime}
              onChange={(event) => handleChange('startTime', event.target.value)}
            />
            <Input
              label="End"
              type="time"
              step={timeInputStep(timeIncrement)}
              value={form.endTime}
              onChange={(event) => handleChange('endTime', event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Role"
              value={form.roleId}
              onChange={(event) => handleChange('roleId', event.target.value)}
            >
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </Select>
            <Select
              label="Location"
              value={form.locationId}
              onChange={(event) => handleChange('locationId', event.target.value)}
            >
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </Select>
          </div>
          <Select
            label="Employee"
            value={form.employeeId ?? ''}
            onChange={(event) => handleChange('employeeId', event.target.value || undefined)}
          >
            <option value="">Unassigned</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.displayName}
              </option>
            ))}
          </Select>
          <Input
            label="Break (minutes)"
            type="number"
            min={0}
            step={5}
            value={form.breakMin}
            onChange={(event) => handleChange('breakMin', Number(event.target.value))}
          />
          <label className="flex flex-col gap-2 text-sm font-medium text-muted">
            Notes
            <textarea
              value={form.notes ?? ''}
              onChange={(event) => handleChange('notes', event.target.value)}
              className="min-h-[96px] rounded-2xl border border-surface/50 bg-surface/70 px-4 py-3 text-sm text-foreground shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Add context, coverage rationale, or break instructions"
            />
          </label>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-background/60 p-4">
            <h3 className="text-sm font-semibold text-foreground">Assignment summary</h3>
            <dl className="mt-3 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <dt>Employee</dt>
                <dd className="font-semibold text-foreground">{currentEmployee?.displayName ?? 'Unassigned'}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Role</dt>
                <dd className="font-semibold text-foreground">
                  {roles.find((role) => role.id === form.roleId)?.name ?? 'Select role'}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt>Location</dt>
                <dd className="font-semibold text-foreground">
                  {locations.find((location) => location.id === form.locationId)?.name ?? 'Select location'}
                </dd>
              </div>
            </dl>
          </div>
          <div className="rounded-2xl border border-border bg-background/60 p-4">
            <h3 className="text-sm font-semibold text-foreground">Guardrail check</h3>
            <div className="mt-3 space-y-2 text-sm text-muted-foreground">
              {preview?.length ? (
                preview.map((violation) => (
                  <div key={violation.id} className="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">{violation.code}</p>
                    <p className="mt-1 text-sm text-foreground">{violation.message}</p>
                    {violation.suggestion && (
                      <p className="mt-1 text-xs text-muted-foreground">Suggested fix: {violation.suggestion}</p>
                    )}
                  </div>
                ))
              ) : (
                <p className="rounded-xl border border-emerald-400/30 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-600">
                  No violations detected.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const timeInputStep = (increment: number) => {
  if (increment <= 5) return 300;
  if (increment <= 10) return 600;
  if (increment <= 15) return 900;
  return 1800;
};
