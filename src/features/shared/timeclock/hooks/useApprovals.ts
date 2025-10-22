import { useCallback, useMemo, useState } from 'react';
import type { ApprovalDecision, ApprovalItem, Employee } from '../lib/types';
import { formatDate } from '../lib/format';

const createApproval = (employee: Employee, offset: number): ApprovalItem => {
  const periodStart = new Date();
  periodStart.setDate(periodStart.getDate() - (7 + offset));
  const periodEnd = new Date(periodStart);
  periodEnd.setDate(periodStart.getDate() + 6);
  return {
    id: `${employee.id}-approval-${offset}`,
    employeeId: employee.id,
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    entries: [],
    pendingSince: new Date().toISOString(),
  } satisfies ApprovalItem;
};

export const useApprovals = (employees: Employee[]) => {
  const [pending, setPending] = useState<ApprovalItem[]>(() =>
    employees.flatMap((employee, index) => (employee.role === 'EMP' ? [] : [createApproval(employee, index)]))
  );
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | undefined>();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return pending.filter((item) => {
      const matchesEmployee = selectedEmployeeId ? item.employeeId === selectedEmployeeId : true;
      const employee = employees.find((emp) => emp.id === item.employeeId);
      const matchesSearch = search
        ? employee?.displayName.toLowerCase().includes(search.toLowerCase())
        : true;
      return matchesEmployee && matchesSearch;
    });
  }, [employees, pending, search, selectedEmployeeId]);

  const decide = useCallback(
    (id: string, decision: ApprovalDecision, note?: string) => {
      setPending((prev) => prev.filter((item) => item.id !== id));
      console.info(`Decision ${decision} for ${id}`, note);
    },
    []
  );

  const summary = useMemo(() => {
    if (filtered.length === 0) {
      return 'All caught up';
    }
    const first = filtered[0];
    return `Next: ${formatDate(first.periodStart)} – ${formatDate(first.periodEnd)}`;
  }, [filtered]);

  return {
    pending,
    filtered,
    summary,
    search,
    setSearch,
    selectedEmployeeId,
    setSelectedEmployeeId,
    decide,
  };
};
