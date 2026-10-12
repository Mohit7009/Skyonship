import { normalizeShypfyPaymentType } from '../types/shypfy';

export interface CourierBookingInput {
  shipmentId?: string;
  orderId: string;
  courierId: string;
  serviceId: string;
  courierName: string;
  serviceName: string;
  originPincode: string;
  destinationPincode: string;
  paymentMode: 'PREPAID' | 'COD' | string;
  actualWeight: number;
  chargeableWeight: number;
  sellingPriceINR: number;
  estimatedDays: string;
  declaredValue?: number;
  pickupLocation?: string;
  pickupContactName?: string;
  pickupPhone?: string;
  pickupAddress?: string;
  pickupCity?: string;
  deliveryContactName?: string;
  deliveryPhone?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryState?: string;
  length?: number;
  width?: number;
  height?: number;
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
    const isShypfy =
      input.courierId.toLowerCase().includes('shypfy') ||
      input.courierName.toLowerCase().includes('shypfy');

    if (isShypfy) {
      try {
        const normalizedPaymentMethod = normalizeShypfyPaymentType(input.paymentMode);

        const res = await fetch('/api/integrations/shypfy/shipment/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: input.orderId || `ORD-${Date.now()}`,
            order_date: new Date().toISOString().replace('T', ' ').slice(0, 19),
            originPincode: input.originPincode,
            destinationPincode: input.destinationPincode,
            pickup_location: input.pickupLocation || 'Primary',
            pickupAddress: input.pickupAddress,
            pickupContactName: input.pickupContactName,
            pickupPhone: input.pickupPhone,
            pickupCity: input.pickupCity,
            deliveryContactName: input.deliveryContactName,
            deliveryPhone: input.deliveryPhone,
            deliveryAddress: input.deliveryAddress,
            deliveryCity: input.deliveryCity,
            deliveryState: input.deliveryState,
            billing_customer_name: input.deliveryContactName || 'Customer',
            billing_address: input.deliveryAddress || 'Address Details',
            billing_city: input.deliveryCity || 'City',
            billing_pincode: input.destinationPincode,
            billing_state: input.deliveryState || 'State',
            billing_country: 'India',
            billing_phone: input.deliveryPhone || '9876543210',
            shipping_is_billing: true,
            order_items: [
              {
                name: 'Standard Package',
                sku: 'SKU-01',
                units: 1,
                selling_price: input.sellingPriceINR || 500,
              },
            ],
            payment_method: normalizedPaymentMethod,
            payment_mode: normalizedPaymentMethod,
            sub_total: input.sellingPriceINR || 500,
            total_amount: input.sellingPriceINR || 500,
            length: input.length || 10,
            width: input.width || 10,
            height: input.height || 10,
            weight: input.actualWeight || 0.5,
          }),
        });

        if (!res.ok) {
          let errorDetail = `HTTP ${res.status} ${res.statusText}`;
          try {
            const errorJson = await res.json();
            errorDetail = errorJson?.error || errorJson?.message || JSON.stringify(errorJson);
          } catch {
            try {
              const text = await res.text();
              if (text) errorDetail = text;
            } catch {
              // fallback to status text
            }
          }

          return {
            success: false,
            bookingId: '',
            awbNumber: '',
            courierId: input.courierId,
            courierName: input.courierName || 'Shypfy Logistics',
            serviceName: input.serviceName || 'Shypfy Express',
            status: 'FAILED',
            isMock: false,
            bookingReference: input.orderId,
            message: `Shypfy booking failed: ${errorDetail}`,
            bookedAt: new Date().toISOString(),
          };
        }

        const apiRes = await res.json();
        if (!apiRes || !apiRes.success || !apiRes.data) {
          const errMsg = apiRes?.error || apiRes?.message || 'Shypfy rejected shipment creation';
          return {
            success: false,
            bookingId: '',
            awbNumber: '',
            courierId: input.courierId,
            courierName: input.courierName || 'Shypfy Logistics',
            serviceName: input.serviceName || 'Shypfy Express',
            status: 'FAILED',
            isMock: false,
            bookingReference: input.orderId,
            message: `Shypfy booking failed: ${errMsg}`,
            bookedAt: new Date().toISOString(),
          };
        }

        const awb = apiRes.data.awb_code || apiRes.data.tracking_id || apiRes.data.id || apiRes.data.barcodes?.wbn;
        if (!awb) {
          return {
            success: false,
            bookingId: '',
            awbNumber: '',
            courierId: input.courierId,
            courierName: input.courierName || 'Shypfy Logistics',
            serviceName: input.serviceName || 'Shypfy Express',
            status: 'FAILED',
            isMock: false,
            bookingReference: input.orderId,
            message: 'Shypfy shipment created but no AWB / tracking ID returned',
            bookedAt: new Date().toISOString(),
          };
        }

        return {
          success: true,
          bookingId: `bk-${Date.now()}`,
          awbNumber: String(awb),
          courierId: input.courierId,
          courierName: input.courierName || 'Shypfy Logistics',
          serviceName: input.serviceName || 'Shypfy Express',
          status: 'BOOKED',
          isMock: false,
          bookingReference: apiRes.data.order_id || input.orderId,
          labelUrl: apiRes.data.label_url || apiRes.data.labelUrl,
          message: 'Shipment successfully booked live on Shypfy Logistics Network',
          bookedAt: new Date().toISOString(),
        };
      } catch (err: any) {
        return {
          success: false,
          bookingId: '',
          awbNumber: '',
          courierId: input.courierId,
          courierName: input.courierName || 'Shypfy Logistics',
          serviceName: input.serviceName || 'Shypfy Express',
          status: 'FAILED',
          isMock: false,
          bookingReference: input.orderId,
          message: `Shypfy booking request failed: ${err?.message || 'Network error'}`,
          bookedAt: new Date().toISOString(),
        };
      }
    }

    // Fallback / Demo Mode handler for non-Shypfy simulated couriers ONLY
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
