-- ============================================================================
-- SKYONSHIP LOGISTICS PORTAL — SUPABASE POSTGRESQL SCHEMA MIGRATION
-- Migration: 001_initial_schema.sql
-- Description: Core DDL Tables, Enums, Foreign Keys, Unique Idempotency Keys, 
--              Minor-unit Currency Ledgers, and Performance Indexes.
-- Financial Safety: Default wallet balance initialized to 0 (₹0.00).
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- 1. ENUM TYPES
-- ----------------------------------------------------------------------------
CREATE TYPE tenant_status AS ENUM ('ACTIVE', 'SUSPENDED', 'PENDING_KYC');
CREATE TYPE user_role AS ENUM ('MERCHANT_ADMIN', 'OPS_USER', 'FINANCE_USER', 'SUPER_ADMIN');

CREATE TYPE wallet_status AS ENUM ('ACTIVE', 'LOW_BALANCE', 'SUSPENDED');
CREATE TYPE transaction_type AS ENUM (
    'RECHARGE', 
    'SHIPMENT_CHARGE', 
    'REFUND', 
    'ADJUSTMENT', 
    'RESERVATION', 
    'RESERVATION_RELEASE'
);
CREATE TYPE transaction_direction AS ENUM ('CREDIT', 'DEBIT');
CREATE TYPE transaction_status AS ENUM ('POSTED', 'PENDING', 'FAILED', 'REVERSED');

CREATE TYPE shipment_mode AS ENUM ('B2C', 'B2B');
CREATE TYPE payment_mode AS ENUM ('PREPAID', 'COD');
CREATE TYPE internal_shipment_status AS ENUM (
    'DRAFT',
    'PENDING_RESERVATION',
    'BOOKING_CONFIRMED',
    'PENDING_API',
    'API_PROCESSING',
    'API_FAILED',
    'AWB_ASSIGNED',
    'PICKUP_REQUESTED',
    'PICKED_UP',
    'IN_TRANSIT',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'NDR',
    'RTO_INITIATED',
    'RTO_IN_TRANSIT',
    'RTO_DELIVERED',
    'CANCELLED',
    'CANCEL_REQUESTED',
    'PENDING_VERIFICATION'
);

CREATE TYPE pickup_status AS ENUM ('REQUESTED', 'SCHEDULED', 'PICKED_UP', 'CANCELLED', 'FAILED');
CREATE TYPE ndr_status AS ENUM ('OPEN', 'CUSTOMER_ACTION_REQUIRED', 'REATTEMPT_REQUESTED', 'REATTEMPT_SCHEDULED', 'RESOLVED', 'RTO_INITIATED', 'CLOSED');
CREATE TYPE rto_status AS ENUM ('RTO_INITIATED', 'RTO_IN_TRANSIT', 'RTO_DELIVERED');

CREATE TYPE cod_receivable_status AS ENUM ('NOT_ELIGIBLE', 'ELIGIBLE', 'PROCESSING', 'REMITTED', 'ON_HOLD', 'MISMATCH');
CREATE TYPE cod_remittance_status AS ENUM ('DRAFT', 'PROCESSING', 'COMPLETED', 'FAILED', 'ON_HOLD', 'CANCELLED');
CREATE TYPE early_cod_plan_type AS ENUM ('STANDARD_T7', 'EARLY_T2', 'INSTANT_T0');
CREATE TYPE payout_destination_type AS ENUM ('BANK', 'WALLET');

-- ----------------------------------------------------------------------------
-- 2. TENANTS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_name VARCHAR(255) NOT NULL,
    brand_logo_url TEXT,
    gst_number VARCHAR(20),
    status tenant_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 3. USER PROFILES TABLE (Linked to Supabase auth.users)
-- ----------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(30),
    role user_role NOT NULL DEFAULT 'MERCHANT_ADMIN',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_auth_user_id ON users(auth_user_id);

-- ----------------------------------------------------------------------------
-- 4. WAREHOUSES TABLE (Pickup Hubs)
-- ----------------------------------------------------------------------------
CREATE TABLE warehouses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    address_line1 TEXT NOT NULL,
    address_line2 TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_warehouses_tenant_id ON warehouses(tenant_id);

-- ----------------------------------------------------------------------------
-- 5. WALLETS TABLE (Integer Minor Units in Paise — Zero Initial Balance)
-- ----------------------------------------------------------------------------
CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL UNIQUE REFERENCES tenants(id) ON DELETE CASCADE,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    available_balance_minor BIGINT NOT NULL DEFAULT 0 CHECK (available_balance_minor >= 0),
    reserved_balance_minor BIGINT NOT NULL DEFAULT 0 CHECK (reserved_balance_minor >= 0),
    total_spent_minor BIGINT NOT NULL DEFAULT 0 CHECK (total_spent_minor >= 0),
    total_refunded_minor BIGINT NOT NULL DEFAULT 0 CHECK (total_refunded_minor >= 0),
    low_balance_threshold_minor BIGINT NOT NULL DEFAULT 50000 CHECK (low_balance_threshold_minor >= 0), -- ₹500.00
    status wallet_status NOT NULL DEFAULT 'ACTIVE',
    version INTEGER NOT NULL DEFAULT 1, -- Optimistic concurrency control
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wallets_tenant_id ON wallets(tenant_id);

-- ----------------------------------------------------------------------------
-- 6. WALLET TRANSACTIONS TABLE (Immutable Financial Audit Ledger)
-- ----------------------------------------------------------------------------
CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    direction transaction_direction NOT NULL,
    amount_minor BIGINT NOT NULL CHECK (amount_minor > 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    reference_type VARCHAR(50) NOT NULL, -- 'SHIPMENT', 'RECHARGE', 'RESERVATION', etc.
    reference_id VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    balance_before_minor BIGINT NOT NULL,
    balance_after_minor BIGINT NOT NULL,
    status transaction_status NOT NULL DEFAULT 'POSTED',
    idempotency_key VARCHAR(255) NOT NULL UNIQUE, -- Double-debit protection guard
    actor_type VARCHAR(20) DEFAULT 'SYSTEM',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wallet_tx_tenant_id ON wallet_transactions(tenant_id);
CREATE INDEX idx_wallet_tx_wallet_id ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_tx_reference ON wallet_transactions(reference_type, reference_id);

-- ----------------------------------------------------------------------------
-- 7. SHIPMENTS TABLE (Single Source of Truth for Orders)
-- ----------------------------------------------------------------------------
CREATE TABLE shipments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    shipment_number VARCHAR(100) NOT NULL UNIQUE,
    booking_reference_id VARCHAR(255) NOT NULL UNIQUE, -- Client idempotency key
    order_id VARCHAR(100) NOT NULL,
    awb_number VARCHAR(100),
    courier_id VARCHAR(100) NOT NULL,
    courier_name VARCHAR(100) NOT NULL,
    service_name VARCHAR(100) DEFAULT 'Standard',
    mode shipment_mode NOT NULL DEFAULT 'B2C',
    
    -- Pickup Details
    pickup_warehouse_id UUID REFERENCES warehouses(id) ON DELETE SET NULL,
    pickup_contact VARCHAR(255) NOT NULL,
    pickup_phone VARCHAR(30) NOT NULL,
    pickup_address TEXT NOT NULL,
    pickup_city VARCHAR(100) NOT NULL,
    pickup_pincode VARCHAR(10) NOT NULL,

    -- Delivery Details
    delivery_contact VARCHAR(255) NOT NULL,
    delivery_phone VARCHAR(30) NOT NULL,
    delivery_email VARCHAR(255),
    delivery_address TEXT NOT NULL,
    delivery_city VARCHAR(100) NOT NULL,
    delivery_pincode VARCHAR(10) NOT NULL,

    -- Physical Package Metrics
    actual_weight_kg NUMERIC(8,2) NOT NULL CHECK (actual_weight_kg > 0),
    chargeable_weight_kg NUMERIC(8,2) NOT NULL CHECK (chargeable_weight_kg > 0),
    dimensions_cm VARCHAR(50),
    invoice_value_inr NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    invoice_number VARCHAR(100),

    -- Financial Charges
    payment_mode payment_mode NOT NULL DEFAULT 'PREPAID',
    cod_amount_inr NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    base_freight_inr NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    fuel_surcharge_inr NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    cod_fee_inr NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    total_customer_charge_inr NUMERIC(12,2) NOT NULL DEFAULT 0.00,

    -- Status & Label
    booking_status internal_shipment_status NOT NULL DEFAULT 'DRAFT',
    customer_facing_status VARCHAR(100) NOT NULL DEFAULT 'Booking Confirmed',
    tracking_status VARCHAR(100) NOT NULL DEFAULT 'Booked',
    label_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shipments_tenant_id ON shipments(tenant_id);
CREATE INDEX idx_shipments_awb_number ON shipments(awb_number);
CREATE INDEX idx_shipments_order_id ON shipments(order_id);
CREATE INDEX idx_shipments_booking_status ON shipments(booking_status);

-- ----------------------------------------------------------------------------
-- 8. SHIPMENT STATUS HISTORY TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE shipment_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    old_status internal_shipment_status NOT NULL,
    new_status internal_shipment_status NOT NULL,
    source VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    reason TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_shipment_history_shipment ON shipment_status_history(shipment_id);

-- ----------------------------------------------------------------------------
-- 9. COD RECEIVABLES & REMITTANCES TABLES
-- ----------------------------------------------------------------------------
CREATE TABLE cod_remittances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    remittance_id VARCHAR(100) NOT NULL UNIQUE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    courier_id VARCHAR(100),
    shipment_count INTEGER NOT NULL CHECK (shipment_count > 0),
    gross_cod_amount_inr NUMERIC(12,2) NOT NULL,
    deductions_inr NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    early_fee_inr NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    net_remittance_inr NUMERIC(12,2) NOT NULL,
    status cod_remittance_status NOT NULL DEFAULT 'PROCESSING',
    payout_type early_cod_plan_type NOT NULL DEFAULT 'STANDARD_T7',
    payout_destination payout_destination_type NOT NULL DEFAULT 'BANK',
    bank_reference_utr VARCHAR(100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_cod_remittances_tenant ON cod_remittances(tenant_id);

CREATE TABLE cod_receivables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    shipment_id UUID NOT NULL UNIQUE REFERENCES shipments(id) ON DELETE CASCADE,
    order_id VARCHAR(100) NOT NULL,
    awb_number VARCHAR(100) NOT NULL,
    cod_amount_inr NUMERIC(12,2) NOT NULL,
    cod_fee_inr NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    net_eligible_inr NUMERIC(12,2) NOT NULL,
    status cod_receivable_status NOT NULL DEFAULT 'NOT_ELIGIBLE',
    delivered_at TIMESTAMPTZ,
    eligible_at TIMESTAMPTZ,
    remittance_id VARCHAR(100) REFERENCES cod_remittances(remittance_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cod_receivables_tenant ON cod_receivables(tenant_id);

-- ----------------------------------------------------------------------------
-- 10. PICKUP REQUESTS & EVENTS TABLES
-- ----------------------------------------------------------------------------
CREATE TABLE pickup_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pickup_number VARCHAR(100) NOT NULL UNIQUE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    warehouse_id UUID NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    courier_id VARCHAR(100) NOT NULL,
    courier_name VARCHAR(100) NOT NULL,
    shipment_count INTEGER NOT NULL CHECK (shipment_count > 0),
    total_weight_kg NUMERIC(8,2) NOT NULL,
    scheduled_date DATE NOT NULL,
    time_slot VARCHAR(100) NOT NULL,
    contact_person VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(30) NOT NULL,
    status pickup_status NOT NULL DEFAULT 'REQUESTED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_pickups_tenant ON pickup_requests(tenant_id);

-- ----------------------------------------------------------------------------
-- 11. NDR & RTO EXCEPTION RECORDS TABLES
-- ----------------------------------------------------------------------------
CREATE TABLE ndr_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ndr_id VARCHAR(100) NOT NULL UNIQUE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    awb_number VARCHAR(100) NOT NULL,
    courier_id VARCHAR(100) NOT NULL,
    courier_name VARCHAR(100) NOT NULL,
    recipient_name VARCHAR(255),
    recipient_phone VARCHAR(30),
    ndr_reason TEXT NOT NULL,
    attempt_number INTEGER NOT NULL DEFAULT 1,
    status ndr_status NOT NULL DEFAULT 'CUSTOMER_ACTION_REQUIRED',
    next_action TEXT,
    updated_address TEXT,
    updated_phone VARCHAR(30),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ndr_tenant ON ndr_records(tenant_id);
CREATE INDEX idx_ndr_shipment ON ndr_records(shipment_id);

CREATE TABLE rto_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rto_id VARCHAR(100) NOT NULL UNIQUE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    shipment_id UUID NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
    awb_number VARCHAR(100) NOT NULL,
    courier_id VARCHAR(100) NOT NULL,
    courier_name VARCHAR(100) NOT NULL,
    rto_reason TEXT NOT NULL,
    status rto_status NOT NULL DEFAULT 'RTO_INITIATED',
    rto_charge_inr NUMERIC(10,2) DEFAULT 0.00,
    initiated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_rto_tenant ON rto_records(tenant_id);
CREATE INDEX idx_rto_shipment ON rto_records(shipment_id);

-- ----------------------------------------------------------------------------
-- 12. AUDIT LOGS TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(100) NOT NULL,
    resource_id VARCHAR(255),
    metadata_json JSONB,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
