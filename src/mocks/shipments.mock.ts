import type { ShipmentItem, ShipmentFilterState } from '../types/shipments';

export const DEMO_SHIPMENT_ITEMS: ShipmentItem[] = [
  {
    id: 'shp-1001',
    awb: 'DEMO-9840192',
    orderId: 'ORD-10842',
    customerName: 'Rahul Sharma',
    customerPhone: '+91 98765 43210',
    courierId: 'bluedart',
    courierName: 'BlueDart Express',
    shipmentType: 'b2c',
    paymentMode: 'cod',
    amount: 1299,
    destination: 'Mumbai, MH',
    status: 'delivered',
    statusText: 'Delivered',
    createdAt: '2026-08-20 10:30 AM',
    packageWeight: '1.2 kg',
    itemCount: 2,
  },
  {
    id: 'shp-1002',
    awb: 'DEMO-9840193',
    orderId: 'ORD-10843',
    customerName: 'Priya Patel',
    customerPhone: '+91 98123 45678',
    courierId: 'fedex',
    courierName: 'FedEx Priority',
    shipmentType: 'b2c',
    paymentMode: 'prepaid',
    amount: 2450,
    destination: 'Bengaluru, KA',
    status: 'in_transit',
    statusText: 'In Transit',
    createdAt: '2026-08-20 11:15 AM',
    packageWeight: '0.8 kg',
    itemCount: 1,
  },
  {
    id: 'shp-1003',
    awb: 'DEMO-9840194',
    orderId: 'ORD-10844',
    customerName: 'Aman Verma',
    customerPhone: '+91 99887 76655',
    courierId: 'dhl',
    courierName: 'DHL Express',
    shipmentType: 'b2b',
    paymentMode: 'prepaid',
    amount: 18500,
    destination: 'Delhi, DL',
    status: 'ndr',
    statusText: 'NDR Action Needed',
    createdAt: '2026-08-19 04:45 PM',
    packageWeight: '12.5 kg',
    itemCount: 10,
  },
  {
    id: 'shp-1004',
    awb: 'DEMO-9840195',
    orderId: 'ORD-10845',
    customerName: 'Suresh Kumar',
    customerPhone: '+91 97111 22334',
    courierId: 'delhivery',
    courierName: 'Delhivery Surface',
    shipmentType: 'b2c',
    paymentMode: 'cod',
    amount: 850,
    destination: 'Hyderabad, TS',
    status: 'out_for_delivery',
    statusText: 'Out for Delivery',
    createdAt: '2026-08-19 09:20 AM',
    packageWeight: '1.5 kg',
    itemCount: 3,
  },
  {
    id: 'shp-1005',
    awb: 'DEMO-9840196',
    orderId: 'ORD-10846',
    customerName: 'Ananya Roy',
    customerPhone: '+91 96543 21098',
    courierId: 'shadowfax',
    courierName: 'Shadowfax Express',
    shipmentType: 'b2c',
    paymentMode: 'cod',
    amount: 1450,
    destination: 'Kolkata, WB',
    status: 'rto',
    statusText: 'RTO Initiated',
    createdAt: '2026-08-18 02:10 PM',
    packageWeight: '0.5 kg',
    itemCount: 1,
  },
  {
    id: 'shp-1006',
    awb: 'DEMO-9840197',
    orderId: 'ORD-10847',
    customerName: 'Vikram Singh',
    customerPhone: '+91 95432 10987',
    courierId: 'bluedart',
    courierName: 'BlueDart Express',
    shipmentType: 'b2b',
    paymentMode: 'prepaid',
    amount: 34200,
    destination: 'Ahmedabad, GJ',
    status: 'booked',
    statusText: 'Booked',
    createdAt: '2026-08-20 01:00 PM',
    packageWeight: '45.0 kg',
    itemCount: 25,
  },
  {
    id: 'shp-1007',
    awb: 'DEMO-9840198',
    orderId: 'ORD-10848',
    customerName: 'Kavita Reddy',
    customerPhone: '+91 94321 09876',
    courierId: 'fedex',
    courierName: 'FedEx Priority',
    shipmentType: 'b2c',
    paymentMode: 'prepaid',
    amount: 1890,
    destination: 'Chennai, TN',
    status: 'ready_to_ship',
    statusText: 'Ready to Ship',
    createdAt: '2026-08-20 02:30 PM',
    packageWeight: '2.0 kg',
    itemCount: 2,
  },
  {
    id: 'shp-1008',
    awb: 'DEMO-9840199',
    orderId: 'ORD-10849',
    customerName: 'Deepak Joshi',
    customerPhone: '+91 93210 98765',
    courierId: 'delhivery',
    courierName: 'Delhivery Surface',
    shipmentType: 'b2c',
    paymentMode: 'cod',
    amount: 990,
    destination: 'Pune, MH',
    status: 'picked_up',
    statusText: 'Picked Up',
    createdAt: '2026-08-19 06:15 PM',
    packageWeight: '1.0 kg',
    itemCount: 1,
  },
  {
    id: 'shp-1009',
    awb: 'DEMO-9840200',
    orderId: 'ORD-10850',
    customerName: 'Neha Gupta',
    customerPhone: '+91 92109 87654',
    courierId: 'bluedart',
    courierName: 'BlueDart Express',
    shipmentType: 'b2c',
    paymentMode: 'prepaid',
    amount: 3100,
    destination: 'Jaipur, RJ',
    status: 'delivered',
    statusText: 'Delivered',
    createdAt: '2026-08-17 11:00 AM',
    packageWeight: '1.8 kg',
    itemCount: 4,
  },
  {
    id: 'shp-1010',
    awb: 'DEMO-9840201',
    orderId: 'ORD-10851',
    customerName: 'Rajesh Nair',
    customerPhone: '+91 91098 76543',
    courierId: 'dhl',
    courierName: 'DHL Express',
    shipmentType: 'b2b',
    paymentMode: 'prepaid',
    amount: 12500,
    destination: 'Kochi, KL',
    status: 'cancelled',
    statusText: 'Cancelled',
    createdAt: '2026-08-16 03:20 PM',
    packageWeight: '8.0 kg',
    itemCount: 5,
  },
];

export const filterDemoShipments = (
  items: ShipmentItem[],
  filters: ShipmentFilterState
): ShipmentItem[] => {
  return items.filter((item) => {
    // 1. Status Filter
    if (filters.status !== 'all' && item.status !== filters.status) {
      return false;
    }

    // 2. Search Query Filter (AWB, Order ID, Customer Name)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchAwb = item.awb.toLowerCase().includes(q);
      const matchOrder = item.orderId.toLowerCase().includes(q);
      const matchCustomer = item.customerName.toLowerCase().includes(q);
      if (!matchAwb && !matchOrder && !matchCustomer) {
        return false;
      }
    }

    // 3. Courier Filter
    if (filters.courier !== 'all' && item.courierId !== filters.courier) {
      return false;
    }

    // 4. Payment Mode Filter
    if (filters.paymentMode !== 'all' && item.paymentMode !== filters.paymentMode) {
      return false;
    }

    // 5. Shipment Type Filter
    if (filters.shipmentType !== 'all' && item.shipmentType !== filters.shipmentType) {
      return false;
    }

    return true;
  });
};
