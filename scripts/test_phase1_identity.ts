/**
 * Phase 1 — Secure Customer Identity and Multi-Tenant Foundation Test Suite
 * 
 * Includes:
 * 1. [STATIC SPECIFICATION TESTS] AST / Code pattern verification of migrations, RLS policies, and source code.
 * 2. [RUNTIME IN-MEMORY SIMULATIONS] State machine simulation of:
 *    - get_auth_tenant_id() with stale / mismatched JWT claims, missing db mapping, and valid claims.
 *    - handle_new_auth_user() atomicity, email collision rejection (different & NULL auth_user_id),
 *      wallet structural conflict validation, balance preservation, and rollback.
 * 3. [RUNTIME SERVICE ADAPTER TESTS] CustomerShipmentService tenant isolation & Shypfy payload builders.
 * 
 * NOTE: Live database testing requires applying migration 004 to a Supabase / PostgreSQL instance
 * and running the read-only production verification checklist.
 */
import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isValidUUID, toValidTenantUUID, generateUUID } from '../src/utils/uuidHelper';
import { CustomerShipmentService, type CustomerShipmentDetail } from '../src/services/customerShipmentService';
import { buildShypfyShipmentPayload } from '../api/shypfy';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runPhase1SecurityTests() {
  console.log('====================================================================');
  console.log('🔒 SKYONSHIP PHASE 1 IDENTITY, TENANCY & MIGRATION 004 TEST SUITE');
  console.log('====================================================================\n');

  let passed = 0;
  let failed = 0;

  function test(name: string, fn: () => void | Promise<void>) {
    try {
      fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name}\n     ${err.message}`);
      failed++;
    }
  }

  // ==========================================================================
  // Suite 1: Strict UUID Tenancy Validation [RUNTIME]
  // ==========================================================================
  console.log('--- Suite 1: Strict UUID Tenancy Validation [RUNTIME] ---');
  test('Valid UUID string correctly identified', () => {
    assert.strictEqual(isValidUUID('c7041e77-2809-4cfa-a22f-f87788a299f8'), true);
    assert.strictEqual(isValidUUID('00000000-0000-0000-0000-000000000001'), true);
  });

  test('Invalid string rejected by isValidUUID', () => {
    assert.strictEqual(isValidUUID('tenant_mohit_sharma'), false);
    assert.strictEqual(isValidUUID('TENANT-1001'), false);
    assert.strictEqual(isValidUUID(null), false);
    assert.strictEqual(isValidUUID(''), false);
    assert.strictEqual(isValidUUID("'; DROP TABLE users;--"), false);
  });

  test('Generated UUID conforms to RFC 4122 v4', () => {
    const id = generateUUID();
    assert.strictEqual(isValidUUID(id), true);
  });

  // ==========================================================================
  // Suite 2: Codebase Credential Leak Prevention [STATIC SPECIFICATION]
  // ==========================================================================
  console.log('\n--- Suite 2: Codebase Credential Leak Prevention [STATIC SPECIFICATION] ---');
  test('auth.service.ts contains NO hardcoded admin/merchant passwords', () => {
    const authCode = fs.readFileSync(path.resolve(__dirname, '../src/services/auth.service.ts'), 'utf8');
    assert.strictEqual(authCode.includes('Mohit@#1424'), false, 'Security Error: Found plaintext Mohit@#1424 in auth service!');
    assert.strictEqual(authCode.includes('Merchant@#1424'), false, 'Security Error: Found plaintext Merchant@#1424 in auth service!');
    assert.strictEqual(authCode.includes('COURRIER3_REGISTERED_USERS'), false, 'Security Error: Found plaintext user store in auth service!');
  });

  test('auth.service.ts enforces native Supabase Auth methods', () => {
    const authCode = fs.readFileSync(path.resolve(__dirname, '../src/services/auth.service.ts'), 'utf8');
    assert.strictEqual(authCode.includes('supabase.auth.signInWithPassword'), true);
    assert.strictEqual(authCode.includes('supabase.auth.signUp'), true);
    assert.strictEqual(authCode.includes('supabase.auth.signOut'), true);
  });

  // ==========================================================================
  // Suite 3: Migration 004 DDL & RLS Hardening [STATIC SPECIFICATION]
  // ==========================================================================
  console.log('\n--- Suite 3: Migration 004 DDL & RLS Hardening [STATIC SPECIFICATION] ---');
  test('004_secure_identity_foundation.sql eliminates demo fallback in get_auth_tenant_id', () => {
    const mig004 = fs.readFileSync(path.resolve(__dirname, '../supabase/migrations/004_secure_identity_foundation.sql'), 'utf8');
    const funcMatch = mig004.match(/CREATE OR REPLACE FUNCTION public\.get_auth_tenant_id\(\)[\s\S]*?\$\$ LANGUAGE plpgsql/);
    assert(funcMatch, 'Could not find get_auth_tenant_id() in migration 004');
    assert.strictEqual(
      funcMatch[0].includes('00000000-0000-0000-0000-000000000001'),
      false,
      'Security Error: get_auth_tenant_id() still contains hardcoded demo tenant UUID!'
    );
    assert(mig004.includes('IF auth.uid() IS NULL THEN'), 'Must fail closed when unauthenticated');
    assert(mig004.includes('GRANT EXECUTE ON FUNCTION public.get_auth_tenant_id() TO anon, authenticated, service_role;'), 'Must grant execute so RLS evaluates cleanly');
  });

  test('004 get_auth_tenant_id verifies authoritative db tenant and rejects mismatched JWT claims', () => {
    const mig004 = fs.readFileSync(path.resolve(__dirname, '../supabase/migrations/004_secure_identity_foundation.sql'), 'utf8');
    assert(mig004.includes('SELECT u.tenant_id INTO v_db_tenant_id'), 'Must query authoritative tenant from public.users');
    assert(mig004.includes('IF v_db_tenant_id IS NULL THEN'), 'Must fail closed if db tenant mapping is missing');
    assert(mig004.includes('v_jwt_tenant_id <> v_db_tenant_id'), 'Must check for JWT claim mismatch');
    assert(mig004.includes('SET search_path = pg_catalog, public'), 'Must pin search path');
    assert.strictEqual(mig004.includes("-> 'user_metadata'"), false, 'Must NEVER inspect client-modifiable user_metadata');
  });

  test('004 migration enforces strict tenant provisioning atomicity (NO skipped insert)', () => {
    const mig004 = fs.readFileSync(path.resolve(__dirname, '../supabase/migrations/004_secure_identity_foundation.sql'), 'utf8');
    const insertUsersMatch = mig004.match(/INSERT INTO public\.users[\s\S]*?RETURNING id INTO new_user_id;/);
    assert(insertUsersMatch, 'Could not find INSERT INTO public.users in migration 004');
    assert.strictEqual(
      insertUsersMatch[0].includes('ON CONFLICT'),
      false,
      'Atomicity Violation: INSERT INTO public.users must NOT use ON CONFLICT DO NOTHING!'
    );
    assert(mig004.includes('IF new_user_id IS NULL THEN'), 'Must assert new_user_id is not null');
  });

  test('004 migration trigger validates wallet structural integrity and checks for pre-existing non-zero balance', () => {
    const mig004 = fs.readFileSync(path.resolve(__dirname, '../supabase/migrations/004_secure_identity_foundation.sql'), 'utf8');
    assert(mig004.includes('ON CONFLICT (tenant_id) DO NOTHING;'), 'Must use ON CONFLICT DO NOTHING');
    assert(mig004.includes('v_wallet_record.available_balance_minor <> 0'), 'Must verify zero initial balance for new tenant');
    assert(mig004.includes('v_wallet_record.currency <> \'INR\''), 'Must verify currency INR');
    assert(mig004.includes('v_wallet_record.available_balance_minor < 0'), 'Must verify non-negative balance for existing tenant');
  });

  test('004 migration trigger prevents email collision & account takeover for both NULL and different auth_user_id', () => {
    const mig004 = fs.readFileSync(path.resolve(__dirname, '../supabase/migrations/004_secure_identity_foundation.sql'), 'utf8');
    assert(mig004.includes('SELECT id INTO v_conflicting_user_id'), 'Must query conflicting user id on lower(email)');
    assert(mig004.includes('WHERE lower(email) = v_email'), 'Must enforce case-insensitive email matching');
    assert(mig004.includes('IF v_conflicting_user_id IS NOT NULL THEN'), 'Must reject if any existing profile matches email');
    assert(mig004.includes("USING ERRCODE = 'unique_violation'"), 'Must specify unique_violation error code to abort transaction');
  });

  test('004 migration RLS policies allow profile self-read and tenant self-update', () => {
    const mig004 = fs.readFileSync(path.resolve(__dirname, '../supabase/migrations/004_secure_identity_foundation.sql'), 'utf8');
    assert(mig004.includes('OR auth_user_id = auth.uid()'), 'users_select_policy must allow user to read own profile immediately');
    assert(mig004.includes('tenant_update_policy ON tenants'), 'Must configure tenant_update_policy');
    assert(mig004.includes('WITH CHECK (id = get_auth_tenant_id())'), 'tenant_update_policy must prevent modifying other tenants');
  });

  // ==========================================================================
  // Suite 4: In-Memory Database State Machine Simulation [RUNTIME SIMULATION]
  // ==========================================================================
  console.log('\n--- Suite 4: State Machine Simulation [RUNTIME IN-MEMORY SIMULATION] ---');

  interface MockTenant { id: string; company_name: string; status: string; }
  interface MockUser { id: string; tenant_id: string; auth_user_id: string | null; email: string; role: string; }
  interface MockWallet { id: string; tenant_id: string; currency: string; available_balance_minor: number; reserved_balance_minor: number; status: string; version: number; }
  interface MockAuthUser { id: string; email: string; raw_user_meta_data?: any; raw_app_meta_data?: any; }

  class MockDatabaseState {
    tenants: MockTenant[] = [];
    users: MockUser[] = [];
    wallets: MockWallet[] = [];
    authUsers: MockAuthUser[] = [];

    // Simulates get_auth_tenant_id() logic
    simulateGetAuthTenantId(callerAuthUid: string | null, jwtAppMetaTenantId?: string | null): string | null {
      // 1. Unauthenticated -> return null
      if (!callerAuthUid) return null;

      // 2. Query authoritative db tenant
      const dbUser = this.users.find((u) => u.auth_user_id === callerAuthUid);
      if (!dbUser || !dbUser.tenant_id) return null;

      const v_db_tenant_id = dbUser.tenant_id;

      // 3. Extract JWT tenant claim
      const v_jwt_tenant_id = jwtAppMetaTenantId && isValidUUID(jwtAppMetaTenantId) ? jwtAppMetaTenantId : null;

      // 4. Mismatch check: if JWT has claim, it MUST match db
      if (v_jwt_tenant_id && v_jwt_tenant_id !== v_db_tenant_id) {
        return null; // Mismatch rejected!
      }

      return v_db_tenant_id;
    }

    // Replicates handle_new_auth_user() PL/pgSQL logic atomically
    simulateHandleNewAuthUser(newAuthUser: MockAuthUser): { success: boolean; error?: string } {
      const snapshot = {
        tenants: [...this.tenants],
        users: [...this.users],
        wallets: [...this.wallets],
        authUserMeta: newAuthUser.raw_app_meta_data ? { ...newAuthUser.raw_app_meta_data } : {},
      };

      try {
        const v_email = (newAuthUser.email || `${newAuthUser.id}@skyonship.local`).trim().toLowerCase().slice(0, 255);
        const v_business_name = (newAuthUser.raw_user_meta_data?.business_name || 'My Logistics Hub').trim().slice(0, 255) || 'My Logistics Hub';
        const v_full_name = (newAuthUser.raw_user_meta_data?.full_name || v_email.split('@')[0] || 'Merchant Admin').trim().slice(0, 255);

        // STEP 1: Idempotency Check (authoritative mapping exists)
        const existingUser = this.users.find((u) => u.auth_user_id === newAuthUser.id);
        if (existingUser) {
          const v_existing_tenant_id = existingUser.tenant_id;
          if (!v_existing_tenant_id) {
            throw new Error(`Corrupt profile detected: tenant_id is NULL for auth_user_id ${newAuthUser.id}`);
          }
          // Self-heal wallet if missing, NEVER reset balance
          let existingWallet = this.wallets.find((w) => w.tenant_id === v_existing_tenant_id);
          if (!existingWallet) {
            existingWallet = {
              id: generateUUID(),
              tenant_id: v_existing_tenant_id,
              currency: 'INR',
              available_balance_minor: 0,
              reserved_balance_minor: 0,
              status: 'ACTIVE',
              version: 1,
            };
            this.wallets.push(existingWallet);
          }

          // Validate existing wallet structural integrity
          if (existingWallet.currency !== 'INR' || existingWallet.available_balance_minor < 0 || existingWallet.reserved_balance_minor < 0) {
            throw new Error('Wallet integrity violation: invalid wallet state for existing tenant');
          }

          newAuthUser.raw_app_meta_data = {
            ...(newAuthUser.raw_app_meta_data || {}),
            tenant_id: v_existing_tenant_id,
            role: 'MERCHANT_ADMIN',
          };
          return { success: true };
        }

        // STEP 2: Anti-Account-Takeover / Email Collision Safety
        const conflictingUser = this.users.find((u) => u.email.toLowerCase() === v_email);
        if (conflictingUser) {
          throw new Error(`unique_violation: A user profile with email "${v_email}" already exists (user_id: ${conflictingUser.id}). Registration rejected.`);
        }

        // STEP 3: Provision New Tenant
        const new_tenant_id = generateUUID();
        this.tenants.push({
          id: new_tenant_id,
          company_name: v_business_name,
          status: 'ACTIVE',
        });

        // STEP 4: Provision User Profile (STRICT ATOMICITY)
        const new_user_id = generateUUID();
        if (this.users.some((u) => u.auth_user_id === newAuthUser.id || u.email.toLowerCase() === v_email)) {
          throw new Error('unique_violation on public.users');
        }
        this.users.push({
          id: new_user_id,
          tenant_id: new_tenant_id,
          auth_user_id: newAuthUser.id,
          email: v_email,
          role: 'MERCHANT_ADMIN',
        });

        // STEP 5: Provision Empty Wallet
        const newWallet: MockWallet = {
          id: generateUUID(),
          tenant_id: new_tenant_id,
          currency: 'INR',
          available_balance_minor: 0,
          reserved_balance_minor: 0,
          status: 'ACTIVE',
          version: 1,
        };
        this.wallets.push(newWallet);

        // Wallet Conflict Validation for newly provisioned tenant
        if (newWallet.available_balance_minor !== 0 || newWallet.reserved_balance_minor !== 0 || newWallet.currency !== 'INR') {
          throw new Error('Wallet conflict violation: pre-existing non-zero balance detected for new tenant');
        }

        // STEP 6: Set app_metadata
        newAuthUser.raw_app_meta_data = {
          ...(newAuthUser.raw_app_meta_data || {}),
          tenant_id: new_tenant_id,
          role: 'MERCHANT_ADMIN',
        };

        return { success: true };
      } catch (err: any) {
        this.tenants = snapshot.tenants;
        this.users = snapshot.users;
        this.wallets = snapshot.wallets;
        newAuthUser.raw_app_meta_data = snapshot.authUserMeta;
        return { success: false, error: err.message };
      }
    }
  }

  // --- Tests for get_auth_tenant_id() ---
  test('Simulated get_auth_tenant_id: Returns NULL for unauthenticated caller', () => {
    const db = new MockDatabaseState();
    assert.strictEqual(db.simulateGetAuthTenantId(null), null);
  });

  test('Simulated get_auth_tenant_id: Returns NULL when user has no public.users row (unprovisioned)', () => {
    const db = new MockDatabaseState();
    const unmappedAuthId = generateUUID();
    assert.strictEqual(db.simulateGetAuthTenantId(unmappedAuthId), null);
  });

  test('Simulated get_auth_tenant_id: REJECTS stale / mismatched JWT tenant claim', () => {
    const db = new MockDatabaseState();
    const authId = generateUUID();
    const authoritativeTenant = generateUUID();
    const forgedTenant = generateUUID();

    db.users.push({ id: generateUUID(), tenant_id: authoritativeTenant, auth_user_id: authId, email: 'user@test.com', role: 'MERCHANT_ADMIN' });

    // JWT claim has forged / stale tenant ID
    const resolved = db.simulateGetAuthTenantId(authId, forgedTenant);
    assert.strictEqual(resolved, null, 'Security Violation: Must reject mismatched JWT claim!');
  });

  test('Simulated get_auth_tenant_id: Accepts matching JWT claim or absent claim', () => {
    const db = new MockDatabaseState();
    const authId = generateUUID();
    const authoritativeTenant = generateUUID();

    db.users.push({ id: generateUUID(), tenant_id: authoritativeTenant, auth_user_id: authId, email: 'user@test.com', role: 'MERCHANT_ADMIN' });

    // 1. With matching JWT claim
    assert.strictEqual(db.simulateGetAuthTenantId(authId, authoritativeTenant), authoritativeTenant);
    // 2. With absent JWT claim (first login / signup before refresh)
    assert.strictEqual(db.simulateGetAuthTenantId(authId, null), authoritativeTenant);
  });

  // --- Tests for handle_new_auth_user() ---
  test('Simulated Trigger: Fresh signup provisions tenant, user, ₹0 wallet and metadata', () => {
    const db = new MockDatabaseState();
    const userA: MockAuthUser = {
      id: generateUUID(),
      email: 'merchant.a@acme.com',
      raw_user_meta_data: { business_name: 'Acme Logistics' },
    };
    const res = db.simulateHandleNewAuthUser(userA);
    assert.strictEqual(res.success, true);
    assert.strictEqual(db.tenants.length, 1);
    assert.strictEqual(db.users.length, 1);
    assert.strictEqual(db.wallets.length, 1);
    assert.strictEqual(db.wallets[0].available_balance_minor, 0);
    assert.strictEqual(db.users[0].tenant_id, db.tenants[0].id);
    assert.strictEqual(userA.raw_app_meta_data?.tenant_id, db.tenants[0].id);
  });

  test('Simulated Trigger: Retry does NOT create duplicate tenant and preserves non-zero wallet', () => {
    const db = new MockDatabaseState();
    const userA: MockAuthUser = { id: generateUUID(), email: 'merchant.a@acme.com' };
    db.simulateHandleNewAuthUser(userA);
    const originalTenantId = db.tenants[0].id;

    // Simulate recharge of ₹25,000.00 (2,500,000 paise)
    db.wallets[0].available_balance_minor = 2500000;

    const retryRes = db.simulateHandleNewAuthUser(userA);
    assert.strictEqual(retryRes.success, true);
    assert.strictEqual(db.tenants.length, 1, 'Must NOT create a duplicate second tenant!');
    assert.strictEqual(db.wallets[0].available_balance_minor, 2500000, 'Non-zero balance must be preserved!');
    assert.strictEqual(db.tenants[0].id, originalTenantId);
  });

  test('Simulated Trigger: Self-heals missing wallet for existing user with validation', () => {
    const db = new MockDatabaseState();
    const tenantId = generateUUID();
    const authId = generateUUID();
    db.tenants.push({ id: tenantId, company_name: 'Existing Tenant', status: 'ACTIVE' });
    db.users.push({ id: generateUUID(), tenant_id: tenantId, auth_user_id: authId, email: 'existing@test.com', role: 'MERCHANT_ADMIN' });

    const user: MockAuthUser = { id: authId, email: 'existing@test.com' };
    const res = db.simulateHandleNewAuthUser(user);
    assert.strictEqual(res.success, true);
    assert.strictEqual(db.tenants.length, 1);
    assert.strictEqual(db.wallets.length, 1, 'Must self-heal wallet');
    assert.strictEqual(db.wallets[0].tenant_id, tenantId);
    assert.strictEqual(db.wallets[0].available_balance_minor, 0);
  });

  test('Simulated Trigger: Email collision with different auth_user_id rolls back without orphan tenant', () => {
    const db = new MockDatabaseState();
    const userA: MockAuthUser = { id: generateUUID(), email: 'victim@company.com' };
    db.simulateHandleNewAuthUser(userA);
    assert.strictEqual(db.tenants.length, 1);

    const attacker: MockAuthUser = { id: generateUUID(), email: 'VICTIM@company.com' };
    const res = db.simulateHandleNewAuthUser(attacker);

    assert.strictEqual(res.success, false);
    assert(res.error?.includes('unique_violation'));
    assert.strictEqual(db.tenants.length, 1, 'No orphan tenant');
    assert.strictEqual(db.users[0].auth_user_id, userA.id, 'Original ownership preserved');
    assert.strictEqual(attacker.raw_app_meta_data?.tenant_id, undefined);
  });

  test('Simulated Trigger: Email collision with unlinked profile (auth_user_id IS NULL) rejected without linking', () => {
    const db = new MockDatabaseState();
    const invitedTenantId = generateUUID();
    db.tenants.push({ id: invitedTenantId, company_name: 'Invited Org', status: 'ACTIVE' });
    db.users.push({
      id: generateUUID(),
      tenant_id: invitedTenantId,
      auth_user_id: null,
      email: 'invited.employee@org.com',
      role: 'OPS_USER',
    });

    const impostor: MockAuthUser = { id: generateUUID(), email: 'invited.employee@org.com' };
    const res = db.simulateHandleNewAuthUser(impostor);

    assert.strictEqual(res.success, false);
    assert(res.error?.includes('unique_violation'));
    assert.strictEqual(db.tenants.length, 1);
    assert.strictEqual(db.users[0].auth_user_id, null, 'Must not link unverified user');
  });

  // ==========================================================================
  // Suite 5: Cross-Tenant Isolation in Customer Services [RUNTIME]
  // ==========================================================================
  console.log('\n--- Suite 5: Cross-Tenant Isolation in Customer Services [RUNTIME] ---');
  test('CustomerShipmentService strictly isolates records between tenants', () => {
    const tenantA = 'a1111111-1111-4111-a111-111111111111';
    const tenantB = 'b2222222-2222-4222-b222-222222222222';

    const newShipment: CustomerShipmentDetail = {
      id: 'shp-tenant-b-test',
      shipmentId: 'SHP-TENANT-B-999',
      tenantId: tenantB,
      orderId: 'ORD-TENANT-B-999',
      awbNumber: 'AWB-SECRET-999',
      bookingDate: '2026-10-14 10:00 AM',
      courierId: 'delhivery',
      courierName: 'Delhivery Surface',
      serviceName: 'Standard',
      mode: 'B2C',
      pickupContact: 'Warehouse B',
      pickupPhone: '9876543210',
      pickupAddress: 'Address B',
      pickupCity: 'Mumbai',
      pickupPincode: '400001',
      deliveryContact: 'Customer B',
      deliveryPhone: '9123456780',
      deliveryEmail: 'customerB@gmail.com',
      deliveryAddress: 'Destination B',
      deliveryCity: 'Delhi',
      deliveryPincode: '110001',
      actualWeightKg: 1.0,
      chargeableWeightKg: 1.0,
      dimensionsCm: '10 × 10 × 10 CM',
      invoiceValueINR: 2500,
      paymentMode: 'PREPAID',
      codAmountINR: 0,
      baseFreightINR: 80,
      fuelSurchargeINR: 10,
      codFeeINR: 0,
      totalCustomerChargeINR: 95,
      bookingStatus: 'BOOKING_CONFIRMED',
      customerFacingStatus: 'Booked',
      routingHistory: [],
    };

    CustomerShipmentService.addShipmentRecord(newShipment);

    // Tenant A queries for Tenant B's shipment ID
    const queryByTenantA = CustomerShipmentService.getShipmentById(newShipment.shipmentId, tenantA);
    assert.strictEqual(queryByTenantA, null, 'Security Violation: Tenant A was able to read Tenant B shipment!');

    // Tenant A queries for Tenant B's AWB number
    const queryAwbByTenantA = CustomerShipmentService.getShipmentById('AWB-SECRET-999', tenantA);
    assert.strictEqual(queryAwbByTenantA, null, 'Security Violation: Tenant A was able to read Tenant B shipment by AWB!');

    // Tenant B queries for their own shipment
    const queryByTenantB = CustomerShipmentService.getShipmentById(newShipment.shipmentId, tenantB);
    assert(queryByTenantB !== null, 'Tenant B should be able to read their own shipment');
    assert.strictEqual(queryByTenantB?.orderId, 'ORD-TENANT-B-999');
  });

  // ==========================================================================
  // Suite 6: Shypfy Integration Non-Regression [RUNTIME]
  // ==========================================================================
  console.log('\n--- Suite 6: Shypfy Integration Non-Regression [RUNTIME] ---');
  test('Shypfy payload builder executes cleanly without regression', () => {
    const input = {
      order_id: 'ORD-REG-101',
      originPincode: '134113',
      pickup_location: 'test',
      pickupAddress: 'Panchkula Phase 1',
      pickupContactName: 'Test Contact',
      pickupPhone: '9876543210',
      pickupCity: 'Panchkula',
      deliveryContactName: 'Recipient',
      deliveryPhone: '9876543211',
      deliveryAddress: 'Baddi Barotiwala',
      deliveryCity: 'Barotiwala',
      deliveryState: 'Himachal Pradesh',
      destinationPincode: '173205',
      payment_mode: 'Prepaid',
      sellingPriceINR: 750,
      weight: 1.5,
      length: 15,
      width: 15,
      height: 15,
    };
    const payload = buildShypfyShipmentPayload(input);
    assert.strictEqual(payload.order_number, 'ORD-REG-101');
    assert.strictEqual(payload.weight, 1500);
    assert.strictEqual(payload.pickup_location.name, 'DIVYANSH ENTERPRISES');
    assert.strictEqual(payload.drop_location.pin, 173205);
  });

  console.log('\n====================================================================');
  console.log(`📊 PHASE 1 TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase1SecurityTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
