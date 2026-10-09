import type { CustomerOrder, OrderFilterState } from '../types/orders';

export const DEMO_ORDER_ITEMS: CustomerOrder[] = [];

export const filterDemoOrders = (
  items: CustomerOrder[],
  filters: OrderFilterState
): CustomerOrder[] => {
  return items.filter((item) => {
    if (filters.status !== 'all' && item.orderStatus !== filters.status && item.shipmentStatus !== filters.status) {
      return false;
    }

    if (filters.paymentMode !== 'all' && item.paymentMode !== filters.paymentMode) {
      return false;
    }

    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchNum = item.orderNumber.toLowerCase().includes(q);
      const matchCust = item.customerName.toLowerCase().includes(q);
      const matchPhone = item.customerPhone.includes(q);
      if (!matchNum && !matchCust && !matchPhone) return false;
    }

    return true;
  });
};
