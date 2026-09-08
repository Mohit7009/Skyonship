import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import {
  Package,
  PlusCircle,
  FileSpreadsheet,
  Search,
  AlertTriangle,
  Calculator,
  Wallet,
  IndianRupee,
  CreditCard,
  Warehouse,
  Building2,
  KeyRound,
  LayoutDashboard,
  ShieldCheck,
  User,
} from 'lucide-react';
import { AppShell } from '../components/common/AppShell';
import type { NavGroupConfig } from '../components/common/Sidebar';
import { useRbac } from '../context/RbacContext';
import { useTenant } from '../context/TenantContext';

export const BASE_ENTERPRISE_B2B_NAV_GROUPS: NavGroupConfig[] = [
  {
    sectionLabel: 'DASHBOARD',
    categoryIcon: LayoutDashboard,
    items: [
      { label: 'Dashboard', path: '/app', icon: LayoutDashboard },
    ],
  },
  {
    sectionLabel: 'SHIPMENTS',
    categoryIcon: Package,
    items: [
      { label: 'Create Shipment', path: '/app/orders/create', icon: PlusCircle },
      { label: 'All Orders', path: '/app/orders', icon: Package },
      { label: 'Bulk Upload', path: '/app/bulk/upload', icon: FileSpreadsheet },
    ],
  },
  {
    sectionLabel: 'TRACKING',
    categoryIcon: Search,
    items: [
      { label: 'Tracking & NDR', path: '/app/ndr', icon: AlertTriangle },
    ],
  },
  {
    sectionLabel: 'FINANCE',
    categoryIcon: Wallet,
    items: [
      { label: 'Wallet', path: '/app/wallet', icon: Wallet },
      { label: 'COD Remittance', path: '/app/cod', icon: IndianRupee },
      { label: 'Invoices', path: '/app/billing', icon: CreditCard },
    ],
  },
  {
    sectionLabel: 'TOOLS',
    categoryIcon: Calculator,
    items: [
      { label: 'Rate Calculator', path: '/app/rates', icon: Calculator },
      { label: 'Warehouses', path: '/app/warehouses', icon: Warehouse },
    ],
  },
  {
    sectionLabel: 'ACCOUNT',
    categoryIcon: User,
    items: [
      { label: 'Profile', path: '/app/settings/profile', icon: Building2 },
      { label: 'KYC', path: '/app/settings/kyc', icon: ShieldCheck },
      { label: 'Bank Details', path: '/app/settings/bank', icon: CreditCard },
    ],
  },
];

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const { canAccessPath, currentRole, roles, setActiveRoleId } = useRbac();
  const { activeTenantId, activeTenant } = useTenant();

  // Filter navigation groups dynamically
  const filteredNavGroups = BASE_ENTERPRISE_B2B_NAV_GROUPS.map((group) => {
    const allowedItems = group.items.filter((item) => canAccessPath(item.path));
    return { ...group, items: allowedItems };
  }).filter((group) => group.items.length > 0);

  return (
    <div>
      {/* Top RBAC & Multi-Tenant Banner */}
      <div
        style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '6px 16px',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          borderBottom: '1px solid #1e293b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px 16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <KeyRound size={14} style={{ color: '#38bdf8' }} />
            <span>Role: <strong>{currentRole?.name}</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', borderLeft: '1px solid #334155', paddingLeft: '16px' }}>
            <Building2 size={14} style={{ color: '#38bdf8' }} />
            <span>Tenant: <strong style={{ color: '#38bdf8' }}>{activeTenant?.companyName || 'Apex Logistics'} ({activeTenantId})</strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8', fontSize: '11px' }}>Quick Switch Role:</span>
          {roles.filter((r) => r.portal === 'SELLER').map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveRoleId(r.id)}
              style={{
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '3px',
                border: r.id === currentRole?.id ? '1px solid #38bdf8' : '1px solid #334155',
                backgroundColor: r.id === currentRole?.id ? '#0284c7' : '#1e293b',
                color: '#ffffff',
                cursor: 'pointer',
              }}
            >
              {r.name}
            </button>
          ))}
        </div>
      </div>

      <AppShell
        navigationGroups={filteredNavGroups}
        brandName="Courier Aggregator"
        portalLabel="Enterprise Logistics Portal"
      >
        <div key={location.pathname} className="animate-fade-in">
          <Outlet />
        </div>
      </AppShell>
    </div>
  );
};
