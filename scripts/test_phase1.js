/**
 * Automated Verification Suite for Phase 1 Shypfy Production Booking Fixes
 * 
 * SAFETY RULES ENFORCED:
 * - 100% Mocked network calls. ZERO real courier bookings dispatched to Shypfy.
 * - ZERO modifications to Supabase, database records, or environment files.
 * - Credentials are NOT logged, printed, or exposed.
 */

// Polyfill window & localStorage for Node test runner
const _storage = new Map();
globalThis.localStorage = {
  getItem: (key) => _storage.get(key) || null,
  setItem: (key, val) => _storage.set(key, String(val)),
  removeItem: (key) => _storage.delete(key),
  clear: () => _storage.clear(),
};
globalThis.window = globalThis;

import assert from 'node:assert';
import { normalizeShypfyPaymentType } from '../src/types/shypfy.ts';
import { resolveShypfySubpath } from '../api/shypfy.ts';
import { CourierBookingAdapter } from '../src/services/courierBookingAdapter.ts';

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✅ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
    failed++;
  }
}

console.log('====================================================');
console.log('🧪 RUNNING PHASE 1 VERIFICATION TEST SUITE');
console.log('====================================================\n');

// ---------------------------------------------------------------------------
// SUITE 1: SHYPFY PAYMENT TYPE ENUM NORMALIZATION
// ---------------------------------------------------------------------------
console.log('--- Suite 1: Payment Type Enum Normalization ---');

runTest('Maps "COD" and lowercase "cod" to "COD"', () => {
  assert.strictEqual(normalizeShypfyPaymentType('COD'), 'COD');
  assert.strictEqual(normalizeShypfyPaymentType('cod'), 'COD');
  assert.strictEqual(normalizeShypfyPaymentType('Cod '), 'COD');
});

runTest('Maps "Pickup", "pickup", "PICKUP" to "Pickup"', () => {
  assert.strictEqual(normalizeShypfyPaymentType('Pickup'), 'Pickup');
  assert.strictEqual(normalizeShypfyPaymentType('pickup'), 'Pickup');
  assert.strictEqual(normalizeShypfyPaymentType('PICKUP'), 'Pickup');
  assert.strictEqual(normalizeShypfyPaymentType('  pickup  '), 'Pickup');
});

runTest('Maps "PREPAID", "Prepaid", "prepaid" to "Prepaid"', () => {
  assert.strictEqual(normalizeShypfyPaymentType('PREPAID'), 'Prepaid');
  assert.strictEqual(normalizeShypfyPaymentType('prepaid'), 'Prepaid');
  assert.strictEqual(normalizeShypfyPaymentType('Prepaid'), 'Prepaid');
  assert.strictEqual(normalizeShypfyPaymentType(''), 'Prepaid');
  assert.strictEqual(normalizeShypfyPaymentType(undefined), 'Prepaid');
  assert.strictEqual(normalizeShypfyPaymentType('UNKNOWN'), 'Prepaid');
});

// ---------------------------------------------------------------------------
// SUITE 2: VERCEL ROUTING SUBPATH RESOLUTION
// ---------------------------------------------------------------------------
console.log('\n--- Suite 2: Vercel Routing Subpath Resolution ---');

runTest('Extracts path from vercel.json rewrite query param: req.query.path="shipment/create"', () => {
  const req = { query: { path: 'shipment/create' }, url: '/api/shypfy?path=shipment/create' };
  assert.strictEqual(resolveShypfySubpath(req), 'shipment/create');
});

runTest('Handles array query path: req.query.path=["shipment", "create"]', () => {
  const req = { query: { path: ['shipment', 'create'] }, url: '/api/shypfy?path=shipment/create' };
  assert.strictEqual(resolveShypfySubpath(req), 'shipment/create');
});

runTest('Extracts path for serviceability, test, label, track, cancel', () => {
  assert.strictEqual(resolveShypfySubpath({ query: { path: 'serviceability' } }), 'serviceability');
  assert.strictEqual(resolveShypfySubpath({ query: { path: 'test' } }), 'test');
  assert.strictEqual(resolveShypfySubpath({ query: { path: 'label' } }), 'label');
  assert.strictEqual(resolveShypfySubpath({ query: { path: 'track' } }), 'track');
  assert.strictEqual(resolveShypfySubpath({ query: { path: 'cancel' } }), 'cancel');
});

runTest('Extracts path from direct URL if query param is absent', () => {
  assert.strictEqual(resolveShypfySubpath({ url: '/api/integrations/shypfy/shipment/create' }), 'shipment/create');
  assert.strictEqual(resolveShypfySubpath({ url: '/api/integrations/shypfy/serviceability' }), 'serviceability');
  assert.strictEqual(resolveShypfySubpath({ url: '/api/shypfy/test' }), 'test');
});

// ---------------------------------------------------------------------------
// SUITE 3: VERCEL API HANDLER ROUTING & 404 UNKNOWN ROUTE
// ---------------------------------------------------------------------------
console.log('\n--- Suite 3: Vercel Handler Routing & 404 Fallback ---');

import shypfyHandler from '../api/shypfy.ts';

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(key, val) { this.headers[key] = val; },
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; },
    end() { return this; },
  };
}

await runAsyncTest('Returns HTTP 404 on unrecognized route (never falls back to test)', async () => {
  const req = {
    method: 'GET',
    url: '/api/shypfy?path=nonexistent/route',
    query: { path: 'nonexistent/route' },
  };
  const res = createMockRes();
  await shypfyHandler(req, res);

  assert.strictEqual(res.statusCode, 404, 'Expected HTTP 404 for unknown route');
  assert.strictEqual(res.body?.success, false);
  assert.ok(res.body?.error?.includes('Endpoint not found'), 'Expected error message mentioning Endpoint not found');
});

await runAsyncTest('Handles OPTIONS preflight with 200 and CORS headers', async () => {
  const req = { method: 'OPTIONS', url: '/api/shypfy?path=shipment/create' };
  const res = createMockRes();
  await shypfyHandler(req, res);

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.headers['Access-Control-Allow-Origin'], '*');
});

// ---------------------------------------------------------------------------
// SUITE 4: COURIER BOOKING ADAPTER - ZERO FAKE AWBS & STRICT ERROR PROPAGATION
// ---------------------------------------------------------------------------
console.log('\n--- Suite 4: Courier Booking Adapter - Strict Live Error Handling ---');

const sampleBookingInput = {
  orderId: 'TEST-ORD-001',
  courierId: 'shypfy',
  courierName: 'Shypfy Logistics',
  serviceId: 'shypfy_express',
  serviceName: 'Shypfy Express',
  originPincode: '110001',
  destinationPincode: '400001',
  paymentMode: 'PREPAID',
  actualWeight: 0.5,
  chargeableWeight: 0.5,
  sellingPriceINR: 500,
  estimatedDays: '2-3 Days',
};

const originalFetch = globalThis.fetch;

await runAsyncTest('HTTP 400 Shypfy failure: returns success:false, status:FAILED, no fake AWB', async () => {
  globalThis.fetch = async () => ({
    ok: false,
    status: 400,
    statusText: 'Bad Request',
    json: async () => ({
      success: false,
      error: 'SWIFT_MALFORMED_INPUT_EXCEPTION: dropPincode invalid',
    }),
  });

  const result = await CourierBookingAdapter.bookShipment(sampleBookingInput);

  assert.strictEqual(result.success, false, 'Expected success=false');
  assert.strictEqual(result.status, 'FAILED', 'Expected status=FAILED');
  assert.strictEqual(result.isMock, false, 'Expected isMock=false');
  assert.strictEqual(result.awbNumber, '', 'Expected empty awbNumber, NO fake AWB');
  assert.ok(result.message.includes('SWIFT_MALFORMED_INPUT_EXCEPTION'), 'Real error message must be preserved');
});

await runAsyncTest('HTTP 500 Server error: returns success:false, status:FAILED, no fake AWB', async () => {
  globalThis.fetch = async () => ({
    ok: false,
    status: 500,
    statusText: 'Internal Server Error',
    json: async () => ({ success: false, message: 'Upstream gateway timeout' }),
  });

  const result = await CourierBookingAdapter.bookShipment(sampleBookingInput);

  assert.strictEqual(result.success, false);
  assert.strictEqual(result.status, 'FAILED');
  assert.strictEqual(result.isMock, false);
  assert.strictEqual(result.awbNumber, '');
  assert.ok(result.message.includes('Upstream gateway timeout'));
});

await runAsyncTest('Network fetch exception: returns success:false, status:FAILED, no fake AWB', async () => {
  globalThis.fetch = async () => {
    throw new Error('Connection refused / ECONNREFUSED');
  };

  const result = await CourierBookingAdapter.bookShipment(sampleBookingInput);

  assert.strictEqual(result.success, false);
  assert.strictEqual(result.status, 'FAILED');
  assert.strictEqual(result.isMock, false);
  assert.strictEqual(result.awbNumber, '');
  assert.ok(result.message.includes('ECONNREFUSED'));
});

await runAsyncTest('HTTP 200 with Shypfy error response: returns success:false, status:FAILED', async () => {
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      success: false,
      error: 'Carrier credit balance exhausted',
    }),
  });

  const result = await CourierBookingAdapter.bookShipment(sampleBookingInput);

  assert.strictEqual(result.success, false);
  assert.strictEqual(result.status, 'FAILED');
  assert.strictEqual(result.isMock, false);
  assert.strictEqual(result.awbNumber, '');
  assert.ok(result.message.includes('Carrier credit balance exhausted'));
});

await runAsyncTest('HTTP 200 with Shypfy real success: returns success:true, real AWB', async () => {
  globalThis.fetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      success: true,
      data: {
        order_id: 'TEST-ORD-001',
        awb_code: 'DELHIVERY_987654321012',
        tracking_id: 'DELHIVERY_987654321012',
        label_url: 'https://app.shypfy.com/labels/123.pdf',
      },
    }),
  });

  const result = await CourierBookingAdapter.bookShipment(sampleBookingInput);

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.status, 'BOOKED');
  assert.strictEqual(result.isMock, false);
  assert.strictEqual(result.awbNumber, 'DELHIVERY_987654321012');
  assert.strictEqual(result.labelUrl, 'https://app.shypfy.com/labels/123.pdf');
});

// ---------------------------------------------------------------------------
// SUITE 5: CUSTOMER BOOKING SERVICE - PROPAGATES ERROR & BLOCKS WALLET DEBIT
// ---------------------------------------------------------------------------
console.log('\n--- Suite 5: Customer Booking Service Integration ---');

import { CustomerBookingService } from '../src/services/customerBookingService.ts';
import { WalletService } from '../src/mocks/wallet.mock.ts';

const sampleCustomerInput = {
  tenantId: 'test-tenant-phase1',
  orderId: 'TEST-ORD-P1',
  customerName: 'Test Consignee',
  customerPhone: '9876543210',
  shipmentType: 'b2c',
  pickupContactName: 'Warehouse Manager',
  pickupPhone: '9876543210',
  pickupAddressLine1: 'Warehouse 1, Industrial Area',
  pickupCity: 'Delhi',
  pickupPincode: '110001',
  deliveryContactName: 'Consignee Name',
  deliveryPhone: '9876543210',
  deliveryAddressLine1: 'Consignee Address',
  deliveryCity: 'Mumbai',
  deliveryState: 'Maharashtra',
  deliveryPincode: '400001',
  invoiceValueINR: 1000,
  paymentMode: 'prepaid',
  packages: [{ lengthCm: 10, widthCm: 10, heightCm: 10, weightKg: 0.5 }],
  actualWeightKg: 0.5,
  chargeableWeightKg: 0.5,
  courierId: 'shypfy',
  courierName: 'Shypfy Logistics',
  serviceName: 'Shypfy Express',
  baseFreightINR: 65,
  fuelSurchargeINR: 10,
  codFeeINR: 0,
  insuranceFeeINR: 0,
  gstINR: 13.5,
  shippingChargeINR: 88.5,
};

await runAsyncTest('Customer booking propagates real Shypfy error and prevents wallet debit', async () => {
  // Ensure test wallet has balance: recharge(amountINR, providerName, tenantId)
  WalletService.recharge(1000, 'UPI', 'test-tenant-phase1');
  const initialBalance = WalletService.getWallet('test-tenant-phase1').availableBalanceMinor;

  // Mock Shypfy rejection
  globalThis.fetch = async () => ({
    ok: false,
    status: 400,
    statusText: 'Bad Request',
    json: async () => ({
      success: false,
      error: 'SWIFT_ORIGIN_UNSERVICEABLE: pickup pincode not serviceable',
    }),
  });

  const res = await CustomerBookingService.bookShipmentWithWalletDebit(sampleCustomerInput);

  assert.strictEqual(res.success, false, 'Expected booking to fail');
  assert.strictEqual(res.reason, 'BOOKING_FAILED');
  assert.ok(res.message.includes('SWIFT_ORIGIN_UNSERVICEABLE'), 'Real Shypfy error must propagate to customer');

  // Verify wallet balance is unchanged
  const postBalance = WalletService.getWallet('test-tenant-phase1').availableBalanceMinor;
  assert.strictEqual(postBalance, initialBalance, 'Wallet must NOT be debited on failed booking');
});

// Restore original fetch
globalThis.fetch = originalFetch;

console.log('\n====================================================');
console.log(`📊 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
console.log('====================================================');

if (failed > 0) {
  process.exit(1);
}
