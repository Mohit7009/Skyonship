import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Users,
  Package,
  Truck,
  IndianRupee,
  Wallet,
  Sliders,
  Layers,
  BarChart2,
  Scale,
  Receipt,
  Bell,
  Warehouse,
  MapPin,
  FileCheck,
  Lock,
  FileText,
  KeyRound,
  Rocket,
  Building2,
} from 'lucide-react';
import { AppShell } from '../components/common/AppShell';
import type { NavGroupConfig } from '../components/common/Sidebar';
import { useRbac } from '../context/RbacContext';
import { useTenant } from '../context/TenantContext';

const BASE_ADMIN_NAV_GROUPS: NavGroupConfig[] = [
  {
    sectionLabel: 'OVERVIEW',
    items: [
      { label: 'Dashboard', path: '/admin', icon: ShieldCheck },
    ],
  },
  {
    sectionLabel: 'ACCESS CONTROL',
    items: [
      { label: 'Roles', path: '/admin/roles', icon: Lock },
      { label: 'Permissions Matrix', path: '/admin/permissions', icon: FileCheck },
      { label: 'User Access Logs', path: '/admin/access-logs', icon: FileText },
    ],
  },
  {
    sectionLabel: 'ACCOUNTS & USERS',
    items: [
      { label: 'Customers', path: '/admin/customers', icon: Users },
      { label: 'Onboarding Tracker', path: '/admin/onboarding', icon: Rocket },
      { label: 'Users & Roles', path: '/admin/roles', icon: Users },
    ],
  },
  {
    sectionLabel: 'OPERATIONS',
    items: [
      { label: 'Platform Shipments', path: '/admin/shipments', icon: Package },
      { label: 'NDR & RTO', path: '/admin/ndr', icon: Package, badge: 'Alerts' },
      { label: 'Weight Disputes', path: '/admin/weight-discrepancies', icon: Scale },
      { label: 'Customer Warehouses', path: '/admin/warehouses', icon: Warehouse },
    ],
  },
  {
    sectionLabel: 'RATE CARDS',
    items: [
      { label: 'B2B Rate Cards', path: '/admin/b2b-rates', icon: Layers },
      { label: 'B2C Rate Cards', path: '/admin/selling-rates', icon: Sliders },
      { label: 'Rate Preview', path: '/admin/rate-preview', icon: FileCheck },
    ],
  },
  {
    sectionLabel: 'PARTNERS & NETWORK',
    items: [
      { label: 'Courier Partners', path: '/admin/couriers', icon: Truck },
      { label: 'Courier Master', path: '/admin/couriers/master', icon: Truck },
      { label: 'Zones & Pincodes', path: '/admin/zones', icon: MapPin },
    ],
  },
  {
    sectionLabel: 'FINANCE',
    items: [
      { label: 'Customer Wallets', path: '/admin/customer-wallets', icon: Wallet },
      { label: 'COD Remittances', path: '/admin/cod/remittances', icon: IndianRupee },
      { label: 'GST Tax Invoices', path: '/admin/finance/gst-invoices', icon: Receipt },
    ],
  },
  {
    sectionLabel: 'SYSTEM & LOGS',
    items: [
      { label: 'Notification Center', path: '/admin/notifications', icon: Bell },
      { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart2 },
      { label: 'System Audit Logs', path: '/admin/audit-logs', icon: ShieldCheck },
    ],
  },
];

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { canAccessPath, currentRole, roles, setActiveRoleId } = useRbac();
  const { activeTenantId, activeTenant, tenants, setActiveTenantId } = useTenant();

  // Filter nav groups dynamically based on RBAC permissions
  const filteredNavGroups = BASE_ADMIN_NAV_GROUPS.map((group) => {
    const allowedItems = group.items.filter((item) => canAccessPath(item.path));
    return { ...group, items: allowedItems };
  }).filter((group) => group.items.length > 0);

  return (
    <div>
      {/* Top RBAC & Multi-Tenant Simulator Banner */}
      <div
        style={{
          backgroundColor: '#1e1b4b',
          color: '#ffffff',
          padding: '6px 16px',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          borderBottom: '1px solid #312e81',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <KeyRound size={14} style={{ color: '#a855f7' }} />
            <span>Role: <strong>{currentRole?.name}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderLeft: '1px solid #475569', paddingLeft: '16px' }}>
            <Building2 size={14} style={{ color: '#38bdf8' }} />
            <span>Active Tenant: <strong style={{ color: '#38bdf8' }}>{activeTenant?.companyName || activeTenantId} ({activeTenantId})</strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: '11px' }}>Tenant Scope:</span>
            <select
              value={activeTenantId}
              onChange={(e) => setActiveTenantId(e.target.value)}
              style={{
                fontSize: '11px',
                padding: '2px 6px',
                borderRadius: '4px',
                backgroundColor: '#334155',
                color: '#ffffff',
                border: '1px solid #475569',
              }}
            >
              <option value="ALL">All Tenants (Super Admin View)</option>
              {tenants.map((t) => (
                <option key={t.tenantId} value={t.tenantId}>
                  {t.tenantId} - {t.companyName}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={{ color: '#94a3b8', fontSize: '11px' }}>Role:</span>
            {roles.filter((r) => r.portal === 'ADMIN').map((r) => (
              <button
                key={r.id}
                onClick={() => setActiveRoleId(r.id)}
                style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  border: r.id === currentRole?.id ? '1px solid #a855f7' : '1px solid #475569',
                  backgroundColor: r.id === currentRole?.id ? '#a855f7' : '#334155',
                  color: '#ffffff',
                  cursor: 'pointer',
                }}
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AppShell
        navigationGroups={filteredNavGroups}
        brandName="Courier Aggregator"
        portalLabel="Super Admin Portal"
      >
        <div key={location.pathname} className="animate-fade-in">
          <Outlet />
        </div>
      </AppShell>
    </div>
  );
};
