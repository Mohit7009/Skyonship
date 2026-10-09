-- ============================================================================
-- SKYONSHIP LOGISTICS PORTAL — SUPABASE ROW-LEVEL SECURITY (RLS) POLICIES
-- Migration: 002_rls_policies.sql
-- Description: Defense-in-depth customer tenant isolation policies, 
--              immutable wallet ledger rules, and security helper functions.
-- Security Rule: Disallows broad public access. Enforces tenant boundaries.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. HELPER FUNCTION: Extract Verified Tenant ID from JWT
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_auth_tenant_id()
RETURNS UUID AS $$
BEGIN
    RETURN (NULLIF(current_setting('request.jwt.claims', true)::json -> 'app_metadata' ->> 'tenant_id', ''))::uuid;
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- 2. ENABLE ROW-LEVEL SECURITY ON ALL CUSTOMER-OWNED TABLES
-- ----------------------------------------------------------------------------
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipment_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE cod_remittances ENABLE ROW LEVEL SECURITY;
ALTER TABLE cod_receivables ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE ndr_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE rto_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 3. TENANTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY tenant_select_policy ON tenants
    FOR SELECT
    USING (id = get_auth_tenant_id());

-- ----------------------------------------------------------------------------
-- 4. USERS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY users_tenant_isolation_policy ON users
    FOR ALL
    USING (tenant_id = get_auth_tenant_id())
    WITH CHECK (tenant_id = get_auth_tenant_id());

-- ----------------------------------------------------------------------------
-- 5. WAREHOUSES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY warehouses_tenant_isolation_policy ON warehouses
    FOR ALL
    USING (tenant_id = get_auth_tenant_id())
    WITH CHECK (tenant_id = get_auth_tenant_id());

-- ----------------------------------------------------------------------------
-- 6. WALLETS POLICIES (Read-only for merchant users; updates via DB functions)
-- ----------------------------------------------------------------------------
CREATE POLICY wallets_select_policy ON wallets
    FOR SELECT
    USING (tenant_id = get_auth_tenant_id());

-- ----------------------------------------------------------------------------
-- 7. WALLET TRANSACTIONS POLICIES (IMMUTABLE LEDGER: SELECT & INSERT ONLY)
-- ----------------------------------------------------------------------------
-- Read transaction entries owned by authenticated user's tenant
CREATE POLICY wallet_tx_select_policy ON wallet_transactions
    FOR SELECT
    USING (tenant_id = get_auth_tenant_id());

-- Insert ledger entries owned by authenticated user's tenant
CREATE POLICY wallet_tx_insert_policy ON wallet_transactions
    FOR INSERT
    WITH CHECK (tenant_id = get_auth_tenant_id());

-- NOTE: NO UPDATE OR DELETE POLICIES ARE CREATED FOR WALLET TRANSACTIONS.
-- Ledger entries are strictly IMMUTABLE for customer/merchant roles.

-- ----------------------------------------------------------------------------
-- 8. SHIPMENTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY shipments_tenant_isolation_policy ON shipments
    FOR ALL
    USING (tenant_id = get_auth_tenant_id())
    WITH CHECK (tenant_id = get_auth_tenant_id());

-- ----------------------------------------------------------------------------
-- 9. SHIPMENT STATUS HISTORY POLICIES (SELECT & INSERT ONLY)
-- ----------------------------------------------------------------------------
CREATE POLICY shipment_history_select_policy ON shipment_status_history
    FOR SELECT
    USING (tenant_id = get_auth_tenant_id());

CREATE POLICY shipment_history_insert_policy ON shipment_status_history
    FOR INSERT
    WITH CHECK (tenant_id = get_auth_tenant_id());

-- ----------------------------------------------------------------------------
-- 10. COD RECEIVABLES & REMITTANCES POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY cod_remittances_tenant_isolation_policy ON cod_remittances
    FOR ALL
    USING (tenant_id = get_auth_tenant_id())
    WITH CHECK (tenant_id = get_auth_tenant_id());

CREATE POLICY cod_receivables_tenant_isolation_policy ON cod_receivables
    FOR ALL
    USING (tenant_id = get_auth_tenant_id())
    WITH CHECK (tenant_id = get_auth_tenant_id());

-- ----------------------------------------------------------------------------
-- 11. PICKUP REQUESTS POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY pickups_tenant_isolation_policy ON pickup_requests
    FOR ALL
    USING (tenant_id = get_auth_tenant_id())
    WITH CHECK (tenant_id = get_auth_tenant_id());

-- ----------------------------------------------------------------------------
-- 12. NDR & RTO POLICIES
-- ----------------------------------------------------------------------------
CREATE POLICY ndr_tenant_isolation_policy ON ndr_records
    FOR ALL
    USING (tenant_id = get_auth_tenant_id())
    WITH CHECK (tenant_id = get_auth_tenant_id());

CREATE POLICY rto_tenant_isolation_policy ON rto_records
    FOR ALL
    USING (tenant_id = get_auth_tenant_id())
    WITH CHECK (tenant_id = get_auth_tenant_id());

-- ----------------------------------------------------------------------------
-- 13. AUDIT LOGS POLICIES (SELECT & INSERT ONLY)
-- ----------------------------------------------------------------------------
CREATE POLICY audit_logs_select_policy ON audit_logs
    FOR SELECT
    USING (tenant_id = get_auth_tenant_id());

CREATE POLICY audit_logs_insert_policy ON audit_logs
    FOR INSERT
    WITH CHECK (tenant_id = get_auth_tenant_id());
