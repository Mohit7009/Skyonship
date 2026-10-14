import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  TenantProfile,
  TenantSecurityEvent,
} from '../services/tenantService';
import {
  TenantService,
  INITIAL_TENANTS,
} from '../services/tenantService';
import { useRbac } from './RbacContext';
import { supabase } from '../lib/supabaseClient';
import { isValidUUID } from '../utils/uuidHelper';

interface TenantContextType {
  activeTenantId: string;
  activeTenant: TenantProfile | null;
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
  refreshTenantProfile: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentRole } = useRbac();
  const isSuperAdmin = currentRole?.code === 'SUPER_ADMIN';

  const [tenants, setTenants] = useState<TenantProfile[]>(() => TenantService.getTenants());
  const [securityEvents, setSecurityEvents] = useState<TenantSecurityEvent[]>(() =>
    TenantService.getSecurityEvents()
  );

  // Initialize from active storage, but do NOT default to demo tenant
  const [activeTenantId, setActiveTenantIdState] = useState<string>(() => {
    return localStorage.getItem('courrier3_active_tenant_id') || '';
  });

  const [activeTenant, setActiveTenant] = useState<TenantProfile | null>(null);

  // Synchronize tenant profile from Supabase PostgreSQL
  const resolveTenantProfile = useCallback(async (tenantId: string): Promise<TenantProfile | null> => {
    if (!tenantId) return null;

    if (tenantId === 'ALL') {
      return {
        tenantId: 'ALL',
        companyName: 'Platform Headquarters',
        slug: 'all',
        status: 'ACTIVE',
        planTier: 'Enterprise',
        createdAt: '2026-01-01',
        assignedRateCards: [],
        assignedManager: 'HQ Administrator',
        contactEmail: 'admin@skyonship.com',
        contactMobile: '',
        gstNumber: '',
      };
    }

    // 1. If valid UUID, query Supabase tenants table
    if (isValidUUID(tenantId)) {
      try {
        const { data, error } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', tenantId)
          .maybeSingle();

        if (!error && data) {
          const profile: TenantProfile = {
            tenantId: data.id,
            companyName: data.company_name || 'My Logistics Hub',
            slug: (data.company_name || 'merchant').toLowerCase().replace(/[^a-z0-9]/g, '-'),
            status: data.status || 'ACTIVE',
            planTier: 'Growth',
            createdAt: data.created_at ? new Date(data.created_at).toISOString().split('T')[0] : '2026-01-01',
            assignedRateCards: ['RC-STANDARD'],
            assignedManager: 'Support Desk',
            contactEmail: data.billing_email || '',
            contactMobile: '',
            gstNumber: data.gst_number || '',
          };
          return profile;
        }
      } catch (_err) {
        // Query failed, fall back to checking local demo registry or current user metadata
      }

      // If valid UUID but no DB row yet (e.g. before SQL trigger migration is executed), construct a clean merchant profile
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('courrier3_current_user') : null;
        if (raw) {
          const u = JSON.parse(raw);
          return {
            tenantId,
            companyName: u.businessName || 'My Logistics Hub',
            slug: (u.businessName || 'merchant').toLowerCase().replace(/[^a-z0-9]/g, '-'),
            status: 'ACTIVE',
            planTier: 'Growth',
            createdAt: new Date().toISOString().split('T')[0],
            assignedRateCards: ['RC-STANDARD'],
            assignedManager: 'Support Desk',
            contactEmail: u.workEmail || '',
            contactMobile: u.phoneNumber || '',
            gstNumber: '',
          };
        }
      } catch {}
    }

    // 2. Check local demo mock registry if present (for test tenants like TENANT-1001)
    const localMatch = INITIAL_TENANTS.find((t) => t.tenantId === tenantId);
    if (localMatch) {
      return localMatch;
    }

    // Fail-Closed: Never fall back to Apex Logistics for unknown IDs
    return null;
  }, []);

  // Synchronize active tenant directly from Supabase session
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        const u = data.user;
        const isAdmin = u.email?.includes('admin') || u.app_metadata?.role === 'super_admin';
        const tId = u.app_metadata?.tenant_id || (isAdmin ? 'ALL' : u.id);
        setActiveTenantIdState((prev) => (prev !== tId ? tId : prev));
        localStorage.setItem('courrier3_active_tenant_id', tId);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u = session.user;
        const isAdmin = u.email?.includes('admin') || u.app_metadata?.role === 'super_admin';
        const tId = u.app_metadata?.tenant_id || (isAdmin ? 'ALL' : u.id);
        setActiveTenantIdState((prev) => (prev !== tId ? tId : prev));
        localStorage.setItem('courrier3_active_tenant_id', tId);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (activeTenantId) {
      localStorage.setItem('courrier3_active_tenant_id', activeTenantId);
      resolveTenantProfile(activeTenantId).then((profile) => {
        if (isMounted) {
          setActiveTenant(profile);
          if (profile && !tenants.some((t) => t.tenantId === profile.tenantId)) {
            setTenants((prev) => [profile, ...prev]);
          }
        }
      });
    } else {
      setActiveTenant(null);
    }

    return () => {
      isMounted = false;
    };
  }, [activeTenantId, resolveTenantProfile, tenants]);

  const setActiveTenantId = (tenantId: string) => {
    setActiveTenantIdState(tenantId);
  };

  const refreshTenantProfile = async () => {
    if (activeTenantId) {
      const profile = await resolveTenantProfile(activeTenantId);
      setActiveTenant(profile);
    }
  };

  const logSecurityViolation = (
    eventType: TenantSecurityEvent['eventType'],
    targetResource: string,
    details: string
  ) => {
    const newEvt = TenantService.logSecurityEvent(
      activeTenantId || 'UNASSIGNED',
      'authenticated_user@skyonship.com',
      eventType,
      targetResource,
      details
    );
    setSecurityEvents((prev) => [newEvt, ...prev]);
  };

  const scopeData = <T extends Record<string, unknown>>(items: T[]): T[] => {
    if (!activeTenantId) return [];
    return TenantService.scopeDataByTenant(items, activeTenantId, isSuperAdmin);
  };

  const validateOwnership = (recordTenantId?: string): boolean => {
    if (!recordTenantId) return true;
    if (!activeTenantId) return false;
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
        refreshTenantProfile,
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
