import type { RouteObject } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { CustomerDashboard } from '../pages/app/CustomerDashboard';
import { ShipmentsPage } from '../pages/app/ShipmentsPage';
import { CreateShipmentWizardPage } from '../pages/app/CreateShipmentWizardPage';
import { ShipmentControlCenterPage } from '../pages/app/ShipmentControlCenterPage';
import { ShipmentLabelPage } from '../pages/app/ShipmentLabelPage';
import { LabelPreviewPage } from '../pages/app/LabelPreviewPage';
import { CustomerOrdersPage } from '../pages/app/CustomerOrdersPage';
import { BulkOrderImportPage } from '../pages/app/BulkOrderImportPage';
import { CustomerPickupRequestsPage } from '../pages/app/CustomerPickupRequestsPage';
import { PickupsPage } from '../pages/app/PickupsPage';
import { CreatePickupWizardPage } from '../pages/app/CreatePickupWizardPage';
import { PickupDetailPage } from '../pages/app/PickupDetailPage';
import { ShippingLabelsPage } from '../pages/app/ShippingLabelsPage';
import { ManifestsPage } from '../pages/app/ManifestsPage';
import { CreateManifestPage } from '../pages/app/CreateManifestPage';
import { ManifestDetailPage } from '../pages/app/ManifestDetailPage';
import { ExceptionsPage } from '../pages/app/ExceptionsPage';
import { ExceptionDetailPage } from '../pages/app/ExceptionDetailPage';
import { TrackingPage } from '../pages/app/TrackingPage';
import { PublicTrackingPage } from '../pages/public/PublicTrackingPage';
import { CustomerTrackingPreviewPage } from '../pages/app/CustomerTrackingPreviewPage';
import { TrackingPageSettings } from '../pages/app/settings/TrackingPageSettings';
import { NotificationsPage } from '../pages/app/NotificationsPage';
import { NotificationTemplatesPage } from '../pages/app/NotificationTemplatesPage';
import { NotificationRulesPage } from '../pages/app/NotificationRulesPage';
import { NotificationDetailPage } from '../pages/app/NotificationDetailPage';
import { NotificationChannelSettings } from '../pages/app/settings/NotificationChannelSettings';
import { WalletPage } from '../pages/app/WalletPage';
import { WalletRechargeWizardPage } from '../pages/app/WalletRechargeWizardPage';
import { WalletTransactionsPage } from '../pages/app/WalletTransactionsPage';
import { WalletTransactionDetailPage } from '../pages/app/WalletTransactionDetailPage';
import { InvoiceDetailPage } from '../pages/app/InvoiceDetailPage';
import { BillingSettingsPage } from '../pages/app/settings/BillingSettingsPage';
import { CourierSettingsPage } from '../pages/app/settings/CourierSettingsPage';
import { CouriersPage } from '../pages/app/CouriersPage';
import { AddCourierWizardPage } from '../pages/app/AddCourierWizardPage';
import { CourierDetailPage } from '../pages/app/CourierDetailPage';
import { PricingPage } from '../pages/app/PricingPage';
import { BookingsPage } from '../pages/app/BookingsPage';
import { BookingDetailPage } from '../pages/app/BookingDetailPage';
import { RateCalculatorPage } from '../pages/app/RateCalculatorPage';
import { CustomerMyRateCardPage } from '../pages/app/CustomerMyRateCardPage';
import { ServiceabilityPage } from '../pages/app/ServiceabilityPage';
import { CourierAllocationPage } from '../pages/app/CourierAllocationPage';
import { WarehousesPage } from '../pages/app/WarehousesPage';
import { CodDashboardPage } from '../pages/app/CodDashboardPage';
import { NdrManagementPage } from '../pages/app/NdrManagementPage';
import { RtoManagementPage } from '../pages/app/RtoManagementPage';
import { SellerOnboardingWizardPage } from '../pages/app/SellerOnboardingWizardPage';
import { SellerStaffUsersPage } from '../pages/app/settings/SellerStaffUsersPage';
import { SellerTeamRolesPage } from '../pages/app/team/SellerTeamRolesPage';
import { SellerTeamActivityPage } from '../pages/app/team/SellerTeamActivityPage';
import { CompanyProfilePage } from '../pages/app/settings/CompanyProfilePage';
import { SellerKycVerificationPage } from '../pages/app/settings/SellerKycVerificationPage';
import { BankDetailsPage } from '../pages/app/settings/BankDetailsPage';
import { ShippingPlansPage } from '../pages/app/settings/ShippingPlansPage';
import { ServiceAgreementPage } from '../pages/app/settings/ServiceAgreementPage';
import { TrainingCenterPage } from '../pages/app/settings/TrainingCenterPage';
import { PreferencesPage } from '../pages/app/settings/PreferencesPage';
import { ChangePasswordPage } from '../pages/app/settings/ChangePasswordPage';
import { WeightDiscrepancyPage } from '../pages/app/WeightDiscrepancyPage';
import { OrderDetailPage } from '../pages/app/OrderDetailPage';
import { GstProfileSettingsPage } from '../pages/app/settings/GstProfileSettingsPage';
import { CustomerGstInvoicesPage } from '../pages/app/billing/CustomerGstInvoicesPage';
import { RoutePlaceholder } from '../components/common/RoutePlaceholder';
import { PermissionGuard } from '../components/common/PermissionGuard';
import { TenantGuard } from '../components/common/TenantGuard';

export const appRoutes: RouteObject = {
  path: '/app',
  element: <AppLayout />,
  children: [
    {
      index: true,
      element: <CustomerDashboard />,
    },
    // SHIPMENTS
    {
      path: 'shipments',
      element: <ShipmentsPage />,
    },
    {
      path: 'shipments/create',
      element: <CreateShipmentWizardPage />,
    },
    {
      path: 'shipments/:shipmentId',
      element: <TenantGuard><ShipmentControlCenterPage /></TenantGuard>,
    },
    {
      path: 'shipment-control-center/:id',
      element: <TenantGuard><ShipmentControlCenterPage /></TenantGuard>,
    },
    {
      path: 'shipments/:shipmentId/label',
      element: <ShipmentLabelPage />,
    },
    {
      path: 'labels/:id',
      element: <LabelPreviewPage />,
    },
    {
      path: 'shipments/ready',
      element: <RoutePlaceholder moduleName="Ready to Ship Dispatches" portal="Customer Portal" path="/app/shipments/ready" />,
    },
    {
      path: 'shipments/pickup',
      element: <PickupsPage />,
    },
    {
      path: 'shipments/in-transit',
      element: <RoutePlaceholder moduleName="In-Transit Parcels" portal="Customer Portal" path="/app/shipments/in-transit" />,
    },
    {
      path: 'shipments/out-for-delivery',
      element: <RoutePlaceholder moduleName="Out for Delivery Shipments" portal="Customer Portal" path="/app/shipments/out-for-delivery" />,
    },
    {
      path: 'shipments/delivered',
      element: <RoutePlaceholder moduleName="Delivered Orders & Proof of Delivery" portal="Customer Portal" path="/app/shipments/delivered" />,
    },
    {
      path: 'ndr',
      element: <NdrManagementPage />,
    },
    {
      path: 'weight-discrepancies',
      element: <WeightDiscrepancyPage />,
    },
    {
      path: 'rto',
      element: <RtoManagementPage />,
    },
    {
      path: 'tracking',
      element: <TrackingPage />,
    },
    {
      path: 'tracking/:shipmentId',
      element: <TrackingPage />,
    },
    {
      path: 'tracking-preview',
      element: <CustomerTrackingPreviewPage />,
    },
    {
      path: 'settings/tracking-page',
      element: <TrackingPageSettings />,
    },
    {
      path: 'notifications',
      element: <NotificationsPage />,
    },
    {
      path: 'notifications/templates',
      element: <NotificationTemplatesPage />,
    },
    {
      path: 'notifications/rules',
      element: <NotificationRulesPage />,
    },
    {
      path: 'notifications/:id',
      element: <NotificationDetailPage />,
    },
    {
      path: 'settings/notifications',
      element: <NotificationChannelSettings />,
    },
    {
      path: 'exceptions',
      element: <ExceptionsPage />,
    },
    {
      path: 'exceptions/:id',
      element: <ExceptionDetailPage />,
    },

    // PICKUPS
    {
      path: 'pickups',
      element: <CustomerPickupRequestsPage />,
    },
    {
      path: 'pickups/create',
      element: <CreatePickupWizardPage />,
    },
    {
      path: 'pickups/:pickupId',
      element: <PickupDetailPage />,
    },

    // LABELS & MANIFESTS
    {
      path: 'labels',
      element: <ShippingLabelsPage />,
    },
    {
      path: 'manifests',
      element: <ManifestsPage />,
    },
    {
      path: 'manifests/create',
      element: <CreateManifestPage />,
    },
    {
      path: 'manifests/:manifestId',
      element: <ManifestDetailPage />,
    },

    // BULK OPERATIONS
    {
      path: 'bulk',
      element: <BulkOrderImportPage />,
    },
    {
      path: 'bulk/upload',
      element: <BulkOrderImportPage />,
    },
    {
      path: 'bulk/history',
      element: <BulkOrderImportPage />,
    },
    {
      path: 'bulk/labels',
      element: <ShippingLabelsPage />,
    },
    {
      path: 'bulk/manifests',
      element: <ManifestsPage />,
    },
    {
      path: 'bulk/failed',
      element: <BulkOrderImportPage />,
    },

    // ORDERS
    {
      path: 'orders',
      element: <CustomerOrdersPage />,
    },
    {
      path: 'orders/bulk-upload',
      element: <BulkOrderImportPage />,
    },
    {
      path: 'orders/create',
      element: <CreateShipmentWizardPage />,
    },
    {
      path: 'orders/:id',
      element: <OrderDetailPage />,
    },
    {
      path: 'orders/pending',
      element: <RoutePlaceholder moduleName="Pending & Unfulfilled Orders" portal="Customer Portal" path="/app/orders/pending" />,
    },
    {
      path: 'orders/cancelled',
      element: <RoutePlaceholder moduleName="Cancelled Orders Log" portal="Customer Portal" path="/app/orders/cancelled" />,
    },

    // COURIERS & RATES
    {
      path: 'couriers',
      element: <CouriersPage />,
    },
    {
      path: 'couriers/integrations',
      element: <CouriersPage />,
    },
    {
      path: 'couriers/add',
      element: <AddCourierWizardPage />,
    },
    {
      path: 'couriers/:courierId',
      element: <CourierDetailPage />,
    },
    {
      path: 'pricing',
      element: <PricingPage />,
    },
    {
      path: 'bookings',
      element: <BookingsPage />,
    },
    {
      path: 'bookings/:id',
      element: <BookingDetailPage />,
    },
    {
      path: 'rates',
      element: <RateCalculatorPage />,
    },
    {
      path: 'my-rate-card',
      element: <CustomerMyRateCardPage />,
    },
    {
      path: 'rate-calculator',
      element: <RateCalculatorPage />,
    },
    {
      path: 'calculator',
      element: <RateCalculatorPage />,
    },
    {
      path: 'serviceability',
      element: <ServiceabilityPage />,
    },
    {
      path: 'couriers/calculator',
      element: <RateCalculatorPage />,
    },
    {
      path: 'couriers/serviceability',
      element: <ServiceabilityPage />,
    },
    {
      path: 'courier-allocation',
      element: <CourierAllocationPage />,
    },
    {
      path: 'couriers/allocation',
      element: <CourierAllocationPage />,
    },

    // FINANCE
    {
      path: 'wallet',
      element: <WalletPage />,
    },
    {
      path: 'wallet/transactions',
      element: <WalletTransactionsPage />,
    },
    {
      path: 'wallet/transactions/:id',
      element: <WalletTransactionDetailPage />,
    },
    {
      path: 'wallet/recharge',
      element: <WalletRechargeWizardPage />,
    },
    {
      path: 'cod',
      element: <CodDashboardPage />,
    },
    {
      path: 'billing',
      element: <CustomerGstInvoicesPage />,
    },
    {
      path: 'billing/gst-invoices',
      element: <CustomerGstInvoicesPage />,
    },
    {
      path: 'billing/invoices/:id',
      element: <InvoiceDetailPage />,
    },
    {
      path: 'settings/billing',
      element: <BillingSettingsPage />,
    },
    {
      path: 'settings/gst-profile',
      element: <GstProfileSettingsPage />,
    },
    {
      path: 'settings/warehouses',
      element: <WarehousesPage />,
    },
    {
      path: 'settings/couriers',
      element: <CourierSettingsPage />,
    },

    // ANALYTICS
    {
      path: 'reports',
      element: <RoutePlaceholder moduleName="Analytics & Shipping Reports" portal="Customer Portal" path="/app/reports" />,
    },
    {
      path: 'reports/analytics',
      element: <RoutePlaceholder moduleName="Logistics BI & Shipping Analytics" portal="Customer Portal" path="/app/reports/analytics" />,
    },

    // MANAGEMENT
    {
      path: 'warehouses',
      element: <WarehousesPage />,
    },
    {
      path: 'customers',
      element: <RoutePlaceholder moduleName="Customer Address Book" portal="Customer Portal" path="/app/customers" />,
    },
    {
      path: 'onboarding',
      element: <SellerOnboardingWizardPage />,
    },
    {
      path: 'team',
      element: <PermissionGuard><SellerStaffUsersPage /></PermissionGuard>,
    },
    {
      path: 'team/roles',
      element: <PermissionGuard><SellerTeamRolesPage /></PermissionGuard>,
    },
    {
      path: 'team/activity',
      element: <PermissionGuard><SellerTeamActivityPage /></PermissionGuard>,
    },
    {
      path: 'settings/team',
      element: <PermissionGuard><SellerStaffUsersPage /></PermissionGuard>,
    },
    {
      path: 'settings/company',
      element: <CompanyProfilePage />,
    },
    {
      path: 'settings/profile',
      element: <CompanyProfilePage />,
    },
    {
      path: 'kyc',
      element: <SellerKycVerificationPage />,
    },
    {
      path: 'settings/kyc',
      element: <SellerKycVerificationPage />,
    },
    {
      path: 'settings/bank',
      element: <BankDetailsPage />,
    },
    {
      path: 'settings/shipping-plans',
      element: <ShippingPlansPage />,
    },
    {
      path: 'settings/agreement',
      element: <ServiceAgreementPage />,
    },
    {
      path: 'settings/training',
      element: <TrainingCenterPage />,
    },
    {
      path: 'settings/preferences',
      element: <PreferencesPage />,
    },
    {
      path: 'settings/security',
      element: <ChangePasswordPage />,
    },
    // SUPPORT & ACCOUNT
    {
      path: 'support',
      element: <RoutePlaceholder moduleName="Customer Support & Help Desk" portal="Customer Portal" path="/app/support" />,
    },
    {
      path: 'support/tickets',
      element: <RoutePlaceholder moduleName="Support Tickets History" portal="Customer Portal" path="/app/support/tickets" />,
    },
    {
      path: 'settings',
      element: <CompanyProfilePage />,
    },
  ],
};

export const publicTrackRoutes: RouteObject = {
  path: 'track',
  element: <PublicTrackingPage />,
  children: [
    {
      path: ':awb',
      element: <PublicTrackingPage />,
    },
  ],
};
