import assert from 'node:assert';
import { buildShypfyShipmentPayload } from '../api/shypfy';

console.log('Testing buildShypfyShipmentPayload...');

const input = {
  order_id: 'ORD-12345',
  originPincode: '134113',
  pickup_location: 'test api',
  pickupAddress: '001 panchkula phase 1 test',
  pickupContactName: 'test',
  pickupPhone: '8798589658',
  pickupCity: 'PANCHKULA',
  deliveryContactName: 'Mohit',
  deliveryPhone: '7009174879',
  deliveryAddress: 'Baddi - Jhar Majri Road, Barotiwala',
  deliveryCity: 'Barotiwala',
  deliveryState: 'Himachal Pradesh',
  destinationPincode: '173205',
  payment_mode: 'Prepaid',
  sellingPriceINR: 1000,
  weight: 1.0,
  length: 10,
  width: 10,
  height: 10,
};

const payload = buildShypfyShipmentPayload(input);
console.log('Generated Payload:', JSON.stringify(payload, null, 2));

assert.strictEqual(payload.order_number, 'ORD-12345');
assert.strictEqual(payload.payment_mode, 'Prepaid');
assert.strictEqual(payload.weight, 1000, 'Weight must be 1000 grams for 1.0kg');
assert.strictEqual(payload.pickup_location.name, 'DIVYANSH ENTERPRISES', 'Panchkula 134113 must map to DIVYANSH ENTERPRISES');
assert.strictEqual(payload.return_location.name, 'DIVYANSH ENTERPRISES');
assert.strictEqual(payload.drop_location.pin, 173205);
assert.strictEqual(payload.drop_location.phone, 7009174879);
assert.strictEqual(payload.drop_location.country, 'India');
assert.strictEqual(typeof payload.tax_value, 'number');
assert.strictEqual(typeof payload.total_amount, 'number');
assert.strictEqual(payload.total_amount, 1000);

console.log('✅ ALL PAYLOAD BUILDER TESTS PASSED!');

import { createShypfyShipment } from '../api/shypfy';

async function testLiveCall() {
  if (!process.env.SHYPFY_CLIENT_ID || !process.env.SHYPFY_API_USERNAME || !process.env.SHYPFY_API_PASSWORD) {
    console.log('Skipping live call: SHYPFY credentials not in process.env');
    return;
  }

  console.log('\nTesting live createShypfyShipment error translation...');
  try {
    const res = await createShypfyShipment(input);
    console.log('Live Booking Success! AWB:', res);
  } catch (err: any) {
    console.log('Caught Handled Error Message:');
    console.log(err.message);
    assert(
      err.message.includes('No active rate card / weight brackets configured') ||
      err.message.includes('Shypfy Account Error') ||
      err.message.includes('404'),
      'Error message should be translated cleanly'
    );
    console.log('✅ ERROR MESSAGE WAS TRANSLATED CLEANLY!');
  }
}

// testLiveCall(); // Commented out to prevent unauthorized live orders
