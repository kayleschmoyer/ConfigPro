import { useMemo, useRef } from 'react';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Select } from '../../../shared/ui/Select';
import { cn } from '../../../lib/cn';
import { useSchedule } from '../hooks/useSchedule';
import { useAutoScheduler } from '../hooks/useAutoScheduler';
import { usePublishing } from '../hooks/usePublishing';
import { useSchedulerShortcuts } from '../lib/shortcuts';
import { ScheduleGrid } from '../components/ScheduleGrid';
import { ShiftEditor } from '../components/ShiftEditor';
import { RightPanel } from '../components/RightPanel';
import type { Shift } from '../lib/types';
import { differenceInMinutes } from '../lib/time';

const viewModes = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
] as const;

const groupingModes = [
  { label: 'By employee', value: 'employee' },
  { label: 'By role', value: 'role' },
] as const;

export const Schedule = () => {
  const searchRef = useRef<HTMLInputElement>(null);
  const schedule = useSchedule();
  const publishing = usePublishing(schedule.shifts);
  const auto = useAutoScheduler({
    context: schedule.context,
    shifts: schedule.shifts,
    onApply: (assigned) => {
      const merged = mergeShifts(schedule.shifts, assigned);
      schedule.replaceShifts(merged);
    },
  });

  const selectedShift = useMemo(
    () => schedule.shifts.find((shift) => shift.id === schedule.selectedShiftId) ?? null,
    [schedule.shifts, schedule.selectedShiftId],
  );

  const sortedShifts = useMemo(
    () => [...schedule.shifts].sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()),
    [schedule.shifts],
  );

  const moveSelection = (direction: 'left' | 'right') => {
    if (!sortedShifts.length) return;
    const currentIndex = selectedShift
      ? sortedShifts.findIndex((shift) => shift.id === selectedShift.id)
      : -1;
    const delta = direction === 'left' ? -1 : 1;
    const nextIndex = (currentIndex + delta + sortedShifts.length) % sortedShifts.length;
    schedule.setSelectedShiftId(sortedShifts[nextIndex]?.id ?? null);
  };

  const resizeSelection = (direction: 'left' | 'right') => {
    if (!selectedShift) return;
    const delta = direction === 'left' ? -schedule.timeIncrement : schedule.timeIncrement;
    const start = new Date(selectedShift.start);
    const end = new Date(selectedShift.end);
    if (direction === 'left') {
      start.setUTCMinutes(start.getUTCMinutes() + delta);
      if (start >= end) return;
    } else {
      end.setUTCMinutes(end.getUTCMinutes() + delta);
      if (end <= start) return;
    }
    const updated: Shift = {
      id: selectedShift.id,
      employeeId: selectedShift.employee?.id,
      roleId: selectedShift.roleId,
      locationId: selectedShift.locationId,
      start: start.toISOString(),
      end: end.toISOString(),
      breakMin: selectedShift.breakMin,
      status: selectedShift.status,
      notes: selectedShift.notes,
    };
    schedule.saveShift(updated);
  };

  useSchedulerShortcuts({
    focusSearch: () => searchRef.current?.focus(),
    goSchedule: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
    newShift: () => {
      if (selectedShift) {
        schedule.beginEditShift(selectedShift.id);
      } else if (schedule.rows.length) {
        const firstRow = schedule.rows[0];
        const firstDate = schedule.columns[0]?.date ?? schedule.startDate;
        schedule.beginCreateShift({ rowId: firstRow.id, date: firstDate, startMinutes: 8 * 60, endMinutes: 12 * 60 });
      }
    },
    moveSelection,
    resizeSelection,
    undo: schedule.undo,
    redo: schedule.redo,
  });

  const handleAutoSchedule = async () => {
    await auto.run();
  };

  const handleApplyAuto = () => {
    const outcome = auto.apply();
    if (!outcome.ok && outcome.violations.length) {
      schedule.setPreview(outcome.violations);
    } else if (outcome.ok) {
      schedule.setPreview(null);
    }
  };

  const handlePublish = () => {
    publishing.publish(schedule.shifts);
  };

  const editorShift = useMemo(() => {
    if (!schedule.editorState.draft) return null;
    const existing = schedule.shifts.find((shift) => shift.id === schedule.editorState.draft?.id);
    if (existing) return existing;
    const base = schedule.editorState.draft;
    const employee = base.employeeId
      ? schedule.context.employees.find((employee) => employee.id === base.employeeId)
      : undefined;
    const role = schedule.context.roles.find((role) => role.id === base.roleId);
    const location = schedule.context.locations.find((location) => location.id === base.locationId);
    const violations = schedule.evaluateShift(base);
    return {
      ...base,
      employee,
      role,
      location,
      violations,
      durationMinutes: differenceInMinutes(base.start, base.end),
    };
  }, [schedule.context.employees, schedule.context.locations, schedule.context.roles, schedule.editorState.draft, schedule.evaluateShift, schedule.shifts]);

  return (
    <div className="flex items-start gap-6">
      <div className="flex min-w-0 flex-1 flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-surface/70 p-1">
              {viewModes.map((mode) => (
                <Button
                  key={mode.value}
                  size="sm"
                  variant={schedule.view === mode.value ? 'primary' : 'ghost'}
                  onClick={() => schedule.setView(mode.value)}
                >
                  {mode.label}
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2 rounded-full bg-surface/70 p-1">
              {groupingModes.map((mode) => (
                <Button
                  key={mode.value}
                  size="sm"
                  variant={schedule.grouping === mode.value ? 'primary' : 'ghost'}
                  onClick={() => schedule.setGrouping(mode.value)}
                >
                  {mode.label}
                </Button>
              ))}
            </div>
            <Input
              ref={searchRef}
              placeholder="Search team (/ to focus)"
              value={schedule.filters.search}
              onChange={(event) => schedule.setFilters({ search: event.target.value })}
              className="w-56"
            />
            <Input
              type="date"
              label="Week of"
              value={schedule.startDate}
              onChange={(event) => schedule.setStartDate(event.target.value)}
            />
            <Select
              label="Location"
              value={schedule.filters.location}
              onChange={(event) => schedule.setFilters({ location: event.target.value })}
            >
              <option value="all">All locations</option>
              {schedule.context.locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </Select>
            <Select
              label="Role"
              value={schedule.filters.role}
              onChange={(event) => schedule.setFilters({ role: event.target.value })}
            >
              <option value="all">All roles</option>
              {schedule.context.roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleAutoSchedule} disabled={auto.isRunning}>
              {auto.isRunning ? 'Running…' : 'Dry run auto-schedule'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleApplyAuto}
              disabled={!auto.result || (auto.result?.violations.some((violation) => violation.kind === 'HARD') ?? false)}
            >
              Apply plan
            </Button>
            <Button size="sm" variant={publishing.status === 'PUBLISHED' ? 'primary' : 'outline'} onClick={handlePublish}>
              {publishing.status === 'PUBLISHED' ? 'Published' : 'Publish'}
            </Button>
          </div>
        </div>
        {auto.result && (
          <div className="grid gap-3 rounded-2xl border border-border bg-surface/80 px-5 py-4 md:grid-cols-4">
            <Metric label="Total score" value={auto.result.scores.total.toFixed(2)} />
            <Metric label="Fairness" value={auto.result.scores.fairness.toFixed(2)} />
            <Metric label="Coverage" value={(auto.result.scores.coverage * 100).toFixed(0) + '%'} />
            <Metric label="Overtime flags" value={String(auto.result.scores.overtime)} tone="text-amber-500" />
            {auto.result.violations.filter((violation) => violation.kind === 'HARD').length > 0 && (
              <div className="md:col-span-4 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-600">
                Hard guardrails block apply:
                <ul className="mt-2 space-y-1">
                  {auto.result.violations
                    .filter((violation) => violation.kind === 'HARD')
                    .map((violation) => (
                      <li key={violation.id}>• {violation.message}</li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        )}
        <ScheduleGrid
          columns={schedule.columns}
          rows={schedule.rows}
          shifts={schedule.shifts}
          view={schedule.view}
          grouping={schedule.grouping}
          rowHeight={schedule.rowHeight}
          timeIncrement={schedule.timeIncrement}
          selectedShiftId={schedule.selectedShiftId}
          filters={schedule.filters}
          onSelectShift={schedule.setSelectedShiftId}
          onBeginCreateShift={schedule.beginCreateShift}
          onBeginEditShift={schedule.beginEditShift}
          onSaveShift={schedule.saveShift}
          evaluateShift={schedule.evaluateShift}
          onPreview={schedule.setPreview}
          preview={schedule.preview}
          coverageHeatmap={schedule.coverageHeatmap}
          templates={schedule.templates}
          applyTemplate={schedule.applyTemplate}
          undo={schedule.undo}
          redo={schedule.redo}
          canUndo={schedule.canUndo}
          canRedo={schedule.canRedo}
        />
      </div>
      <RightPanel
        shift={selectedShift}
        shifts={schedule.shifts}
        labor={schedule.context.labor}
        preview={schedule.preview}
        isOpen={schedule.isRightPanelOpen}
        onClose={schedule.toggleRightPanel}
        onEdit={schedule.beginEditShift}
      />
      <ShiftEditor
        shift={editorShift}
        isOpen={schedule.editorState.isOpen}
        employees={schedule.context.employees}
        roles={schedule.context.roles}
        locations={schedule.context.locations}
        onClose={schedule.closeEditor}
        onSave={schedule.saveShift}
        onDelete={schedule.deleteShift}
        onDuplicate={schedule.duplicateShift}
        evaluate={schedule.evaluateShift}
        preview={schedule.preview}
        setPreview={schedule.setPreview}
        timeIncrement={schedule.timeIncrement}
      />
    </div>
  );
};

const mergeShifts = (current: Shift[], assigned: Shift[]) => {
  const map = new Map<string, Shift>();
  current.forEach((shift) => map.set(shift.id, { ...shift }));
  assigned.forEach((shift) => map.set(shift.id, { ...shift }));
  return Array.from(map.values());
};

const Metric = ({ label, value, tone }: { label: string; value: string; tone?: string }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    <p className={cn('mt-1 text-lg font-semibold text-foreground', tone)}>{value}</p>
  </div>
);
