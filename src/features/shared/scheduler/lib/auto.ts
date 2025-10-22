import { computeFairness, fairnessScore } from './fairness';
import { formatRange } from './format';
import { violationsForShift } from './rules';
import { differenceInMinutes } from './time';
import type { RuleContext } from './rules';
import type {
  AutoScheduleRequest,
  AutoScheduleResult,
  CoverageRequirement,
  Employee,
  Shift,
  SoftPrefs,
  Violation,
} from './types';

const buildRuleContext = (request: AutoScheduleRequest, workingShifts: Shift[]): RuleContext => ({
  availability: request.availability,
  labor: request.laws,
  shifts: workingShifts,
  roles: request.coverage.map((item) => ({ id: item.roleId, name: item.roleId })),
  employees: request.employees,
});

const flattenCoverage = (requirements: CoverageRequirement[]) => {
  const segments: Array<CoverageRequirement['segments'][number] & { roleId: string; locationId: string; date: string }> = [];
  requirements.forEach((requirement) => {
    requirement.segments.forEach((segment) => {
      segments.push({
        ...segment,
        roleId: requirement.roleId,
        locationId: requirement.locationId,
        date: requirement.date,
      });
    });
  });
  return segments;
};

const fairnessDelta = (request: AutoScheduleRequest, planned: Shift[], candidate: Shift) => {
  const baseline = planned.filter((shift) => shift.employeeId);
  const before = computeFairness(request.employees, baseline);
  const after = computeFairness(request.employees, [...baseline, candidate]);
  const score = fairnessScore(after) - fairnessScore(before);
  return Number.isFinite(score) ? score : 0;
};

const preferenceBoost = (prefs: SoftPrefs | undefined, shift: Shift) => {
  let score = 0;
  if (!prefs) return score;
  if (prefs.preferRoles?.includes(shift.roleId)) score += 0.5;
  if (prefs.preferLocations?.includes(shift.locationId)) score += 0.25;
  return score;
};

const overtimePenalty = (employee: Employee, context: RuleContext, candidate: Shift) => {
  const minutes = differenceInMinutes(candidate.start, candidate.end);
  const dailyLimit = employee.maxDailyMin ?? context.labor.overtime?.dailyOTAfterMin;
  const weeklyLimit = employee.maxWeeklyMin ?? context.labor.overtime?.weeklyOTAfterMin;
  let penalty = 0;
  if (dailyLimit) {
    const dayMinutes = context.shifts
      .filter((shift) => shift.employeeId === employee.id && shift.start.slice(0, 10) === candidate.start.slice(0, 10))
      .reduce((sum, shift) => sum + differenceInMinutes(shift.start, shift.end), 0);
    if (dayMinutes + minutes > dailyLimit) penalty += (dayMinutes + minutes - dailyLimit) / 60;
  }
  if (weeklyLimit) {
    const weekMinutes = context.shifts
      .filter((shift) => shift.employeeId === employee.id)
      .reduce((sum, shift) => sum + differenceInMinutes(shift.start, shift.end), 0);
    if (weekMinutes + minutes > weeklyLimit) penalty += (weekMinutes + minutes - weeklyLimit) / 60;
  }
  return penalty;
};

const candidateScore = (
  employee: Employee,
  shift: Shift,
  request: AutoScheduleRequest,
  context: RuleContext,
  prefs: SoftPrefs | undefined,
) => {
  const fairness = fairnessDelta(request, context.shifts, { ...shift, employeeId: employee.id });
  const overtime = overtimePenalty(employee, context, shift);
  const preference = preferenceBoost(prefs, shift);
  const cost = employee.hourlyCost ?? 0;
  const minutes = differenceInMinutes(shift.start, shift.end);
  const hourlyCost = (cost / 60) * minutes;
  const weightFairness = request.fairnessWeight ?? 1;
  const weightOvertime = request.overtimeWeight ?? 1;
  const weightPreferences = request.preferenceWeight ?? 1;
  const weightCost = request.costWeight ?? 0.5;
  return weightFairness * fairness - weightOvertime * overtime + weightPreferences * preference - weightCost * hourlyCost;
};

const canAssign = (employee: Employee, shift: Shift, context: RuleContext) => {
  const violations = violationsForShift(shift, employee, context);
  const hard = violations.some((violation) => violation.kind === 'HARD');
  return { ok: !hard, violations };
};

const buildShift = (segment: ReturnType<typeof flattenCoverage>[number]): Shift => ({
  id: `${segment.roleId}-${segment.locationId}-${segment.start}`,
  roleId: segment.roleId,
  locationId: segment.locationId,
  start: segment.start,
  end: segment.end,
  breakMin: 0,
  status: 'DRAFT',
});

const assignCoverage = (
  request: AutoScheduleRequest,
  segments: ReturnType<typeof flattenCoverage>,
): { shifts: Shift[]; violations: Violation[]; remaining: CoverageRequirement[] } => {
  const planned: Shift[] = [...request.existingShifts];
  const violations: Violation[] = [];
  for (const segment of segments) {
    const required = segment.requiredCount;
    const alreadyScheduled = planned.filter(
      (shift) =>
        shift.roleId === segment.roleId &&
        shift.locationId === segment.locationId &&
        shift.start <= segment.start &&
        shift.end >= segment.end,
    );
    const deficit = required - alreadyScheduled.length;
    if (deficit <= 0) continue;
    for (let slot = 0; slot < deficit; slot += 1) {
      const draft = buildShift(segment);
      type Candidate = { employee: Employee; score: number; violations: Violation[]; shift: Shift };
      let bestCandidate: Candidate | undefined;
      request.employees.forEach((employee) => {
        const candidateShift: Shift = { ...draft, employeeId: employee.id };
        const context = buildRuleContext(request, [...planned, candidateShift]);
        const { ok, violations: candidateViolations } = canAssign(employee, candidateShift, context);
        if (!ok) return;
        const score = candidateScore(employee, candidateShift, request, context, request.softPrefs?.[employee.id]);
        if (!bestCandidate || score > bestCandidate.score) {
          bestCandidate = { employee, score, violations: candidateViolations, shift: candidateShift };
        }
      });
      if (bestCandidate) {
        const finalShift: Shift = { ...bestCandidate.shift, id: `${draft.id}-${slot}` };
        planned.push(finalShift);
        violations.push(...bestCandidate.violations);
      } else {
        violations.push({
          id: `UNFILLED-${draft.id}-${slot}`,
          code: 'COVERAGE_GAP',
          kind: 'HARD',
          message: `Unable to fill ${formatRange(draft.start, draft.end)} for role ${draft.roleId}`,
          suggestion: 'Adjust coverage requirement or expand eligibility pool',
        });
      }
    }
  }
  const unmet = segments
    .map((segment) => ({
      ...segment,
      scheduled: planned.filter(
        (shift) =>
          shift.roleId === segment.roleId &&
          shift.locationId === segment.locationId &&
          shift.start <= segment.start &&
          shift.end >= segment.end,
      ).length,
    }))
    .filter((segment) => segment.scheduled < segment.requiredCount)
    .map((segment) => ({
      id: `${segment.roleId}-${segment.date}-${segment.locationId}`,
      roleId: segment.roleId,
      locationId: segment.locationId,
      date: segment.date,
      segments: [
        {
          start: segment.start,
          end: segment.end,
          requiredCount: segment.requiredCount - segment.scheduled,
        },
      ],
    }));
  return { shifts: planned, violations, remaining: unmet };
};

const refine = (request: AutoScheduleRequest, shifts: Shift[], violations: Violation[]) => {
  const pool = shifts.filter((shift) => shift.employeeId);
  const context = buildRuleContext(request, shifts);
  const prefs = request.softPrefs ?? {};
  let improved = false;
  for (let i = 0; i < pool.length; i += 1) {
    for (let j = i + 1; j < pool.length; j += 1) {
      const a = pool[i]!;
      const b = pool[j]!;
      const employeeA = request.employees.find((employee) => employee.id === a.employeeId);
      const employeeB = request.employees.find((employee) => employee.id === b.employeeId);
      if (!employeeA || !employeeB) continue;
      const swapA = { ...a, employeeId: employeeB.id };
      const swapB = { ...b, employeeId: employeeA.id };
      const contextWithSwap: RuleContext = {
        ...context,
        shifts: shifts.map((shift) => {
          if (shift.id === a.id) return swapA;
          if (shift.id === b.id) return swapB;
          return shift;
        }),
      };
      const aResult = canAssign(employeeB, swapA, contextWithSwap);
      const bResult = canAssign(employeeA, swapB, contextWithSwap);
      if (!aResult.ok || !bResult.ok) continue;
      const beforeScore =
        candidateScore(employeeA, a, request, context, prefs[employeeA.id ?? '']) +
        candidateScore(employeeB, b, request, context, prefs[employeeB.id ?? '']);
      const afterScore =
        candidateScore(employeeB, swapA, request, contextWithSwap, prefs[employeeB.id ?? '']) +
        candidateScore(employeeA, swapB, request, contextWithSwap, prefs[employeeA.id ?? '']);
      if (afterScore > beforeScore + 0.1) {
        shifts = contextWithSwap.shifts;
        violations.push(...aResult.violations, ...bResult.violations);
        improved = true;
      }
    }
  }
  return { shifts, violations, improved };
};

export const runAutoScheduler = (request: AutoScheduleRequest): AutoScheduleResult => {
  const segments = flattenCoverage(request.coverage).sort((a, b) => b.requiredCount - a.requiredCount);
  const { shifts, violations, remaining } = assignCoverage(request, segments);
  let current = { shifts, violations };
  for (let iteration = 0; iteration < 3; iteration += 1) {
    const next = refine(request, current.shifts, current.violations);
    current = { shifts: next.shifts, violations: next.violations };
    if (!next.improved) break;
  }
  const assigned = current.shifts.filter((shift) => shift.employeeId);
  const fairness = fairnessScore(computeFairness(request.employees, assigned));
  const overtime = current.violations.filter((violation) => violation.code.includes('OVERTIME')).length;
  const coverageScore = 1 - remaining.length / Math.max(1, segments.length);
  const prefsScore = 1 - current.violations.filter((violation) => violation.code === 'PREFERENCE').length / Math.max(1, assigned.length);
  const costScore = 1 / (1 + assigned.reduce((sum, shift) => {
    const employee = request.employees.find((item) => item.id === shift.employeeId);
    if (!employee) return sum;
    const rate = employee.hourlyCost ?? 0;
    const hours = differenceInMinutes(shift.start, shift.end) / 60;
    return sum + rate * hours;
  }, 0));
  const total = (fairness + coverageScore + prefsScore + costScore) / 4 - overtime * 0.02;
  return {
    assigned,
    unassigned: remaining,
    violations: current.violations,
    scores: {
      fairness,
      overtime,
      coverage: coverageScore,
      prefs: prefsScore,
      cost: costScore,
      total,
    },
  };
};
