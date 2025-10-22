import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Select } from '@/shared/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/Tabs';
import { useClockContext } from '../hooks/ClockProvider';
import { PinKeypad } from '../components/PinKeypad';
import { ClockStatusCard } from '../components/ClockStatusCard';
import { GeoGuard } from '../components/GeoGuard';
import { SelfieCapture } from '../components/SelfieCapture';
import { formatDateTime } from '../lib/format';
import type { PunchType } from '../lib/types';

const authModes = [
  { label: 'PIN Keypad', value: 'PIN' },
  { label: 'Employee ID', value: 'ID' },
  { label: 'QR Badge', value: 'QR' },
  { label: 'SSO', value: 'SSO' },
];

type AuthMode = (typeof authModes)[number]['value'];

export const Clock = () => {
  const {
    state,
    status,
    currentShift,
    selectEmployee,
    submitPunch,
    flushOffline,
    isSyncing,
    pinBuffer,
    setPinBuffer,
  } = useClockContext();
  const [authMode, setAuthMode] = useState<AuthMode>('PIN');
  const [jobCode, setJobCode] = useState('');
  const [notes, setNotes] = useState('');
  const [selfie, setSelfie] = useState<string | undefined>();
  const [livenessPassed, setLivenessPassed] = useState(false);

  useEffect(() => {
    if (state.selectedEmployee?.defaultJobCode) {
      setJobCode(state.selectedEmployee.defaultJobCode);
    }
  }, [state.selectedEmployee?.defaultJobCode]);

  const nextAction = useMemo(() => {
    switch (status) {
      case 'CLOCKED_OUT':
        return { label: 'Clock In', type: 'IN' as PunchType };
      case 'ON_BREAK':
        return { label: 'End Break', type: 'BREAK_END' as PunchType };
      default:
        return { label: 'Clock Out', type: 'OUT' as PunchType };
    }
  }, [status]);

  const secondaryAction = useMemo(() => {
    if (status === 'CLOCKED_IN') {
      return { label: 'Start Break', type: 'BREAK_START' as PunchType };
    }
    if (status === 'CLOCKED_OUT') {
      return { label: 'Switch Job', type: 'JOB_SWITCH' as PunchType };
    }
    return undefined;
  }, [status]);

  const handlePunch = async (type: PunchType) => {
    if (!state.selectedEmployee) return;
    await submitPunch({
      employee: state.selectedEmployee,
      punchType: type,
      jobCode,
      notes,
      selfieUrl: selfie,
      livenessPassed,
    });
    setNotes('');
    setSelfie(undefined);
    setLivenessPassed(false);
    setPinBuffer('');
  };

  return (
    <div className="grid gap-8 p-6 lg:grid-cols-[420px_1fr] lg:p-10">
      <div className="space-y-6">
        <ClockStatusCard
          status={status}
          employee={state.selectedEmployee}
          activePunch={state.activePunch}
          currentShift={currentShift}
          offlineQueue={state.offlineQueue}
          onViewTimesheet={() => selectEmployee(state.selectedEmployee?.id)}
        />

        <motion.section
          layout
          className="space-y-4 rounded-3xl border border-white/5 bg-surface/80 p-6 shadow-xl shadow-black/30"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Authenticate</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {authMode} mode
            </span>
          </div>
          <Tabs value={authMode} onValueChange={(value) => setAuthMode(value as AuthMode)}>
            <TabsList>
              {authModes.map((mode) => (
                <TabsTrigger key={mode.value} value={mode.value}>
                  {mode.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="PIN" className="pt-4">
              <PinKeypad value={pinBuffer} onChange={setPinBuffer} onSubmit={() => handlePunch(nextAction.type)} />
            </TabsContent>
            <TabsContent value="ID" className="pt-4">
              <Input label="Employee ID" value={state.selectedEmployee?.id ?? ''} readOnly />
              <Input label="Password" type="password" placeholder="Enter password" />
            </TabsContent>
            <TabsContent value="QR" className="pt-4 text-sm text-muted-foreground">
              <p>Scan the rotating site QR with your badge or ConfigPro mobile app.</p>
              <Button variant="outline" size="sm" className="mt-3">
                Launch QR scanner
              </Button>
            </TabsContent>
            <TabsContent value="SSO" className="pt-4 text-sm text-muted-foreground">
              <Button size="sm">Continue with SSO</Button>
            </TabsContent>
          </Tabs>
        </motion.section>

        <motion.section
          layout
          className="space-y-4 rounded-3xl border border-white/5 bg-surface/80 p-6 shadow-xl shadow-black/30"
        >
          <h2 className="text-lg font-semibold text-white">Punch details</h2>
          <Select
            label="Employee"
            value={state.selectedEmployee?.id ?? ''}
            onChange={(event) => selectEmployee(event.target.value)}
          >
            <option value="">Select employee</option>
            {state.employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.displayName}
              </option>
            ))}
          </Select>
          <Input
            label="Job code"
            value={jobCode}
            onChange={(event) => setJobCode(event.target.value)}
            placeholder="Assign job or cost center"
          />
          <Input
            label="Notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optional notes for audit trail"
          />
          {state.policy?.antiBuddy?.selfieRequired && (
            <SelfieCapture
              employee={state.selectedEmployee}
              requireLiveness={state.policy?.antiBuddy?.livenessRandom}
              onCapture={(dataUrl, passed) => {
                setSelfie(dataUrl);
                setLivenessPassed(passed);
              }}
            />
          )}
          <GeoGuard
            geo={state.activePunch?.geo}
            device={state.activePunch?.device}
            policy={state.policy}
            onRequestException={() => console.info('Exception requested')}
          />
        </motion.section>
      </div>

      <div className="space-y-6">
        <motion.section
          layout
          className="space-y-4 rounded-3xl border border-white/5 bg-surface/80 p-6 shadow-xl shadow-black/30"
        >
          <h2 className="text-lg font-semibold text-white">Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" onClick={() => handlePunch(nextAction.type)} disabled={!state.selectedEmployee || isSyncing}>
              {isSyncing ? 'Processing…' : nextAction.label}
            </Button>
            {secondaryAction && (
              <Button
                size="lg"
                variant="outline"
                onClick={() => handlePunch(secondaryAction.type)}
                disabled={!state.selectedEmployee}
              >
                {secondaryAction.label}
              </Button>
            )}
            {state.offlineQueue.events.length > 0 && (
              <Button variant="ghost" size="lg" onClick={flushOffline}>
                Sync offline punches
              </Button>
            )}
          </div>
          <div className="rounded-2xl border border-white/5 bg-background/40 p-4 text-sm text-muted-foreground">
            <p className="font-semibold text-white">Audit trail</p>
            <ul className="mt-3 space-y-2">
              {state.punches.slice(0, 5).map((punch) => (
                <li key={punch.id} className="flex justify-between text-xs text-muted-foreground">
                  <span>{punch.type.replace('_', ' ')}</span>
                  <span>{formatDateTime(punch.timestamp)}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.section>
      </div>
    </div>
  );
};
