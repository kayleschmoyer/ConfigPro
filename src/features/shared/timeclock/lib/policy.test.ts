import { describe, expect, it } from 'vitest';
import { evaluateTimesheetEntry } from './policy';
import type { Policy, TimesheetEntry } from './types';

const createEntry = (start: string, end: string, overrides: Partial<TimesheetEntry> = {}): TimesheetEntry => ({
  id: 'entry-1',
  employeeId: 'EMP-1',
  start,
  end,
  minutesWorked: 0,
  regularMinutes: 0,
  otMinutes: 0,
  dtMinutes: 0,
  breakMinutes: overrides.breakMinutes ?? 30,
  audit: [],
  ...overrides,
});

describe('policy evaluation', () => {
  it('applies California daily overtime and double time thresholds', () => {
    const policy: Policy = {
      id: 'ca',
      name: 'CA Daily',
      overtime: { dailyOTAfterMin: 8 * 60, dailyDTAfterMin: 12 * 60 },
      rounding: { mode: 'NEAREST', incrementMin: 6 },
      grace: {},
      breaks: { mealRequired: true, mealMin: 30 },
      permissions: { employeeEditOwn: true, managerEditTeam: true },
    };

    const entry = createEntry('2024-01-01T08:00:00.000Z', '2024-01-01T21:00:00.000Z');
    const evaluation = evaluateTimesheetEntry(entry, policy);

    expect(evaluation.regularMinutes).toBe(8 * 60);
    expect(evaluation.otMinutes).toBe(4 * 60);
    expect(evaluation.dtMinutes).toBe(30);
    expect(evaluation.breakMinutes).toBeGreaterThanOrEqual(30);
  });

  it('converts regular time to weekly overtime after 40 hours', () => {
    const policy: Policy = {
      id: 'us',
      name: 'US FLSA',
      overtime: { weeklyOTAfterMin: 40 * 60 },
      rounding: { mode: 'NEAREST', incrementMin: 6 },
      grace: {},
      breaks: { mealRequired: true, mealMin: 30 },
      permissions: { employeeEditOwn: true, managerEditTeam: true },
    };

    const entry = createEntry('2024-01-05T08:00:00.000Z', '2024-01-05T10:30:00.000Z', { breakMinutes: 30 });
    const evaluation = evaluateTimesheetEntry(entry, policy, { weeklyMinutesToDate: 39 * 60 });

    expect(evaluation.regularMinutes).toBe(60);
    expect(evaluation.otMinutes).toBe(60);
    expect(evaluation.dtMinutes).toBe(0);
  });
});
