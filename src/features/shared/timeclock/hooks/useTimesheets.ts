import { useCallback, useMemo, useState } from 'react';
import type { Employee, Policy, TimesheetEntry } from '../lib';
import { evaluateTimesheetEntry } from '../lib/policy';

const now = new Date();
const startOfWeek = new Date(now);
startOfWeek.setDate(now.getDate() - now.getDay());

const demoEntries = (employee: Employee): TimesheetEntry[] => {
  const baseDate = new Date(startOfWeek);
  return Array.from({ length: 5 }).map((_, index) => {
    const day = new Date(baseDate);
    day.setDate(baseDate.getDate() + index);
    const start = new Date(day);
    start.setHours(8, 0, 0, 0);
    const end = new Date(day);
    end.setHours(17, 0, 0, 0);
    return {
      id: `${employee.id}-${index}`,
      employeeId: employee.id,
      start: start.toISOString(),
      end: end.toISOString(),
      jobCode: employee.defaultJobCode,
      costCenter: 'HQ',
      minutesWorked: 9 * 60,
      regularMinutes: 8 * 60,
      otMinutes: 60,
      dtMinutes: 0,
      breakMinutes: 30,
      exceptions: index === 2 ? ['GEO_VIOLATION'] : undefined,
      approved: index < 3,
      locked: false,
      audit: [
        {
          at: new Date(day.getTime() + 30 * 60000).toISOString(),
          by: 'system',
          change: 'Auto-generated from punches',
        },
      ],
    } satisfies TimesheetEntry;
  });
};

export const useTimesheets = (employees: Employee[], policy?: Policy) => {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>(employees[0]?.id);
  const [entries, setEntries] = useState<TimesheetEntry[]>(() =>
    employees.flatMap((employee) => demoEntries(employee))
  );
  const [managerView, setManagerView] = useState(false);

  const filteredEntries = useMemo(() => {
    if (!selectedEmployeeId) return entries;
    return entries.filter((entry) => entry.employeeId === selectedEmployeeId);
  }, [entries, selectedEmployeeId]);

  const updateEntry = useCallback(
    (entryId: string, updates: Partial<TimesheetEntry>) => {
      setEntries((prev) =>
        prev.map((entry) => (entry.id === entryId ? { ...entry, ...updates, approved: false } : entry))
      );
    },
    []
  );

  const approveEntries = useCallback((entryIds: string[]) => {
    setEntries((prev) => prev.map((entry) => (entryIds.includes(entry.id) ? { ...entry, approved: true } : entry)));
  }, []);

  const toggleManagerView = useCallback(() => setManagerView((prev) => !prev), []);

  const totals = useMemo(() => {
    return filteredEntries.reduce(
      (acc, entry) => {
        acc.minutes += entry.minutesWorked;
        acc.ot += entry.otMinutes;
        acc.dt += entry.dtMinutes;
        acc.breaks += entry.breakMinutes;
        return acc;
      },
      { minutes: 0, ot: 0, dt: 0, breaks: 0 }
    );
  }, [filteredEntries]);

  const recalc = useCallback(
    (entry: TimesheetEntry) => {
      if (!policy) return entry;
      const evaluation = evaluateTimesheetEntry(entry, policy);
      const minutesWorked =
        evaluation.regularMinutes + evaluation.otMinutes + evaluation.dtMinutes;
      const nextExceptions = evaluation.flags.length
        ? Array.from(new Set([...(entry.exceptions ?? []), ...evaluation.flags]))
        : entry.exceptions;
      return {
        ...entry,
        regularMinutes: evaluation.regularMinutes,
        otMinutes: evaluation.otMinutes,
        dtMinutes: evaluation.dtMinutes,
        breakMinutes: evaluation.breakMinutes,
        minutesWorked,
        exceptions: nextExceptions,
      } satisfies TimesheetEntry;
    },
    [policy]
  );

  return {
    entries,
    filteredEntries,
    totals,
    managerView,
    selectedEmployeeId,
    setSelectedEmployeeId,
    updateEntry,
    approveEntries,
    toggleManagerView,
    recalc,
  };
};
