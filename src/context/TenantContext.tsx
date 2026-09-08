import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  TenantProfile,
  TenantSecurityEvent,
} from '../services/tenantService';
import {
  TenantService,
} from '../services/tenantService';
import { useRbac } from './RbacContext';

interface TenantContextType {
  activeTenantId: string;
  activeTenant: TenantProfile;
  tenants: TenantProfile[];
  securityEvents: TenantSecurityEvent[];
  setActiveTenantId: (tenantId: string) => void;
  scopeData: <T extends Record<string, unknown>>(items: T[]) => T[];
  validateOwnership: (recordTenantId?: string) => boolean;
  logSecurityViolation: (
    eventType: TenantSecurityEvent['eventType'],
    targetResource: string,
    details: string
  ) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentRole } = useRbac();
  const isSuperAdmin = currentRole?.code === 'SUPER_ADMIN';

  const [tenants] = useState<TenantProfile[]>(() => TenantService.getTenants());
  const [securityEvents, setSecurityEvents] = useState<TenantSecurityEvent[]>(() =>
    TenantService.getSecurityEvents()
  );

  const [activeTenantId, setActiveTenantIdState] = useState<string>(() => {
    return localStorage.getItem('courrier3_active_tenant_id') || 'TENANT-1001';
  });

  useEffect(() => {
    localStorage.setItem('courrier3_active_tenant_id', activeTenantId);
  }, [activeTenantId]);

  const setActiveTenantId = (tenantId: string) => {
    setActiveTenantIdState(tenantId);
  };

  const activeTenant =
    tenants.find((t) => t.tenantId === activeTenantId) || tenants[0];

  const logSecurityViolation = (
    eventType: TenantSecurityEvent['eventType'],
    targetResource: string,
    details: string
  ) => {
    const newEvt = TenantService.logSecurityEvent(
      activeTenantId,
      'logged_user@tenant.com',
      eventType,
      targetResource,
      details
    );
    setSecurityEvents((prev) => [newEvt, ...prev]);
  };

  const scopeData = <T extends Record<string, unknown>>(items: T[]): T[] => {
    return TenantService.scopeDataByTenant(items, activeTenantId, isSuperAdmin);
  };

  const validateOwnership = (recordTenantId?: string): boolean => {
    if (!recordTenantId) return true;
    const isValid = TenantService.validateOwnership(recordTenantId, activeTenantId, isSuperAdmin);
    if (!isValid) {
      logSecurityViolation(
        'Cross-Tenant Access Blocked',
        `Record Tenant: ${recordTenantId}`,
        `Attempted cross-tenant access from active tenant ${activeTenantId}`
      );
    }
    return isValid;
  };

  return (
    <TenantContext.Provider
      value={{
        activeTenantId,
        activeTenant,
        tenants,
        securityEvents,
        setActiveTenantId,
        scopeData,
        validateOwnership,
        logSecurityViolation,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
