import { beforeEach, describe, expect, it } from 'vitest';
import { getSchedulingApi, resetSchedulingApi } from '../scheduling';
import type { ScheduleDraft, ShiftAssignment } from '../../modules/scheduling';

const draft: ScheduleDraft = {
  id: 'draft-1',
  name: 'Test Draft',
  status: 'draft',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  assignments: [],
};

const assignment: ShiftAssignment = {
  staffId: 'a',
  role: 'Barista',
  date: '2024-04-01',
  startTime: '08:00',
  endTime: '12:00',
  location: 'Main',
};

describe('Scheduling API', () => {
  beforeEach(() => {
    resetSchedulingApi();
  });

  it('persists drafts and supports publishing', async () => {
    const api = getSchedulingApi();
    const drafted = await api.draftSchedule(draft);
    expect(drafted.status).toBe('draft');

    const published = await api.publishSchedule(drafted.id);
    expect(published.status).toBe('published');

    const log = await api.getAuditLog(drafted.id);
    expect(log).toHaveLength(2);
  });

  it('tracks swaps and allows rollback', async () => {
    const api = getSchedulingApi();
    const withShift = await api.draftSchedule({ ...draft, id: 'draft-2', assignments: [assignment] });
    const replacement: ShiftAssignment = { ...assignment, staffId: 'b', role: 'Manager' };
    await api.swapShifts(withShift.id, assignment, replacement);

    const log = await api.getAuditLog(withShift.id);
    const swapEntry = log.find((entry) => entry.action === 'swap');
    expect(swapEntry).toBeDefined();

    if (swapEntry) {
      const rolledBack = await api.rollback(withShift.id, swapEntry.id);
      expect(rolledBack.assignments[0].staffId).toBe(assignment.staffId);
    }
  });
});
