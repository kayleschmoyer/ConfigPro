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
