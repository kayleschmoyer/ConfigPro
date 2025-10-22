import type {
  AvailabilityRule,
  CoverageRequirement,
  Employee,
  LaborLawProfile,
  Location,
  Role,
  Shift,
} from './types';

export type ShiftTemplate = {
  id: string;
  label: string;
  startMinutes: number;
  durationMinutes: number;
  breakMin: number;
  roleId?: string;
};

const baseMonday = new Date(Date.UTC(2025, 1, 10));

const dateKeyFromOffset = (dayOffset: number) => {
  const date = new Date(baseMonday);
  date.setUTCDate(baseMonday.getUTCDate() + dayOffset);
  date.setUTCHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
};

const isoFromOffset = (dayOffset: number, hour: number, minute = 0) => {
  const date = new Date(baseMonday);
  date.setUTCDate(baseMonday.getUTCDate() + dayOffset);
  date.setUTCHours(hour, minute, 0, 0);
  return date.toISOString();
};

export const sampleRoles: Role[] = [
  { id: 'front-desk', name: 'Front Desk', color: '#60a5fa', requiredCerts: ['customer'] },
  { id: 'barista', name: 'Barista', color: '#f97316', requiredCerts: ['bar'] },
  { id: 'kitchen', name: 'Kitchen', color: '#34d399' },
  { id: 'shift-lead', name: 'Shift Lead', color: '#facc15', requiredCerts: ['lead'] },
];

export const sampleLocations: Location[] = [
  { id: 'hq', name: 'Downtown Flagship', tz: 'America/Los_Angeles' },
  { id: 'uptown', name: 'Uptown Satellite', tz: 'America/Los_Angeles' },
];

export const sampleEmployees: Employee[] = [
  {
    id: 'emp-anna',
    displayName: 'Anna Lopez',
    age: 28,
    roles: ['front-desk', 'shift-lead'],
    certs: ['customer', 'lead'],
    maxDailyMin: 9 * 60,
    maxWeeklyMin: 40 * 60,
    minRestMin: 10 * 60,
    homeLocationId: 'hq',
    eligibleLocationIds: ['hq', 'uptown'],
    hourlyCost: 28,
  },
  {
    id: 'emp-ben',
    displayName: 'Ben Carter',
    age: 32,
    roles: ['barista', 'kitchen'],
    certs: ['bar'],
    maxDailyMin: 10 * 60,
    maxWeeklyMin: 38 * 60,
    minRestMin: 11 * 60,
    homeLocationId: 'hq',
    eligibleLocationIds: ['hq'],
    hourlyCost: 24,
  },
  {
    id: 'emp-cam',
    displayName: 'Camille Singh',
    age: 24,
    roles: ['front-desk'],
    certs: ['customer'],
    maxDailyMin: 8 * 60,
    maxWeeklyMin: 32 * 60,
    minRestMin: 10 * 60,
    homeLocationId: 'uptown',
    eligibleLocationIds: ['uptown', 'hq'],
    hourlyCost: 22,
  },
  {
    id: 'emp-dylan',
    displayName: 'Dylan Brooks',
    age: 19,
    roles: ['kitchen', 'barista'],
    certs: ['bar'],
    maxDailyMin: 8 * 60,
    maxWeeklyMin: 30 * 60,
    minRestMin: 10 * 60,
    homeLocationId: 'hq',
    eligibleLocationIds: ['hq'],
    hourlyCost: 20,
  },
  {
    id: 'emp-emma',
    displayName: 'Emma Zhang',
    age: 17,
    roles: ['front-desk'],
    certs: ['customer'],
    maxDailyMin: 6 * 60,
    maxWeeklyMin: 24 * 60,
    minRestMin: 12 * 60,
    homeLocationId: 'uptown',
    eligibleLocationIds: ['uptown'],
    hourlyCost: 18,
  },
  {
    id: 'emp-finn',
    displayName: 'Finn Morales',
    age: 21,
    roles: ['barista', 'shift-lead'],
    certs: ['bar'],
    maxDailyMin: 9 * 60,
    maxWeeklyMin: 36 * 60,
    minRestMin: 10 * 60,
    homeLocationId: 'hq',
    eligibleLocationIds: ['hq', 'uptown'],
    hourlyCost: 26,
  },
  {
    id: 'emp-gia',
    displayName: 'Gia Patel',
    age: 23,
    roles: ['kitchen'],
    certs: [],
    maxDailyMin: 8 * 60,
    maxWeeklyMin: 34 * 60,
    minRestMin: 11 * 60,
    homeLocationId: 'hq',
    eligibleLocationIds: ['hq'],
    hourlyCost: 21,
  },
  {
    id: 'emp-hugo',
    displayName: 'Hugo Smith',
    age: 29,
    roles: ['front-desk', 'barista'],
    certs: ['customer', 'bar'],
    maxDailyMin: 9 * 60,
    maxWeeklyMin: 40 * 60,
    minRestMin: 10 * 60,
    homeLocationId: 'hq',
    eligibleLocationIds: ['hq', 'uptown'],
    hourlyCost: 25,
  },
];

export const sampleAvailability: AvailabilityRule[] = [
  ...sampleEmployees.flatMap<AvailabilityRule>((employee) => [
    {
      id: `avail-${employee.id}-week`,
      employeeId: employee.id,
      kind: 'AVAILABLE',
      start: isoFromOffset(-1, 6),
      end: isoFromOffset(14, 23, 30),
    },
  ]),
  {
    id: 'avail-emma-school',
    employeeId: 'emp-emma',
    kind: 'UNAVAILABLE',
    start: isoFromOffset(0, 7),
    end: isoFromOffset(0, 15),
  },
  {
    id: 'avail-emma-school-2',
    employeeId: 'emp-emma',
    kind: 'UNAVAILABLE',
    start: isoFromOffset(1, 7),
    end: isoFromOffset(1, 15),
  },
];

export const sampleLabor: LaborLawProfile = {
  id: 'labor-default',
  name: 'US Retail Default',
  minorLimits: {
    maxDailyMin: 6 * 60,
    maxWeeklyMin: 28 * 60,
    curfew: { startHHmm: '06:00', endHHmm: '21:30' },
  },
  breaks: {
    mealRequired: true,
    mealMin: 30,
    secondMealAfterMin: 10 * 60,
  },
  restMin: 10 * 60,
  overtime: {
    dailyOTAfterMin: 8 * 60,
    weeklyOTAfterMin: 40 * 60,
  },
};

export const sampleCoverage: CoverageRequirement[] = Array.from({ length: 7 }).flatMap((_, index) => {
  const date = dateKeyFromOffset(index);
  return [
    {
      id: `cov-front-${date}`,
      roleId: 'front-desk',
      locationId: index % 2 === 0 ? 'hq' : 'uptown',
      date,
      segments: [
        { start: isoFromOffset(index, 7), end: isoFromOffset(index, 12), requiredCount: 1 },
        { start: isoFromOffset(index, 12), end: isoFromOffset(index, 18), requiredCount: 2 },
      ],
    },
    {
      id: `cov-bar-${date}`,
      roleId: 'barista',
      locationId: 'hq',
      date,
      segments: [
        { start: isoFromOffset(index, 6), end: isoFromOffset(index, 11), requiredCount: 1 },
        { start: isoFromOffset(index, 11), end: isoFromOffset(index, 16), requiredCount: 2 },
      ],
    },
    {
      id: `cov-kit-${date}`,
      roleId: 'kitchen',
      locationId: 'hq',
      date,
      segments: [
        { start: isoFromOffset(index, 9), end: isoFromOffset(index, 15), requiredCount: 2 },
      ],
    },
  ];
});

export const sampleShifts: Shift[] = [
  {
    id: 'shift-anna-mon',
    employeeId: 'emp-anna',
    roleId: 'shift-lead',
    locationId: 'hq',
    start: isoFromOffset(0, 7, 30),
    end: isoFromOffset(0, 15, 30),
    breakMin: 30,
    status: 'DRAFT',
  },
  {
    id: 'shift-ben-mon',
    employeeId: 'emp-ben',
    roleId: 'barista',
    locationId: 'hq',
    start: isoFromOffset(0, 6),
    end: isoFromOffset(0, 14),
    breakMin: 45,
    status: 'DRAFT',
  },
  {
    id: 'shift-cam-mon',
    employeeId: 'emp-cam',
    roleId: 'front-desk',
    locationId: 'uptown',
    start: isoFromOffset(0, 8),
    end: isoFromOffset(0, 16),
    breakMin: 30,
    status: 'DRAFT',
  },
  {
    id: 'shift-dylan-mon',
    employeeId: 'emp-dylan',
    roleId: 'kitchen',
    locationId: 'hq',
    start: isoFromOffset(0, 9),
    end: isoFromOffset(0, 15, 30),
    breakMin: 30,
    status: 'DRAFT',
  },
  {
    id: 'shift-emma-mon',
    employeeId: 'emp-emma',
    roleId: 'front-desk',
    locationId: 'uptown',
    start: isoFromOffset(0, 16),
    end: isoFromOffset(0, 20),
    breakMin: 15,
    status: 'DRAFT',
  },
  {
    id: 'shift-finn-tue',
    employeeId: 'emp-finn',
    roleId: 'barista',
    locationId: 'hq',
    start: isoFromOffset(1, 7),
    end: isoFromOffset(1, 15),
    breakMin: 30,
    status: 'DRAFT',
  },
  {
    id: 'shift-gia-tue',
    employeeId: 'emp-gia',
    roleId: 'kitchen',
    locationId: 'hq',
    start: isoFromOffset(1, 10),
    end: isoFromOffset(1, 16),
    breakMin: 30,
    status: 'DRAFT',
  },
  {
    id: 'shift-hugo-tue',
    employeeId: 'emp-hugo',
    roleId: 'front-desk',
    locationId: 'hq',
    start: isoFromOffset(1, 8),
    end: isoFromOffset(1, 16),
    breakMin: 30,
    status: 'DRAFT',
  },
];

export const shiftTemplates: ShiftTemplate[] = [
  { id: 'template-8-4', label: '8a – 4p', startMinutes: 8 * 60, durationMinutes: 8 * 60, breakMin: 30 },
  { id: 'template-open', label: 'Open (6a – 2p)', startMinutes: 6 * 60, durationMinutes: 8 * 60, breakMin: 30 },
  { id: 'template-close', label: 'Close (2p – 10p)', startMinutes: 14 * 60, durationMinutes: 8 * 60, breakMin: 30 },
  { id: 'template-mid', label: 'Mid (10a – 6p)', startMinutes: 10 * 60, durationMinutes: 8 * 60, breakMin: 30 },
];

export const defaultStartDate = dateKeyFromOffset(0);
