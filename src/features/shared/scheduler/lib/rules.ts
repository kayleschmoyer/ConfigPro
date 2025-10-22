import type { AvailabilityRule, Employee, LaborLawProfile, Role, Shift, Violation } from './types';
import { differenceInMinutes, overlaps } from './time';

export type RuleContext = {
  shifts: Shift[];
  availability: AvailabilityRule[];
  labor: LaborLawProfile;
  roles: Role[];
  employees: Employee[];
};

type CheckArgs = {
  shift: Shift;
  employee: Employee | undefined;
  context: RuleContext;
};

type Check = (args: CheckArgs) => Violation | Violation[] | null;

const createViolation = (
  code: string,
  message: string,
  kind: 'HARD' | 'SOFT' = 'HARD',
  shiftId?: string,
  employeeId?: string,
  suggestion?: string,
): Violation => ({
  id: `${code}-${shiftId ?? 'unknown'}-${employeeId ?? 'na'}`,
  code,
  kind,
  message,
  shiftId,
  employeeId,
  suggestion,
});

const getEmployeeShifts = (employeeId: string | undefined, context: RuleContext) => {
  if (!employeeId) return [] as Shift[];
  return context.shifts.filter((item) => item.employeeId === employeeId);
};

const availabilityCheck: Check = ({ shift, employee, context }) => {
  if (!employee) return createViolation('UNASSIGNED', 'Shift is unassigned', 'SOFT', shift.id);
  const relevant = context.availability.filter((rule) => rule.employeeId === employee.id);
  if (relevant.length === 0) return null;
  const shiftStart = new Date(shift.start).getTime();
  const shiftEnd = new Date(shift.end).getTime();
  const blocking = relevant.find((rule) => {
    const start = new Date(rule.start).getTime();
    const end = new Date(rule.end).getTime();
    const overlap = shiftStart < end && shiftEnd > start;
    return overlap && rule.kind === 'UNAVAILABLE';
  });
  if (blocking) {
    return createViolation(
      'AVAILABILITY',
      `${employee.displayName} marked unavailable during this time`,
      'HARD',
      shift.id,
      employee.id,
      'Pick a different employee or adjust the shift to fall within availability',
    );
  }
  const permitted = relevant.filter((rule) => rule.kind === 'AVAILABLE');
  if (permitted.length === 0) return null;
  const matches = permitted.some((rule) => {
    const start = new Date(rule.start).getTime();
    const end = new Date(rule.end).getTime();
    return shiftStart >= start && shiftEnd <= end;
  });
  if (!matches) {
    return createViolation(
      'OUTSIDE_AVAILABILITY',
      `${employee.displayName} is not marked available for this full shift`,
      'SOFT',
      shift.id,
      employee.id,
      'Confirm availability exception or choose another teammate',
    );
  }
  return null;
};

const roleCertificationCheck: Check = ({ shift, employee, context }) => {
  if (!employee) return null;
  if (!employee.roles.includes(shift.roleId)) {
    return createViolation(
      'ROLE_MISMATCH',
      `${employee.displayName} is not assigned to role`,
      'HARD',
      shift.id,
      employee.id,
      'Assign a role-aligned employee or update role qualifications',
    );
  }
  const role = context.roles.find((item) => item.id === shift.roleId);
  if (!role || !role.requiredCerts?.length) return null;
  const employeeCerts = new Set(employee.certs ?? []);
  const missing = role.requiredCerts.filter((cert) => !employeeCerts.has(cert));
  if (missing.length) {
    return createViolation(
      'CERTIFICATION',
      `${employee.displayName} lacks required certification (${missing.join(', ')})`,
      'HARD',
      shift.id,
      employee.id,
      'Assign a certified teammate or update certifications',
    );
  }
  return null;
};

const restCheck: Check = ({ shift, employee, context }) => {
  if (!employee) return null;
  const minRest = employee.minRestMin ?? context.labor.restMin;
  if (!minRest) return null;
  const sorted = getEmployeeShifts(employee.id, context).filter((item) => item.id !== shift.id);
  const shiftStart = new Date(shift.start).getTime();
  const shiftEnd = new Date(shift.end).getTime();
  for (const other of sorted) {
    const otherEnd = new Date(other.end).getTime();
    if (otherEnd <= shiftStart) {
      const gap = (shiftStart - otherEnd) / (60 * 1000);
      if (gap < minRest) {
        return createViolation(
          'REST',
          `${employee.displayName} would only rest ${gap}m before this shift`,
          'HARD',
          shift.id,
          employee.id,
          'Provide at least the required rest window before reassigning',
        );
      }
    }
    const otherStart = new Date(other.start).getTime();
    if (otherStart >= shiftEnd) {
      const gap = (otherStart - shiftEnd) / (60 * 1000);
      if (gap < minRest) {
        return createViolation(
          'REST',
          `${employee.displayName} would only rest ${gap}m after this shift`,
          'HARD',
          shift.id,
          employee.id,
          'End earlier or schedule a different teammate',
        );
      }
    }
  }
  return null;
};

const overlapCheck: Check = ({ shift, employee, context }) => {
  if (!employee) return null;
  const peers = getEmployeeShifts(employee.id, context).filter((item) => item.id !== shift.id);
  const overlapping = peers.find((other) => overlaps(shift.start, shift.end, other.start, other.end));
  if (overlapping) {
    return createViolation(
      'OVERLAP',
      'Employee already has a shift during this time',
      'HARD',
      shift.id,
      employee.id,
      'Choose a different time or teammate to avoid overlaps',
    );
  }
  return null;
};

const locationCheck: Check = ({ shift, employee }) => {
  if (!employee) return null;
  if (employee.eligibleLocationIds && !employee.eligibleLocationIds.includes(shift.locationId)) {
    return createViolation(
      'LOCATION',
      `${employee.displayName} is not eligible for this site`,
      'HARD',
      shift.id,
      employee.id,
      'Select a site-qualified teammate',
    );
  }
  return null;
};

const curfewCheck: Check = ({ shift, employee, context }) => {
  if (!employee) return null;
  if (!employee.age || employee.age >= 18) return null;
  const curfew = context.labor.minorLimits?.curfew;
  if (!curfew) return null;
  const shiftStart = new Date(shift.start);
  const shiftEnd = new Date(shift.end);
  const curfewEnd = curfew.endHHmm;
  const [endH, endM] = curfewEnd.split(':').map(Number);
  const curfewEndMinutes = endH * 60 + endM;
  const shiftEndMinutes = shiftEnd.getUTCHours() * 60 + shiftEnd.getUTCMinutes();
  if (shiftEndMinutes > curfewEndMinutes) {
    return createViolation(
      'MINOR_CURFEW',
      `${employee.displayName} would work past permitted curfew`,
      'HARD',
      shift.id,
      employee.id,
      'Shorten the shift or assign an adult employee',
    );
  }
  const [startH, startM] = curfew.startHHmm.split(':').map(Number);
  const curfewStartMinutes = startH * 60 + startM;
  const shiftStartMinutes = shiftStart.getUTCHours() * 60 + shiftStart.getUTCMinutes();
  if (shiftStartMinutes < curfewStartMinutes) {
    return createViolation(
      'MINOR_CURFEW',
      `${employee.displayName} cannot start before ${curfew.startHHmm}`,
      'HARD',
      shift.id,
      employee.id,
      'Delay start or pick another teammate',
    );
  }
  return null;
};

const overtimeCheck: Check = ({ shift, employee, context }) => {
  if (!employee) return null;
  const shiftMinutes = differenceInMinutes(shift.start, shift.end);
  const sameDay = shift.start.slice(0, 10);
  const employeeShifts = getEmployeeShifts(employee.id, context);
  const dayMinutes = employeeShifts
    .filter((s) => s.id !== shift.id && s.start.slice(0, 10) === sameDay)
    .reduce((total, item) => total + differenceInMinutes(item.start, item.end), 0);
  const weekMinutes = employeeShifts
    .filter((s) => s.id !== shift.id)
    .reduce((total, item) => total + differenceInMinutes(item.start, item.end), 0);
  const maxDaily = employee.maxDailyMin ?? context.labor.minorLimits?.maxDailyMin;
  if (maxDaily && dayMinutes + shiftMinutes > maxDaily) {
    return createViolation(
      'MAX_DAILY',
      `${employee.displayName} exceeds daily limit`,
      'HARD',
      shift.id,
      employee.id,
      'Shorten or split the shift to stay within the limit',
    );
  }
  const maxWeekly = employee.maxWeeklyMin ?? context.labor.minorLimits?.maxWeeklyMin;
  if (maxWeekly && weekMinutes + shiftMinutes > maxWeekly) {
    return createViolation(
      'MAX_WEEKLY',
      `${employee.displayName} exceeds weekly limit`,
      'HARD',
      shift.id,
      employee.id,
      'Spread hours across more team members',
    );
  }
  const overtime = context.labor.overtime;
  if (!overtime) return null;
  const dayThreshold = overtime.dailyOTAfterMin;
  const weekThreshold = overtime.weeklyOTAfterMin;
  const projectedDay = dayMinutes + shiftMinutes;
  const projectedWeek = weekMinutes + shiftMinutes;
  const warnings: Violation[] = [];
  if (dayThreshold && projectedDay > dayThreshold) {
    warnings.push(
      createViolation(
        'DAILY_OVERTIME',
        `${employee.displayName} would enter daily overtime`,
        'SOFT',
        shift.id,
        employee.id,
        'Balance hours to avoid overtime premiums',
      ),
    );
  }
  if (weekThreshold && projectedWeek > weekThreshold) {
    warnings.push(
      createViolation(
        'WEEKLY_OVERTIME',
        `${employee.displayName} would enter weekly overtime`,
        'SOFT',
        shift.id,
        employee.id,
        'Consider another teammate to manage overtime exposure',
      ),
    );
  }
  return warnings.length ? warnings : null;
};

const breakCheck: Check = ({ shift, employee, context }) => {
  if (!employee) return null;
  const shiftMinutes = differenceInMinutes(shift.start, shift.end);
  const breakRules = context.labor.breaks;
  if (!breakRules) return null;
  if (breakRules.mealRequired && shiftMinutes >= 5 * 60 && !shift.breakMin) {
    return createViolation(
      'MEAL_BREAK',
      'Meal break required for this shift duration',
      'HARD',
      shift.id,
      employee.id,
      'Add a compliant meal break',
    );
  }
  if (breakRules.mealMin && (shift.breakMin ?? 0) < breakRules.mealMin) {
    return createViolation(
      'MEAL_BREAK_SHORT',
      'Scheduled break is shorter than required minimum',
      'HARD',
      shift.id,
      employee.id,
      'Extend break to legal minimum',
    );
  }
  if (breakRules.secondMealAfterMin && shiftMinutes > breakRules.secondMealAfterMin && (shift.breakMin ?? 0) < breakRules.mealMin! * 2) {
    return createViolation(
      'SECOND_MEAL',
      'Second meal break required',
      'HARD',
      shift.id,
      employee.id,
      'Schedule two compliant breaks',
    );
  }
  return null;
};

const checks: Check[] = [
  availabilityCheck,
  roleCertificationCheck,
  overlapCheck,
  locationCheck,
  restCheck,
  curfewCheck,
  overtimeCheck,
  breakCheck,
];

export const violationsForShift = (shift: Shift, employee: Employee | undefined, context: RuleContext) => {
  const violations: Violation[] = [];
  for (const check of checks) {
    const result = check({ shift, employee, context });
    if (!result) continue;
    if (Array.isArray(result)) {
      violations.push(...result);
    } else {
      violations.push(result);
    }
  }
  return violations;
};

export const applyViolationsToShift = (shift: Shift, employee: Employee | undefined, context: RuleContext) => {
  const violations = violationsForShift(shift, employee, context);
  return { ...shift, flags: violations.map((item) => item.code) };
};

export const isHardViolation = (violation: Violation) => violation.kind === 'HARD';

export const hasHardViolation = (violations: Violation[]) => violations.some(isHardViolation);

export const withinMaxDaily = (employee: Employee | undefined, context: RuleContext, minutes: number) => {
  if (!employee) return true;
  const maxDaily = employee.maxDailyMin ?? context.labor.minorLimits?.maxDailyMin;
  if (!maxDaily) return true;
  return minutes <= maxDaily;
};

export const withinMaxWeekly = (employee: Employee | undefined, context: RuleContext, minutes: number) => {
  if (!employee) return true;
  const maxWeekly = employee.maxWeeklyMin ?? context.labor.minorLimits?.maxWeeklyMin;
  if (!maxWeekly) return true;
  return minutes <= maxWeekly;
};

export const projectOvertime = (employee: Employee | undefined, context: RuleContext) => {
  if (!employee) return { daily: 0, weekly: 0 };
  const employeeShifts = getEmployeeShifts(employee.id, context);
  const byDay = new Map<string, number>();
  let total = 0;
  employeeShifts.forEach((shift) => {
    const minutes = differenceInMinutes(shift.start, shift.end);
    total += minutes;
    const day = shift.start.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + minutes);
  });
  const dailyThreshold = context.labor.overtime?.dailyOTAfterMin ?? Infinity;
  const weeklyThreshold = context.labor.overtime?.weeklyOTAfterMin ?? Infinity;
  const daily = Math.max(0, Math.max(...Array.from(byDay.values()), 0) - dailyThreshold);
  const weekly = Math.max(0, total - weeklyThreshold);
  return { daily, weekly };
};
