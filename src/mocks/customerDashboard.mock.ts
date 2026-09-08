import type {
  DashboardKpiMetrics,
  ShipmentTrendPoint,
  ShipmentStatusDistribution,
  RecentShipment,
} from '../types/customerDashboard';

export const DEMO_MERCHANT_PROFILE = {
  companyName: 'Apex Retail Store',
  userName: 'Alex Mercer',
  userRole: 'Merchant Administrator',
  tenantId: 'tnt-demo-apex-01',
};

export const DEMO_KPI_METRICS: DashboardKpiMetrics = {
  totalShipments: 12840,
  inTransit: 3410,
  delivered: 8920,
  ndrActionNeeded: 340,
  rtoReturned: 170,
  codPendingRemittance: 14250,
};

export const DEMO_TREND_MAP: Record<string, ShipmentTrendPoint[]> = {
  '7d': [
    { day: 'Mon', count: 1420 },
    { day: 'Tue', count: 1850 },
    { day: 'Wed', count: 2100 },
    { day: 'Thu', count: 1940 },
    { day: 'Fri', count: 2450 },
    { day: 'Sat', count: 1680 },
    { day: 'Sun', count: 1400 },
  ],
  '30d': [
    { day: 'Week 1', count: 9800 },
    { day: 'Week 2', count: 12400 },
    { day: 'Week 3', count: 11200 },
    { day: 'Week 4', count: 14800 },
  ],
  '90d': [
    { day: 'Jun', count: 38000 },
    { day: 'Jul', count: 42500 },
    { day: 'Aug', count: 48200 },
  ],
};

export const DEMO_STATUS_DISTRIBUTION: ShipmentStatusDistribution[] = [
  { status: 'booked', label: 'Booked', count: 820, percentage: 6.4, variant: 'neutral' },
  { status: 'picked_up', label: 'Picked Up', count: 1120, percentage: 8.7, variant: 'info' },
  { status: 'in_transit', label: 'In Transit', count: 3410, percentage: 26.6, variant: 'info' },
  { status: 'out_for_delivery', label: 'Out for Delivery', count: 1560, percentage: 12.1, variant: 'brand' },
  { status: 'delivered', label: 'Delivered', count: 8920, percentage: 69.5, variant: 'success' },
  { status: 'ndr', label: 'NDR Exception', count: 340, percentage: 2.6, variant: 'warning' },
  { status: 'rto', label: 'RTO Returned', count: 170, percentage: 1.3, variant: 'danger' },
];

export const DEMO_RECENT_SHIPMENTS: RecentShipment[] = [
  {
    awb: 'AWB-9840192',
    orderId: 'ORD-10842',
    courier: 'BlueDart Express',
    status: 'success',
    statusText: 'Delivered',
    destination: 'Mumbai, MH',
    date: '2026-08-20',
    amount: '₹425.00',
  },
  {
    awb: 'AWB-9840193',
    orderId: 'ORD-10843',
    courier: 'FedEx Priority',
    status: 'info',
    statusText: 'In Transit',
    destination: 'Bengaluru, KA',
    date: '2026-08-20',
    amount: '₹680.00',
  },
  {
    awb: 'AWB-9840194',
    orderId: 'ORD-10844',
    courier: 'DHL Express',
    status: 'warning',
    statusText: 'NDR Action Needed',
    destination: 'Delhi, DL',
    date: '2026-08-19',
    amount: '₹1,100.00',
  },
  {
    awb: 'AWB-9840195',
    orderId: 'ORD-10845',
    courier: 'Delhivery Surface',
    status: 'info',
    statusText: 'In Transit',
    destination: 'Hyderabad, TS',
    date: '2026-08-19',
    amount: '₹352.00',
  },
  {
    awb: 'AWB-9840196',
    orderId: 'ORD-10846',
    courier: 'Shadowfax Express',
    status: 'danger',
    statusText: 'RTO Initiated',
    destination: 'Kolkata, WB',
    date: '2026-08-18',
    amount: '₹290.00',
  },
];

export const fetchDashboardMetrics = async (): Promise<DashboardKpiMetrics> => {
  return new Promise((resolve) => setTimeout(() => resolve(DEMO_KPI_METRICS), 400));
};

export const fetchRecentShipments = async (): Promise<RecentShipment[]> => {
  return new Promise((resolve) => setTimeout(() => resolve(DEMO_RECENT_SHIPMENTS), 400));
};
