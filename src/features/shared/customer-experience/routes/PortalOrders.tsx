import { OrderTimeline } from '../components/OrderTimeline';
import { useOrders } from '../hooks/useOrders';

export const PortalOrders = () => {
  const { timeline } = useOrders();

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-2xl font-semibold text-foreground">Orders & work orders</h2>
        <p className="text-sm text-muted">Track project progress, technician assignments, and milestones.</p>
      </header>
      <OrderTimeline orders={timeline} emptyLabel="No work orders yet" />
    </div>
  );
};

export default PortalOrders;
