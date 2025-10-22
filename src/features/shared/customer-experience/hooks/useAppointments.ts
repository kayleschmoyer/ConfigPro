import { useCallback, useMemo, useState } from 'react';
import { formatDateTime } from '../lib/format';
import type { Appointment } from '../lib/types';
import { usePortal } from './usePortal';

export const useAppointments = () => {
  const { snapshot } = usePortal();
  const [optimistic, setOptimistic] = useState<Appointment[]>(snapshot.appointments);

  const appointments = useMemo(() => optimistic, [optimistic]);

  const reschedule = useCallback((appointmentId: string, startsAt: string, endsAt: string) => {
    setOptimistic(current =>
      current.map(appointment =>
        appointment.id === appointmentId
          ? { ...appointment, startsAt, endsAt, status: 'BOOKED' }
          : appointment
      )
    );
  }, []);

  const cancel = useCallback((appointmentId: string) => {
    setOptimistic(current =>
      current.map(appointment =>
        appointment.id === appointmentId ? { ...appointment, status: 'CANCELLED' } : appointment
      )
    );
  }, []);

  const formatAppointment = useCallback(
    (appointment: Appointment) => ({
      ...appointment,
      window: `${formatDateTime(appointment.startsAt)} – ${formatDateTime(appointment.endsAt)}`
    }),
    []
  );

  const formatted = useMemo(() => appointments.map(formatAppointment), [appointments, formatAppointment]);
  const nextAppointment = formatted[0];

  return { appointments: formatted, nextAppointment, reschedule, cancel };
};
