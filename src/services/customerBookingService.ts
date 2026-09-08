import { WalletService } from '../mocks/wallet.mock';
import type { WalletTransaction } from '../types/wallet';
import { CourierBookingAdapter } from './courierBookingAdapter';
import { CustomerShipmentService, type MultiPackageDetail } from './customerShipmentService';
import { LabelService } from './labelService';

export interface CustomerBookingInput {
  tenantId: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shipmentType: 'b2c' | 'b2b';
  pickupContactName: string;
  pickupPhone: string;
  pickupAddressLine1: string;
  pickupCity: string;
  pickupPincode: string;
  deliveryContactName: string;
  deliveryCompany?: string;
  deliveryPhone: string;
  deliveryAddressLine1: string;
  deliveryAddressLine2?: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryPincode: string;
  invoiceNumber?: string;
  invoiceDate?: string;
  invoiceValueINR: number;
  paymentMode: 'prepaid' | 'cod';
  codAmount?: number;
  insuranceEnabled?: boolean;
  insuredValueINR?: number;
  packageType?: string;
  packages: MultiPackageDetail[];
  actualWeightKg: number;
  chargeableWeightKg: number;
  courierId: string;
  courierName: string;
  serviceName: string;
  baseFreightINR: number;
  fuelSurchargeINR: number;
  codFeeINR: number;
  insuranceFeeINR: number;
  gstINR: number;
  shippingChargeINR: number;
}

export interface CustomerBookingResult {
  success: boolean;
  reason?: 'INSUFFICIENT_WALLET_BALANCE' | 'BOOKING_FAILED' | 'WALLET_SUSPENDED' | 'VALIDATION_FAILED';
  message: string;
  shipmentId?: string;
  orderId?: string;
  awbNumber?: string;
  bookingReference?: string;
  courierName?: string;
  serviceName?: string;
  customerChargeINR?: number;
  requiredAmountINR?: number;
  availableBalanceINR?: number;
  shortfallINR?: number;
  remainingBalanceINR?: number;
  transaction?: WalletTransaction | null;
  bookedAt?: string;
  packageCount?: number;
}

export const CustomerBookingService = {
  // Check if tenant has sufficient wallet balance for the booking charge
  checkWalletSufficiency: (tenantId: string, amountINR: number) => {
    const wallet = WalletService.getWallet(tenantId);
    const availableINR = wallet.availableBalanceMinor / 100;
    const isSufficient = availableINR >= amountINR;
    const shortfallINR = isSufficient ? 0 : amountINR - availableINR;

    return {
      isSufficient,
      availableINR,
      requiredINR: amountINR,
      shortfallINR,
      walletStatus: wallet.status,
    };
  },

  // Execute Shipment Booking with strict backend validation and atomic wallet debit
  bookShipmentWithWalletDebit: async (input: CustomerBookingInput): Promise<CustomerBookingResult> => {
    const tenantId = input.tenantId || 'tenant-demo-01';
    const totalChargeINR = input.shippingChargeINR;

    // 1. Strict Server-Side Field Validation
    if (!input.pickupPincode || !/^\d{6}$/.test(input.pickupPincode)) {
      return { success: false, reason: 'VALIDATION_FAILED', message: 'Invalid origin pickup pincode.' };
    }
    if (!input.deliveryPincode || !/^\d{6}$/.test(input.deliveryPincode)) {
      return { success: false, reason: 'VALIDATION_FAILED', message: 'Invalid delivery pincode.' };
    }
    if (!input.deliveryContactName || !input.deliveryPhone || !input.deliveryAddressLine1) {
      return { success: false, reason: 'VALIDATION_FAILED', message: 'Incomplete delivery consignee details.' };
    }
    if (input.invoiceValueINR <= 0) {
      return { success: false, reason: 'VALIDATION_FAILED', message: 'Invoice value must be greater than 0.' };
    }
    if (input.paymentMode === 'cod' && (!input.codAmount || input.codAmount <= 0)) {
      return { success: false, reason: 'VALIDATION_FAILED', message: 'COD Amount must be specified for COD orders.' };
    }

    // 2. Wallet Sufficiency Check
    const suff = CustomerBookingService.checkWalletSufficiency(tenantId, totalChargeINR);

    if (suff.walletStatus === 'SUSPENDED') {
      return {
        success: false,
        reason: 'WALLET_SUSPENDED',
        message: 'Wallet account is suspended. Booking rejected.',
        requiredAmountINR: totalChargeINR,
        availableBalanceINR: suff.availableINR,
      };
    }

    if (!suff.isSufficient) {
      return {
        success: false,
        reason: 'INSUFFICIENT_WALLET_BALANCE',
        message: `Insufficient Wallet Balance. Required ₹${totalChargeINR.toFixed(2)}, Available ₹${suff.availableINR.toFixed(2)}. Shortfall: ₹${suff.shortfallINR.toFixed(2)}.`,
        requiredAmountINR: totalChargeINR,
        availableBalanceINR: suff.availableINR,
        shortfallINR: suff.shortfallINR,
      };
    }

    // 3. Courier Booking Adapter Execution (AWB & Reference Generation)
    const bookingRes = await CourierBookingAdapter.bookShipment({
      orderId: input.orderId,
      courierId: input.courierId,
      serviceId: input.courierId,
      courierName: input.courierName,
      serviceName: input.serviceName,
      originPincode: input.pickupPincode,
      destinationPincode: input.deliveryPincode,
      paymentMode: input.paymentMode === 'cod' ? 'COD' : 'PREPAID',
      actualWeight: input.actualWeightKg,
      chargeableWeight: input.chargeableWeightKg,
      sellingPriceINR: totalChargeINR,
      estimatedDays: '2–4 Days',
    });

    if (!bookingRes.success) {
      return {
        success: false,
        reason: 'BOOKING_FAILED',
        message: 'Courier booking failed. Wallet balance was not debited.',
      };
    }

    const shipmentId = `SHP-${input.orderId}`;
    const awb = bookingRes.awbNumber || `AWB-${Math.floor(10000000 + Math.random() * 90000000)}`;

    // 4. Wallet Debit & Ledger Transaction Logging
    const debitRes = WalletService.debit(
      shipmentId,
      input.orderId,
      input.courierId,
      input.courierName,
      totalChargeINR,
      {
        baseFreightMinor: Math.round(input.baseFreightINR * 100),
        fuelSurchargeMinor: Math.round(input.fuelSurchargeINR * 100),
        codFeeMinor: Math.round(input.codFeeINR * 100),
        totalMinor: Math.round(totalChargeINR * 100),
      }
    );

    if (!debitRes.success) {
      return {
        success: false,
        reason: 'INSUFFICIENT_WALLET_BALANCE',
        message: debitRes.message,
        requiredAmountINR: totalChargeINR,
        availableBalanceINR: suff.availableINR,
      };
    }

    // 5. Persist Shipment Record in CustomerShipmentService
    const nowStr = new Date().toLocaleString();
    CustomerShipmentService.addShipmentRecord({
      id: `shp-${Date.now()}`,
      shipmentId,
      tenantId,
      orderId: input.orderId,
      awbNumber: awb,
      bookingDate: nowStr,
      courierId: input.courierId,
      courierName: input.courierName,
      serviceName: input.serviceName,
      mode: input.shipmentType === 'b2b' ? 'B2B' : 'B2C',
      pickupContact: input.pickupContactName,
      pickupPhone: input.pickupPhone,
      pickupAddress: input.pickupAddressLine1,
      pickupCity: input.pickupCity,
      pickupPincode: input.pickupPincode,
      deliveryContact: input.deliveryContactName,
      deliveryPhone: input.deliveryPhone,
      deliveryAddress: `${input.deliveryAddressLine1}${input.deliveryAddressLine2 ? `, ${input.deliveryAddressLine2}` : ''}`,
      deliveryCity: input.deliveryCity,
      deliveryPincode: input.deliveryPincode,
      actualWeightKg: input.actualWeightKg,
      chargeableWeightKg: input.chargeableWeightKg,
      dimensionsCm: input.packages[0] ? `${input.packages[0].lengthCm} × ${input.packages[0].widthCm} × ${input.packages[0].heightCm} CM` : '20 × 15 × 10 CM',
      invoiceValueINR: input.invoiceValueINR,
      invoiceNumber: input.invoiceNumber,
      invoiceDate: input.invoiceDate,
      insuranceEnabled: input.insuranceEnabled,
      insuredValueINR: input.insuredValueINR,
      packageType: input.packageType,
      packages: input.packages,
      paymentMode: input.paymentMode === 'cod' ? 'COD' : 'PREPAID',
      codAmountINR: input.codAmount || 0,
      baseFreightINR: input.baseFreightINR,
      fuelSurchargeINR: input.fuelSurchargeINR,
      codFeeINR: input.codFeeINR,
      totalCustomerChargeINR: totalChargeINR,
      transactionId: debitRes.transaction?.id,
      bookingStatus: 'BOOKING_CONFIRMED',
      customerFacingStatus: 'Booked',
      trackingStatus: 'BOOKING_CONFIRMED',
      trackingTimeline: [
        { statusKey: 'BOOKING_CONFIRMED', statusTitle: 'Shipment Booked', location: `${input.pickupCity} Hub`, timestamp: nowStr, description: 'Shipment created & wallet debited.', completed: true },
      ],
      statusHistory: [
        { id: `hist-${Date.now()}`, shipmentId, oldStatus: 'DRAFT', newStatus: 'BOOKING_CONFIRMED', source: 'SYSTEM', timestamp: nowStr, userOrAdmin: 'Merchant User', reason: 'Booked via shipment wizard' },
      ],
    });

    // 6. Generate Labels in LabelService
    await LabelService.generateLabel(shipmentId, 'THERMAL_4X6');

    const updatedWallet = WalletService.getWallet(tenantId);
    const remainingBalanceINR = updatedWallet.availableBalanceMinor / 100;

    return {
      success: true,
      message: 'Shipment booked successfully and wallet balance debited.',
      shipmentId,
      orderId: input.orderId,
      awbNumber: awb,
      bookingReference: bookingRes.bookingReference,
      courierName: input.courierName,
      serviceName: input.serviceName,
      customerChargeINR: totalChargeINR,
      remainingBalanceINR,
      transaction: debitRes.transaction,
      bookedAt: nowStr,
      packageCount: input.packages.length,
    };
  },
};
