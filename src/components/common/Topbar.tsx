import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Wallet, Plus, Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { NotificationDropdown } from './NotificationDropdown';
import { UserProfileMenu } from './UserProfileMenu';
import { CommandPaletteModal } from './CommandPaletteModal';
import { LiveToastContainer } from './LiveToastContainer';
import { useBreakpoints } from '../../hooks/useBreakpoints';
import { APP_CONFIG } from '../../config/app.config';
import { WalletService } from '../../mocks/wallet.mock';

export interface TopbarProps {
  portalName?: string;
  onMenuToggle?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  portalName = 'Customer Portal',
  onMenuToggle,
}) => {
  const navigate = useNavigate();
  const { isMobile } = useBreakpoints();

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const isCustomerPortal = !portalName.toLowerCase().includes('admin');
  const walletBalancePaise = WalletService.getWallet().availableBalanceMinor;
  const walletBalanceINR = (walletBalancePaise / 100).toFixed(2);

  // Global Keyboard Shortcut: Ctrl + K / Cmd + K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isMac = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('mac');

  return (
    <header
      style={{
        height: '52px',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: isMobile ? '0 var(--space-3)' : '0 var(--space-4)',
        position: 'sticky',
        top: 0,
        zIndex: 'var(--z-sticky)',
      }}
    >
      {/* LIVE TOAST OVERLAY */}
      <LiveToastContainer />

      {/* Left Area: Mobile Trigger & Brand Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            style={{
              padding: 'var(--space-1-5, 6px)',
              borderRadius: 'var(--radius-default)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text-secondary)',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            aria-label="Toggle Navigation Menu"
          >
            <Menu size={18} />
          </button>
        )}
        <span
          style={{
            fontSize: 'var(--font-size-small)',
            fontWeight: 'var(--font-weight-medium)',
            color: 'var(--color-text-secondary)',
          }}
        >
          {APP_CONFIG.name} &bull; <strong style={{ color: 'var(--color-text-primary)' }}>{portalName}</strong>
        </span>
      </div>

      {/* Center/Right Area: Search, Wallet Badge, Add Money, Notifications, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {/* DESKTOP GLOBAL SEARCH TRIGGER BAR */}
        {!isMobile && (
          <div
            onClick={() => setIsCommandPaletteOpen(true)}
            style={{
              width: '280px',
              height: '34px',
              backgroundColor: 'var(--color-surface-secondary)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-default)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 10px',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              transition: 'border-color var(--transition-fast)',
            }}
            title="Press Ctrl + K to open Global Command Search"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={15} style={{ color: '#2563EB' }} />
              <span style={{ fontSize: '12px' }}>Search AWB, LRN, Order ID, Customer...</span>
            </div>

            <kbd style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '1px 5px', fontSize: '10px', fontWeight: 'bold' }}>
              {isMac ? '⌘ K' : 'Ctrl K'}
            </kbd>
          </div>
        )}

        {/* MOBILE SEARCH ICON BUTTON */}
        {isMobile && (
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            style={{
              padding: '6px',
              borderRadius: 'var(--radius-default)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-violet-main)',
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
            aria-label="Open Global Search"
          >
            <Search size={18} />
          </button>
        )}

        {/* PROMINENT HEADER WALLET & RECHARGE BUTTON (CUSTOMER PORTAL ONLY) */}
        {isCustomerPortal && !isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              onClick={() => navigate('/app/wallet')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: 'var(--radius-default)',
                backgroundColor: 'var(--color-surface-secondary)',
                border: '1px solid var(--color-border)',
                cursor: 'pointer',
                transition: 'background-color var(--transition-fast)',
              }}
              title="Click to view Wallet & Ledger"
            >
              <Wallet size={14} style={{ color: '#2563EB' }} />
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.1 }}>
                <span style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  Wallet Balance
                </span>
                <strong style={{ fontSize: '13px', color: '#2563EB' }}>
                  ₹{walletBalanceINR}
                </strong>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={13} />}
              onClick={() => navigate('/app/wallet')}
              style={{ height: '30px', fontSize: '12px', padding: '0 10px' }}
            >
              + Add Money
            </Button>
          </div>
        )}

        <NotificationDropdown portalName={portalName} />
        <UserProfileMenu portalName={portalName} />
      </div>

      {/* COMMAND PALETTE MODAL OVERLAY */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        portalName={portalName}
      />
    </header>
  );
};
