import { useMemo, useState } from 'react';
import type { Rule } from '../lib/types';

type SimulationResult = {
  rule: Rule;
  wouldTrigger: boolean;
  explanation: string;
};

const rules: Rule[] = [
  {
    id: 'rule-1',
    name: 'Auto-route >$10K to Controller',
    trigger: 'bill.captured',
    conditions: { amountGreaterThan: 10_000_00 },
    actions: [{ type: 'route', params: { approver: 'controller' } }],
    enabled: true,
  },
  {
    id: 'rule-2',
    name: 'Flag missing W-9',
    trigger: 'bill.ready_for_review',
    actions: [{ type: 'tag', params: { label: 'Missing W-9' } }],
    enabled: true,
  },
];

export const useAutomation = () => {
  const [selectedRule, setSelectedRule] = useState<Rule | undefined>(rules[0]);
  const simulator = useMemo<SimulationResult[]>(
    () =>
      rules.map((rule) => ({
        rule,
        wouldTrigger: rule.enabled,
        explanation: rule.enabled
          ? 'Conditions satisfied based on last captured bill (stub)'
          : 'Rule disabled',
      })),
    []
  );

  return {
    rules,
    selectedRule,
    setSelectedRule,
    simulator,
  };
};
