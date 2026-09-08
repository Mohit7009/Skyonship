export interface PickupWarehouseSnapshot extends Record<string, unknown> {
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  pincode: string;
  city: string;
  state: string;
  pickupStartTime?: string;
  pickupEndTime?: string;
  frozenAt: string;
}

export interface CustomerWarehouse extends Record<string, unknown> {
  id: string;
  tenantId: string;
  warehouseCode: string; // e.g. MUM-WH-01 (unique, immutable code)
  warehouseName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  pincode: string;
  city: string;
  state: string;
  country: string;
  pickupStartTime: string; // e.g. "10:00 AM"
  pickupEndTime: string;   // e.g. "06:00 PM"
  isDefault: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  totalShipmentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerWarehouseInput extends Record<string, unknown> {
  tenantId: string;
  warehouseName: string;
  contactPerson: string;
  phone: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  pincode: string;
  city: string;
  state: string;
  country?: string;
  pickupStartTime?: string;
  pickupEndTime?: string;
  isDefault?: boolean;
}

// Initial Demo Multi-Warehouse Locations (Delhi, Mumbai, Bangalore)
export const INITIAL_CUSTOMER_WAREHOUSES: CustomerWarehouse[] = [
  {
    id: 'wh-01',
    tenantId: 'tenant-demo-01',
    warehouseCode: 'DEL-WH-01',
    warehouseName: 'Delhi Connaught Primary Warehouse',
    contactPerson: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'delhi.wh@acmestore.com',
    addressLine1: 'Plot 42, Block B, Connaught Place',
    addressLine2: 'Near Central Park Ring Road',
    pincode: '110001',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    pickupStartTime: '10:00 AM',
    pickupEndTime: '06:00 PM',
    isDefault: true, // Delhi is Default
    status: 'ACTIVE',
    totalShipmentsCount: 420,
    createdAt: '2026-08-01 10:00 AM',
    updatedAt: '2026-08-01 10:00 AM',
  },
  {
    id: 'wh-02',
    tenantId: 'tenant-demo-01',
    warehouseCode: 'MUM-WH-01',
    warehouseName: 'Mumbai Lower Parel Fulfillment Center',
    contactPerson: 'Rahul Sharma',
    phone: '+91 98112 99887',
    email: 'mumbai.wh@acmestore.com',
    addressLine1: 'Unit 102, Gala Industrial Estate, Lower Parel',
    addressLine2: 'Opposite Railway Station West',
    pincode: '400001',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pickupStartTime: '09:30 AM',
    pickupEndTime: '07:00 PM',
    isDefault: false,
    status: 'ACTIVE',
    totalShipmentsCount: 310,
    createdAt: '2026-08-10 14:30 PM',
    updatedAt: '2026-08-10 14:30 PM',
  },
  {
    id: 'wh-03',
    tenantId: 'tenant-demo-01',
    warehouseCode: 'BLR-WH-01',
    warehouseName: 'Bangalore Electronic City Warehouse',
    contactPerson: 'Venkatesh Rao',
    phone: '+91 99001 12233',
    email: 'blr.wh@acmestore.com',
    addressLine1: 'Plot 88, Phase 2, Electronic City Tech Zone',
    pincode: '560001',
    city: 'Bangalore',
    state: 'Karnataka',
    country: 'India',
    pickupStartTime: '10:00 AM',
    pickupEndTime: '05:30 PM',
    isDefault: false,
    status: 'ACTIVE',
    totalShipmentsCount: 150,
    createdAt: '2026-08-15 11:00 AM',
    updatedAt: '2026-08-15 11:00 AM',
  },
];

let WAREHOUSE_STORE = [...INITIAL_CUSTOMER_WAREHOUSES];

// Pincode Lookup Auto-population Service
export function lookupPincodeDetails(pincode: string): { city: string; state: string; zone: string } {
  const clean = pincode.trim();

  if (clean.startsWith('11') || clean === '110001' || clean === '110020') {
    return { city: 'New Delhi', state: 'Delhi', zone: 'N1' };
  }
  if (clean.startsWith('40') || clean === '400001' || clean === '400013') {
    return { city: 'Mumbai', state: 'Maharashtra', zone: 'W1' };
  }
  if (clean.startsWith('56') || clean === '560001' || clean === '560100') {
    return { city: 'Bangalore', state: 'Karnataka', zone: 'S1' };
  }
  if (clean.startsWith('70') || clean === '700001') {
    return { city: 'Kolkata', state: 'West Bengal', zone: 'E1' };
  }
  if (clean.startsWith('60') || clean === '600001') {
    return { city: 'Chennai', state: 'Tamil Nadu', zone: 'S2' };
  }
  if (clean.startsWith('30') || clean === '302020') {
    return { city: 'Jaipur', state: 'Rajasthan', zone: 'N2' };
  }

  return { city: 'Metropolitan City', state: 'State Region', zone: 'N1' };
}

export const CustomerWarehouseService = {
  getWarehouses: (tenantId = 'tenant-demo-01', statusFilter = 'all'): CustomerWarehouse[] => {
    return WAREHOUSE_STORE.filter((w) => {
      if (w.tenantId !== tenantId) return false;
      if (statusFilter !== 'all' && w.status !== statusFilter) return false;
      return true;
    });
  },

  getActiveWarehouses: (tenantId = 'tenant-demo-01'): CustomerWarehouse[] => {
    return WAREHOUSE_STORE.filter((w) => w.tenantId === tenantId && w.status === 'ACTIVE');
  },

  getDefaultWarehouse: (tenantId = 'tenant-demo-01'): CustomerWarehouse => {
    const active = CustomerWarehouseService.getActiveWarehouses(tenantId);
    return active.find((w) => w.isDefault) || active[0] || INITIAL_CUSTOMER_WAREHOUSES[0];
  },

  getWarehouseById: (id: string, tenantId = 'tenant-demo-01'): CustomerWarehouse | null => {
    return WAREHOUSE_STORE.find((w) => (w.id === id || w.warehouseCode === id) && (tenantId === 'all' || w.tenantId === tenantId)) || null;
  },

  checkDuplicateWarehouse: (tenantId: string, pincode: string, addressLine1: string): boolean => {
    return WAREHOUSE_STORE.some(
      (w) =>
        w.tenantId === tenantId &&
        w.status === 'ACTIVE' &&
        w.pincode === pincode.trim() &&
        w.addressLine1.toLowerCase().trim() === addressLine1.toLowerCase().trim()
    );
  },

  addWarehouse: (input: CustomerWarehouseInput): { success: boolean; message: string; warehouse: CustomerWarehouse } => {
    const existingForTenant = WAREHOUSE_STORE.filter((w) => w.tenantId === input.tenantId);

    // Auto-generate Warehouse Code (e.g., MUM-WH-02 or WH-004)
    const prefix = input.city ? input.city.slice(0, 3).toUpperCase() : 'WH';
    const code = `${prefix}-WH-${(existingForTenant.length + 1).toString().padStart(2, '0')}`;

    // Transactional Default Rule: If new is set as default, reset old defaults
    const isFirstWarehouse = existingForTenant.length === 0;
    const shouldBeDefault = input.isDefault ?? isFirstWarehouse;

    if (shouldBeDefault) {
      WAREHOUSE_STORE.forEach((w) => {
        if (w.tenantId === input.tenantId) w.isDefault = false;
      });
    }

    const newWh: CustomerWarehouse = {
      id: `wh-${Date.now()}`,
      tenantId: input.tenantId,
      warehouseCode: code,
      warehouseName: input.warehouseName,
      contactPerson: input.contactPerson,
      phone: input.phone,
      email: input.email,
      addressLine1: input.addressLine1,
      addressLine2: input.addressLine2,
      landmark: input.landmark,
      pincode: input.pincode.trim(),
      city: input.city,
      state: input.state,
      country: input.country || 'India',
      pickupStartTime: input.pickupStartTime || '10:00 AM',
      pickupEndTime: input.pickupEndTime || '06:00 PM',
      isDefault: shouldBeDefault,
      status: 'ACTIVE',
      totalShipmentsCount: 0,
      createdAt: new Date().toLocaleString(),
      updatedAt: new Date().toLocaleString(),
    };

    WAREHOUSE_STORE.unshift(newWh);
    return {
      success: true,
      message: `Warehouse ${newWh.warehouseCode} (${newWh.warehouseName}) created successfully!`,
      warehouse: newWh,
    };
  },

  updateWarehouse: (
    id: string,
    updates: Partial<CustomerWarehouseInput>,
    tenantId = 'tenant-demo-01'
  ): { success: boolean; message: string; warehouse?: CustomerWarehouse } => {
    const wh = CustomerWarehouseService.getWarehouseById(id, tenantId);
    if (!wh) return { success: false, message: 'Warehouse record not found.' };

    if (updates.isDefault) {
      WAREHOUSE_STORE.forEach((w) => {
        if (w.tenantId === tenantId) w.isDefault = false;
      });
    }

    Object.assign(wh, updates);
    wh.updatedAt = new Date().toLocaleString();

    return {
      success: true,
      message: `Warehouse ${wh.warehouseCode} updated successfully. (Historical shipments preserve original snapshot).`,
      warehouse: wh,
    };
  },

  setDefaultWarehouse: (id: string, tenantId = 'tenant-demo-01'): { success: boolean; message: string } => {
    const target = CustomerWarehouseService.getWarehouseById(id, tenantId);
    if (!target) return { success: false, message: 'Warehouse not found.' };

    WAREHOUSE_STORE.forEach((w) => {
      if (w.tenantId === tenantId) {
        w.isDefault = w.id === id;
      }
    });

    return {
      success: true,
      message: `${target.warehouseName} (${target.warehouseCode}) set as primary default pickup facility.`,
    };
  },

  deactivateWarehouse: (id: string, tenantId = 'tenant-demo-01'): { success: boolean; message: string } => {
    const wh = CustomerWarehouseService.getWarehouseById(id, tenantId);
    if (!wh) return { success: false, message: 'Warehouse record not found.' };

    wh.status = 'INACTIVE';
    wh.isDefault = false;

    // Auto-reassign next active as default if needed
    const remainingActive = CustomerWarehouseService.getActiveWarehouses(tenantId);
    if (remainingActive.length > 0 && !remainingActive.some((w) => w.isDefault)) {
      remainingActive[0].isDefault = true;
    }

    return {
      success: true,
      message: `Warehouse ${wh.warehouseCode} deactivated. It can no longer be selected for new bookings, but historical shipments remain intact.`,
    };
  },

  // Freeze Pickup Warehouse Snapshot for Shipment Booking
  createWarehouseSnapshot: (warehouseId: string, tenantId = 'tenant-demo-01'): PickupWarehouseSnapshot => {
    const wh = CustomerWarehouseService.getWarehouseById(warehouseId, tenantId) || CustomerWarehouseService.getDefaultWarehouse(tenantId);
    return {
      warehouseId: wh.id,
      warehouseCode: wh.warehouseCode,
      warehouseName: wh.warehouseName,
      contactPerson: wh.contactPerson,
      phone: wh.phone,
      email: wh.email,
      addressLine1: wh.addressLine1,
      addressLine2: wh.addressLine2,
      landmark: wh.landmark,
      pincode: wh.pincode,
      city: wh.city,
      state: wh.state,
      pickupStartTime: wh.pickupStartTime,
      pickupEndTime: wh.pickupEndTime,
      frozenAt: new Date().toLocaleString(),
    };
  },
};
