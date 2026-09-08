import type { CustomerOrder, OrderFilterState } from '../types/orders';

export const DEMO_ORDER_ITEMS: CustomerOrder[] = [
  {
    id: 'ord-10001',
    orderNumber: 'ORD-10001',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98765 43210',
    customerEmail: 'rahul.sharma@example.com',
    companyName: 'Apex Retail Store',
    items: [
      { id: 'itm-1', name: 'Cotton Crew T-Shirt', sku: 'TSH-BLK-M', quantity: 2, unitPrice: 500, subtotal: 1000 },
      { id: 'itm-2', name: 'Denim Jeans Blue', sku: 'JNS-BLU-32', quantity: 1, unitPrice: 1499, subtotal: 1499 },
    ],
    totalItemCount: 3,
    orderValue: 2499,
    paymentMode: 'cod',
    orderStatus: 'confirmed',
    orderStatusText: 'Confirmed',
    shipmentStatus: 'ready_to_ship',
    shipmentStatusText: 'Ready to Ship',
    createdAt: '2026-08-20 09:30 AM',
    shippingAddress: { addressLine1: 'Flat 402, Sunshine Heights', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
  },
  {
    id: 'ord-10002',
    orderNumber: 'ORD-10002',
    customerName: 'Priya Patel',
    customerPhone: '+91 98123 45678',
    customerEmail: 'priya.patel@example.com',
    items: [
      { id: 'itm-3', name: 'Wireless Bluetooth Earbuds', sku: 'AUDIO-EAR-W', quantity: 1, unitPrice: 3490, subtotal: 3490 },
    ],
    totalItemCount: 1,
    orderValue: 3490,
    paymentMode: 'prepaid',
    orderStatus: 'shipped',
    orderStatusText: 'Shipped',
    shipmentStatus: 'in_transit',
    shipmentStatusText: 'In Transit',
    createdAt: '2026-08-20 10:15 AM',
    shippingAddress: { addressLine1: '12th Cross, Indiranagar', city: 'Bengaluru', state: 'Karnataka', pincode: '560038' },
  },
  {
    id: 'ord-10003',
    orderNumber: 'ORD-10003',
    customerName: 'Aman Verma',
    customerPhone: '+91 99887 76655',
    customerEmail: 'aman.verma@example.com',
    companyName: 'TechCorp Solutions',
    items: [
      { id: 'itm-4', name: 'Ergonomic Desk Chair', sku: 'FUR-CHR-ERG', quantity: 5, unitPrice: 8500, subtotal: 42500 },
    ],
    totalItemCount: 5,
    orderValue: 42500,
    paymentMode: 'prepaid',
    orderStatus: 'processing',
    orderStatusText: 'Processing',
    shipmentStatus: 'unshipped',
    shipmentStatusText: 'Unshipped',
    createdAt: '2026-08-19 03:45 PM',
    shippingAddress: { addressLine1: 'Cyber City Tower B', city: 'Gurugram', state: 'Haryana', pincode: '122002' },
  },
  {
    id: 'ord-10004',
    orderNumber: 'ORD-10004',
    customerName: 'Suresh Kumar',
    customerPhone: '+91 97111 22334',
    customerEmail: 'suresh.k@example.com',
    items: [
      { id: 'itm-5', name: 'Smartwatch Fitness Tracker', sku: 'WAT-FIT-BLK', quantity: 1, unitPrice: 1999, subtotal: 1999 },
    ],
    totalItemCount: 1,
    orderValue: 1999,
    paymentMode: 'cod',
    orderStatus: 'delivered',
    orderStatusText: 'Delivered',
    shipmentStatus: 'delivered',
    shipmentStatusText: 'Delivered',
    createdAt: '2026-08-18 11:20 AM',
    shippingAddress: { addressLine1: 'Banjara Hills Road 12', city: 'Hyderabad', state: 'Telangana', pincode: '500034' },
  },
  {
    id: 'ord-10005',
    orderNumber: 'ORD-10005',
    customerName: 'Ananya Roy',
    customerPhone: '+91 96543 21098',
    customerEmail: 'ananya.roy@example.com',
    items: [
      { id: 'itm-6', name: 'Ceramic Coffee Mug Set', sku: 'KIT-MUG-WHT', quantity: 2, unitPrice: 450, subtotal: 900 },
    ],
    totalItemCount: 2,
    orderValue: 900,
    paymentMode: 'cod',
    orderStatus: 'cancelled',
    orderStatusText: 'Cancelled',
    shipmentStatus: 'cancelled',
    shipmentStatusText: 'Cancelled',
    createdAt: '2026-08-18 01:10 PM',
    shippingAddress: { addressLine1: 'Park Street 45A', city: 'Kolkata', state: 'West Bengal', pincode: '700016' },
  },
  {
    id: 'ord-10006',
    orderNumber: 'ORD-10006',
    customerName: 'Vikram Singh',
    customerPhone: '+91 95432 10987',
    customerEmail: 'vikram.singh@example.com',
    companyName: 'Vikas Logistics',
    items: [
      { id: 'itm-7', name: 'Industrial Safety Gloves Pack', sku: 'SAF-GLV-100', quantity: 20, unitPrice: 850, subtotal: 17000 },
    ],
    totalItemCount: 20,
    orderValue: 17000,
    paymentMode: 'prepaid',
    orderStatus: 'new',
    orderStatusText: 'New',
    shipmentStatus: 'unshipped',
    shipmentStatusText: 'Unshipped',
    createdAt: '2026-08-20 01:00 PM',
    shippingAddress: { addressLine1: 'GIDC Industrial Estate Phase 2', city: 'Ahmedabad', state: 'Gujarat', pincode: '382445' },
  },
];

export const filterDemoOrders = (
  items: CustomerOrder[],
  filters: OrderFilterState
): CustomerOrder[] => {
  return items.filter((item) => {
    // 1. Order Status Filter
    if (filters.orderStatus !== 'all' && item.orderStatus !== filters.orderStatus) {
      return false;
    }

    // 2. Search Query (Order ID, Customer Name, Phone, Email)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchId = item.orderNumber.toLowerCase().includes(q);
      const matchName = item.customerName.toLowerCase().includes(q);
      const matchPhone = item.customerPhone.toLowerCase().includes(q);
      const matchEmail = item.customerEmail.toLowerCase().includes(q);
      if (!matchId && !matchName && !matchPhone && !matchEmail) {
        return false;
      }
    }

    // 3. Payment Mode Filter
    if (filters.paymentMode !== 'all' && item.paymentMode !== filters.paymentMode) {
      return false;
    }

    // 4. Shipment Status Filter
    if (filters.shipmentStatus !== 'all' && item.shipmentStatus !== filters.shipmentStatus) {
      return false;
    }

    return true;
  });
};
