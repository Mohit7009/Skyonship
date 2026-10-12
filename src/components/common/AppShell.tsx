import React, { useState } from 'react';
import { Sidebar, type NavGroupConfig } from './Sidebar';
import { Topbar } from './Topbar';
import { Drawer } from '../ui/Drawer';
import { useBreakpoints } from '../../hooks/useBreakpoints';

export interface AppShellProps {
  navigationGroups: NavGroupConfig[];
  brandName?: string;
  portalLabel?: string;
  children?: React.ReactNode;
  contentLayout?: 'constrained' | 'full';
}

export const AppShell: React.FC<AppShellProps> = ({
  navigationGroups,
  brandName = 'Skyonship',
  portalLabel = 'Enterprise Logistics Portal',
  children,
}) => {
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const { isMobile } = useBreakpoints();

  const handleToggleCollapse = () => {
    setIsDesktopCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: 'var(--color-background)', overflowX: 'hidden' }}>
      {/* Desktop Sidebar (Hidden on Mobile) */}
      {!isMobile && (
        <Sidebar
          navigationGroups={navigationGroups}
          brandName={brandName}
          portalLabel={portalLabel}
          isCollapsed={isDesktopCollapsed}
          onToggleCollapse={handleToggleCollapse}
        />
      )}

      {/* Mobile Drawer Navigation (Sheet Overlay) */}
      {isMobile && (
        <Drawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          position="left"
          title={`${brandName} Navigation`}
        >
          <div style={{ margin: '-var(--space-6)', backgroundColor: 'var(--color-sidebar-bg)', minHeight: '100%' }}>
            <Sidebar
              navigationGroups={navigationGroups}
              brandName={brandName}
              portalLabel={portalLabel}
              isCollapsed={false}
            />
          </div>
        </Drawer>
      )}

      {/* Main Structural Wrapper - Automatically stretches & resizes smoothly */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Topbar Header */}
        <Topbar
          portalName={portalLabel}
          onMenuToggle={isMobile ? () => setIsMobileDrawerOpen(true) : undefined}
        />

        {/* Flexible Main Content Area */}
        <main
          style={{
            flex: 1,
            padding: isMobile ? 'var(--space-3)' : 'var(--space-4)',
            width: '100%',
            maxWidth: '100%',
            margin: '0 auto',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
