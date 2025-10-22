import { useCallback, useMemo, useState } from 'react';
import type { Employee, ExceptionItem } from '../lib/types';
import { formatRelative } from '../lib/format';

const createException = (employee: Employee, index: number): ExceptionItem => {
  const date = new Date();
  date.setDate(date.getDate() - index);
  return {
    id: `${employee.id}-exception-${index}`,
    employeeId: employee.id,
    date: date.toISOString(),
    kind: index % 2 === 0 ? 'GEO_VIOLATION' : 'SHORT_MEAL',
    severity: index % 3 === 0 ? 'CRITICAL' : 'WARN',
    message:
      index % 2 === 0
        ? 'Punch recorded outside allowed geofence. Review device trust signals.'
        : 'Meal break logged under required duration. Please acknowledge.',
    relatedPunchIds: [`${employee.id}-punch-${index}`],
    resolved: index === 0,
    resolvedAt: index === 0 ? new Date().toISOString() : undefined,
    resolvedBy: index === 0 ? 'Kai Mendoza' : undefined,
  } satisfies ExceptionItem;
};

export const useExceptions = (employees: Employee[]) => {
  const [items, setItems] = useState<ExceptionItem[]>(() =>
    employees.flatMap((employee, index) =>
      index > 4 ? [] : [createException(employee, index), createException(employee, index + 1)]
    )
  );
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState<'ALL' | ExceptionItem['severity']>('ALL');

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const employee = employees.find((emp) => emp.id === item.employeeId);
      const matchesSeverity = severity === 'ALL' ? true : item.severity === severity;
      const matchesSearch = search
        ? employee?.displayName.toLowerCase().includes(search.toLowerCase())
        : true;
      return matchesSeverity && matchesSearch;
    });
  }, [employees, items, search, severity]);

  const resolve = useCallback((id: string, resolver: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, resolved: true, resolvedAt: new Date().toISOString(), resolvedBy: resolver }
          : item
      )
    );
  }, []);

  const reopen = useCallback((id: string) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, resolved: false } : item)));
  }, []);

  const metrics = useMemo(() => {
    const unresolved = filtered.filter((item) => !item.resolved);
    const critical = unresolved.filter((item) => item.severity === 'CRITICAL');
    return {
      unresolvedCount: unresolved.length,
      criticalCount: critical.length,
      nextSLA: unresolved[0] ? formatRelative(unresolved[0].date) : 'All clear',
    };
  }, [filtered]);

  return {
    items,
    filtered,
    search,
    setSearch,
    severity,
    setSeverity,
    resolve,
    reopen,
    metrics,
  };
};
