import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  ShieldAlert,
  Activity,
  BarChart3,
  PieChart,
  X,
  Copy,
  Check,
  ExternalLink,
  Clock,
  MapPin,
  Calendar,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import {
  Button,
  Card,
  Badge,
  Table,
  CardSkeleton,
} from '../../components/ui';
import { Drawer } from '../../components/ui/Drawer';
import { AnimatedCounter } from '../../components/common/AnimatedCounter';
import { WalletService } from '../../mocks/wallet.mock';
import { CustomerShipmentService, type CustomerShipmentDetail } from '../../services/customerShipmentService';
import { formatNumber } from '../../utils/formatters';

import { OnboardingTrackerCard } from '../../components/app/OnboardingTrackerCard';
import { ThreeDIcon } from '../../components/common/ThreeDIcon';

export const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Alert Dismiss States
  const [showDisputesAlert, setShowDisputesAlert] = useState(false);
  const [showNdrAlert, setShowNdrAlert] = useState(false);
  const [showWalletAlert, setShowWalletAlert] = useState(true);

  // 5-Stage Interactive Shipment Pipeline Filter ('all' | 'created' | 'inTransit' | 'delivered' | 'rto')
  const [activeStageFilter, setActiveStageFilter] = useState<'all' | 'created' | 'inTransit' | 'delivered' | 'rto'>('all');

  // Slide-over Order Peek Drawer
  const [selectedDrawerOrder, setSelectedDrawerOrder] = useState<CustomerShipmentDetail | null>(null);

  // 1-Click Copy AWB with temporary feedback
  const [copiedAwb, setCopiedAwb] = useState<string | null>(null);
  const handleCopyAwb = (e: React.MouseEvent, awb: string) => {
    e.stopPropagation();
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(awb);
    }
    setCopiedAwb(awb);
    setTimeout(() => {
      setCopiedAwb((prev) => (prev === awb ? null : prev));
    }, 2000);
  };

  // Date Range Filter State for Charts & Metrics
  const [chartDateRange, setChartDateRange] = useState<'today' | '7d' | '30d'>('7d');
  const [isMetricsLoading, setIsMetricsLoading] = useState(false);

  const handleDateRangeChange = (range: 'today' | '7d' | '30d') => {
    setIsMetricsLoading(true);
    setChartDateRange(range);
    setTimeout(() => setIsMetricsLoading(false), 250);
  };

  const [, setSyncVersion] = useState<number>(0);

  // Active Tenant & Wallet Data
  const activeTenantId =
    typeof window !== 'undefined' && window.localStorage
      ? localStorage.getItem('courrier3_active_tenant_id') || 'tenant-demo-01'
      : 'tenant-demo-01';

  // Synchronize shipments and wallet from Supabase Cloud DB on mount
  useEffect(() => {
    Promise.all([
      CustomerShipmentService.syncFromSupabase(activeTenantId),
      WalletService.syncFromSupabase(activeTenantId),
    ])
      .then(() => {
        setSyncVersion((v) => v + 1);
      })
      .catch(() => {});
  }, [activeTenantId]);

  const wallet = WalletService.getWallet(activeTenantId);
  const walletBalancePaise = wallet.availableBalanceMinor ?? 0;
  const walletBalanceINR = (walletBalancePaise / 100).toFixed(2);
  const isWalletLow = parseFloat(walletBalanceINR) < 500;

  // Real-time Tenant Shipments Data
  const tenantShipments = CustomerShipmentService.queryShipments({ tenantId: activeTenantId });

  const totalShipmentsCount = tenantShipments.length;
  const todaysOrdersCount = tenantShipments.length;
  const createdCount = tenantShipments.filter((s) =>
    ['CREATED', 'DRAFT', 'BOOKING_CONFIRMED', 'AWB_ASSIGNED', 'PICKUP_REQUESTED', 'PENDING_API', 'API_PROCESSING'].includes(
      s.bookingStatus
    )
  ).length;
  const inTransitCount = tenantShipments.filter((s) =>
    ['IN_TRANSIT', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(s.bookingStatus)
  ).length;
  const deliveredCount = tenantShipments.filter((s) => s.bookingStatus === 'DELIVERED').length;
  const rtoCount = tenantShipments.filter((s) =>
    ['NDR', 'RTO_INITIATED', 'RTO_IN_TRANSIT', 'RTO_DELIVERED', 'CANCELLED', 'CANCEL_REQUESTED'].includes(s.bookingStatus)
  ).length;
  const codPendingTotal = tenantShipments
    .filter((s) => s.paymentMode === 'COD' && s.bookingStatus !== 'DELIVERED')
    .reduce((acc, curr) => acc + (curr.codAmountINR || 0), 0);

  // Breadcrumbs
  const breadcrumbs = [
    { label: 'Merchant Portal', path: '/app' },
    { label: 'Dashboard', path: '/app' },
  ];

  // 1. TOP 5 KPI CARDS CONFIGURATION (Animated Counters)
  const kpiCardsList = [
    {
      id: 'wallet-balance',
      title: 'Wallet Balance',
      numericValue: parseFloat(walletBalanceINR) || 0,
      prefix: '₹',
      decimals: 2,
      trend: parseFloat(walletBalanceINR) > 0 ? 'Active Prepaid Funds' : 'Recharge Required',
      isTrendPositive: parseFloat(walletBalanceINR) > 0,
      subtitle: 'Available shipping funds',
      threeDType: 'wallet' as const,
      cardBg: '#faf5ff',
      borderColor: '#ddd6fe',
      textColor: '#6d28d9',
      path: '/app/wallet',
    },
    {
      id: 'todays-orders',
      title: "Today's Orders",
      numericValue: todaysOrdersCount,
      prefix: '',
      decimals: 0,
      trend: todaysOrdersCount === 0 ? '0 orders today' : `${todaysOrdersCount} total booked`,
      isTrendPositive: todaysOrdersCount > 0,
      subtitle: 'Dispatched today',
      threeDType: 'orders' as const,
      cardBg: '#eff6ff',
      borderColor: '#bfdbfe',
      textColor: '#1d4ed8',
      path: '/app/orders',
    },
    {
      id: 'in-transit',
      title: 'In Transit',
      numericValue: inTransitCount,
      prefix: '',
      decimals: 0,
      trend: inTransitCount === 0 ? '0 in transit' : `${inTransitCount} on route`,
      isTrendPositive: inTransitCount > 0,
      subtitle: 'Parcels on the move',
      threeDType: 'transit' as const,
      cardBg: '#f0f9ff',
      borderColor: '#bae6fd',
      textColor: '#0369a1',
      path: '/app/shipments',
    },
    {
      id: 'delivered',
      title: 'Delivered',
      numericValue: deliveredCount,
      prefix: '',
      decimals: 0,
      trend: deliveredCount === 0 ? '0 delivered' : `${deliveredCount} fulfilled`,
      isTrendPositive: true,
      subtitle: 'Successfully fulfilled',
      threeDType: 'delivered' as const,
      cardBg: '#f0fdf4',
      borderColor: '#bbf7d0',
      textColor: '#15803d',
      path: '/app/shipments',
    },
    {
      id: 'cod-pending',
      title: 'COD Pending',
      numericValue: codPendingTotal,
      prefix: '₹',
      decimals: 2,
      trend: codPendingTotal === 0 ? 'No pending COD' : `₹${codPendingTotal.toFixed(2)} in pipeline`,
      isTrendPositive: true,
      subtitle: 'Pending cash payouts',
      threeDType: 'cod' as const,
      cardBg: '#fffbeb',
      borderColor: '#fef3c7',
      textColor: '#b45309',
      path: '/app/cod',
    },
  ];

  // 2. 6 LARGE ACTION CARDS CONFIGURATION
  const mainActionCards = [
    {
      id: 'create-shipment',
      title: 'Create Shipment',
      description: 'Book single dispatches or B2B freight orders with instant courier rate cards.',
      threeDType: 'shipment_create' as const,
      btnText: 'Create Order →',
      path: '/app/orders/create',
    },
    {
      id: 'all-orders',
      title: 'All Orders',
      description: 'Track active shipments, bulk uploads, manifests, and shipping labels.',
      threeDType: 'all_orders' as const,
      btnText: 'View Orders →',
      path: '/app/orders',
    },
    {
      id: 'track-shipment',
      title: 'Track Shipment',
      description: 'Real-time AWB tracking, NDR exception resolution & delivery status.',
      threeDType: 'track' as const,
      btnText: 'Track AWB →',
      path: '/app/tracking',
    },
    {
      id: 'rate-calculator',
      title: 'Rate Calculator',
      description: 'Calculate instant courier freight rates across 29,000+ Indian pincodes.',
      threeDType: 'calculator' as const,
      btnText: 'Calculate Rates →',
      path: '/app/rates',
    },
    {
      id: 'warehouses',
      title: 'Warehouses',
      description: 'Manage pickup hubs, seller origin locations & contact addresses.',
      threeDType: 'warehouse' as const,
      btnText: 'Manage Hubs →',
      path: '/app/warehouses',
    },
    {
      id: 'invoices',
      title: 'Invoices & Billing',
      description: 'View GST tax invoices, billing ledgers & daily COD remittance statements.',
      threeDType: 'invoices' as const,
      btnText: 'View Invoices →',
      path: '/app/billing',
    },
  ];

  // 3. RECENT ORDERS DATA (Filtered dynamically by active pipeline funnel stage)
  const filteredShipments = tenantShipments.filter((s) => {
    if (activeStageFilter === 'all') return true;
    if (activeStageFilter === 'created') {
      return ['CREATED', 'DRAFT', 'BOOKING_CONFIRMED', 'AWB_ASSIGNED', 'PICKUP_REQUESTED', 'PENDING_API', 'API_PROCESSING'].includes(
        s.bookingStatus
      );
    }
    if (activeStageFilter === 'inTransit') {
      return ['IN_TRANSIT', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(s.bookingStatus);
    }
    if (activeStageFilter === 'delivered') {
      return s.bookingStatus === 'DELIVERED';
    }
    if (activeStageFilter === 'rto') {
      return ['NDR', 'RTO_INITIATED', 'RTO_IN_TRANSIT', 'RTO_DELIVERED', 'CANCELLED', 'CANCEL_REQUESTED'].includes(
        s.bookingStatus
      );
    }
    return true;
  });

  interface RecentOrderRow extends Record<string, unknown> {
    awb: string;
    orderId: string;
    customer: string;
    destinationCity: string;
    courier: string;
    status: string;
    statusVariant: 'success' | 'info' | 'warning' | 'danger' | 'brand' | 'neutral';
    amount: string;
    rawShipment: CustomerShipmentDetail;
  }

  const recentOrdersData: RecentOrderRow[] = filteredShipments.slice(0, 6).map((s) => ({
    awb: s.awbNumber || 'PENDING',
    orderId: s.orderId || s.id,
    customer: s.deliveryContact || 'Customer',
    destinationCity: s.deliveryCity || '',
    courier: s.courierName || 'Shypfy Live',
    status: CustomerShipmentService.getCustomerFacingStatus(s.bookingStatus),
    statusVariant: (s.bookingStatus === 'DELIVERED' ? 'success' : s.bookingStatus === 'CANCELLED' ? 'danger' : 'brand') as any,
    amount: `₹${(s.totalCustomerChargeINR || 0).toFixed(2)}`,
    rawShipment: s,
  }));

  // 3. LIVE OPERATIONAL ACTIVITY FEED DATA
  const activityFeedData = [
    {
      id: 'act-1',
      title: 'Shypfy Live API Active',
      description: 'Shypfy Live API endpoint & auth token verified (HTTP 200 OK)',
      time: 'Just now',
      icon: CheckCircle2,
      iconColor: '#16a34a',
      bgColor: '#f0fdf4',
    },
    {
      id: 'act-2',
      title: 'Account Initialized',
      description: 'Logistics merchant portal ready for shipping',
      time: 'System',
      icon: Package,
      iconColor: '#0284c7',
      bgColor: '#f0f9ff',
    },
  ];

  // 4. COURIER USAGE ANALYTICS DATA
  const courierUsageData = [
    { name: 'Shypfy Live API', share: 100, count: 0, color: '#6366f1' },
  ];

  // Dynamic Chart Data based on Date Filter
  const performanceChartStats = {
    today: { created: 0, inTransit: 0, delivered: 0, rto: 0 },
    '7d': { created: 0, inTransit: 0, delivered: 0, rto: 0 },
    '30d': { created: 0, inTransit: 0, delivered: 0, rto: 0 },
  }[chartDateRange];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1400px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* 1. DASHBOARD HEADER */}
      <PageHeader
        title="Dashboard"
        description="Real-time logistics analytics, wallet balance, and operational activity."
        breadcrumbs={breadcrumbs}
        style={{ marginBottom: '0px' }}
        actions={
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => navigate('/app/orders/create')}
            style={{ backgroundColor: '#0284c7', borderColor: '#0284c7', fontWeight: '700' }}
          >
            Create Shipment
          </Button>
        }
      />

      {/* ONBOARDING TRACKER CARD */}
      <OnboardingTrackerCard customerId="CUST-1001" />

      {/* 2. ALERT CENTER (CONDITIONAL OPERATIONAL ALERTS) */}
      {(showDisputesAlert || showNdrAlert || (isWalletLow && showWalletAlert)) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          
          {/* Weight Disputes Alert */}
          {showDisputesAlert && (
            <div style={{ padding: '12px 16px', backgroundColor: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={18} style={{ color: '#d97706' }} />
                <div>
                  <strong style={{ fontSize: '13px', color: '#92400e', display: 'block' }}>3 Weight Disputes Pending Verification</strong>
                  <span style={{ fontSize: '11px', color: '#b45309' }}>Courier weight discrepancies detected. Submit proof to avoid auto-debit.</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button variant="outline" size="sm" onClick={() => navigate('/app/weight-discrepancies')} style={{ fontSize: '11px', borderColor: '#fde68a', color: '#92400e' }}>
                  Resolve Disputes
                </Button>
                <button
                  onClick={() => setShowDisputesAlert(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#92400e', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Dismiss Alert"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Pending NDR Alert */}
          {showNdrAlert && (
            <div style={{ padding: '12px 16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={18} style={{ color: '#0284c7', flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '13px', color: '#0369a1', display: 'block' }}>38 Pending NDR Cases Requiring Action</strong>
                  <span style={{ fontSize: '12px', lineHeight: 1.4, color: '#0284c7' }}>Delivery re-attempt instructions needed to prevent parcel return.</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Button variant="outline" size="sm" onClick={() => navigate('/app/ndr')} style={{ height: '30px', fontSize: '12px', fontWeight: '600', borderColor: '#93c5fd', color: '#0369a1', borderRadius: '6px' }}>
                  Take Action
                </Button>
                <button
                  type="button"
                  onClick={() => setShowNdrAlert(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0369a1',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(2, 132, 199, 0.12)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  title="Dismiss Alert"
                  aria-label="Dismiss pending NDR alert"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}

          {/* Low Wallet Balance Alert (Shown conditionally) */}
          {isWalletLow && showWalletAlert && (
            <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CreditCard size={18} style={{ color: '#dc2626', flexShrink: 0 }} />
                <div>
                  <strong style={{ fontSize: '13px', color: '#991b1b', display: 'block' }}>Low Wallet Balance (₹{walletBalanceINR})</strong>
                  <span style={{ fontSize: '12px', lineHeight: 1.4, color: '#b91c1c' }}>Recharge your shipping wallet to ensure uninterrupted courier dispatch.</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/app/wallet')}
                  style={{ height: '30px', fontSize: '12px', fontWeight: '600', backgroundColor: '#dc2626', borderColor: '#dc2626', borderRadius: '6px' }}
                >
                  Recharge Now
                </Button>
                <button
                  type="button"
                  onClick={() => setShowWalletAlert(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#991b1b',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.12)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  title="Dismiss Alert"
                  aria-label="Dismiss low wallet balance alert"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. TOP 5 COLORFUL 3D KPI CARDS */}
      {isMetricsLoading ? (
        <CardSkeleton count={5} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '14px', width: '100%' }}>
        {kpiCardsList.map((card) => {
          return (
            <div
              key={card.id}
              onClick={() => navigate(card.path)}
              style={{
                backgroundColor: '#ffffff',
                border: `1px solid ${card.borderColor}`,
                borderRadius: '14px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <ThreeDIcon type={card.threeDType} size="sm" />

                <div style={{ display: 'flex', alignItems: 'center', gap: '2px', fontSize: '10px', fontWeight: '700', color: card.textColor, backgroundColor: card.cardBg, padding: '2px 6px', borderRadius: '4px' }}>
                  {card.isTrendPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {card.trend}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>
                  <AnimatedCounter
                    value={card.numericValue}
                    prefix={card.prefix}
                    decimals={card.decimals}
                  />
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#334155', marginTop: '4px' }}>
                  {card.title}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  {card.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* 4. 6 LOGISTICS ACTION CARDS GRID (Compact & Efficient) */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', letterSpacing: '-0.01em', margin: '0 0 12px 0' }}>
          Core Operational Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', width: '100%' }}>
          {mainActionCards.map((card) => {
            return (
              <div
                key={card.id}
                role="button"
                tabIndex={0}
                onClick={() => navigate(card.path)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(card.path);
                  }
                }}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  transition: 'transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = '#0284c7';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <ThreeDIcon type={card.threeDType} size="sm" />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                      {card.title}
                    </h3>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '3px 0 0 0', lineHeight: 1.35 }}>
                      {card.description}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-start', borderTop: '1px solid #f8fafc', paddingTop: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {card.btnText}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. SECOND ROW: SHIPMENT PERFORMANCE CHART & WALLET SUMMARY CARD */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', alignItems: 'stretch' }}>
        
        {/* LEFT: SHIPMENT PERFORMANCE & PIPELINE FUNNEL FILTER PANEL */}
        <Card style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={18} style={{ color: '#0284c7' }} /> Shipment Pipeline Funnel
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Click any stage to live-filter recent orders</span>
              </div>

              {/* Reset filter badge if not 'all' */}
              {activeStageFilter !== 'all' && (
                <button
                  type="button"
                  onClick={() => setActiveStageFilter('all')}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border: '1px solid #bae6fd',
                    backgroundColor: '#f0f9ff',
                    color: '#0284c7',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  title="Show all shipments"
                >
                  Clear Filter (Show All) <X size={12} />
                </button>
              )}
            </div>

            {/* Visual Performance Progress Bar */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ height: '12px', width: '100%', backgroundColor: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: totalShipmentsCount > 0 ? `${Math.round((deliveredCount / totalShipmentsCount) * 100)}%` : '0%', backgroundColor: '#16a34a', transition: 'width 0.4s ease' }} title={`Delivered: ${deliveredCount}`} />
                <div style={{ width: totalShipmentsCount > 0 ? `${Math.round((inTransitCount / totalShipmentsCount) * 100)}%` : '0%', backgroundColor: '#0284c7', transition: 'width 0.4s ease' }} title={`In Transit: ${inTransitCount}`} />
                <div style={{ width: totalShipmentsCount > 0 ? `${Math.round((createdCount / totalShipmentsCount) * 100)}%` : '100%', backgroundColor: '#38bdf8', transition: 'width 0.4s ease' }} title={`Created: ${createdCount}`} />
                <div style={{ width: totalShipmentsCount > 0 ? `${Math.round((rtoCount / totalShipmentsCount) * 100)}%` : '0%', backgroundColor: '#ef4444', transition: 'width 0.4s ease' }} title={`RTO / NDR: ${rtoCount}`} />
              </div>
            </div>

            {/* Interactive 5-Stage Funnel Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))', gap: '8px' }}>
              {[
                { key: 'all' as const, label: 'All Orders', count: totalShipmentsCount, color: '#0369a1', bg: '#f8fafc', activeBg: '#e0f2fe', border: '#e2e8f0', activeBorder: '#0284c7' },
                { key: 'created' as const, label: 'Created', count: createdCount, color: '#0284c7', bg: '#f0f9ff', activeBg: '#e0f2fe', border: '#bae6fd', activeBorder: '#0284c7' },
                { key: 'inTransit' as const, label: 'In Transit', count: inTransitCount, color: '#15803d', bg: '#f0fdf4', activeBg: '#dcfce7', border: '#bbf7d0', activeBorder: '#16a34a' },
                { key: 'delivered' as const, label: 'Delivered', count: deliveredCount, color: '#047857', bg: '#ecfdf5', activeBg: '#d1fae5', border: '#a7f3d0', activeBorder: '#059669' },
                { key: 'rto' as const, label: 'NDR / RTO', count: rtoCount, color: '#b91c1c', bg: '#fef2f2', activeBg: '#fee2e2', border: '#fecaca', activeBorder: '#dc2626' },
              ].map((stage) => {
                const isActive = activeStageFilter === stage.key;
                return (
                  <button
                    key={stage.key}
                    type="button"
                    onClick={() => setActiveStageFilter(stage.key)}
                    style={{
                      padding: '10px 6px',
                      backgroundColor: isActive ? stage.activeBg : stage.bg,
                      border: `2px solid ${isActive ? stage.activeBorder : stage.border}`,
                      borderRadius: '10px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.18s ease',
                      boxShadow: isActive ? '0 4px 12px rgba(2, 132, 199, 0.18)' : 'none',
                      transform: isActive ? 'translateY(-2px)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.transform = 'none';
                    }}
                  >
                    <span style={{ fontSize: '10px', color: stage.color, fontWeight: '800', display: 'block', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      {stage.label}
                    </span>
                    <span style={{ fontSize: '17px', fontWeight: '900', color: '#0f172a', display: 'block', marginTop: '2px' }}>
                      <AnimatedCounter value={stage.count} />
                    </span>
                    {isActive && (
                      <span style={{ fontSize: '9px', fontWeight: '800', color: stage.color, display: 'inline-block', marginTop: '2px', textTransform: 'uppercase' }}>
                        Active Filter
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
            <span>Success Rate: <strong style={{ color: '#16a34a' }}>{totalShipmentsCount > 0 ? `${Math.round((deliveredCount / totalShipmentsCount) * 100)}%` : '100%'}</strong></span>
            <span>Active Filter: <strong style={{ color: '#0284c7', textTransform: 'uppercase' }}>{activeStageFilter}</strong></span>
          </div>
        </Card>

        {/* RIGHT: WALLET SUMMARY CARD */}
        <Card style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Wallet size={18} style={{ color: '#7c3aed' }} />
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
                  Wallet Summary
                </h3>
              </div>
              <Badge variant="brand">Prepaid Merchant</Badge>
            </div>

            {/* Big Current Balance Readout with AnimatedCounter */}
            <div style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '16px', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                Current Balance
              </span>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#5b21b6', marginTop: '2px' }}>
                <AnimatedCounter
                  value={parseFloat(walletBalanceINR) || 0}
                  prefix="₹ "
                  decimals={2}
                />
              </div>
            </div>

            {/* Hold Balance & Monthly Spend breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>Hold Balance</span>
                <strong style={{ color: '#0f172a', fontSize: '14px' }}>₹ 0.00</strong>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>Monthly Spend</span>
                <strong style={{ color: '#0f172a', fontSize: '14px' }}>₹ 0.00</strong>
              </div>
            </div>
          </div>

          {/* Recharge Button */}
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus size={16} />}
            onClick={() => navigate('/app/wallet')}
            style={{ width: '100%', marginTop: '16px', backgroundColor: '#7c3aed', borderColor: '#7c3aed', fontWeight: '700' }}
          >
            Recharge Wallet
          </Button>
        </Card>

      </div>

      {/* 5. THIRD ROW: RECENT ORDERS TABLE & LIVE ACTIVITY FEED */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', alignItems: 'start' }}>
        
        {/* LEFT: RECENT ORDERS TABLE */}
        <Card style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package size={18} style={{ color: '#0284c7' }} /> Recent Orders
              </h3>
              {activeStageFilter !== 'all' && (
                <Badge variant="brand">
                  Filtered: {activeStageFilter.toUpperCase()} ({recentOrdersData.length})
                </Badge>
              )}
            </div>
            <button
              onClick={() => navigate('/app/shipments')}
              style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View All Orders <ArrowRight size={12} />
            </button>
          </div>

          {recentOrdersData.length === 0 ? (
            <div style={{ padding: '36px 16px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              <Package size={32} style={{ color: '#94a3b8', margin: '0 auto 8px' }} />
              <strong style={{ fontSize: '14px', color: '#1e293b', display: 'block' }}>
                {activeStageFilter !== 'all' ? `No shipments in "${activeStageFilter.toUpperCase()}" stage` : 'No Recent Shipments'}
              </strong>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 16px 0' }}>
                {activeStageFilter !== 'all' ? 'Try switching to another pipeline stage or clear the filter.' : 'Your orders will appear here automatically once you book dispatches.'}
              </p>
              {activeStageFilter !== 'all' ? (
                <Button variant="outline" size="sm" onClick={() => setActiveStageFilter('all')}>
                  Show All Orders
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={() => navigate('/app/orders/create')} style={{ backgroundColor: '#0284c7', borderColor: '#0284c7' }}>
                  Book Your First Shipment
                </Button>
              )}
            </div>
          ) : (
            <Table
              columns={[
                {
                  key: 'awb',
                  header: 'AWB / Tracking',
                  render: (r: RecentOrderRow) => (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => setSelectedDrawerOrder(r.rawShipment)}
                        style={{
                          fontFamily: 'monospace',
                          color: '#0284c7',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          textDecoration: 'underline',
                          background: 'none',
                          border: 'none',
                          padding: 0,
                        }}
                        title="Open Quick Peek Drawer"
                      >
                        {r.awb}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleCopyAwb(e, r.awb)}
                        style={{
                          background: copiedAwb === r.awb ? '#dcfce7' : '#f1f5f9',
                          border: `1px solid ${copiedAwb === r.awb ? '#86efac' : '#e2e8f0'}`,
                          borderRadius: '4px',
                          padding: '2px 4px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.15s ease',
                        }}
                        title={copiedAwb === r.awb ? 'Copied to clipboard!' : 'Copy AWB'}
                      >
                        {copiedAwb === r.awb ? (
                          <Check size={11} style={{ color: '#16a34a' }} />
                        ) : (
                          <Copy size={11} style={{ color: '#64748b' }} />
                        )}
                      </button>
                      {copiedAwb === r.awb && (
                        <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700' }}>Copied!</span>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'customer',
                  header: 'Customer',
                  render: (r: RecentOrderRow) => (
                    <div>
                      <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '12px', whiteSpace: 'nowrap', display: 'block' }}>
                        {r.customer}
                      </span>
                      {r.destinationCity && (
                        <span style={{ fontSize: '10px', color: '#64748b', display: 'block' }}>
                          📍 {r.destinationCity}
                        </span>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'courier',
                  header: 'Courier',
                  render: (r: RecentOrderRow) => (
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#f0f9ff',
                        color: '#0284c7',
                        border: '1px solid #bae6fd',
                        whiteSpace: 'nowrap',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <Truck size={12} style={{ color: '#0284c7' }} />
                      {r.courier}
                    </span>
                  ),
                },
                {
                  key: 'status',
                  header: 'Status',
                  render: (r: RecentOrderRow) => <Badge variant={r.statusVariant}>{r.status}</Badge>,
                },
                {
                  key: 'amount',
                  header: 'Amount',
                  align: 'right',
                  render: (r: RecentOrderRow) => <strong style={{ color: '#0f172a', fontSize: '12px' }}>{r.amount}</strong>,
                },
                {
                  key: 'action',
                  header: 'Quick Action',
                  align: 'center',
                  render: (r: RecentOrderRow) => (
                    <button
                      type="button"
                      onClick={() => setSelectedDrawerOrder(r.rawShipment)}
                      style={{
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        padding: '3px 8px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontWeight: '700',
                        color: '#0284c7',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f0f9ff';
                        e.currentTarget.style.borderColor = '#0284c7';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ffffff';
                        e.currentTarget.style.borderColor = '#cbd5e1';
                      }}
                      title="Open Peek Drawer"
                    >
                      Peek <ExternalLink size={10} />
                    </button>
                  ),
                },
              ]}
              data={recentOrdersData}
              keyExtractor={(r) => r.awb}
            />
          )}
        </Card>

        {/* RIGHT: LIVE ACTIVITY FEED */}
        <Card style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} style={{ color: '#16a34a' }} /> Live Activity Feed
            </h3>
            <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a', display: 'inline-block' }} /> Live Stream
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activityFeedData.map((act) => {
              const ActIcon = act.icon;
              return (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '10px 12px',
                    backgroundColor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '6px',
                      backgroundColor: act.bgColor,
                      color: act.iconColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <ActIcon size={16} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{ fontSize: '12px', color: '#0f172a' }}>{act.title}</strong>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>{act.time}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#475569', margin: '3px 0 0 0', lineHeight: 1.45 }}>
                      {act.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

      </div>

      {/* 6. FOURTH ROW: COURIER USAGE ANALYTICS */}
      <Card style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <PieChart size={18} style={{ color: '#7c3aed' }} /> Courier Usage Analytics
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Shipment share percentage across top integrated logistics partners</span>
          </div>

          <Badge variant="neutral">Total 0 Shipments</Badge>
        </div>

        {/* Multi-Segment Share Bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ height: '14px', width: '100%', backgroundColor: '#e2e8f0', borderRadius: '7px', overflow: 'hidden', display: 'flex' }}>
            {courierUsageData.map((c) => (
              <div key={c.name} style={{ width: `${c.share}%`, backgroundColor: c.color }} title={`${c.name}: ${c.share}%`} />
            ))}
          </div>
        </div>

        {/* Courier Share Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          {courierUsageData.map((c) => (
            <div key={c.name} style={{ padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c.color, display: 'inline-block' }} />
                  {c.name}
                </span>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>{c.share}%</strong>
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {formatNumber(c.count)} shipments
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 7. SLIDE-OVER ORDER PEEK DRAWER */}
      <Drawer
        isOpen={Boolean(selectedDrawerOrder)}
        onClose={() => setSelectedDrawerOrder(null)}
        position="right"
        title={selectedDrawerOrder ? `Order: ${selectedDrawerOrder.orderId || selectedDrawerOrder.awbNumber || 'Details'}` : 'Shipment Details'}
      >
        {selectedDrawerOrder && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* AWB & Status Banner */}
              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Airway Bill (AWB)
                  </span>
                  <Badge variant={selectedDrawerOrder.bookingStatus === 'DELIVERED' ? 'success' : selectedDrawerOrder.bookingStatus === 'CANCELLED' ? 'danger' : 'brand'}>
                    {CustomerShipmentService.getCustomerFacingStatus(selectedDrawerOrder.bookingStatus)}
                  </Badge>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '15px', fontWeight: '800', color: '#0f172a' }}>
                    {selectedDrawerOrder.awbNumber || 'PENDING ASSIGNMENT'}
                  </span>
                  {selectedDrawerOrder.awbNumber && (
                    <button
                      type="button"
                      onClick={(e) => handleCopyAwb(e, selectedDrawerOrder.awbNumber!)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: '700',
                        border: '1px solid #cbd5e1',
                        backgroundColor: '#ffffff',
                        color: copiedAwb === selectedDrawerOrder.awbNumber ? '#16a34a' : '#0284c7',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title="Copy AWB number"
                    >
                      {copiedAwb === selectedDrawerOrder.awbNumber ? (
                        <>
                          <Check size={12} color="#16a34a" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={12} /> Copy
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* 4-Step Tracking Stepper */}
              <div style={{ backgroundColor: '#ffffff', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} style={{ color: '#0284c7' }} /> Shipment Journey Stepper
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', paddingLeft: '4px' }}>
                  {[
                    {
                      label: 'Booked / Manifested',
                      sub: 'AWB generated on Shypfy Live',
                      isDone: true,
                      isCurrent: ['BOOKING_CONFIRMED', 'AWB_ASSIGNED', 'PICKUP_REQUESTED'].includes(selectedDrawerOrder.bookingStatus),
                    },
                    {
                      label: 'Pickup Completed',
                      sub: selectedDrawerOrder.pickupCity ? `Picked from ${selectedDrawerOrder.pickupCity}` : 'Origin Hub Dispatched',
                      isDone: ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedDrawerOrder.bookingStatus),
                      isCurrent: selectedDrawerOrder.bookingStatus === 'PICKED_UP',
                    },
                    {
                      label: 'In Transit / Out for Delivery',
                      sub: 'Linehaul connection active',
                      isDone: ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(selectedDrawerOrder.bookingStatus),
                      isCurrent: ['IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(selectedDrawerOrder.bookingStatus),
                    },
                    {
                      label: 'Delivered',
                      sub: selectedDrawerOrder.bookingStatus === 'DELIVERED' ? 'Successfully handed to customer' : 'Pending destination handover',
                      isDone: selectedDrawerOrder.bookingStatus === 'DELIVERED',
                      isCurrent: selectedDrawerOrder.bookingStatus === 'DELIVERED',
                    },
                  ].map((step, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', position: 'relative' }}>
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          backgroundColor: step.isDone ? '#16a34a' : step.isCurrent ? '#0284c7' : '#e2e8f0',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '11px',
                          fontWeight: '800',
                          flexShrink: 0,
                          marginTop: '1px',
                        }}
                      >
                        {step.isDone ? <Check size={13} /> : idx + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: '700', color: step.isDone || step.isCurrent ? '#0f172a' : '#94a3b8' }}>
                          {step.label}
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '1px' }}>
                          {step.sub}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Destination */}
              <div style={{ backgroundColor: '#ffffff', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} style={{ color: '#0284c7' }} /> Destination Address
                </div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
                  {selectedDrawerOrder.deliveryContact || 'Customer'}
                </div>
                {selectedDrawerOrder.deliveryPhone && (
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Phone: {selectedDrawerOrder.deliveryPhone}
                  </div>
                )}
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px', lineHeight: 1.4 }}>
                  {selectedDrawerOrder.deliveryAddress}
                  <br />
                  {selectedDrawerOrder.deliveryCity} - {selectedDrawerOrder.deliveryPincode}
                </div>
              </div>

              {/* Package Specs & Charges */}
              <div style={{ backgroundColor: '#ffffff', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Package size={14} style={{ color: '#0284c7' }} /> Package Specs & Billing
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                  <div style={{ padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b', fontSize: '10px', display: 'block', textTransform: 'uppercase' }}>Courier</span>
                    <strong style={{ color: '#0f172a' }}>{selectedDrawerOrder.courierName || 'Shypfy Live'}</strong>
                  </div>
                  <div style={{ padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b', fontSize: '10px', display: 'block', textTransform: 'uppercase' }}>Mode</span>
                    <strong style={{ color: '#0f172a' }}>{selectedDrawerOrder.paymentMode || 'Prepaid'}</strong>
                  </div>
                  <div style={{ padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b', fontSize: '10px', display: 'block', textTransform: 'uppercase' }}>Weight</span>
                    <strong style={{ color: '#0f172a' }}>{selectedDrawerOrder.actualWeightKg ?? 0.5} kg</strong>
                  </div>
                  <div style={{ padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: '6px', border: '1px solid #f1f5f9' }}>
                    <span style={{ color: '#64748b', fontSize: '10px', display: 'block', textTransform: 'uppercase' }}>Charge</span>
                    <strong style={{ color: '#0284c7' }}>₹{(selectedDrawerOrder.totalCustomerChargeINR || 0).toFixed(2)}</strong>
                  </div>
                </div>
              </div>

            </div>

            {/* Sticky Drawer Footer Actions */}
            <div style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', backgroundColor: '#ffffff', display: 'flex', gap: '10px' }}>
              <Button
                variant="primary"
                size="sm"
                style={{ flex: 1, backgroundColor: '#0284c7', borderColor: '#0284c7', fontWeight: '700' }}
                onClick={() => {
                  const awb = selectedDrawerOrder.awbNumber;
                  setSelectedDrawerOrder(null);
                  navigate(`/app/tracking${awb ? `?awb=${awb}` : ''}`);
                }}
              >
                Full Tracking Page →
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDrawerOrder(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Drawer>

    </div>
  );
};
