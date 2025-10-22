import { useCallback, useState } from 'react';
import { runAutoScheduler } from '../lib/auto';
import type { AutoScheduleRequest, AutoScheduleResult, Shift, Violation , SchedulerContext } from '../lib';

type UseAutoSchedulerOptions = {
  context: SchedulerContext;
  shifts: Shift[];
  onApply: (shifts: Shift[]) => void;
};

type ApplyResult = { ok: true } | { ok: false; violations: Violation[] };

const buildRequest = (context: SchedulerContext, shifts: Shift[], overrides?: Partial<AutoScheduleRequest>): AutoScheduleRequest => ({
  rangeStart: context.coverage[0]?.date ?? shifts[0]?.start ?? new Date().toISOString(),
  rangeEnd: context.coverage[context.coverage.length - 1]?.date ?? shifts[0]?.end ?? new Date().toISOString(),
  coverage: context.coverage,
  employees: context.employees,
  availability: context.availability,
  laws: context.labor,
  existingShifts: shifts,
  softPrefs: {},
  fairnessWeight: 1,
  overtimeWeight: 1,
  preferenceWeight: 1,
  costWeight: 0.5,
  ...overrides,
});

export const useAutoScheduler = ({ context, shifts, onApply }: UseAutoSchedulerOptions) => {
  const [result, setResult] = useState<AutoScheduleResult | null>(null);
  const [lastRequest, setLastRequest] = useState<AutoScheduleRequest | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const run = useCallback(
    async (overrides?: Partial<AutoScheduleRequest>) => {
      setIsRunning(true);
      try {
        const request = buildRequest(context, shifts, overrides);
        const next = runAutoScheduler(request);
        setResult(next);
        setLastRequest(request);
        return next;
      } finally {
        setIsRunning(false);
      }
    },
    [context, shifts],
  );

  const apply = useCallback((): ApplyResult => {
    if (!result) {
      return { ok: false, violations: [] };
    }
    const blocking = result.violations.filter((violation) => violation.kind === 'HARD');
    if (blocking.length) {
      return { ok: false, violations: blocking };
    }
    onApply(result.assigned);
    return { ok: true };
  }, [onApply, result]);

  return {
    isRunning,
    result,
    lastRequest,
    run,
    apply,
  };
};
