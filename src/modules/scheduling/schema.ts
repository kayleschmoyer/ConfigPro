export type QualificationLevel = 'trainee' | 'associate' | 'senior' | 'manager';

export interface Qualification {
  id: string;
  name: string;
  level: QualificationLevel;
  expiresOn?: string;
}

export interface StaffProfile {
  id: string;
  displayName: string;
  role: string;
  qualifications: Qualification[];
  maxWeeklyHours: number;
  preferredHours: number;
  availability: Record<string, string[]>; // weekday => time ranges
}

export interface LaborLawRule {
  id: string;
  description: string;
  appliesToRoles?: string[];
  maxHoursPerDay?: number;
  maxConsecutiveDays?: number;
  minRestPeriodHours?: number;
  requiresQualificationIds?: string[];
}

export interface DemandSignal {
  date: string;
  interval: string;
  expectedDemand: number;
  location: string;
  segment?: string;
}

export interface DemandForecast {
  generatedAt: string;
  signals: DemandSignal[];
  model: string;
  version: string;
}

export interface SchedulingConstraint {
  id: string;
  description: string;
  lawRuleId?: string;
  customRule?: (context: SchedulingContext) => boolean;
  severity: 'info' | 'warning' | 'critical';
}

export interface ShiftAssignment {
  staffId: string;
  role: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  notes?: string;
}

export interface ScheduleDraft {
  id: string;
  name: string;
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
  updatedAt: string;
  assignments: ShiftAssignment[];
  metadata?: Record<string, string | number>;
}

export interface SchedulingContext {
  staff: StaffProfile[];
  laborRules: LaborLawRule[];
  demandForecast: DemandForecast;
  constraints: SchedulingConstraint[];
  drafts: ScheduleDraft[];
}

export const createSchedulingContext = (
  staff: StaffProfile[],
  laborRules: LaborLawRule[],
  demandForecast: DemandForecast,
  constraints: SchedulingConstraint[] = [],
  drafts: ScheduleDraft[] = [],
): SchedulingContext => ({
  staff,
  laborRules,
  demandForecast,
  constraints,
  drafts,
});

export interface ComplianceResult {
  constraintId: string;
  passed: boolean;
  message?: string;
}

export const evaluateCompliance = (
  context: SchedulingContext,
): ComplianceResult[] =>
  context.constraints.map((constraint) => {
    const passed = constraint.customRule ? constraint.customRule(context) : true;
    return {
      constraintId: constraint.id,
      passed,
      message: passed
        ? undefined
        : `Constraint ${constraint.description} failed for current schedule context`,
    };
  });

export const groupAssignmentsByDate = (assignments: ShiftAssignment[]): Record<string, ShiftAssignment[]> =>
  assignments.reduce<Record<string, ShiftAssignment[]>>((acc, assignment) => {
    const bucket = acc[assignment.date] ?? [];
    bucket.push(assignment);
    acc[assignment.date] = bucket;
    return acc;
  }, {});

export const aggregateCoverage = (
  forecast: DemandForecast,
  assignments: ShiftAssignment[],
): Record<string, { demand: number; scheduled: number }> => {
  const coverage: Record<string, { demand: number; scheduled: number }> = {};

  for (const signal of forecast.signals) {
    coverage[`${signal.date}:${signal.interval}`] = {
      demand: signal.expectedDemand,
      scheduled: 0,
    };
  }

  for (const assignment of assignments) {
    const key = `${assignment.date}:${assignment.startTime}-${assignment.endTime}`;
    if (!coverage[key]) {
      coverage[key] = { demand: 0, scheduled: 0 };
    }
    coverage[key].scheduled += 1;
  }

  return coverage;
};

const hoursBetween = (startTime: string, endTime: string): number => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  const start = startHour + startMinute / 60;
  const end = endHour + endMinute / 60;
  const diff = end - start;
  return diff >= 0 ? diff : 24 + diff;
};

const average = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const percentage = (value: number): number => Number(Number.isFinite(value) ? value.toFixed(2) : '0');

const safeDivide = (numerator: number, denominator: number): number =>
  denominator === 0 ? 0 : numerator / denominator;

export interface LocationCoverageInsight {
  location: string;
  demand: number;
  scheduled: number;
  fillRate: number;
}

export interface RoleCoverageInsight {
  role: string;
  assignments: number;
  uniqueStaff: number;
  averageHours: number;
}

export interface ScheduleInsights {
  coverageScore: number;
  utilisation: number;
  overtimeRisk: number;
  fairnessIndex: number;
  staffingVelocity: number;
  qualificationMatch: number;
  complianceScore: number;
  locationCoverage: LocationCoverageInsight[];
  roleCoverage: RoleCoverageInsight[];
}

export const generateScheduleInsights = (
  context: SchedulingContext,
  draft: ScheduleDraft,
  compliance: ComplianceResult[] = [],
): ScheduleInsights => {
  const coverage = aggregateCoverage(context.demandForecast, draft.assignments);
  let demandTotal = 0;
  let fulfilledTotal = 0;

  Object.values(coverage).forEach(({ demand, scheduled }) => {
    demandTotal += demand;
    fulfilledTotal += Math.min(scheduled, demand);
  });

  const staffLookup = new Map(context.staff.map((staff) => [staff.id, staff]));
  const hoursByStaff = new Map<string, number>();
  const locationDemand = new Map<string, number>();
  const locationScheduled = new Map<string, number>();
  const roleAssignments = new Map<string, number>();
  const roleHours = new Map<string, number>();
  const roleStaff = new Map<string, Set<string>>();

  context.demandForecast.signals.forEach((signal) => {
    locationDemand.set(signal.location, (locationDemand.get(signal.location) ?? 0) + signal.expectedDemand);
  });

  draft.assignments.forEach((assignment) => {
    const hours = hoursBetween(assignment.startTime, assignment.endTime);
    hoursByStaff.set(assignment.staffId, (hoursByStaff.get(assignment.staffId) ?? 0) + hours);
    locationScheduled.set(assignment.location, (locationScheduled.get(assignment.location) ?? 0) + 1);
    roleAssignments.set(assignment.role, (roleAssignments.get(assignment.role) ?? 0) + 1);
    roleHours.set(assignment.role, (roleHours.get(assignment.role) ?? 0) + hours);
    const staffSet = roleStaff.get(assignment.role) ?? new Set<string>();
    staffSet.add(assignment.staffId);
    roleStaff.set(assignment.role, staffSet);
  });

  const utilisation = percentage(
    average(
      context.staff.map((staff) => {
        const hours = hoursByStaff.get(staff.id) ?? 0;
        return safeDivide(hours, staff.preferredHours || staff.maxWeeklyHours || 1) * 100;
      }),
    ),
  );

  const overtimeRisk = percentage(
    safeDivide(
      context.staff.filter((staff) => (hoursByStaff.get(staff.id) ?? 0) > staff.maxWeeklyHours).length,
      Math.max(context.staff.length, 1),
    ) * 100,
  );

  const staffHours = Array.from(hoursByStaff.values());
  const meanHours = average(staffHours);
  const fairnessIndex = percentage(
    100 - Math.min(100, (Math.sqrt(average(staffHours.map((value) => (value - meanHours) ** 2))) / Math.max(meanHours, 1)) * 100),
  );

  const staffingVelocity = percentage(
    safeDivide(draft.assignments.length, context.demandForecast.signals.length || 1) * 100,
  );

  const qualificationMatches = draft.assignments.filter((assignment) => {
    const staff = staffLookup.get(assignment.staffId);
    if (!staff) {
      return false;
    }

    const applicableRequirementIds = context.constraints
      .filter((constraint) =>
        constraint.requiresQualificationIds?.length &&
        (!constraint.appliesToRoles || constraint.appliesToRoles.includes(assignment.role)),
      )
      .flatMap((constraint) => constraint.requiresQualificationIds ?? []);

    if (applicableRequirementIds.length === 0) {
      return staff.qualifications.length > 0;
    }

    const staffQualificationIds = new Set(staff.qualifications.map((qualification) => qualification.id));
    return applicableRequirementIds.every((qualificationId) => staffQualificationIds.has(qualificationId));
  }).length;

  const complianceScore = percentage(
    compliance.length === 0
      ? 100
      : safeDivide(
          compliance.filter((result) => result.passed).length,
          compliance.length,
        ) * 100,
  );

  const locationCoverage: LocationCoverageInsight[] = Array.from(
    new Set([...locationDemand.keys(), ...locationScheduled.keys()]),
  ).map((location) => {
    const demand = locationDemand.get(location) ?? 0;
    const scheduled = locationScheduled.get(location) ?? 0;
    return {
      location,
      demand,
      scheduled,
      fillRate: percentage(safeDivide(scheduled, demand || 1) * 100),
    };
  });

  const roleCoverage: RoleCoverageInsight[] = Array.from(roleAssignments.entries()).map(([role, count]) => {
    const uniqueStaff = roleStaff.get(role)?.size ?? 0;
    return {
      role,
      assignments: count,
      uniqueStaff,
      averageHours: percentage(safeDivide(roleHours.get(role) ?? 0, Math.max(uniqueStaff, 1))),
    };
  });

  const qualificationMatch = percentage(
    safeDivide(qualificationMatches, Math.max(draft.assignments.length, 1)) * 100,
  );

  return {
    coverageScore: percentage(safeDivide(fulfilledTotal, Math.max(demandTotal, 1)) * 100),
    utilisation,
    overtimeRisk,
    fairnessIndex,
    staffingVelocity,
    qualificationMatch,
    complianceScore,
    locationCoverage,
    roleCoverage,
  };
};
