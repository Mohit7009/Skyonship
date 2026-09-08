import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  RbacRole,
  RbacUser,
  RbacAuditLog,
  PermissionCategory,
  PermissionType,
  PortalType,
  RolePermissionMap,
} from '../services/rbacService';
import {
  INITIAL_ROLES,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS,
} from '../services/rbacService';

export interface NewRoleInput {
  name: string;
  code: string;
  portal: PortalType;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  permissions: RolePermissionMap;
  isSystemRole?: boolean;
}

interface RbacContextType {
  roles: RbacRole[];
  users: RbacUser[];
  auditLogs: RbacAuditLog[];
  activeRoleId: string;
  activeUserId: string;
  currentRole: RbacRole;
  currentUser: RbacUser;
  setActiveRoleId: (roleId: string) => void;
  setActiveUserId: (userId: string) => void;
  hasPermission: (category: PermissionCategory, action?: PermissionType) => boolean;
  canAccessPath: (path: string) => boolean;
  createRole: (newRole: NewRoleInput) => void;
  duplicateRole: (roleId: string, newName: string) => void;
  editRole: (roleId: string, updates: Partial<RbacRole>) => void;
  toggleRoleStatus: (roleId: string) => void;
  deleteRole: (roleId: string) => void;
  assignUserRole: (userId: string, newRoleId: string) => void;
  createTeamUser: (userData: { name: string; email: string; phone?: string; roleId: string; roleName: string; portal: PortalType }) => void;
  toggleUserStatus: (userId: string) => void;
  resetUserPassword: (userId: string) => void;
  logActivity: (action: RbacAuditLog['action'], resource: string, details: string) => void;
}

const STORAGE_KEYS = {
  ROLES: 'courrier3_rbac_roles',
  USERS: 'courrier3_rbac_users',
  AUDIT_LOGS: 'courrier3_rbac_audit_logs',
  ACTIVE_ROLE: 'courrier3_rbac_active_role',
  ACTIVE_USER: 'courrier3_rbac_active_user',
};

const RbacContext = createContext<RbacContextType | undefined>(undefined);

// Path to category & action mapping for URL Access Protection
const PATH_PERMISSION_MAP: Record<string, { category: PermissionCategory; action: PermissionType }> = {
  '/admin': { category: 'Dashboard', action: 'View' },
  '/admin/customers': { category: 'Customer Management', action: 'View' },
  '/admin/customers/kyc': { category: 'Customer Management', action: 'View' },
  '/admin/kyc': { category: 'Customer Management', action: 'View' },
  '/admin/shipments': { category: 'Orders', action: 'View' },
  '/admin/ndr': { category: 'NDR', action: 'View' },
  '/admin/weight-discrepancies': { category: 'Disputes', action: 'View' },
  '/admin/warehouses': { category: 'Warehouses', action: 'View' },
  '/admin/b2b-rates': { category: 'Rate Cards', action: 'View' },
  '/admin/selling-rates': { category: 'Rate Cards', action: 'View' },
  '/admin/rate-preview': { category: 'Rate Cards', action: 'View' },
  '/admin/couriers': { category: 'Integrations', action: 'View' },
  '/admin/zones': { category: 'Integrations', action: 'View' },
  '/admin/customer-wallets': { category: 'Wallet', action: 'View' },
  '/admin/cod/remittances': { category: 'COD Remittance', action: 'View' },
  '/admin/finance/gst-invoices': { category: 'Billing', action: 'View' },
  '/admin/notifications': { category: 'Settings', action: 'View' },
  '/admin/reports': { category: 'Reports', action: 'View' },
  '/admin/roles': { category: 'Customer Management', action: 'Manage' },
  '/admin/permissions': { category: 'Customer Management', action: 'Manage' },
  '/admin/access-logs': { category: 'Reports', action: 'View' },

  // Seller Paths
  '/app': { category: 'Dashboard', action: 'View' },
  '/app/orders': { category: 'Orders', action: 'View' },
  '/app/orders/create': { category: 'Orders', action: 'Create' },
  '/app/bulk/upload': { category: 'Orders', action: 'Create' },
  '/app/tracking': { category: 'Tracking', action: 'View' },
  '/app/ndr': { category: 'NDR', action: 'View' },
  '/app/rto': { category: 'RTO', action: 'View' },
  '/app/rates': { category: 'Rate Cards', action: 'View' },
  '/app/my-rate-card': { category: 'Rate Cards', action: 'View' },
  '/app/wallet': { category: 'Wallet', action: 'View' },
  '/app/wallet/recharge': { category: 'Wallet', action: 'Manage' },
  '/app/cod': { category: 'COD Remittance', action: 'View' },
  '/app/billing/gst-invoices': { category: 'Billing', action: 'View' },
  '/app/billing': { category: 'Billing', action: 'View' },
  '/app/warehouses': { category: 'Warehouses', action: 'View' },
  '/app/pickups': { category: 'Warehouses', action: 'View' },
  '/app/weight-discrepancies': { category: 'Disputes', action: 'View' },
  '/app/couriers': { category: 'Integrations', action: 'View' },
  '/app/settings': { category: 'Settings', action: 'View' },
  '/app/settings/team': { category: 'Settings', action: 'Manage' },
  '/app/team': { category: 'Settings', action: 'Manage' },
  '/app/team/roles': { category: 'Settings', action: 'Manage' },
  '/app/team/activity': { category: 'Settings', action: 'View' },
  '/app/manifests': { category: 'Reports', action: 'View' },
};

export const RbacProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roles, setRoles] = useState<RbacRole[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROLES);
      return saved ? JSON.parse(saved) : INITIAL_ROLES;
    } catch {
      return INITIAL_ROLES;
    }
  });

  const [users, setUsers] = useState<RbacUser[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USERS);
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [auditLogs, setAuditLogs] = useState<RbacAuditLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length < 200) {
          return parsed;
        }
      }
      return INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  const [activeRoleId, setActiveRoleIdState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_ROLE) || 'role-admin-super';
    } catch {
      return 'role-admin-super';
    }
  });

  const [activeUserId, setActiveUserIdState] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ACTIVE_USER) || 'usr-admin-01';
    } catch {
      return 'usr-admin-01';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ROLES, JSON.stringify(roles));
    } catch {
      // Ignore storage errors
    }
  }, [roles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    } catch {
      // Ignore storage errors
    }
  }, [users]);

  useEffect(() => {
    try {
      // Keep max 50 recent audit logs to avoid storage quota limits
      const capped = auditLogs.slice(0, 50);
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(capped));
    } catch (err) {
      console.warn('Quota exceeded saving audit logs to localStorage, purging old logs', err);
      try {
        localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
      } catch {
        // Ignore
      }
    }
  }, [auditLogs]);

  const setActiveRoleId = (roleId: string) => {
    setActiveRoleIdState(roleId);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ROLE, roleId);
    } catch {
      // Ignore
    }
  };

  const setActiveUserId = (userId: string) => {
    setActiveUserIdState(userId);
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, userId);
    } catch {
      // Ignore
    }
    const matchedUser = users.find((u) => u.id === userId);
    if (matchedUser) {
      setActiveRoleId(matchedUser.roleId);
      logActivity('User Login', matchedUser.email, `User ${matchedUser.name} authenticated into ${matchedUser.portal} portal as ${matchedUser.roleName}`);
    }
  };

  const currentRole = roles.find((r) => r.id === activeRoleId) || roles[0];
  const currentUser = users.find((u) => u.id === activeUserId) || users[0];

  const logActivity = (action: RbacAuditLog['action'], resource: string, details: string) => {
    const now = new Date();
    const newLog: RbacAuditLog = {
      id: `log-${Date.now()}`,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0],
      user: currentUser.name,
      email: currentUser.email,
      role: currentRole.name,
      action,
      resource,
      ip: currentUser.ipAddress || '127.0.0.1',
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev].slice(0, 50));
  };

  const hasPermission = (category: PermissionCategory, action: PermissionType = 'View'): boolean => {
    if (!currentRole || currentRole.status === 'INACTIVE') return false;
    // Super Admin has full permission
    if (currentRole.code === 'SUPER_ADMIN' || currentRole.code === 'ACCOUNT_OWNER') return true;

    const catPerms = currentRole.permissions?.[category];
    if (!catPerms) return false;
    return Boolean(catPerms[action]);
  };

  // Pure function without side-effects for safe sidebar render checking
  const canAccessPath = (path: string): boolean => {
    if (!currentRole || currentRole.status === 'INACTIVE') return false;
    if (currentRole.code === 'SUPER_ADMIN' || currentRole.code === 'ACCOUNT_OWNER') return true;

    // Check exact path or prefix match
    const matchedKey = Object.keys(PATH_PERMISSION_MAP).find((p) => {
      if (p === path) return true;
      if (p !== '/admin' && p !== '/app' && path.startsWith(p + '/')) return true;
      return false;
    });

    if (!matchedKey) return true; // Default allow if path not restricted

    const rule = PATH_PERMISSION_MAP[matchedKey];
    return hasPermission(rule.category, rule.action);
  };

  const createRole = (newRoleData: NewRoleInput) => {
    const id = `role-${newRoleData.portal.toLowerCase()}-${Date.now()}`;
    const now = new Date().toISOString().split('T')[0];
    const newRole: RbacRole = {
      ...newRoleData,
      id,
      assignedUsersCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    setRoles((prev) => [newRole, ...prev]);
    logActivity('Role Created', newRole.name, `Created role "${newRole.name}" for portal ${newRole.portal}`);
  };

  const duplicateRole = (roleId: string, newName: string) => {
    const sourceRole = roles.find((r) => r.id === roleId);
    if (!sourceRole) return;

    const newId = `role-${sourceRole.portal.toLowerCase()}-${Date.now()}`;
    const now = new Date().toISOString().split('T')[0];
    const dup: RbacRole = {
      ...sourceRole,
      id: newId,
      name: newName,
      code: `${sourceRole.code}_COPY_${Date.now().toString().slice(-4)}`,
      isSystemRole: false,
      assignedUsersCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    setRoles((prev) => [dup, ...prev]);
    logActivity('Role Duplicated', `${sourceRole.name} -> ${newName}`, `Duplicated role "${sourceRole.name}" to create "${newName}"`);
  };

  const editRole = (roleId: string, updates: Partial<RbacRole>) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== roleId) return r;
        return {
          ...r,
          ...updates,
          updatedAt: new Date().toISOString().split('T')[0],
        };
      })
    );
    logActivity('Permission Changed', updates.name || roleId, `Updated permission matrix for role ID ${roleId}`);
  };

  const toggleRoleStatus = (roleId: string) => {
    setRoles((prev) =>
      prev.map((r) => {
        if (r.id !== roleId) return r;
        const newStatus = r.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        logActivity('Role Deactivated', r.name, `Toggled role status for "${r.name}" to ${newStatus}`);
        return { ...r, status: newStatus };
      })
    );
  };

  const deleteRole = (roleId: string) => {
    const roleToDelete = roles.find((r) => r.id === roleId);
    if (roleToDelete?.isSystemRole) return;

    setRoles((prev) => prev.filter((r) => r.id !== roleId));
    logActivity('Role Deactivated', roleToDelete?.name || roleId, `Deleted custom role ${roleToDelete?.name}`);
  };

  const assignUserRole = (userId: string, newRoleId: string) => {
    const targetRole = roles.find((r) => r.id === newRoleId);
    if (!targetRole) return;

    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        logActivity('User Assigned', `${u.name} -> ${targetRole.name}`, `Assigned user ${u.name} to role ${targetRole.name}`);
        return { ...u, roleId: targetRole.id, roleName: targetRole.name };
      })
    );

    setRoles((prev) =>
      prev.map((r) => {
        const count = users.filter((u) => u.roleId === r.id).length;
        return { ...r, assignedUsersCount: count };
      })
    );
  };

  const createTeamUser = (userData: { name: string; email: string; phone?: string; roleId: string; roleName: string; portal: PortalType }) => {
    const newUser: RbacUser = {
      id: `usr-${Date.now()}`,
      name: userData.name,
      email: userData.email,
      roleId: userData.roleId,
      roleName: userData.roleName,
      portal: userData.portal,
      status: 'ACTIVE',
      lastLogin: 'Never',
      ipAddress: '127.0.0.1',
    };
    setUsers((prev) => [newUser, ...prev]);
    logActivity('User Assigned', newUser.email, `Created new team user "${newUser.name}" assigned to role "${newUser.roleName}"`);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const newStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        logActivity('User Status Changed', u.email, `Toggled user status for "${u.name}" to ${newStatus}`);
        return { ...u, status: newStatus };
      })
    );
  };

  const resetUserPassword = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      logActivity('Password Reset', targetUser.email, `Dispatched password reset instructions for user "${targetUser.name}"`);
    }
  };

  return (
    <RbacContext.Provider
      value={{
        roles,
        users,
        auditLogs,
        activeRoleId,
        activeUserId,
        currentRole,
        currentUser,
        setActiveRoleId,
        setActiveUserId,
        hasPermission,
        canAccessPath,
        createRole,
        duplicateRole,
        editRole,
        toggleRoleStatus,
        deleteRole,
        assignUserRole,
        createTeamUser,
        toggleUserStatus,
        resetUserPassword,
        logActivity,
      }}
    >
      {children}
    </RbacContext.Provider>
  );
};

export const useRbac = () => {
  const context = useContext(RbacContext);
  if (!context) {
    throw new Error('useRbac must be used within an RbacProvider');
  }
  return context;
};
