import { groupAssignmentsByDate } from '../modules/scheduling';
import type { ScheduleDraft, SchedulingContext, ShiftAssignment } from '../modules/scheduling';

export interface ScheduleOptimizationService {
  readonly name: string;
  generateSchedule(context: SchedulingContext): Promise<ScheduleDraft>;
}

interface OptimizationOptions {
  maxShiftsPerDay?: number;
}

const createAssignment = (
  staffId: string,
  role: string,
  date: string,
  interval: string,
  location: string,
): ShiftAssignment => {
  const [startTime, endTime] = interval.split('-');
  return {
    staffId,
    role,
    date,
    startTime,
    endTime,
    location,
  };
};

export class GreedyScheduleOptimizationService implements ScheduleOptimizationService {
  public readonly name = 'greedy-coverage';
  private readonly options: OptimizationOptions;

  constructor(options: OptimizationOptions = {}) {
    this.options = options;
  }

  async generateSchedule(context: SchedulingContext): Promise<ScheduleDraft> {
    const { demandForecast, staff, drafts } = context;
    const latestDraft = drafts.find((draft) => draft.status === 'draft');
    const assignments: ShiftAssignment[] = latestDraft ? [...latestDraft.assignments] : [];

    const staffUsage: Record<string, number> = {};

    for (const signal of demandForecast.signals) {
      const requiredHeadcount = Math.ceil(signal.expectedDemand);
      const existingAssignmentsForDay = assignments.filter(
        (assignment) => assignment.date === signal.date && assignment.startTime === signal.interval.split('-')[0],
      );

      const needed = Math.max(0, requiredHeadcount - existingAssignmentsForDay.length);
      if (needed === 0) continue;

      const availableStaff = staff
        .filter((member) => member.availability[signal.date]?.includes(signal.interval))
        .sort((a, b) => (staffUsage[a.id] ?? 0) - (staffUsage[b.id] ?? 0));

      for (const member of availableStaff.slice(0, needed)) {
        const usage = staffUsage[member.id] ?? 0;
        if (this.options.maxShiftsPerDay && usage >= this.options.maxShiftsPerDay) {
          continue;
        }

        assignments.push(createAssignment(member.id, member.role, signal.date, signal.interval, signal.location));
        staffUsage[member.id] = usage + 1;
      }
    }

    const grouped = groupAssignmentsByDate(assignments);

    return {
      id: latestDraft?.id ?? `draft-${Date.now()}`,
      name: latestDraft?.name ?? 'Auto generated draft',
      status: 'draft',
      createdAt: latestDraft?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignments: Object.values(grouped).flat(),
      metadata: {
        generator: this.name,
        coverageScore: calculateCoverageScore(context, assignments),
      },
    };
  }
}

const calculateCoverageScore = (context: SchedulingContext, assignments: ShiftAssignment[]): number => {
  const { demandForecast } = context;
  let fulfilled = 0;
  let demand = 0;

  for (const signal of demandForecast.signals) {
    demand += signal.expectedDemand;
    const scheduled = assignments.filter(
      (assignment) => assignment.date === signal.date && assignment.startTime === signal.interval.split('-')[0],
    ).length;
    fulfilled += Math.min(scheduled, signal.expectedDemand);
  }

  return Number(((fulfilled / Math.max(1, demand)) * 100).toFixed(2));
};
