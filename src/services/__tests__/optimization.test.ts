import { describe, expect, it } from 'vitest';
import { GreedyScheduleOptimizationService } from '../optimization';
import { createSchedulingContext } from '../../modules/scheduling';
import type { ScheduleDraft, SchedulingConstraint, StaffProfile, DemandForecast } from '../../modules/scheduling';

const forecast: DemandForecast = {
  generatedAt: new Date().toISOString(),
  model: 'test',
  version: '1.0.0',
  signals: [
    { date: '2024-04-01', interval: '08:00-12:00', expectedDemand: 2, location: 'Main' },
    { date: '2024-04-01', interval: '12:00-16:00', expectedDemand: 1, location: 'Main' },
  ],
};

const staff: StaffProfile[] = [
  {
    id: 'a',
    displayName: 'A',
    role: 'Barista',
    qualifications: [],
    maxWeeklyHours: 40,
    preferredHours: 30,
    availability: { '2024-04-01': ['08:00-12:00', '12:00-16:00'] },
  },
  {
    id: 'b',
    displayName: 'B',
    role: 'Manager',
    qualifications: [],
    maxWeeklyHours: 40,
    preferredHours: 30,
    availability: { '2024-04-01': ['08:00-12:00'] },
  },
];

const constraints: SchedulingConstraint[] = [];

const draft: ScheduleDraft = {
  id: 'draft',
  name: 'Draft',
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  assignments: [],
};

describe('GreedyScheduleOptimizationService', () => {
  it('fills assignments based on demand signals', async () => {
    const context = createSchedulingContext(staff, [], forecast, constraints, [draft]);
    const service = new GreedyScheduleOptimizationService({ maxShiftsPerDay: 1 });
    const schedule = await service.generateSchedule(context);

    expect(schedule.assignments.length).toBeGreaterThanOrEqual(2);
    expect(schedule.metadata?.generator).toBe('greedy-coverage');
  });
});
