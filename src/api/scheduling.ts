import type { ScheduleDraft, ShiftAssignment } from '../modules/scheduling';

export interface AuditLogEntry {
  id: string;
  action: 'draft' | 'publish' | 'swap' | 'rollback';
  scheduleId: string;
  payload: Record<string, unknown>;
  timestamp: string;
  actor: string;
}

export interface SchedulingApi {
  draftSchedule(draft: ScheduleDraft): Promise<ScheduleDraft>;
  publishSchedule(scheduleId: string): Promise<ScheduleDraft>;
  swapShifts(
    scheduleId: string,
    original: ShiftAssignment,
    replacement: ShiftAssignment,
  ): Promise<ScheduleDraft>;
  rollback(scheduleId: string, auditId: string): Promise<ScheduleDraft>;
  getAuditLog(scheduleId: string): Promise<AuditLogEntry[]>;
}

class InMemorySchedulingApi implements SchedulingApi {
  private schedules = new Map<string, ScheduleDraft>();
  private auditLogs = new Map<string, AuditLogEntry[]>();

  async draftSchedule(draft: ScheduleDraft): Promise<ScheduleDraft> {
    const existing = this.schedules.get(draft.id);
    const updated = {
      ...draft,
      status: 'draft' as const,
      updatedAt: new Date().toISOString(),
    };
    this.schedules.set(updated.id, updated);
    this.appendAudit(updated.id, 'draft', { previous: existing, next: updated });
    return updated;
  }

  async publishSchedule(scheduleId: string): Promise<ScheduleDraft> {
    const schedule = this.getScheduleOrThrow(scheduleId);
    const published = {
      ...schedule,
      status: 'published' as const,
      updatedAt: new Date().toISOString(),
    };
    this.schedules.set(scheduleId, published);
    this.appendAudit(scheduleId, 'publish', { previous: schedule, next: published });
    return published;
  }

  async swapShifts(
    scheduleId: string,
    original: ShiftAssignment,
    replacement: ShiftAssignment,
  ): Promise<ScheduleDraft> {
    const schedule = this.getScheduleOrThrow(scheduleId);
    const assignments = schedule.assignments.map((assignment) =>
      assignment.staffId === original.staffId &&
      assignment.date === original.date &&
      assignment.startTime === original.startTime &&
      assignment.endTime === original.endTime
        ? replacement
        : assignment,
    );

    const updated = { ...schedule, assignments, updatedAt: new Date().toISOString() };
    this.schedules.set(scheduleId, updated);
    this.appendAudit(scheduleId, 'swap', { previous: schedule, next: updated, original, replacement });
    return updated;
  }

  async rollback(scheduleId: string, auditId: string): Promise<ScheduleDraft> {
    const auditLog = this.auditLogs.get(scheduleId) ?? [];
    const entry = auditLog.find((log) => log.id === auditId);
    if (!entry) {
      throw new Error(`Audit entry ${auditId} not found`);
    }
    const previous = entry.payload.previous as ScheduleDraft | undefined;
    if (!previous) {
      throw new Error('No previous version stored for rollback');
    }
    this.schedules.set(scheduleId, previous);
    this.appendAudit(scheduleId, 'rollback', { restoredFrom: auditId });
    return previous;
  }

  async getAuditLog(scheduleId: string): Promise<AuditLogEntry[]> {
    return this.auditLogs.get(scheduleId) ?? [];
  }

  private getScheduleOrThrow(scheduleId: string): ScheduleDraft {
    const schedule = this.schedules.get(scheduleId);
    if (!schedule) {
      throw new Error(`Schedule ${scheduleId} not found`);
    }
    return schedule;
  }

  private appendAudit(scheduleId: string, action: AuditLogEntry['action'], payload: Record<string, unknown>) {
    const audit: AuditLogEntry = {
      id: `${action}-${Date.now()}`,
      action,
      scheduleId,
      payload,
      timestamp: new Date().toISOString(),
      actor: 'system',
    };
    const log = this.auditLogs.get(scheduleId) ?? [];
    log.push(audit);
    this.auditLogs.set(scheduleId, log);
  }
}

let apiInstance: SchedulingApi | null = null;

export const getSchedulingApi = (): SchedulingApi => {
  if (!apiInstance) {
    apiInstance = new InMemorySchedulingApi();
  }
  return apiInstance;
};

export const resetSchedulingApi = () => {
  apiInstance = null;
};
