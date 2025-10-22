export type ID = string;
export type DateISO = string;

export type Role = {
  id: ID;
  name: string;
  color?: string;
  requiredCerts?: string[];
};

export type Location = {
  id: ID;
  name: string;
  tz?: string;
};

export type Employee = {
  id: ID;
  displayName: string;
  age?: number;
  roles: ID[];
  certs?: string[];
  maxDailyMin?: number;
  maxWeeklyMin?: number;
  minRestMin?: number;
  homeLocationId?: ID;
  eligibleLocationIds?: ID[];
  hourlyCost?: number;
};

export type AvailabilityRule = {
  id: ID;
  employeeId: ID;
  kind: 'AVAILABLE' | 'UNAVAILABLE';
  rrule?: string;
  start: DateISO;
  end: DateISO;
  locationId?: ID;
};

export type Shift = {
  id: ID;
  employeeId?: ID;
  roleId: ID;
  locationId: ID;
  start: DateISO;
  end: DateISO;
  breakMin?: number;
  status?: 'DRAFT' | 'PUBLISHED';
  flags?: string[];
  notes?: string;
};

export type CoverageRequirement = {
  id: ID;
  roleId: ID;
  locationId: ID;
  date: DateISO;
  segments: {
    start: DateISO;
    end: DateISO;
    requiredCount: number;
  }[];
};

export type LaborLawProfile = {
  id: ID;
  name: string;
  minorLimits?: {
    maxDailyMin?: number;
    maxWeeklyMin?: number;
    curfew?: { startHHmm: string; endHHmm: string };
  };
  breaks?: { mealRequired?: boolean; mealMin?: number; secondMealAfterMin?: number };
  restMin?: number;
  overtime?: { dailyOTAfterMin?: number; weeklyOTAfterMin?: number };
};

export type SoftPrefs = {
  preferRoles?: ID[];
  preferLocations?: ID[];
  maxConsecutiveDays?: number;
};

export type Violation = {
  id: ID;
  shiftId?: ID;
  employeeId?: ID;
  kind: 'HARD' | 'SOFT';
  code: string;
  message: string;
  suggestion?: string;
};

export type AutoScheduleRequest = {
  rangeStart: DateISO;
  rangeEnd: DateISO;
  coverage: CoverageRequirement[];
  employees: Employee[];
  availability: AvailabilityRule[];
  laws: LaborLawProfile;
  existingShifts: Shift[];
  softPrefs?: Record<ID, SoftPrefs>;
  fairnessWeight?: number;
  overtimeWeight?: number;
  preferenceWeight?: number;
  costWeight?: number;
};

export type AutoScheduleResult = {
  assigned: Shift[];
  unassigned: CoverageRequirement[];
  violations: Violation[];
  scores: {
    fairness: number;
    overtime: number;
    coverage: number;
    prefs: number;
    cost: number;
    total: number;
  };
};

export type ScheduleView = 'day' | 'week' | 'month';
export type GridGrouping = 'employee' | 'role';

export type SchedulerContext = {
  roles: Role[];
  locations: Location[];
  employees: Employee[];
  coverage: CoverageRequirement[];
  labor: LaborLawProfile;
};
