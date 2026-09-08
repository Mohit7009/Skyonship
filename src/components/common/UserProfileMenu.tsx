import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Dropdown } from '../ui/Dropdown';

export interface UserProfileMenuProps {
  userName?: string;
  userEmail?: string;
  userRole?: string;
  avatarUrl?: string;
  portalName?: string;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({
  userName,
  userEmail,
  userRole,
  portalName = 'Customer Portal',
}) => {
  const navigate = useNavigate();

  const isAdmin = portalName.toLowerCase().includes('admin');
  const resolvedName = userName || (isAdmin ? 'Platform Super Admin' : 'Priya Sharma');
  const resolvedCompany = isAdmin ? 'Super Admin Portal' : 'Priya Logistics';
  const resolvedEmail = userEmail || (isAdmin ? 'admin@shipping-saas.com' : 'priya@priyalogistics.com');
  const resolvedRole = userRole || (isAdmin ? 'Super Admin' : 'Account Owner');

  const customerDropdownItems = [
    {
      id: 'my-profile',
      label: '👤 My Profile',
      onClick: () => navigate('/app/settings/profile'),
    },
    {
      id: 'kyc-center',
      label: '🛡️ KYC Status',
      onClick: () => navigate('/app/settings/kyc'),
    },
    {
      id: 'bank-details',
      label: '🏦 Bank Details',
      onClick: () => navigate('/app/settings/bank'),
    },
    {
      id: 'change-password',
      label: '🔑 Change Password',
      onClick: () => navigate('/app/settings/security'),
    },
    {
      id: 'logout',
      label: '🚪 Logout',
      danger: true,
      onClick: () => {
        localStorage.removeItem('courrier3_active_portal');
        navigate('/login');
      },
    },
  ];

  const adminDropdownItems = [
    {
      id: 'profile-header',
      label: `🛡️ ${resolvedName} (${resolvedEmail})`,
      onClick: () => navigate('/admin/settings'),
    },
    {
      id: 'admin-roles',
      label: '🔑 Roles & Permissions',
      onClick: () => navigate('/admin/roles'),
    },
    {
      id: 'admin-logs',
      label: '📋 Audit & Access Logs',
      onClick: () => navigate('/admin/access-logs'),
    },
    {
      id: 'admin-settings',
      label: '⚙️ System Settings',
      onClick: () => navigate('/admin/settings'),
    },
    {
      id: 'logout',
      label: '🚪 Sign Out',
      danger: true,
      onClick: () => {
        localStorage.removeItem('courrier3_active_portal');
        navigate('/admin/login');
      },
    },
  ];

  const dropdownItems = isAdmin ? adminDropdownItems : customerDropdownItems;

  const triggerNode = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '6px 12px',
        borderRadius: '10px',
        border: '1px solid #cbd5e1',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      {/* 3D Business Avatar with Verified Badge Dot */}
      <div style={{ position: 'relative' }}>
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '9px',
            background: isAdmin
              ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
              : 'linear-gradient(135deg, #0284c7 0%, #0f172a 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '13px',
            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
          }}
        >
          {isAdmin ? 'SA' : 'PL'}
        </div>
        {!isAdmin && (
          <span
            style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#16a34a',
              border: '2px solid #ffffff',
            }}
            title="Verified Merchant"
          />
        )}
      </div>

      {/* Merchant Identity Text */}
      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a', lineHeight: 1.2 }}>
            {isAdmin ? resolvedName : resolvedCompany}
          </span>
          {!isAdmin && (
            <span
              style={{
                fontSize: '10px',
                fontWeight: '700',
                backgroundColor: '#f0fdf4',
                color: '#16a34a',
                border: '1px solid #bbf7d0',
                padding: '1px 5px',
                borderRadius: '4px',
              }}
            >
              ✓ Verified
            </span>
          )}
        </div>
        <span style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
          {isAdmin ? resolvedRole : `${resolvedName} • ${resolvedRole}`}
        </span>
      </div>

      <ChevronDown size={14} style={{ color: '#64748b', marginLeft: '4px' }} />
    </div>
  );

  return <Dropdown trigger={triggerNode} items={dropdownItems} />;
};
