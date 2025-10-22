import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { punchQueue } from '../lib/offlineQueue';
import type {
  ClockState,
  Employee,
  Punch,
  PunchComposer,
  Policy,
  OfflineQueueSnapshot,
} from '../lib/types';
import { resolveShiftMilestones } from '../lib/policy';

const basePolicy: Policy = {
  id: 'us-flsa',
  name: 'US FLSA + CA Meal',
  overtime: {
    dailyOTAfterMin: 8 * 60,
    dailyDTAfterMin: 12 * 60,
    weeklyOTAfterMin: 40 * 60,
  },
  rounding: { mode: 'NEAREST', incrementMin: 6 },
  grace: { inMin: 5, outMin: 5, breakMin: 5 },
  breaks: { mealRequired: true, mealMin: 30, secondMealAfterMin: 10 * 60, paidBreakMin: 10 },
  geofence: {
    center: { lat: 37.7749, lng: -122.4194 },
    radiusMeters: 200,
    allowedSSIDs: ['ConfigPro-5G'],
  },
  antiBuddy: { selfieRequired: true, livenessRandom: true, rotatingQR: true },
  permissions: { employeeEditOwn: true, managerEditTeam: true },
};

type ClockAction =
  | { type: 'SET_EMPLOYEES'; payload: Employee[] }
  | { type: 'SELECT_EMPLOYEE'; payload?: Employee }
  | { type: 'SET_POLICY'; payload: Policy }
  | { type: 'ADD_PUNCH'; payload: Punch }
  | { type: 'SET_OFFLINE'; payload: boolean }
  | { type: 'SET_OFFLINE_QUEUE'; payload: OfflineQueueSnapshot<Punch> }
  | { type: 'RESET_SHIFT'; payload: { employeeId: string } };

const initialState: ClockState = {
  employees: [],
  punches: [],
  isOffline: false,
  offlineQueue: { key: punchQueue.key, events: [] },
};

const reducer = (state: ClockState, action: ClockAction): ClockState => {
  switch (action.type) {
    case 'SET_EMPLOYEES':
      return { ...state, employees: action.payload };
    case 'SELECT_EMPLOYEE':
      return { ...state, selectedEmployee: action.payload };
    case 'SET_POLICY':
      return { ...state, policy: action.payload };
    case 'ADD_PUNCH': {
      const punches = [action.payload, ...state.punches].slice(0, 500);
      const activePunch = action.payload.type === 'OUT' ? undefined : action.payload;
      return { ...state, punches, activePunch };
    }
    case 'SET_OFFLINE':
      return { ...state, isOffline: action.payload };
    case 'SET_OFFLINE_QUEUE':
      return { ...state, offlineQueue: action.payload };
    case 'RESET_SHIFT': {
      const punches = state.punches.filter((punch) => punch.employeeId !== action.payload.employeeId);
      return { ...state, punches, activePunch: undefined };
    }
    default:
      return state;
  }
};

const employeesSeed: Employee[] = [
  {
    id: 'EMP-1000',
    displayName: 'Jordan Rivers',
    email: 'jordan.rivers@example.com',
    role: 'EMP',
    pinEnabled: true,
    defaultJobCode: 'FRONT_DESK',
    photoUrl: 'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?w=128&h=128&fit=crop',
  },
  {
    id: 'EMP-1001',
    displayName: 'Avery Sloan',
    role: 'LEAD',
    email: 'avery.sloan@example.com',
    pinEnabled: true,
    defaultJobCode: 'FLOOR',
    photoUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=128&h=128&fit=crop',
  },
  {
    id: 'EMP-1002',
    displayName: 'Kai Mendoza',
    role: 'MANAGER',
    email: 'kai.mendoza@example.com',
    pinEnabled: false,
    defaultJobCode: 'MGMT',
    photoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=128&h=128&fit=crop',
  },
];

const simulateLatency = async () => new Promise((resolve) => setTimeout(resolve, 120));

const composePunch = (composer: PunchComposer): Punch => ({
  id: `${composer.employee.id}-${Date.now()}`,
  employeeId: composer.employee.id,
  type: composer.punchType,
  timestamp: new Date().toISOString(),
  jobCode: composer.jobCode ?? composer.employee.defaultJobCode,
  costCenter: composer.costCenter,
  selfieUrl: composer.selfieUrl,
  livenessPassed: composer.livenessPassed,
  geo: composer.geo,
  notes: composer.notes,
  device: { id: 'DEVICE-1', name: 'Front Office Kiosk', trusted: true, ssid: 'ConfigPro-5G' },
});

const resolveNavigatorStatus = () => (typeof navigator !== 'undefined' ? navigator.onLine : true);

export const useClock = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pinBuffer, setPinBuffer] = useState('');

  useEffect(() => {
    dispatch({ type: 'SET_EMPLOYEES', payload: employeesSeed });
    dispatch({ type: 'SET_POLICY', payload: basePolicy });
    dispatch({ type: 'SET_OFFLINE', payload: !resolveNavigatorStatus() });
  }, []);

  useEffect(() => {
    const unsubscribe = punchQueue.subscribe((snapshot) => {
      dispatch({ type: 'SET_OFFLINE_QUEUE', payload: snapshot });
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_OFFLINE', payload: false });
    const handleOffline = () => dispatch({ type: 'SET_OFFLINE', payload: true });
    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
    return undefined;
  }, []);

  const selectEmployee = useCallback((employeeId?: string) => {
    if (!employeeId) {
      dispatch({ type: 'SELECT_EMPLOYEE', payload: undefined });
      return;
    }
    const employee = state.employees.find((item) => item.id === employeeId);
    dispatch({ type: 'SELECT_EMPLOYEE', payload: employee });
  }, [state.employees]);

  const syncPunch = useCallback(
    async (punch: Punch) => {
      if (state.isOffline) {
        punchQueue.enqueue({ ...punch, offline: { queuedAt: new Date().toISOString(), signature: 'offline' } });
        return;
      }
      setIsSyncing(true);
      try {
        await simulateLatency();
        dispatch({ type: 'ADD_PUNCH', payload: punch });
      } finally {
        setIsSyncing(false);
      }
    },
    [state.isOffline]
  );

  const queuePunch = useCallback((punch: Punch) => {
    punchQueue.enqueue(punch);
    dispatch({ type: 'ADD_PUNCH', payload: punch });
  }, []);

  const submitPunch = useCallback(
    async (composer: PunchComposer) => {
      if (!composer.employee) return;
      const punch = composePunch(composer);
      if (state.isOffline) {
        queuePunch({ ...punch, offline: { queuedAt: new Date().toISOString(), signature: 'offline' } });
        return punch;
      }
      await syncPunch(punch);
      return punch;
    },
    [queuePunch, state.isOffline, syncPunch]
  );

  const flushOffline = useCallback(async () => {
    if (state.offlineQueue.events.length === 0) return;
    setIsSyncing(true);
    await punchQueue.flush(async (event) => {
      await simulateLatency();
      dispatch({ type: 'ADD_PUNCH', payload: event.payload });
      punchQueue.remove(event.id);
    });
    setIsSyncing(false);
  }, [state.offlineQueue.events.length]);

  const status = useMemo(() => {
    if (!state.selectedEmployee) return 'CLOCKED_OUT';
    if (!state.activePunch) return 'CLOCKED_OUT';
    if (state.activePunch.type === 'BREAK_START') return 'ON_BREAK';
    return 'CLOCKED_IN';
  }, [state.activePunch, state.selectedEmployee]);

  const currentShift = useMemo(() => {
    if (!state.selectedEmployee) return undefined;
    const entry = state.punches.find((punch) => punch.employeeId === state.selectedEmployee?.id);
    if (!entry || !state.policy) return undefined;
    return resolveShiftMilestones(
      {
        id: entry.id,
        employeeId: entry.employeeId,
        start: entry.timestamp,
        minutesWorked: 0,
        regularMinutes: 0,
        otMinutes: 0,
        dtMinutes: 0,
        breakMinutes: 0,
        audit: [],
      },
      state.policy
    );
  }, [state.punches, state.policy, state.selectedEmployee]);

  return {
    state,
    status,
    currentShift,
    selectEmployee,
    submitPunch,
    queuePunch,
    flushOffline,
    isSyncing,
    pinBuffer,
    setPinBuffer,
  };
};
