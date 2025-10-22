import { useCallback, useState } from 'react';
import { sampleAvailability } from '../lib/constants';
import type { AvailabilityRule, Employee } from '../lib/types';

type UseAvailabilityOptions = {
  employees: Employee[];
};

export const useAvailability = ({ employees }: UseAvailabilityOptions) => {
  const [rules, setRules] = useState<AvailabilityRule[]>(sampleAvailability);

  const upsertRule = useCallback((rule: AvailabilityRule) => {
    setRules((current) => {
      const exists = current.some((item) => item.id === rule.id);
      return exists ? current.map((item) => (item.id === rule.id ? rule : item)) : [...current, rule];
    });
  }, []);

  const removeRule = useCallback((id: string) => {
    setRules((current) => current.filter((rule) => rule.id !== id));
  }, []);

  const getEmployeeAvailability = useCallback(
    (employeeId: string) => rules.filter((rule) => rule.employeeId === employeeId),
    [rules],
  );

  return {
    employees,
    rules,
    upsertRule,
    removeRule,
    getEmployeeAvailability,
  };
};
