import { useCallback, useMemo, useRef, useState } from 'react';
import { formatDate } from '../lib/format';
import { RuleContext, violationsForShift } from '../lib/rules';
import { differenceInMinutes } from '../lib/time';
import type {
  AvailabilityRule,
  CoverageRequirement,
  Employee,
  GridGrouping,
  LaborLawProfile,
  Location,
  Role,
  ScheduleView,
  Shift,
  Violation,
} from '../lib/types';
import {
  defaultStartDate,
  sampleAvailability,
  sampleCoverage,
  sampleEmployees,
  sampleLabor,
  sampleLocations,
  sampleRoles,
  sampleShifts,
  shiftTemplates,
  type ShiftTemplate,
} from '../lib/constants';

const createId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const viewDurations: Record<ScheduleView, number> = {
  day: 1,
  week: 7,
  month: 28,
};

const rowHeight = 72;
const timeIncrement = 15;

export type ScheduleColumn = {
  key: string;
  date: string;
  label: string;
};

export type ScheduleRow = {
  id: string;
  label: string;
  subLabel?: string;
  type: 'employee' | 'role';
  employee?: Employee;
  role?: Role;
};

export type ShiftWithMeta = Shift & {
  employee?: Employee;
  role?: Role;
  location?: Location;
  violations: Violation[];
  durationMinutes: number;
};

export type HeatmapEntry = {
  required: number[];
  scheduled: number[];
};

export type ScheduleFilters = {
  location: string;
  role: string;
  search: string;
};

export type UseScheduleResult = {
  context: {
    roles: Role[];
    locations: Location[];
    employees: Employee[];
    availability: AvailabilityRule[];
    coverage: CoverageRequirement[];
    labor: LaborLawProfile;
  };
  view: ScheduleView;
  setView: (view: ScheduleView) => void;
  grouping: GridGrouping;
  setGrouping: (group: GridGrouping) => void;
  columns: ScheduleColumn[];
  rows: ScheduleRow[];
  shifts: ShiftWithMeta[];
  filters: ScheduleFilters;
  setFilters: (filters: Partial<ScheduleFilters>) => void;
  startDate: string;
  setStartDate: (iso: string) => void;
  rowHeight: number;
  timeIncrement: number;
  selectedShiftId: string | null;
  setSelectedShiftId: (id: string | null) => void;
  beginCreateShift: (args: { rowId: string; date: string; startMinutes: number; endMinutes: number }) => void;
  beginEditShift: (shiftId: string) => void;
  saveShift: (shift: Shift) => void;
  deleteShift: (shiftId: string) => void;
  duplicateShift: (shiftId: string) => void;
  replaceShifts: (shifts: Shift[]) => void;
  applyTemplate: (templateId: string, target: { rowId: string; date: string }) => void;
  templates: ShiftTemplate[];
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  evaluateShift: (shift: Shift) => Violation[];
  preview: Violation[] | null;
  setPreview: (violations: Violation[] | null) => void;
  editorState: {
    isOpen: boolean;
    draft: Shift | null;
  };
  closeEditor: () => void;
  toggleRightPanel: () => void;
  isRightPanelOpen: boolean;
  coverageHeatmap: Record<string, HeatmapEntry>;
};

const toISOFromDay = (date: string, minutes: number) => {
  const result = new Date(`${date}T00:00:00.000Z`);
  result.setUTCMinutes(minutes);
  return result.toISOString();
};

const cloneShifts = (shifts: Shift[]) => shifts.map((shift) => ({ ...shift }));

const buildContext = (shifts: Shift[]): RuleContext => ({
  shifts,
  availability: sampleAvailability,
  labor: sampleLabor,
  roles: sampleRoles,
  employees: sampleEmployees,
});

export const useSchedule = (): UseScheduleResult => {
  const [view, setView] = useState<ScheduleView>('week');
  const [grouping, setGrouping] = useState<GridGrouping>('employee');
  const [filters, setFilterState] = useState<ScheduleFilters>({ location: 'all', role: 'all', search: '' });
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [shifts, setShifts] = useState<Shift[]>(sampleShifts);
  const [selectedShiftId, setSelectedShiftId] = useState<string | null>(sampleShifts[0]?.id ?? null);
  const [preview, setPreview] = useState<Violation[] | null>(null);
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState<Shift | null>(null);
  const [isRightPanelOpen, setRightPanelOpen] = useState(true);

  const historyRef = useRef<{ past: Shift[][]; future: Shift[][] }>({ past: [cloneShifts(sampleShifts)], future: [] });

  const pushHistory = useCallback((snapshot: Shift[]) => {
    const clone = cloneShifts(snapshot);
    const past = [...historyRef.current.past, clone].slice(-25);
    historyRef.current = { past, future: [] };
  }, []);

  const undo = useCallback(() => {
    const { past, future } = historyRef.current;
    if (past.length <= 1) return;
    const current = past[past.length - 1]!;
    const previous = past[past.length - 2]!;
    historyRef.current = { past: past.slice(0, -1), future: [cloneShifts(current), ...future] };
    setShifts(cloneShifts(previous));
  }, []);

  const redo = useCallback(() => {
    const { past, future } = historyRef.current;
    if (future.length === 0) return;
    const [next, ...rest] = future;
    historyRef.current = { past: [...past, cloneShifts(next)], future: rest };
    setShifts(cloneShifts(next));
  }, []);

  const canUndo = historyRef.current.past.length > 1;
  const canRedo = historyRef.current.future.length > 0;

  const setFilters = useCallback((next: Partial<ScheduleFilters>) => {
    setFilterState((current) => ({ ...current, ...next }));
  }, []);

  const saveShift = useCallback(
    (shift: Shift) => {
      setShifts((current) => {
        const exists = current.some((item) => item.id === shift.id);
        const next = exists
          ? current.map((item) => (item.id === shift.id ? { ...item, ...shift } : item))
          : [...current, { ...shift }];
        pushHistory(next);
        return next;
      });
      setSelectedShiftId(shift.id);
      setEditorOpen(false);
      setDraft(null);
    },
    [pushHistory],
  );

  const deleteShift = useCallback(
    (shiftId: string) => {
      setShifts((current) => {
        const next = current.filter((shift) => shift.id !== shiftId);
        pushHistory(next);
        return next;
      });
      if (selectedShiftId === shiftId) {
        setSelectedShiftId(null);
      }
    },
    [pushHistory, selectedShiftId],
  );

  const duplicateShift = useCallback(
    (shiftId: string) => {
      const source = shifts.find((shift) => shift.id === shiftId);
      if (!source) return;
      const clone: Shift = {
        ...source,
        id: createId(),
        status: 'DRAFT',
      };
      saveShift(clone);
    },
    [saveShift, shifts],
  );

  const replaceShifts = useCallback(
    (next: Shift[]) => {
      setShifts(() => {
        pushHistory(next);
        return cloneShifts(next);
      });
    },
    [pushHistory],
  );

  const beginCreateShift = useCallback(
    ({ rowId, date, startMinutes, endMinutes }: { rowId: string; date: string; startMinutes: number; endMinutes: number }) => {
      const baseRoleId = grouping === 'employee'
        ? sampleEmployees.find((employee) => employee.id === rowId)?.roles[0] ?? sampleRoles[0]!.id
        : rowId;
      const employeeId = grouping === 'employee' ? rowId : undefined;
      const locationId = filters.location !== 'all'
        ? filters.location
        : sampleEmployees.find((employee) => employee.id === rowId)?.homeLocationId ?? sampleLocations[0]!.id;
      const draftShift: Shift = {
        id: createId(),
        employeeId,
        roleId: baseRoleId,
        locationId,
        start: toISOFromDay(date, startMinutes),
        end: toISOFromDay(date, endMinutes),
        breakMin: 30,
        status: 'DRAFT',
      };
      setDraft(draftShift);
      setEditorOpen(true);
    },
    [filters.location, grouping],
  );

  const beginEditShift = useCallback(
    (shiftId: string) => {
      const target = shifts.find((shift) => shift.id === shiftId);
      if (!target) return;
      setDraft({ ...target });
      setEditorOpen(true);
    },
    [shifts],
  );

  const applyTemplate = useCallback(
    (templateId: string, target: { rowId: string; date: string }) => {
      const template = shiftTemplates.find((item) => item.id === templateId);
      if (!template) return;
      const start = template.startMinutes;
      const end = template.startMinutes + template.durationMinutes;
      beginCreateShift({ rowId: target.rowId, date: target.date, startMinutes: start, endMinutes: end });
      setDraft((current) =>
        current
          ? {
              ...current,
              breakMin: template.breakMin,
              roleId:
                grouping === 'employee'
                  ? current.roleId ?? template.roleId ?? sampleEmployees.find((employee) => employee.id === target.rowId)?.roles[0] ??
                    sampleRoles[0]!.id
                  : template.roleId ?? target.rowId,
            }
          : current,
      );
    },
    [beginCreateShift, grouping],
  );

  const columns = useMemo<ScheduleColumn[]>(() => {
    const start = new Date(`${startDate}T00:00:00.000Z`);
    const days = viewDurations[view];
    const list: ScheduleColumn[] = [];
    for (let index = 0; index < days; index += 1) {
      const current = new Date(start);
      current.setUTCDate(start.getUTCDate() + index);
      const key = current.toISOString().slice(0, 10);
      list.push({ key, date: key, label: formatDate(current.toISOString()) });
    }
    return list;
  }, [startDate, view]);

  const rows = useMemo<ScheduleRow[]>(() => {
    if (grouping === 'employee') {
      return sampleEmployees
        .filter((employee) => {
          if (filters.location !== 'all' && !employee.eligibleLocationIds?.includes(filters.location)) return false;
          if (filters.role !== 'all' && !employee.roles.includes(filters.role)) return false;
          if (filters.search && !employee.displayName.toLowerCase().includes(filters.search.toLowerCase())) return false;
          return true;
        })
        .map((employee) => ({
          id: employee.id,
          label: employee.displayName,
          subLabel: `${employee.roles
            .map((roleId) => sampleRoles.find((role) => role.id === roleId)?.name ?? roleId)
            .join(', ')} · ${
            sampleLocations.find((location) => location.id === (employee.homeLocationId ?? sampleLocations[0]!.id))?.name ?? ''
          }`,
          type: 'employee',
          employee,
        }));
    }
    return sampleRoles
      .filter((role) => filters.role === 'all' || role.id === filters.role)
      .map((role) => ({
        id: role.id,
        label: role.name,
        subLabel: `${role.requiredCerts?.join(', ') ?? 'No cert required'}`,
        type: 'role' as const,
        role,
      }));
  }, [filters.location, filters.role, filters.search, grouping]);

  const decoratedShifts = useMemo<ShiftWithMeta[]>(() => {
    const context = buildContext(shifts);
    return shifts.map((shift) => {
      const employee = shift.employeeId ? sampleEmployees.find((item) => item.id === shift.employeeId) : undefined;
      const role = sampleRoles.find((item) => item.id === shift.roleId);
      const location = sampleLocations.find((item) => item.id === shift.locationId);
      const violations = violationsForShift(shift, employee, context);
      return {
        ...shift,
        employee,
        role,
        location,
        violations,
        durationMinutes: differenceInMinutes(shift.start, shift.end),
      };
    });
  }, [shifts]);

  const coverageHeatmap = useMemo<Record<string, HeatmapEntry>>(() => {
    const heatmap: Record<string, HeatmapEntry> = {};
    columns.forEach((column) => {
      heatmap[column.key] = { required: Array.from({ length: 24 }, () => 0), scheduled: Array.from({ length: 24 }, () => 0) };
    });
    sampleCoverage.forEach((requirement) => {
      const entry = heatmap[requirement.date];
      if (!entry) return;
      requirement.segments.forEach((segment) => {
        const startHour = new Date(segment.start).getUTCHours();
        const endHour = new Date(segment.end).getUTCHours();
        for (let hour = startHour; hour < endHour; hour += 1) {
          entry.required[hour] = Math.max(entry.required[hour], segment.requiredCount);
        }
      });
    });
    decoratedShifts.forEach((shift) => {
      const key = shift.start.slice(0, 10);
      const entry = heatmap[key];
      if (!entry) return;
      const startHour = new Date(shift.start).getUTCHours();
      const endHour = new Date(shift.end).getUTCHours();
      for (let hour = startHour; hour < endHour; hour += 1) {
        entry.scheduled[hour] += 1;
      }
    });
    return heatmap;
  }, [columns, decoratedShifts]);

  const evaluateShift = useCallback(
    (shift: Shift) => {
      const context = buildContext([...shifts.filter((item) => item.id !== shift.id), shift]);
      const employee = shift.employeeId ? sampleEmployees.find((item) => item.id === shift.employeeId) : undefined;
      return violationsForShift(shift, employee, context);
    },
    [shifts],
  );

  const closeEditor = useCallback(() => {
    setEditorOpen(false);
    setDraft(null);
  }, []);

  const toggleRightPanel = useCallback(() => {
    setRightPanelOpen((value) => !value);
  }, []);

  return {
    context: {
      roles: sampleRoles,
      locations: sampleLocations,
      employees: sampleEmployees,
      availability: sampleAvailability,
      coverage: sampleCoverage,
      labor: sampleLabor,
    },
    view,
    setView,
    grouping,
    setGrouping,
    columns,
    rows,
    shifts: decoratedShifts,
    filters,
    setFilters,
    startDate,
    setStartDate,
    rowHeight,
    timeIncrement,
    selectedShiftId,
    setSelectedShiftId,
    beginCreateShift,
    beginEditShift,
    saveShift,
    deleteShift,
    duplicateShift,
    replaceShifts,
    applyTemplate,
    templates: shiftTemplates,
    undo,
    redo,
    canUndo,
    canRedo,
    evaluateShift,
    preview,
    setPreview,
    editorState: { isOpen: isEditorOpen, draft },
    closeEditor,
    toggleRightPanel,
    isRightPanelOpen,
    coverageHeatmap,
  };
};
