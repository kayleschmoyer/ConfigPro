import { AppointmentBooker } from '../components/AppointmentBooker';
import { useAppointments } from '../hooks/useAppointments';

export const PortalAppointments = () => {
  const { appointments, reschedule, cancel } = useAppointments();

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-foreground">Appointments</h2>
        <p className="text-sm text-muted">Book, reschedule, or cancel with built-in capacity guardrails.</p>
      </header>
      <AppointmentBooker appointments={appointments} onReschedule={reschedule} onCancel={cancel} />
    </div>
  );
};

export default PortalAppointments;
