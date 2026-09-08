import type {
  PickupRequest,
  WarehouseInfo,
  PickupFilterState,
  CreatePickupInput,
  CreatePickupResponse,
} from '../types/pickups';

export const DEMO_WAREHOUSES: WarehouseInfo[] = [
  {
    id: 'wh-001',
    name: 'Gurugram Main Logistics Hub',
    addressLine1: 'Plot 42, Logistics Park, Sector 18',
    city: 'Gurugram',
    state: 'Haryana',
    pincode: '122015',
    contactPerson: 'Main Warehouse Dispatch',
    phone: '+91 98111 22233',
  },
  {
    id: 'wh-002',
    name: 'Mumbai Central Fulfillment Center',
    addressLine1: 'Bldg A3, Bhiwandi Warehousing Zone',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '421302',
    contactPerson: 'Ramesh Desai',
    phone: '+91 98222 33344',
  },
  {
    id: 'wh-003',
    name: 'Bengaluru South Cargo Terminal',
    addressLine1: 'Gate 4, Peenya Industrial Area',
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '560058',
    contactPerson: 'Karthik Raja',
    phone: '+91 98333 44455',
  },
];

export const DEMO_PICKUP_REQUESTS: PickupRequest[] = [
  {
    id: 'pu-101',
    pickupNumber: 'PU-DEMO-001',
    pickupReference: 'DEMO-PICKUP-849201',
    warehouseId: 'wh-001',
    warehouseName: 'Gurugram Main Logistics Hub',
    warehouseAddress: 'Plot 42, Logistics Park, Sector 18, Gurugram, HR',
    courierId: 'bluedart',
    courierName: 'BlueDart Express',
    shipmentIds: ['DEMO-9840192', 'DEMO-9840197'],
    shipmentCount: 2,
    totalWeightKg: 46.2,
    pickupDate: '2026-08-22',
    timeSlot: '10:00 AM – 02:00 PM',
    contactPerson: 'Main Warehouse Dispatch',
    contactPhone: '+91 98111 22233',
    status: 'SCHEDULED',
    statusText: 'Scheduled',
    createdAt: '2026-08-20 09:15 AM',
    events: [
      {
        id: 'evt-1',
        pickupId: 'pu-101',
        status: 'SCHEDULED',
        title: 'Pickup Scheduled',
        description: 'BlueDart vehicle assigned for warehouse dispatch slot.',
        timestamp: '20 Aug 2026, 09:30 AM',
      },
      {
        id: 'evt-2',
        pickupId: 'pu-101',
        status: 'REQUESTED',
        title: 'Pickup Requested',
        description: 'Pickup manifest generated for 2 ready shipments.',
        timestamp: '20 Aug 2026, 09:15 AM',
      },
    ],
  },
  {
    id: 'pu-102',
    pickupNumber: 'PU-DEMO-002',
    pickupReference: 'DEMO-PICKUP-849202',
    warehouseId: 'wh-002',
    warehouseName: 'Mumbai Central Fulfillment Center',
    warehouseAddress: 'Bldg A3, Bhiwandi Warehousing Zone, Mumbai, MH',
    courierId: 'delhivery',
    courierName: 'Delhivery Surface',
    shipmentIds: ['DEMO-9840193', 'DEMO-9840198'],
    shipmentCount: 2,
    totalWeightKg: 2.8,
    pickupDate: '2026-08-22',
    timeSlot: '02:00 PM – 06:00 PM',
    contactPerson: 'Ramesh Desai',
    contactPhone: '+91 98222 33344',
    status: 'REQUESTED',
    statusText: 'Requested',
    createdAt: '2026-08-20 10:45 AM',
    events: [
      {
        id: 'evt-1',
        pickupId: 'pu-102',
        status: 'REQUESTED',
        title: 'Pickup Requested',
        description: 'Pickup request logged; awaiting courier slot confirmation.',
        timestamp: '20 Aug 2026, 10:45 AM',
      },
    ],
  },
  {
    id: 'pu-103',
    pickupNumber: 'PU-DEMO-003',
    pickupReference: 'DEMO-PICKUP-849203',
    warehouseId: 'wh-003',
    warehouseName: 'Bengaluru South Cargo Terminal',
    warehouseAddress: 'Gate 4, Peenya Industrial Area, Bengaluru, KA',
    courierId: 'delhivery',
    courierName: 'Delhivery Surface',
    shipmentIds: ['DEMO-9840195', 'DEMO-9840199'],
    shipmentCount: 2,
    totalWeightKg: 2.5,
    pickupDate: '2026-08-19',
    timeSlot: '10:00 AM – 02:00 PM',
    contactPerson: 'Karthik Raja',
    contactPhone: '+91 98333 44455',
    status: 'PICKED_UP',
    statusText: 'Picked Up',
    createdAt: '2026-08-19 08:30 AM',
    events: [
      {
        id: 'evt-1',
        pickupId: 'pu-103',
        status: 'PICKED_UP',
        title: 'Picked Up',
        description: 'Courier agent collected 2 parcels from warehouse.',
        timestamp: '19 Aug 2026, 11:30 AM',
      },
    ],
  },
];

// In-Memory Pickups Store
const PICKUP_STORE: Map<string, PickupRequest> = new Map();
DEMO_PICKUP_REQUESTS.forEach((p) => PICKUP_STORE.set(p.pickupNumber, p));

export const filterDemoPickups = (
  items: PickupRequest[],
  filters: PickupFilterState
): PickupRequest[] => {
  const storeItems = Array.from(PICKUP_STORE.values());
  const source = storeItems.length > 0 ? storeItems : items;

  return source.filter((item) => {
    // 1. Status Filter
    if (filters.status !== 'all') {
      const matchStatus = String(item.status).toLowerCase() === filters.status.toLowerCase();
      if (!matchStatus) return false;
    }

    // 2. Search Query (Pickup ID, Warehouse, Courier)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      const matchId = item.pickupNumber.toLowerCase().includes(q) || item.pickupReference.toLowerCase().includes(q);
      const matchWh = item.warehouseName.toLowerCase().includes(q);
      const matchCourier = item.courierName.toLowerCase().includes(q);
      if (!matchId && !matchWh && !matchCourier) {
        return false;
      }
    }

    // 3. Warehouse Filter
    if (filters.warehouse !== 'all' && item.warehouseId !== filters.warehouse) {
      return false;
    }

    // 4. Courier Filter
    if (filters.courier !== 'all' && item.courierId !== filters.courier) {
      return false;
    }

    return true;
  });
};

export const getPickupDetail = async (pickupId: string): Promise<PickupRequest | null> => {
  const match = PICKUP_STORE.get(pickupId) || DEMO_PICKUP_REQUESTS.find((p) => p.pickupNumber === pickupId || p.id === pickupId);
  return Promise.resolve(match || DEMO_PICKUP_REQUESTS[0]);
};

/**
 * Demo Pickup Provider Architecture
 */
export const demoPickupProvider = {
  getPickups: (): PickupRequest[] => {
    return Array.from(PICKUP_STORE.values());
  },

  getPickupByShipmentId: (shipmentId: string): PickupRequest | null => {
    for (const p of PICKUP_STORE.values()) {
      if (p.shipmentIds.includes(shipmentId)) {
        return p;
      }
    }
    return null;
  },

  createPickupRequest: async (input: CreatePickupInput): Promise<CreatePickupResponse> => {
    const {
      warehouseId,
      shipmentIds,
      courierId,
      pickupDate,
      pickupSlot,
      contactPerson,
      contactPhone,
    } = input;

    // Check duplicate active pickup for shipments
    for (const p of PICKUP_STORE.values()) {
      if (p.status !== 'CANCELLED' && p.status !== 'FAILED') {
        const overlap = shipmentIds.some((sId) => p.shipmentIds.includes(sId));
        if (overlap) {
          return {
            success: false,
            pickupReference: '',
            status: 'FAILED',
            pickupDate,
            pickupSlot,
            failureReason: 'One or more selected shipments already have an active pickup request.',
          };
        }
      }
    }

    const warehouse = DEMO_WAREHOUSES.find((w) => w.id === warehouseId) || DEMO_WAREHOUSES[0];
    const randNum = Math.floor(100000 + Math.random() * 900000);
    const pickupNumber = `PU-DEMO-${randNum}`;
    const pickupReference = `DEMO-PICKUP-${randNum}`;
    const nowStr = new Date().toLocaleString();

    const newPickup: PickupRequest = {
      id: `pu-${Date.now()}`,
      pickupNumber,
      pickupReference,
      warehouseId: warehouse.id,
      warehouseName: warehouse.name,
      warehouseAddress: `${warehouse.addressLine1}, ${warehouse.city}, ${warehouse.state} - ${warehouse.pincode}`,
      courierId,
      courierName: courierId === 'bluedart' ? 'BlueDart Express' : courierId === 'delhivery' ? 'Delhivery Surface' : 'Shadowfax Cargo',
      shipmentIds,
      shipmentCount: shipmentIds.length,
      totalWeightKg: Number((shipmentIds.length * 1.5).toFixed(1)),
      pickupDate,
      timeSlot: pickupSlot,
      contactPerson: contactPerson || warehouse.contactPerson,
      contactPhone: contactPhone || warehouse.phone,
      status: 'SCHEDULED',
      statusText: 'Scheduled',
      createdAt: nowStr,
      events: [
        {
          id: `evt-${Date.now()}-1`,
          pickupId: pickupNumber,
          status: 'REQUESTED',
          title: 'Pickup Requested',
          description: `Pickup request created for ${shipmentIds.length} parcels at ${warehouse.name}`,
          timestamp: nowStr,
        },
        {
          id: `evt-${Date.now()}-2`,
          pickupId: pickupNumber,
          status: 'SCHEDULED',
          title: 'Pickup Scheduled',
          description: `Vehicle scheduled for slot ${pickupSlot} on ${pickupDate}`,
          timestamp: nowStr,
        },
      ],
    };

    PICKUP_STORE.set(pickupNumber, newPickup);

    return {
      success: true,
      pickupReference,
      status: 'SCHEDULED',
      pickupDate,
      pickupSlot,
      pickup: newPickup,
    };
  },

  reschedulePickup: (pickupId: string, newDate: string, newSlot: string): { success: boolean; message: string; pickup: PickupRequest | null } => {
    const pickup = PICKUP_STORE.get(pickupId) || Array.from(PICKUP_STORE.values()).find((p) => p.id === pickupId);
    if (!pickup) return { success: false, message: 'Pickup request not found.', pickup: null };

    if (pickup.status === 'PICKED_UP' || pickup.status === 'CANCELLED') {
      return { success: false, message: `Cannot reschedule pickup in ${pickup.status} state.`, pickup };
    }

    pickup.pickupDate = newDate;
    pickup.timeSlot = newSlot;
    pickup.status = 'SCHEDULED';
    pickup.statusText = 'Rescheduled';
    pickup.updatedAt = new Date().toISOString();

    const nowStr = new Date().toLocaleString();
    pickup.events.unshift({
      id: `evt-${Date.now()}`,
      pickupId: pickup.pickupNumber,
      status: 'SCHEDULED',
      title: 'Pickup Rescheduled',
      description: `Rescheduled to ${newDate} (${newSlot})`,
      timestamp: nowStr,
    });

    PICKUP_STORE.set(pickup.pickupNumber, pickup);
    return { success: true, message: 'Pickup rescheduled successfully.', pickup };
  },

  cancelPickup: (pickupId: string): { success: boolean; message: string; pickup: PickupRequest | null } => {
    const pickup = PICKUP_STORE.get(pickupId) || Array.from(PICKUP_STORE.values()).find((p) => p.id === pickupId);
    if (!pickup) return { success: false, message: 'Pickup request not found.', pickup: null };

    if (pickup.status === 'PICKED_UP') {
      return { success: false, message: 'Cannot cancel an already picked-up shipment.', pickup };
    }

    if (pickup.status === 'CANCELLED') {
      return { success: false, message: 'Pickup request is already cancelled.', pickup };
    }

    pickup.status = 'CANCELLED';
    pickup.statusText = 'Cancelled';
    pickup.updatedAt = new Date().toISOString();

    const nowStr = new Date().toLocaleString();
    pickup.events.unshift({
      id: `evt-${Date.now()}`,
      pickupId: pickup.pickupNumber,
      status: 'CANCELLED',
      title: 'Pickup Cancelled',
      description: 'Pickup request cancelled by merchant',
      timestamp: nowStr,
    });

    PICKUP_STORE.set(pickup.pickupNumber, pickup);
    return { success: true, message: 'Pickup request cancelled successfully.', pickup };
  },
};
