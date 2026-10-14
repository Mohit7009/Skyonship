import { supabase } from '../../lib/supabaseClient';
import { toValidTenantUUID, generateUUID, isValidUUID } from '../../utils/uuidHelper';
import type { CustomerShipmentDetail, InternalShipmentStatus } from '../customerShipmentService';

export const SupabaseShipmentService = {
  /**
   * Fetch all shipments for a tenant from Supabase PostgreSQL.
   */
  async fetchShipments(tenantId?: string): Promise<CustomerShipmentDetail[]> {
    try {
      const validTid = toValidTenantUUID(tenantId);
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .eq('tenant_id', validTid)
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[SupabaseShipmentService] Fetch shipments warning:', error.message);
        return [];
      }

      if (!data || !Array.isArray(data)) return [];

      return data.map((row: any): CustomerShipmentDetail => {
        const bookingDateStr = row.created_at ? new Date(row.created_at).toLocaleString() : new Date().toLocaleString();
        return {
          id: row.id,
          shipmentId: row.shipment_number,
          tenantId: row.tenant_id,
          orderId: row.order_id,
          awbNumber: row.awb_number,
          bookingDate: bookingDateStr,
          courierId: row.courier_id,
          courierName: row.courier_name,
          serviceName: row.service_name || 'Standard',
          mode: row.mode || 'B2C',
          pickupWarehouseId: row.pickup_warehouse_id || undefined,
          pickupContact: row.pickup_contact,
          pickupPhone: row.pickup_phone,
          pickupAddress: row.pickup_address,
          pickupCity: row.pickup_city,
          pickupPincode: row.pickup_pincode,
          deliveryContact: row.delivery_contact,
          deliveryPhone: row.delivery_phone,
          deliveryEmail: row.delivery_email,
          deliveryAddress: row.delivery_address,
          deliveryCity: row.delivery_city,
          deliveryPincode: row.delivery_pincode,
          actualWeightKg: Number(row.actual_weight_kg || 0.5),
          chargeableWeightKg: Number(row.chargeable_weight_kg || 0.5),
          dimensionsCm: row.dimensions_cm || '20 × 15 × 10 CM',
          invoiceValueINR: Number(row.invoice_value_inr || 0),
          invoiceNumber: row.invoice_number,
          paymentMode: row.payment_mode || 'PREPAID',
          codAmountINR: Number(row.cod_amount_inr || 0),
          baseFreightINR: Number(row.base_freight_inr || 0),
          fuelSurchargeINR: Number(row.fuel_surcharge_inr || 0),
          codFeeINR: Number(row.cod_fee_inr || 0),
          totalCustomerChargeINR: Number(row.total_customer_charge_inr || 0),
          bookingStatus: (row.booking_status as InternalShipmentStatus) || 'BOOKING_CONFIRMED',
          customerFacingStatus: row.customer_facing_status || 'Booking Confirmed',
          trackingStatus: row.tracking_status || 'Booked',
          labelUrl: row.label_url,
          statusHistory: [
            {
              id: `hist-${row.id.slice(0, 8)}`,
              shipmentId: row.shipment_number,
              oldStatus: 'DRAFT',
              newStatus: row.booking_status || 'BOOKING_CONFIRMED',
              source: 'SYSTEM',
              timestamp: bookingDateStr,
              userOrAdmin: 'Merchant User',
              reason: 'Shipment recorded in Supabase cloud DB',
            },
          ],
          trackingTimeline: [
            {
              statusKey: row.booking_status || 'BOOKING_CONFIRMED',
              statusTitle: row.customer_facing_status || 'Shipment Booked',
              location: `${row.pickup_city || 'Origin'} Hub`,
              timestamp: bookingDateStr,
              description: 'Shipment created and synchronized with cloud DB.',
              completed: true,
            },
          ],
        };
      });
    } catch (err: any) {
      console.warn('[SupabaseShipmentService] Fetch exception:', err.message);
      return [];
    }
  },

  /**
   * Insert a new shipment and initial audit status log into Supabase.
   */
  async insertShipment(shipment: CustomerShipmentDetail): Promise<{ success: boolean; message: string; recordId?: string }> {
    try {
      const validTid = toValidTenantUUID(shipment.tenantId);
      const rowId = isValidUUID(shipment.id) ? shipment.id : generateUUID();

      const insertPayload: Record<string, any> = {
        id: rowId,
        tenant_id: validTid,
        shipment_number: shipment.shipmentId,
        booking_reference_id: shipment.shipmentId,
        order_id: shipment.orderId,
        awb_number: shipment.awbNumber || null,
        courier_id: shipment.courierId,
        courier_name: shipment.courierName,
        service_name: shipment.serviceName || 'Standard',
        mode: shipment.mode || 'B2C',
        pickup_warehouse_id: isValidUUID(shipment.pickupWarehouseId) ? shipment.pickupWarehouseId : null,
        pickup_contact: shipment.pickupContact,
        pickup_phone: shipment.pickupPhone,
        pickup_address: shipment.pickupAddress,
        pickup_city: shipment.pickupCity,
        pickup_pincode: (shipment.pickupPincode || '').replace(/\D/g, '').trim(),
        delivery_contact: shipment.deliveryContact,
        delivery_phone: shipment.deliveryPhone,
        delivery_email: (shipment as any).deliveryEmail || null,
        delivery_address: shipment.deliveryAddress,
        delivery_city: shipment.deliveryCity,
        delivery_pincode: (shipment.deliveryPincode || '').replace(/\D/g, '').trim(),
        actual_weight_kg: Number(shipment.actualWeightKg) || 0.5,
        chargeable_weight_kg: Number(shipment.chargeableWeightKg) || 0.5,
        dimensions_cm: shipment.dimensionsCm || '20 × 15 × 10 CM',
        invoice_value_inr: Number(shipment.invoiceValueINR) || 0,
        invoice_number: shipment.invoiceNumber || null,
        payment_mode: shipment.paymentMode || 'PREPAID',
        cod_amount_inr: Number(shipment.codAmountINR) || 0,
        base_freight_inr: Number(shipment.baseFreightINR) || 0,
        fuel_surcharge_inr: Number(shipment.fuelSurchargeINR) || 0,
        cod_fee_inr: Number(shipment.codFeeINR) || 0,
        total_customer_charge_inr: Number(shipment.totalCustomerChargeINR) || 0,
        booking_status: shipment.bookingStatus || 'BOOKING_CONFIRMED',
        customer_facing_status: shipment.customerFacingStatus || 'Booking Confirmed',
        tracking_status: shipment.trackingStatus || 'Booked',
        label_url: shipment.labelUrl || null,
      };

      const { data, error } = await supabase
        .from('shipments')
        .insert([insertPayload])
        .select()
        .single();

      if (error) {
        console.warn('[SupabaseShipmentService] Insert warning:', error.message);
        return { success: false, message: error.message };
      }

      // Append initial audit log entry
      try {
        await supabase.from('shipment_status_history').insert([
          {
            shipment_id: data.id,
            tenant_id: validTid,
            old_status: 'DRAFT',
            new_status: shipment.bookingStatus || 'BOOKING_CONFIRMED',
            source: 'SYSTEM',
            reason: 'Shipment created via portal wizard',
          },
        ]);
      } catch {
        // history insert is non-blocking
      }

      return { success: true, message: 'Shipment saved to Supabase cloud DB.', recordId: data.id };
    } catch (err: any) {
      return { success: false, message: err.message || 'Database error inserting shipment.' };
    }
  },

  /**
   * Update shipment status and audit history in Supabase.
   */
  async updateShipmentStatus(
    shipmentNumber: string,
    newStatus: InternalShipmentStatus,
    customerFacingStatus: string,
    reason: string,
    source = 'ADMIN',
    tenantId?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const validTid = toValidTenantUUID(tenantId);
      const { data, error } = await supabase
        .from('shipments')
        .update({
          booking_status: newStatus,
          customer_facing_status: customerFacingStatus,
          tracking_status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('shipment_number', shipmentNumber)
        .eq('tenant_id', validTid)
        .select()
        .maybeSingle();

      if (error) {
        return { success: false, message: error.message };
      }

      if (data) {
        try {
          await supabase.from('shipment_status_history').insert([
            {
              shipment_id: data.id,
              tenant_id: validTid,
              old_status: data.booking_status || 'BOOKING_CONFIRMED',
              new_status: newStatus,
              source,
              reason,
            },
          ]);
        } catch {
          // history insert is non-blocking
        }
      }

      return { success: true, message: 'Status updated in Supabase cloud DB.' };
    } catch (err: any) {
      return { success: false, message: err.message || 'Database error updating status.' };
    }
  },
};
