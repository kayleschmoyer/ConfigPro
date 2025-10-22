import type { ReactNode } from 'react';

export type Money = { currency: string; value: number };

export type Geo = { lat: number; lng: number; accuracy?: number };

export type DeviceInfo = {
  id: string;
  name: string;
  trusted: boolean;
  ip?: string;
  ssid?: string;
};

export type EmployeeRole = 'EMP' | 'LEAD' | 'MANAGER' | 'PAYROLL';

export type Employee = {
  id: string;
  displayName: string;
  email?: string;
  role: EmployeeRole;
  pinEnabled?: boolean;
  photoUrl?: string;
  defaultJobCode?: string;
};

export type PunchType = 'IN' | 'OUT' | 'BREAK_START' | 'BREAK_END' | 'JOB_SWITCH';

export type Punch = {
  id: string;
  employeeId: string;
  type: PunchType;
  timestamp: string; // ISO
  jobCode?: string;
  costCenter?: string;
  geo?: Geo;
  device?: DeviceInfo;
  selfieUrl?: string;
  livenessPassed?: boolean;
  offline?: { queuedAt: string; signature: string };
  notes?: string;
  policyFlags?: string[];
};

export type TimesheetEntryAudit = {
  at: string;
  by: string;
  change: string;
};

export type TimesheetEntry = {
  id: string;
  employeeId: string;
  start: string;
  end?: string;
  jobCode?: string;
  costCenter?: string;
  minutesWorked: number;
  regularMinutes: number;
  otMinutes: number;
  dtMinutes: number;
  breakMinutes: number;
  exceptions?: string[];
  approved?: boolean;
  locked?: boolean;
  audit: TimesheetEntryAudit[];
};

export type Policy = {
  id: string;
  name: string;
  overtime: {
    dailyOTAfterMin?: number;
    dailyDTAfterMin?: number;
    weeklyOTAfterMin?: number;
  };
  rounding: {
    mode: 'NEAREST' | 'UP' | 'DOWN';
    incrementMin: 5 | 6 | 10 | 15;
  };
  grace: { inMin?: number; outMin?: number; breakMin?: number };
  breaks: {
    mealRequired?: boolean;
    mealMin?: number;
    secondMealAfterMin?: number;
    paidBreakMin?: number;
  };
  geofence?: {
    center: Geo;
    radiusMeters: number;
    allowedSSIDs?: string[];
    allowedIPs?: string[];
  };
  antiBuddy?: {
    selfieRequired?: boolean;
    livenessRandom?: boolean;
    rotatingQR?: boolean;
  };
  permissions: { employeeEditOwn?: boolean; managerEditTeam?: boolean };
};

export type Device = DeviceInfo & {
  siteId?: string;
  lastSeen?: string;
  kioskMode?: boolean;
};

export type PTORequest = {
  id: string;
  employeeId: string;
  start: string;
  end: string;
  minutes: number;
  type: 'VACATION' | 'SICK' | 'PERSONAL' | 'UNPAID';
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  notes?: string;
};

export type ExceptionItemKind =
  | 'MISSING_OUT'
  | 'SHORT_MEAL'
  | 'GEO_VIOLATION'
  | 'UNTRUSTED_DEVICE'
  | 'OVERTIME_THRESHOLD'
  | 'POLICY';

export type ExceptionSeverity = 'INFO' | 'WARN' | 'CRITICAL';

export type ExceptionItem = {
  id: string;
  employeeId: string;
  date: string;
  kind: ExceptionItemKind;
  severity: ExceptionSeverity;
  relatedPunchIds?: string[];
  message: string;
  resolved?: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
};

export type OfflineStatus = 'queued' | 'synced' | 'error';

export type OfflineEvent<TPayload> = {
  id: string;
  payload: TPayload;
  status: OfflineStatus;
  queuedAt: string;
  signature: string;
  lastError?: string;
  retries?: number;
};

export type OfflineQueueSnapshot<TPayload> = {
  key: string;
  events: OfflineEvent<TPayload>[];
};

export type OfflineQueueListener<TPayload> = (
  snapshot: OfflineQueueSnapshot<TPayload>
) => void;

export type TimeClockNavItem = {
  label: string;
  path: string;
  icon?: ReactNode;
  shortcut?: string;
};

export type PunchComposer = {
  employee: Employee;
  punchType: PunchType;
  jobCode?: string;
  costCenter?: string;
  notes?: string;
  selfieUrl?: string;
  livenessPassed?: boolean;
  geo?: Geo;
};

export type ClockState = {
  employees: Employee[];
  selectedEmployee?: Employee;
  activePunch?: Punch;
  punches: Punch[];
  policy?: Policy;
  isOffline: boolean;
  offlineQueue: OfflineQueueSnapshot<Punch>;
};

export type ApprovalDecision = 'APPROVE' | 'REJECT' | 'REQUEST_CHANGES';

export type ApprovalItem = {
  id: string;
  employeeId: string;
  periodStart: string;
  periodEnd: string;
  entries: TimesheetEntry[];
  pendingSince: string;
};

export type DeviceTelemetry = {
  uptimeHours: number;
  lastSync: string;
  mode: 'KIOSK' | 'BROWSER';
};

export type TimeClockFilters = {
  search?: string;
  employeeId?: string;
  status?: 'CLOCKED_IN' | 'CLOCKED_OUT' | 'ON_BREAK';
};

export type PunchPayload = Punch & { offline?: { queuedAt: string; signature: string } };
