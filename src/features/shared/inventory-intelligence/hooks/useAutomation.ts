import { useCallback, useState } from 'react';
import type { AutomationSimulation, Rule } from '../lib';

const DEMO_RULES: Rule[] = [
  {
    id: 'rule-001',
    name: 'Auto-protect safety stock',
    trigger: 'BELOW_SAFETY',
    conditions: { serviceLevel: 0.95 },
    actions: [{ type: 'adjust_safety', params: { increasePct: 0.1 } }],
    enabled: true
  },
  {
    id: 'rule-002',
    name: 'Supplier delay escalation',
    trigger: 'SUPPLIER_DELAY',
    conditions: { delayDays: 5 },
    actions: [
      { type: 'notify', params: { channel: 'slack', target: '#supply-chain' } },
      { type: 'tag', params: { label: 'delay-risk' } }
    ],
    enabled: true
  }
];

export type UseAutomationResult = {
  rules: Rule[];
  toggleRule: (ruleId: string) => void;
  simulate: (ruleId: string) => AutomationSimulation;
  simulations: AutomationSimulation[];
};

export const useAutomation = (): UseAutomationResult => {
  const [rules, setRules] = useState(DEMO_RULES);
  const [simulations, setSimulations] = useState<AutomationSimulation[]>([]);

  const toggleRule = useCallback((ruleId: string) => {
    setRules((current) =>
      current.map((rule) => (rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule))
    );
  }, []);

  const simulate = useCallback(
    (ruleId: string) => {
      const rule = rules.find((item) => item.id === ruleId);
      if (!rule) {
        return { ruleId, fired: false, explanation: 'Rule not found' };
      }
      const fired = Boolean(rule.enabled && rule.trigger === 'BELOW_SAFETY');
      const explanation = fired
        ? `Fired because ${rule.trigger} matched live exception.`
        : 'Conditions not met.';
      const result: AutomationSimulation = { ruleId, fired, explanation };
      setSimulations((current) => [result, ...current.slice(0, 9)]);
      return result;
    },
    [rules]
  );

  return {
    rules,
    toggleRule,
    simulate,
    simulations
  };
};
