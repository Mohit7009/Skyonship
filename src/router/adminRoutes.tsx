import type { RouteObject } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { RoutePlaceholder } from '../components/common/RoutePlaceholder';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { AdminCustomersPage } from '../pages/admin/AdminCustomersPage';
import { AdminCouriersPage } from '../pages/admin/AdminCouriersPage';
import { AdminCourierDetailPage } from '../pages/admin/AdminCourierDetailPage';
import { AdminZonesPage } from '../pages/admin/AdminZonesPage';
import { AdminServiceabilityTestPage } from '../pages/admin/AdminServiceabilityTestPage';
import { AdminPinImportPage } from '../pages/admin/AdminPinImportPage';
import { AdminSellingRatesPage } from '../pages/admin/AdminSellingRatesPage';
import { AdminB2BRateCardsPage } from '../pages/admin/AdminB2BRateCardsPage';
import { AdminCustomerWalletsPage } from '../pages/admin/AdminCustomerWalletsPage';
import { AdminCustomerDetailPage } from '../pages/admin/AdminCustomerDetailPage';
import { AdminCustomerRateAssignmentsPage } from '../pages/admin/AdminCustomerRateAssignmentsPage';
import { AdminShipmentsPage } from '../pages/admin/AdminShipmentsPage';
import { AdminRolesPage } from '../pages/admin/AdminRolesPage';
import { AdminPermissionsPage } from '../pages/admin/AdminPermissionsPage';
import { AdminAccessLogsPage } from '../pages/admin/AdminAccessLogsPage';
import { AdminOnboardingTrackerPage } from '../pages/admin/AdminOnboardingTrackerPage';
import { AdminReportsPage } from '../pages/admin/AdminReportsPage';
import { AdminRechargesPage } from '../pages/admin/AdminRechargesPage';
import { AdminNotificationsPage } from '../pages/admin/AdminNotificationsPage';
import { AdminCodRemittancesPage } from '../pages/admin/AdminCodRemittancesPage';
import { AdminNdrRtoPage } from '../pages/admin/AdminNdrRtoPage';
import { AdminWeightDiscrepancyPage } from '../pages/admin/AdminWeightDiscrepancyPage';
import { AdminCourierMasterPage } from '../pages/admin/AdminCourierMasterPage';
import { AdminRatePreviewPage } from '../pages/admin/AdminRatePreviewPage';
import { AdminGstInvoicesPage } from '../pages/admin/finance/AdminGstInvoicesPage';
import { AdminKycVerificationPage } from '../pages/admin/AdminKycVerificationPage';
import { WarehousesPage } from '../pages/app/WarehousesPage';
import { PermissionGuard } from '../components/common/PermissionGuard';

export const adminRoutes: RouteObject = {
  path: '/admin',
  element: <AdminLayout />,
  children: [
    {
      index: true,
      element: <AdminDashboardPage />,
    },
    // ACCESS CONTROL
    {
      path: 'roles',
      element: <PermissionGuard><AdminRolesPage /></PermissionGuard>,
    },
    {
      path: 'permissions',
      element: <PermissionGuard><AdminPermissionsPage /></PermissionGuard>,
    },
    {
      path: 'access-logs',
      element: <PermissionGuard><AdminAccessLogsPage /></PermissionGuard>,
    },
    // CUSTOMERS
    {
      path: 'customers',
      element: <PermissionGuard><AdminCustomersPage /></PermissionGuard>,
    },
    {
      path: 'onboarding',
      element: <PermissionGuard><AdminOnboardingTrackerPage /></PermissionGuard>,
    },
    {
      path: 'customers/onboarding',
      element: <PermissionGuard><AdminOnboardingTrackerPage /></PermissionGuard>,
    },
    {
      path: 'customers/:id',
      element: <PermissionGuard><AdminCustomerDetailPage /></PermissionGuard>,
    },
    {
      path: 'kyc',
      element: <PermissionGuard><AdminKycVerificationPage /></PermissionGuard>,
    },
    {
      path: 'customers/kyc',
      element: <PermissionGuard><AdminKycVerificationPage /></PermissionGuard>,
    },
    {
      path: 'customer-users',
      element: <RoutePlaceholder moduleName="Customer Users" portal="Super Admin Portal" path="/admin/customer-users" />,
    },
    {
      path: 'customer-rate-assignments',
      element: <AdminCustomerRateAssignmentsPage />,
    },
    {
      path: 'credit-control',
      element: <AdminCustomerDetailPage />,
    },
    {
      path: 'customer-activity',
      element: <PermissionGuard><AdminAccessLogsPage /></PermissionGuard>,
    },
    {
      path: 'warehouses',
      element: <PermissionGuard><WarehousesPage /></PermissionGuard>,
    },
    // COURIER MANAGEMENT
    {
      path: 'couriers',
      element: <PermissionGuard><AdminCouriersPage /></PermissionGuard>,
    },
    {
      path: 'couriers/:id',
      element: <AdminCourierDetailPage />,
    },
    {
      path: 'courier-master',
      element: <AdminCourierMasterPage />,
    },
    {
      path: 'couriers/master',
      element: <AdminCourierMasterPage />,
    },
    {
      path: 'zones',
      element: <AdminZonesPage />,
    },
    {
      path: 'serviceability-test',
      element: <AdminServiceabilityTestPage />,
    },
    {
      path: 'serviceability',
      element: <AdminServiceabilityTestPage />,
    },
    {
      path: 'pincodes/import',
      element: <AdminPinImportPage />,
    },
    {
      path: 'pincodes',
      element: <AdminPinImportPage />,
    },
    // RATE CARDS
    {
      path: 'selling-rates',
      element: <PermissionGuard><AdminSellingRatesPage /></PermissionGuard>,
    },
    {
      path: 'b2b-rates',
      element: <PermissionGuard><AdminB2BRateCardsPage /></PermissionGuard>,
    },
    {
      path: 'rate-cards',
      element: <AdminSellingRatesPage />,
    },
    {
      path: 'rate-cards/create',
      element: <RoutePlaceholder moduleName="Create Master Rate Card" portal="Super Admin Portal" path="/admin/rate-cards/create" />,
    },
    {
      path: 'rate-preview',
      element: <AdminRatePreviewPage />,
    },

    // FINANCE
    {
      path: 'customer-wallets',
      element: <PermissionGuard><AdminCustomerWalletsPage /></PermissionGuard>,
    },
    {
      path: 'wallets',
      element: <AdminCustomerWalletsPage />,
    },
    {
      path: 'recharges',
      element: <AdminRechargesPage />,
    },
    {
      path: 'payments',
      element: <AdminRechargesPage />,
    },
    {
      path: 'cod',
      element: <PermissionGuard><AdminCodRemittancesPage /></PermissionGuard>,
    },
    {
      path: 'cod/remittances',
      element: <AdminCodRemittancesPage />,
    },
    {
      path: 'cod/receivables',
      element: <AdminCodRemittancesPage />,
    },
    {
      path: 'billing',
      element: <PermissionGuard><AdminGstInvoicesPage /></PermissionGuard>,
    },
    {
      path: 'invoices',
      element: <AdminGstInvoicesPage />,
    },
    {
      path: 'finance/gst-invoices',
      element: <AdminGstInvoicesPage />,
    },
    // OPERATIONS
    {
      path: 'orders',
      element: <RoutePlaceholder moduleName="Global Platform Orders" portal="Super Admin Portal" path="/admin/orders" />,
    },
    {
      path: 'shipments',
      element: <PermissionGuard><AdminShipmentsPage /></PermissionGuard>,
    },
    {
      path: 'weight-discrepancies',
      element: <PermissionGuard><AdminWeightDiscrepancyPage /></PermissionGuard>,
    },
    {
      path: 'pickups',
      element: <RoutePlaceholder moduleName="Global Pickup Requests" portal="Super Admin Portal" path="/admin/pickups" />,
    },
    {
      path: 'tracking',
      element: <RoutePlaceholder moduleName="Global Tracking Scans" portal="Super Admin Portal" path="/admin/tracking" />,
    },
    {
      path: 'ndr',
      element: <PermissionGuard><AdminNdrRtoPage /></PermissionGuard>,
    },
    {
      path: 'rto',
      element: <PermissionGuard><AdminNdrRtoPage /></PermissionGuard>,
    },

    // SYSTEM
    {
      path: 'audit-logs',
      element: <PermissionGuard><AdminAccessLogsPage /></PermissionGuard>,
    },
    {
      path: 'users-roles',
      element: <PermissionGuard><AdminRolesPage /></PermissionGuard>,
    },
    {
      path: 'users',
      element: <PermissionGuard><AdminRolesPage /></PermissionGuard>,
    },
    {
      path: 'reports',
      element: <PermissionGuard><AdminReportsPage /></PermissionGuard>,
    },
    {
      path: 'reports/analytics',
      element: <RoutePlaceholder moduleName="System BI & Revenue Analytics" portal="Super Admin Portal" path="/admin/reports/analytics" />,
    },
    {
      path: 'notifications',
      element: <AdminNotificationsPage />,
    },
    {
      path: 'settings',
      element: <RoutePlaceholder moduleName="System Global Settings" portal="Super Admin Portal" path="/admin/settings" />,
    },
  ],
};
