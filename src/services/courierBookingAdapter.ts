export interface CourierBookingInput {
  shipmentId?: string;
  orderId: string;
  courierId: string;
  serviceId: string;
  courierName: string;
  serviceName: string;
  originPincode: string;
  destinationPincode: string;
  paymentMode: 'PREPAID' | 'COD';
  actualWeight: number;
  chargeableWeight: number;
  sellingPriceINR: number;
  estimatedDays: string;
  declaredValue?: number;
}

export interface CourierBookingResponse {
  success: boolean;
  bookingId: string;
  awbNumber: string;
  courierId: string;
  courierName: string;
  serviceName: string;
  status: 'BOOKED' | 'FAILED';
  isMock: boolean;
  bookingReference: string;
  labelUrl?: string;
  message: string;
  bookedAt: string;
}

export const CourierBookingAdapter = {
  bookShipment: async (input: CourierBookingInput): Promise<CourierBookingResponse> => {
    // Generate deterministic demo AWB Number
    const prefix = input.courierId.toUpperCase().slice(0, 3);
    const randomDigits = Math.floor(100000000 + Math.random() * 900000000);
    const awbNumber = `${prefix}${randomDigits}`;
    const bookingId = `bk-${Date.now()}`;
    const bookingReference = `REF-${Date.now().toString().slice(-6)}`;

    return {
      success: true,
      bookingId,
      awbNumber,
      courierId: input.courierId,
      courierName: input.courierName,
      serviceName: input.serviceName,
      status: 'BOOKED',
      isMock: true,
      bookingReference,
      message: 'Shipment booked successfully via Courier Integration Adapter (Development/Mock Mode)',
      bookedAt: new Date().toISOString(),
    };
  },
};
