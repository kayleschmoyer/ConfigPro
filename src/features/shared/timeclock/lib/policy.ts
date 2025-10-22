import { differenceInMinutes } from './time';
import type { Policy, TimesheetEntry } from './types';

export type PolicyEvaluationContext = {
  weeklyMinutesToDate?: number;
  scheduledMinutes?: number;
};

export type PolicyEvaluation = {
  regularMinutes: number;
  otMinutes: number;
  dtMinutes: number;
  breakMinutes: number;
  flags: string[];
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const roundMinutes = (minutes: number, policy: Policy): number => {
  const { rounding } = policy;
  const increment = rounding.incrementMin;
  const remainder = minutes % increment;
  if (remainder === 0) return minutes;
  switch (rounding.mode) {
    case 'UP':
      return minutes + (increment - remainder);
    case 'DOWN':
      return minutes - remainder;
    case 'NEAREST':
    default:
      return remainder >= increment / 2 ? minutes + (increment - remainder) : minutes - remainder;
  }
};

const ensureMeals = (entry: TimesheetEntry, policy: Policy, flags: string[]) => {
  const breaks = policy.breaks;
  if (!breaks?.mealRequired) {
    return entry.breakMinutes;
  }
  const required = breaks.mealMin ?? 30;
  if (entry.breakMinutes >= required) {
    return entry.breakMinutes;
  }
  flags.push('AUTO_MEAL_INSERTED');
  return required;
};

const ensureSecondMeal = (
  entry: TimesheetEntry,
  policy: Policy,
  flags: string[],
  workedMinutes: number
) => {
  const breaks = policy.breaks;
  const secondMealThreshold = breaks?.secondMealAfterMin;
  if (!secondMealThreshold) return 0;
  if (workedMinutes <= secondMealThreshold) return 0;
  const required = breaks?.mealMin ?? 30;
  if (entry.breakMinutes >= required * 2) {
    return 0;
  }
  flags.push('SECOND_MEAL_AUTO_INSERTED');
  return required;
};

const applyDailyOvertime = (
  minutes: number,
  policy: Policy
): Pick<PolicyEvaluation, 'regularMinutes' | 'otMinutes' | 'dtMinutes'> => {
  const dailyOT = policy.overtime.dailyOTAfterMin ?? Number.POSITIVE_INFINITY;
  const dailyDT = policy.overtime.dailyDTAfterMin ?? Number.POSITIVE_INFINITY;
  let regularMinutes = minutes;
  let otMinutes = 0;
  let dtMinutes = 0;

  if (minutes > dailyOT) {
    const otEligible = minutes - dailyOT;
    if (minutes > dailyDT) {
      dtMinutes = minutes - dailyDT;
      otMinutes = Math.max(0, dailyDT - dailyOT);
    } else {
      otMinutes = otEligible;
    }
    regularMinutes = minutes - otMinutes - dtMinutes;
  }

  return { regularMinutes, otMinutes, dtMinutes };
};

const applyWeeklyOvertime = (
  evaluation: Pick<PolicyEvaluation, 'regularMinutes' | 'otMinutes' | 'dtMinutes'>,
  policy: Policy,
  context: PolicyEvaluationContext | undefined
) => {
  const weeklyThreshold = policy.overtime.weeklyOTAfterMin;
  if (!weeklyThreshold) return evaluation;

  const workedTotal = evaluation.regularMinutes + evaluation.otMinutes + evaluation.dtMinutes;
  const prior = context?.weeklyMinutesToDate ?? 0;
  const cumulative = prior + workedTotal;
  if (cumulative <= weeklyThreshold) {
    return evaluation;
  }

  const overflow = cumulative - weeklyThreshold;
  const convert = clamp(overflow, 0, evaluation.regularMinutes);
  return {
    ...evaluation,
    regularMinutes: evaluation.regularMinutes - convert,
    otMinutes: evaluation.otMinutes + convert,
  };
};

export const evaluateTimesheetEntry = (
  entry: TimesheetEntry,
  policy: Policy,
  context?: PolicyEvaluationContext
): PolicyEvaluation => {
  const flags: string[] = [];
  const actualEnd = entry.end ? new Date(entry.end) : new Date();
  const actualStart = new Date(entry.start);
  const rawMinutes = Math.max(0, differenceInMinutes(actualStart, actualEnd) - entry.breakMinutes);
  const roundedMinutes = roundMinutes(rawMinutes, policy);

  const ensuredBreaks = ensureMeals(entry, policy, flags);
  const secondMeal = ensureSecondMeal(entry, policy, flags, roundedMinutes);
  const breakMinutes = ensuredBreaks + secondMeal;

  const evaluation = applyDailyOvertime(roundedMinutes, policy);
  const withWeekly = applyWeeklyOvertime(evaluation, policy, context);

  if (policy.breaks?.paidBreakMin && breakMinutes < policy.breaks.paidBreakMin) {
    flags.push('BREAK_SHORT');
  }
  if (policy.grace?.breakMin && breakMinutes < policy.grace.breakMin) {
    flags.push('BREAK_UNDER_GRACE');
  }

  return {
    ...withWeekly,
    breakMinutes,
    flags,
  };
};

export const resolvePolicy = (policies: Policy[], id: string) => policies.find((policy) => policy.id === id);

export const resolveShiftMilestones = (entry: TimesheetEntry, policy: Policy) => {
  const evaluation = evaluateTimesheetEntry(entry, policy);
  const nextBreakDue = (policy.breaks?.paidBreakMin ?? 0) - evaluation.breakMinutes;
  return {
    nextBreakDueMinutes: Math.max(nextBreakDue, 0),
    otTriggered: evaluation.otMinutes > 0 || evaluation.dtMinutes > 0,
    flags: evaluation.flags,
  };
};
