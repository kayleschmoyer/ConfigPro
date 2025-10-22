import { useMemo } from 'react';
import { formatDate } from '../lib/format';
import type { OrderRef } from '../lib';
import { usePortal } from './usePortal';

export const useOrders = () => {
  const { snapshot } = usePortal();
  const orders = snapshot.orders;

  const timeline = useMemo(
    () =>
      orders.map(order => ({
        ...order,
        formattedDate: formatDate(order.date),
        statusTone: order.status.toLowerCase().includes('complete') ? 'success' : 'info'
      })),
    [orders]
  );

  const nextOrder = useMemo<OrderRef | undefined>(
    () => orders.find(order => order.status.toLowerCase().includes('progress')),
    [orders]
  );

  return { orders, timeline, nextOrder };
};
