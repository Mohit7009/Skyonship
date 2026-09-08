import { WalletService } from '../mocks/wallet.mock';
import type { WalletTransaction } from '../types/wallet';

export type InternalShipmentStatus =
  | 'DRAFT'
  | 'BOOKING_CONFIRMED'
  | 'PENDING_API'
  | 'API_PROCESSING'
  | 'API_FAILED'
  | 'AWB_ASSIGNED'
  | 'PICKUP_REQUESTED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'NDR'
  | 'RTO_INITIATED'
  | 'RTO_IN_TRANSIT'
  | 'RTO_DELIVERED'
  | 'CANCELLED'
  | 'CANCEL_REQUESTED';

export interface ShipmentStatusHistoryItem extends Record<string, unknown> {
  id: string;
  shipmentId: string;
  oldStatus: InternalShipmentStatus;
  newStatus: InternalShipmentStatus;
  source: 'SYSTEM' | 'ADMIN' | 'COURIER_API' | 'WEBHOOK';
  timestamp: string;
  userOrAdmin: string;
  reason: string;
  providerEventId?: string;
}

export interface TrackingEvent extends Record<string, unknown> {
  statusKey: string;
  statusTitle: string;
  location: string;
  timestamp: string;
  description: string;
  completed: boolean;
}

export interface MultiPackageDetail {
  id: string;
  packageNumber: number;
  packageType?: string;
  actualWeightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  volumetricWeightKg: number;
  chargeableWeightKg: number;
  quantity: number;
  packageContents?: string;
}

export interface CustomerShipmentDetail extends Record<string, unknown> {
  id: string;
  shipmentId: string;
  tenantId: string;
  orderId: string;
  awbNumber: string | null;
  bookingDate: string;
  courierId: string;
  courierName: string;
  serviceName: string;
  mode: 'B2C' | 'B2B';
  pickupContact: string;
  pickupPhone: string;
  pickupAddress: string;
  pickupCity: string;
  pickupPincode: string;
  deliveryContact: string;
  deliveryPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryPincode: string;
  actualWeightKg: number;
  chargeableWeightKg: number;
  dimensionsCm: string;
  invoiceValueINR: number;
  invoiceNumber?: string;
  invoiceDate?: string;
  insuranceEnabled?: boolean;
  insuredValueINR?: number;
  packageType?: string;
  packages?: MultiPackageDetail[];
  paymentMode: 'PREPAID' | 'COD';
  codAmountINR?: number;
  baseFreightINR: number;
  fuelSurchargeINR: number;
  codFeeINR: number;
  totalCustomerChargeINR: number;
  courierCostINR?: number;
  grossMarginINR?: number;
  transactionId?: string;
  bookingStatus: InternalShipmentStatus;
  customerFacingStatus: string;
  trackingStatus: string;
  trackingTimeline: TrackingEvent[];
  statusHistory: ShipmentStatusHistoryItem[];
  labelUrl?: string;
}

export const INITIAL_CUSTOMER_SHIPMENTS: CustomerShipmentDetail[] = [
  {
    id: 'shp-101',
    shipmentId: 'SHP-ORD-2026-9041',
    tenantId: 'tenant-demo-01',
    orderId: 'ORD-2026-9041',
    awbNumber: 'DEL847192031',
    bookingDate: '2026-08-20 16:35 PM',
    courierId: 'delhivery',
    courierName: 'Delhivery Surface',
    serviceName: 'Express Surface Cargo',
    mode: 'B2C',
    pickupContact: 'Rajesh Sharma',
    pickupPhone: '+91 98765 00000',
    pickupAddress: 'Plot 42, Industrial Area Phase 1',
    pickupCity: 'New Delhi',
    pickupPincode: '110001',
    deliveryContact: 'Ankit Mehta',
    deliveryPhone: '+91 98123 45678',
    deliveryAddress: 'Block C, MG Road',
    deliveryCity: 'Bengaluru',
    deliveryPincode: '560038',
    actualWeightKg: 1.2,
    chargeableWeightKg: 1.5,
    dimensionsCm: '20 × 15 × 10 CM',
    invoiceValueINR: 2500,
    paymentMode: 'PREPAID',
    codAmountINR: 0,
    baseFreightINR: 68.0,
    fuelSurchargeINR: 17.0,
    codFeeINR: 0,
    totalCustomerChargeINR: 85.0,
    courierCostINR: 62.0,
    grossMarginINR: 23.0,
    transactionId: 'tx-102',
    bookingStatus: 'BOOKING_CONFIRMED',
    customerFacingStatus: 'Booking Confirmed',
    trackingStatus: 'PENDING_API',
    trackingTimeline: [
      { statusKey: 'BOOKING_CONFIRMED', statusTitle: 'Booking Confirmed', location: 'New Delhi Hub', timestamp: '2026-08-20 04:35 PM', description: 'Internal booking created & wallet debited.', completed: true },
    ],
    statusHistory: [
      {
        id: 'hist-101',
        shipmentId: 'SHP-ORD-2026-9041',
        oldStatus: 'DRAFT',
        newStatus: 'BOOKING_CONFIRMED',
        source: 'SYSTEM',
        timestamp: '2026-08-20 16:35 PM',
        userOrAdmin: 'Merchant User',
        reason: 'Order submitted via booking wizard',
      },
    ],
  },
  {
    id: 'shp-102',
    shipmentId: 'SHP-ORD-2026-8812',
    tenantId: 'tenant-demo-01',
    orderId: 'ORD-2026-8812',
    awbNumber: 'BD749102834',
    bookingDate: '2026-08-19 11:20 AM',
    courierId: 'bluedart',
    courierName: 'Blue Dart Air',
    serviceName: 'Express Air Priority',
    mode: 'B2C',
    pickupContact: 'Rajesh Sharma',
    pickupPhone: '+91 98765 00000',
    pickupAddress: 'Plot 42, Industrial Area Phase 1',
    pickupCity: 'New Delhi',
    pickupPincode: '110001',
    deliveryContact: 'Pooja Verma',
    deliveryPhone: '+91 97654 32109',
    deliveryAddress: 'Flat 402, Sunset Heights',
    deliveryCity: 'Mumbai',
    deliveryPincode: '400001',
    actualWeightKg: 0.8,
    chargeableWeightKg: 1.0,
    dimensionsCm: '15 × 10 × 8 CM',
    invoiceValueINR: 4200,
    paymentMode: 'COD',
    codAmountINR: 4200,
    baseFreightINR: 100.0,
    fuelSurchargeINR: 20.0,
    codFeeINR: 20.0,
    totalCustomerChargeINR: 140.0,
    courierCostINR: 105.0,
    grossMarginINR: 35.0,
    transactionId: 'tx-101',
    bookingStatus: 'IN_TRANSIT',
    customerFacingStatus: 'In Transit',
    trackingStatus: 'IN_TRANSIT',
    trackingTimeline: [
      { statusKey: 'BOOKING_CONFIRMED', statusTitle: 'Booking Confirmed', location: 'New Delhi Hub', timestamp: '2026-08-19 11:20 AM', description: 'Internal booking created.', completed: true },
      { statusKey: 'PICKED_UP', statusTitle: 'Picked Up', location: 'New Delhi Air Hub', timestamp: '2026-08-19 03:30 PM', description: 'Air cargo linehaul scan.', completed: true },
      { statusKey: 'IN_TRANSIT', statusTitle: 'In Transit', location: 'Mumbai Terminal', timestamp: '2026-08-20 08:15 AM', description: 'Arrived at Mumbai hub.', completed: true },
    ],
    statusHistory: [
      {
        id: 'hist-201',
        shipmentId: 'SHP-ORD-2026-8812',
        oldStatus: 'BOOKING_CONFIRMED',
        newStatus: 'IN_TRANSIT',
        source: 'COURIER_API',
        timestamp: '2026-08-20 08:15 AM',
        userOrAdmin: 'Blue Dart Integration API',
        reason: 'Status scan update via webhook',
      },
    ],
  },
  {
    id: 'shp-103',
    shipmentId: 'SHP-AWB-9840192',
    tenantId: 'tenant-demo-01',
    orderId: 'ORD-10842',
    awbNumber: 'AWB-9840192',
    bookingDate: '2026-08-20 10:30 AM',
    courierId: 'bluedart',
    courierName: 'BlueDart Express',
    serviceName: 'Surface Express Cargo',
    mode: 'B2C',
    pickupContact: 'Rajesh Kumar',
    pickupPhone: '+91 98765 43210',
    pickupAddress: 'Plot 42, Connaught Place',
    pickupCity: 'New Delhi',
    pickupPincode: '110001',
    deliveryContact: 'Rahul Sharma',
    deliveryPhone: '+91 98112 34567',
    deliveryAddress: 'Flat 402, Sunshine Apartments',
    deliveryCity: 'Mumbai',
    deliveryPincode: '400001',
    actualWeightKg: 1.2,
    chargeableWeightKg: 1.5,
    dimensionsCm: '20 × 15 × 10 CM',
    invoiceValueINR: 1299,
    paymentMode: 'PREPAID',
    codAmountINR: 0,
    baseFreightINR: 350.0,
    fuelSurchargeINR: 75.0,
    codFeeINR: 0,
    totalCustomerChargeINR: 425.0,
    bookingStatus: 'DELIVERED',
    customerFacingStatus: 'Delivered',
    trackingStatus: 'DELIVERED',
    trackingTimeline: [],
    statusHistory: [],
  },
  {
    id: 'shp-104',
    shipmentId: 'SHP-AWB-9840193',
    tenantId: 'tenant-demo-01',
    orderId: 'ORD-10843',
    awbNumber: 'AWB-9840193',
    bookingDate: '2026-08-20 11:15 AM',
    courierId: 'fedex',
    courierName: 'FedEx Priority',
    serviceName: 'Express Air Priority',
    mode: 'B2C',
    pickupContact: 'Rajesh Kumar',
    pickupPhone: '+91 98765 43210',
    pickupAddress: 'Plot 42, Connaught Place',
    pickupCity: 'New Delhi',
    pickupPincode: '110001',
    deliveryContact: 'Rahul Sharma',
    deliveryPhone: '+91 98112 34567',
    deliveryAddress: 'Block B, Indiranagar',
    deliveryCity: 'Bengaluru',
    deliveryPincode: '560038',
    actualWeightKg: 0.8,
    chargeableWeightKg: 1.0,
    dimensionsCm: '15 × 10 × 8 CM',
    invoiceValueINR: 2450,
    paymentMode: 'PREPAID',
    codAmountINR: 0,
    baseFreightINR: 580.0,
    fuelSurchargeINR: 100.0,
    codFeeINR: 0,
    totalCustomerChargeINR: 680.0,
    bookingStatus: 'IN_TRANSIT',
    customerFacingStatus: 'In Transit',
    trackingStatus: 'IN_TRANSIT',
    trackingTimeline: [],
    statusHistory: [],
  },
  {
    id: 'shp-105',
    shipmentId: 'SHP-AWB-9840194',
    tenantId: 'tenant-demo-01',
    orderId: 'ORD-10844',
    awbNumber: 'AWB-9840194',
    bookingDate: '2026-08-19 04:45 PM',
    courierId: 'dhl',
    courierName: 'DHL Express',
    serviceName: 'Express Cargo',
    mode: 'B2B',
    pickupContact: 'Rajesh Kumar',
    pickupPhone: '+91 98765 43210',
    pickupAddress: 'Plot 42, Connaught Place',
    pickupCity: 'New Delhi',
    pickupPincode: '110001',
    deliveryContact: 'Rahul Sharma',
    deliveryPhone: '+91 98112 34567',
    deliveryAddress: 'Sector 15, Connaught Place',
    deliveryCity: 'Delhi',
    deliveryPincode: '110001',
    actualWeightKg: 12.5,
    chargeableWeightKg: 15.0,
    dimensionsCm: '50 × 40 × 30 CM',
    invoiceValueINR: 18500,
    paymentMode: 'PREPAID',
    codAmountINR: 0,
    baseFreightINR: 950.0,
    fuelSurchargeINR: 150.0,
    codFeeINR: 0,
    totalCustomerChargeINR: 1100.0,
    bookingStatus: 'NDR',
    customerFacingStatus: 'NDR Action Needed',
    trackingStatus: 'NDR',
    trackingTimeline: [],
    statusHistory: [],
  },
];

let SHIPMENT_STORE = [...INITIAL_CUSTOMER_SHIPMENTS];
const PROCESSED_EVENT_HASHES = new Set<string>();

// Valid Transition Matrix Map
const ALLOWED_TRANSITIONS: Record<InternalShipmentStatus, InternalShipmentStatus[]> = {
  DRAFT: ['BOOKING_CONFIRMED', 'CANCELLED'],
  BOOKING_CONFIRMED: ['PENDING_API', 'CANCELLED'],
  PENDING_API: ['API_PROCESSING', 'API_FAILED', 'CANCELLED'],
  API_PROCESSING: ['AWB_ASSIGNED', 'API_FAILED', 'CANCELLED'],
  API_FAILED: ['PENDING_API', 'CANCELLED'],
  AWB_ASSIGNED: ['PICKUP_REQUESTED', 'CANCELLED'],
  PICKUP_REQUESTED: ['PICKED_UP', 'CANCEL_REQUESTED', 'CANCELLED'],
  PICKED_UP: ['IN_TRANSIT', 'CANCEL_REQUESTED'],
  IN_TRANSIT: ['OUT_FOR_DELIVERY', 'NDR'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'NDR'],
  DELIVERED: [],
  NDR: ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'RTO_INITIATED'],
  RTO_INITIATED: ['RTO_IN_TRANSIT'],
  RTO_IN_TRANSIT: ['RTO_DELIVERED'],
  RTO_DELIVERED: [],
  CANCELLED: [],
  CANCEL_REQUESTED: ['CANCELLED', 'IN_TRANSIT'],
};

export const CustomerShipmentService = {
  // Map Internal Status to Simplified Customer-Facing Label
  getCustomerFacingStatus: (status: InternalShipmentStatus): string => {
    switch (status) {
      case 'DRAFT':
      case 'BOOKING_CONFIRMED':
        return 'Booking Confirmed';
      case 'PENDING_API':
      case 'API_PROCESSING':
      case 'API_FAILED':
        return 'AWB Pending';
      case 'AWB_ASSIGNED':
      case 'PICKUP_REQUESTED':
        return 'Pickup Requested';
      case 'PICKED_UP':
        return 'Picked Up';
      case 'IN_TRANSIT':
        return 'In Transit';
      case 'OUT_FOR_DELIVERY':
        return 'Out for Delivery';
      case 'DELIVERED':
        return 'Delivered';
      case 'NDR':
        return 'NDR';
      case 'RTO_INITIATED':
      case 'RTO_IN_TRANSIT':
      case 'RTO_DELIVERED':
        return 'RTO';
      case 'CANCELLED':
      case 'CANCEL_REQUESTED':
        return 'Cancelled';
      default:
        return 'In Transit';
    }
  },

  // Validate Controlled Transition Matrix
  validateStatusTransition: (
    currentStatus: InternalShipmentStatus,
    targetStatus: InternalShipmentStatus
  ): { valid: boolean; reason?: string } => {
    if (currentStatus === targetStatus) return { valid: true };
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (allowed.includes(targetStatus)) return { valid: true };
    return {
      valid: false,
      reason: `Invalid status transition from '${currentStatus}' to '${targetStatus}'.`,
    };
  },

  getShipments: (tenantId?: string, searchQuery = '', statusFilter = 'all'): CustomerShipmentDetail[] => {
    return CustomerShipmentService.queryShipments({
      tenantId,
      searchQuery,
      statusFilter,
    });
  },

  queryShipments: (params: {
    tenantId?: string;
    searchQuery?: string;
    dateRange?: 'all' | 'today' | 'yesterday' | 'last7' | 'last30';
    statusFilter?: string;
    typeFilter?: 'all' | 'B2B' | 'B2C';
    paymentModeFilter?: 'all' | 'PREPAID' | 'COD';
    courierFilter?: string;
  }): CustomerShipmentDetail[] => {
    const {
      tenantId = 'tenant-demo-01',
      searchQuery = '',
      statusFilter = 'all',
      typeFilter = 'all',
      paymentModeFilter = 'all',
      courierFilter = 'all',
    } = params;

    return SHIPMENT_STORE.filter((s) => {
      if (tenantId && tenantId !== 'all' && s.tenantId !== tenantId) return false;

      // Status Filter
      if (statusFilter !== 'all') {
        const st = s.bookingStatus as string;
        if (statusFilter === 'BOOKED' && st !== 'BOOKING_CONFIRMED' && st !== 'BOOKED' && st !== 'AWB_ASSIGNED') return false;
        else if (statusFilter === 'IN_TRANSIT' && st !== 'IN_TRANSIT' && st !== 'PICKED_UP' && st !== 'OUT_FOR_DELIVERY' && st !== 'PICKUP_REQUESTED') return false;
        else if (statusFilter === 'DELIVERED' && st !== 'DELIVERED') return false;
        else if (statusFilter === 'NDR' && st !== 'NDR') return false;
        else if (statusFilter === 'RTO' && !st.startsWith('RTO')) return false;
        else if (statusFilter === 'CANCELLED' && st !== 'CANCELLED') return false;
        else if (statusFilter !== 'BOOKED' && statusFilter !== 'IN_TRANSIT' && statusFilter !== 'DELIVERED' && statusFilter !== 'NDR' && statusFilter !== 'RTO' && statusFilter !== 'CANCELLED' && st !== statusFilter) return false;
      }

      // Type Filter
      if (typeFilter !== 'all' && s.mode !== typeFilter) return false;

      // Payment Mode Filter
      if (paymentModeFilter !== 'all' && s.paymentMode !== paymentModeFilter) return false;

      // Courier Filter
      if (courierFilter !== 'all' && s.courierId.toLowerCase() !== courierFilter.toLowerCase()) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = s.shipmentId.toLowerCase().includes(q);
        const matchAwb = s.awbNumber ? s.awbNumber.toLowerCase().includes(q) : false;
        const matchOrder = s.orderId.toLowerCase().includes(q);
        const matchRecipient = s.deliveryContact.toLowerCase().includes(q);
        const matchPhone = s.deliveryPhone.toLowerCase().includes(q);
        const matchPin = s.deliveryPincode.toLowerCase().includes(q);
        if (!matchId && !matchAwb && !matchOrder && !matchRecipient && !matchPhone && !matchPin) return false;
      }

      return true;
    });
  },

  getShipmentSummaryStats: (tenantId = 'tenant-demo-01') => {
    const list = SHIPMENT_STORE.filter((s) => s.tenantId === tenantId);
    let booked = 0;
    let inTransit = 0;
    let delivered = 0;
    let ndr = 0;
    let rto = 0;

    list.forEach((s) => {
      const st = s.bookingStatus as string;
      if (st === 'BOOKING_CONFIRMED' || st === 'BOOKED' || st === 'AWB_ASSIGNED') booked++;
      else if (st === 'IN_TRANSIT' || st === 'PICKED_UP' || st === 'OUT_FOR_DELIVERY' || st === 'PICKUP_REQUESTED') inTransit++;
      else if (st === 'DELIVERED') delivered++;
      else if (st === 'NDR') ndr++;
      else if (st.startsWith('RTO')) rto++;
    });

    return {
      total: list.length,
      booked,
      inTransit,
      delivered,
      ndr,
      rto,
    };
  },

  getShipmentById: (shipmentId: string, tenantId?: string): CustomerShipmentDetail | null => {
    return (
      SHIPMENT_STORE.find(
        (s) => (!tenantId || tenantId === 'all' || s.tenantId === tenantId) &&
          (s.shipmentId === shipmentId || s.awbNumber === shipmentId || s.id === shipmentId)
      ) || null
    );
  },

  // Admin Manual Status Update Engine
  updateStatus: (
    shipmentId: string,
    newStatus: InternalShipmentStatus,
    reason: string,
    source: 'SYSTEM' | 'ADMIN' | 'COURIER_API' | 'WEBHOOK' = 'ADMIN',
    userOrAdmin = 'Super Admin',
    providerEventId?: string
  ): { success: boolean; message: string; shipment?: CustomerShipmentDetail } => {
    const shipment = CustomerShipmentService.getShipmentById(shipmentId);
    if (!shipment) return { success: false, message: 'Shipment not found.' };

    // Duplicate event check
    if (providerEventId) {
      const eventHash = `${shipmentId}_${providerEventId}_${newStatus}`;
      if (PROCESSED_EVENT_HASHES.has(eventHash)) {
        return { success: true, message: 'Duplicate status update event ignored safely.', shipment };
      }
      PROCESSED_EVENT_HASHES.add(eventHash);
    }

    // Validate transition
    const val = CustomerShipmentService.validateStatusTransition(shipment.bookingStatus, newStatus);
    if (!val.valid && source !== 'ADMIN') {
      return { success: false, message: val.reason || 'Invalid status transition.' };
    }

    const oldStatus = shipment.bookingStatus;
    shipment.bookingStatus = newStatus;
    shipment.customerFacingStatus = CustomerShipmentService.getCustomerFacingStatus(newStatus);
    shipment.trackingStatus = newStatus;

    // Append to Audit History Log
    const historyItem: ShipmentStatusHistoryItem = {
      id: `hist-${Date.now()}`,
      shipmentId: shipment.shipmentId,
      oldStatus,
      newStatus,
      source,
      timestamp: new Date().toLocaleString(),
      userOrAdmin,
      reason,
      providerEventId,
    };
    shipment.statusHistory.unshift(historyItem);

    // Append to Tracking Timeline
    shipment.trackingTimeline.push({
      statusKey: newStatus,
      statusTitle: CustomerShipmentService.getCustomerFacingStatus(newStatus),
      location: 'Operational Hub',
      timestamp: new Date().toLocaleString(),
      description: reason,
      completed: true,
    });

    return { success: true, message: `Status updated from ${oldStatus} to ${newStatus}.`, shipment };
  },

  cancelShipment: (
    shipmentId: string,
    reason = 'Merchant requested cancellation',
    tenantId = 'tenant-demo-01'
  ): { success: boolean; message: string; refundTx?: WalletTransaction | null; refundedAmountINR?: number } => {
    const shipment = CustomerShipmentService.getShipmentById(shipmentId, tenantId);
    if (!shipment) {
      return { success: false, message: 'Shipment record not found.' };
    }

    // Check if cancellation is allowed before pickup
    const cancellableStatuses: InternalShipmentStatus[] = ['BOOKING_CONFIRMED', 'PENDING_API', 'API_FAILED', 'AWB_ASSIGNED', 'PICKUP_REQUESTED'];
    if (!cancellableStatuses.includes(shipment.bookingStatus)) {
      return {
        success: false,
        message: `Cancellation is not available at this stage. Shipment is currently in '${shipment.customerFacingStatus}' status.`,
      };
    }

    // Update Status & History
    CustomerShipmentService.updateStatus(shipmentId, 'CANCELLED', `Cancelled by merchant: ${reason}`, 'SYSTEM', 'Merchant User');

    // Perform Wallet Refund
    const refundAmountINR = shipment.totalCustomerChargeINR;
    const targetTxId = shipment.transactionId || `tx-${shipment.shipmentId}`;
    const refundRes = WalletService.refund(targetTxId, refundAmountINR, reason);

    return {
      success: true,
      message: `Shipment ${shipment.shipmentId} cancelled successfully. ₹${refundAmountINR.toFixed(2)} refunded to your merchant wallet.`,
      refundedAmountINR: refundAmountINR,
      refundTx: refundRes.transaction,
    };
  },

  // Save new shipment record dynamically to store
  addShipmentRecord: (shipment: CustomerShipmentDetail): CustomerShipmentDetail => {
    SHIPMENT_STORE.unshift(shipment);
    return shipment;
  },
};
