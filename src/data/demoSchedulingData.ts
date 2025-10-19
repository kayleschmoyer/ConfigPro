import type {
  DemandForecast,
  DemandSignal,
  LaborLawRule,
  ScheduleDraft,
  SchedulingConstraint,
  StaffProfile,
} from '../modules/scheduling';

const baseDate = new Date();
const formatDate = (offset: number) => {
  const date = new Date(baseDate);
  date.setDate(baseDate.getDate() + offset);
  return date.toISOString().slice(0, 10);
};

const intervals = ['08:00-12:00', '12:00-16:00', '16:00-20:00'];

const createDemandSignals = (): DemandSignal[] => {
  const signals: DemandSignal[] = [];
  for (let dayOffset = 0; dayOffset < 5; dayOffset += 1) {
    const date = formatDate(dayOffset);
    intervals.forEach((interval, index) => {
      signals.push({
        date,
        interval,
        expectedDemand: 4 + index + (dayOffset % 2),
        location: 'Main',
      });
    });
  }
  return signals;
};

export const demoDemandForecast: DemandForecast = {
  generatedAt: new Date().toISOString(),
  signals: createDemandSignals(),
  model: 'demo',
  version: '1.0.0',
};

export const demoStaff: StaffProfile[] = [
  {
    id: 'staff-1',
    displayName: 'Rosa Jimenez',
    role: 'Barista',
    qualifications: [
      { id: 'espresso', name: 'Espresso Certified', level: 'associate' },
      { id: 'lead', name: 'Shift Lead', level: 'senior' },
    ],
    maxWeeklyHours: 40,
    preferredHours: 32,
    availability: Object.fromEntries(
      Array.from({ length: 5 }, (_, offset) => [formatDate(offset), intervals]),
    ),
  },
  {
    id: 'staff-2',
    displayName: 'Kofi Mensah',
    role: 'Barista',
    qualifications: [{ id: 'espresso', name: 'Espresso Certified', level: 'associate' }],
    maxWeeklyHours: 35,
    preferredHours: 30,
    availability: Object.fromEntries(
      Array.from({ length: 5 }, (_, offset) => [formatDate(offset), intervals.filter((_, index) => index < 2)]),
    ),
  },
  {
    id: 'staff-3',
    displayName: 'Amelia Chen',
    role: 'Manager',
    qualifications: [
      { id: 'lead', name: 'Shift Lead', level: 'manager' },
      { id: 'safety', name: 'Food Safety', level: 'senior', expiresOn: formatDate(180) },
    ],
    maxWeeklyHours: 45,
    preferredHours: 40,
    availability: Object.fromEntries(
      Array.from({ length: 5 }, (_, offset) => [formatDate(offset), intervals]),
    ),
  },
];

export const demoLaborRules: LaborLawRule[] = [
  {
    id: 'max-8hr',
    description: 'Shift length cannot exceed 8 hours',
    maxHoursPerDay: 8,
  },
  {
    id: 'rest-period',
    description: 'At least 12 hours of rest between shifts',
    minRestPeriodHours: 12,
  },
];

export const demoConstraints: SchedulingConstraint[] = [
  {
    id: 'manager-per-shift',
    description: 'At least one manager per interval',
    severity: 'critical',
    customRule: (context) => {
      const managerIds = new Set(context.staff.filter((staff) => staff.role === 'Manager').map((staff) => staff.id));
      return context.drafts.every((draft) => {
        const buckets = new Map<string, number>();
        draft.assignments.forEach((assignment) => {
          const key = `${assignment.date}-${assignment.startTime}`;
          if (managerIds.has(assignment.staffId)) {
            buckets.set(key, (buckets.get(key) ?? 0) + 1);
          }
        });
        return draft.assignments.every((assignment) => (buckets.get(`${assignment.date}-${assignment.startTime}`) ?? 0) >= 1);
      });
    },
  },
];

export const demoDraft: ScheduleDraft = {
  id: 'draft-demo',
  name: 'Weekly Draft',
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  assignments: [],
};
