import React, { useState } from 'react';
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
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import {
  Button,
  Card,
  Badge,
  Table,
  CardSkeleton,
} from '../../components/ui';
import { WalletService } from '../../mocks/wallet.mock';
import { formatNumber } from '../../utils/formatters';

import { OnboardingTrackerCard } from '../../components/app/OnboardingTrackerCard';
import { ThreeDIcon } from '../../components/common/ThreeDIcon';

export const CustomerDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Alert Dismiss States
  const [showDisputesAlert, setShowDisputesAlert] = useState(true);
  const [showNdrAlert, setShowNdrAlert] = useState(true);
  const [showWalletAlert, setShowWalletAlert] = useState(true);

  // Date Range Filter State for Charts & Metrics
  const [chartDateRange, setChartDateRange] = useState<'today' | '7d' | '30d'>('7d');
  const [isMetricsLoading, setIsMetricsLoading] = useState(false);

  const handleDateRangeChange = (range: 'today' | '7d' | '30d') => {
    setIsMetricsLoading(true);
    setChartDateRange(range);
    setTimeout(() => setIsMetricsLoading(false), 250);
  };

  // Wallet Data
  const wallet = WalletService.getWallet();
  const walletBalancePaise = wallet.availableBalanceMinor || 1485000;
  const walletBalanceINR = (walletBalancePaise / 100).toFixed(2);
  const isWalletLow = parseFloat(walletBalanceINR) < 1000;

  // Breadcrumbs
  const breadcrumbs = [
    { label: 'Merchant Portal', path: '/app' },
    { label: 'Dashboard', path: '/app' },
  ];

  // 1. TOP 5 KPI CARDS CONFIGURATION
  const kpiCardsList = [
    {
      id: 'wallet-balance',
      title: 'Wallet Balance',
      count: `₹${formatNumber(parseFloat(walletBalanceINR))}`,
      trend: 'Active Prepaid',
      isTrendPositive: true,
      subtitle: 'Available funds',
      threeDType: 'wallet' as const,
      cardBg: '#faf5ff',
      borderColor: '#ddd6fe',
      textColor: '#6d28d9',
      path: '/app/wallet',
    },
    {
      id: 'todays-orders',
      title: "Today's Orders",
      count: 48,
      trend: '+12% vs yesterday',
      isTrendPositive: true,
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
      count: 142,
      trend: '+5.1% this week',
      isTrendPositive: true,
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
      count: 1245,
      trend: '+12.3% this month',
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
      count: '₹42,500.00',
      trend: 'Settlement T+1',
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
      id: 'wallet-recharge',
      title: 'Wallet Recharge',
      description: 'Add prepaid funds via UPI, NetBanking or Credit Card for instant credit.',
      threeDType: 'recharge' as const,
      btnText: 'Recharge Now →',
      path: '/app/wallet/recharge',
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

  // 2. RECENT ORDERS DATA
  const recentOrdersData = [
    {
      awb: 'DEL9840192',
      customer: 'Rahul Sharma',
      courier: 'Delhivery Surface',
      courierBg: '#0f172a',
      status: 'Delivered',
      statusVariant: 'success' as const,
      amount: '₹ 450.00',
    },
    {
      awb: 'BD4910284',
      customer: 'Ananya Roy',
      courier: 'Blue Dart Air',
      courierBg: '#dc2626',
      status: 'In Transit',
      statusVariant: 'info' as const,
      amount: '₹ 680.00',
    },
    {
      awb: 'GAT1028491',
      customer: 'Vikram Mehta',
      courier: 'Gati Cargo',
      courierBg: '#1e3a8a',
      status: 'NDR Pending',
      statusVariant: 'warning' as const,
      amount: '₹ 1,120.00',
    },
    {
      awb: 'XPB8391023',
      customer: 'Priya Singh',
      courier: 'Xpressbees',
      courierBg: '#c026d3',
      status: 'In Transit',
      statusVariant: 'info' as const,
      amount: '₹ 380.00',
    },
    {
      awb: 'TCI7482910',
      customer: 'Suresh Kumar',
      courier: 'TCI Express',
      courierBg: '#047857',
      status: 'RTO Initiated',
      statusVariant: 'danger' as const,
      amount: '₹ 890.00',
    },
  ];

  // 3. LIVE OPERATIONAL ACTIVITY FEED DATA
  const activityFeedData = [
    {
      id: 'act-1',
      title: 'Order Created',
      description: 'Order #ORD-10848 created for Rahul Sharma (Mumbai)',
      time: '5 mins ago',
      icon: Package,
      iconColor: '#2563eb',
      bgColor: '#eff6ff',
    },
    {
      id: 'act-2',
      title: 'Pickup Scheduled',
      description: 'Pickup scheduled with Delhivery Surface for 4 parcels',
      time: '20 mins ago',
      icon: Truck,
      iconColor: '#0284c7',
      bgColor: '#f0f9ff',
    },
    {
      id: 'act-3',
      title: 'Shipment Delivered',
      description: 'AWB DEL9840192 delivered to Ananya Roy (Bangalore)',
      time: '45 mins ago',
      icon: CheckCircle2,
      iconColor: '#16a34a',
      bgColor: '#f0fdf4',
    },
    {
      id: 'act-4',
      title: 'NDR Received',
      description: 'NDR raised for AWB BD4910284: Customer unreachable',
      time: '2 hours ago',
      icon: AlertTriangle,
      iconColor: '#d97706',
      bgColor: '#fffbeb',
    },
    {
      id: 'act-5',
      title: 'Wallet Recharged',
      description: 'Wallet auto-credited with ₹5,000.00 via UPI Payment',
      time: '4 hours ago',
      icon: Wallet,
      iconColor: '#7c3aed',
      bgColor: '#faf5ff',
    },
  ];

  // 4. COURIER USAGE ANALYTICS DATA
  const courierUsageData = [
    { name: 'Delhivery', share: 38, count: 474, color: '#0f172a' },
    { name: 'Blue Dart', share: 26, count: 324, color: '#dc2626' },
    { name: 'Gati Freight', share: 18, count: 224, color: '#1e3a8a' },
    { name: 'Xpressbees', share: 12, count: 150, color: '#c026d3' },
    { name: 'TCI Express', share: 6, count: 76, color: '#047857' },
  ];

  // Dynamic Chart Data based on Date Filter
  const performanceChartStats = {
    today: { created: 120, inTransit: 85, delivered: 94, rto: 2 },
    '7d': { created: 1450, inTransit: 142, delivered: 1245, rto: 16 },
    '30d': { created: 5800, inTransit: 380, delivered: 5120, rto: 64 },
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Wallet size={14} />}
              onClick={() => navigate('/app/wallet')}
              style={{ fontWeight: '600' }}
            >
              + Add Money
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus size={14} />}
              onClick={() => navigate('/app/orders/create')}
              style={{ backgroundColor: '#0284c7', borderColor: '#0284c7', fontWeight: '700' }}
            >
              Create Shipment
            </Button>
          </div>
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
            <div style={{ padding: '12px 16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={18} style={{ color: '#2563eb' }} />
                <div>
                  <strong style={{ fontSize: '13px', color: '#1e40af', display: 'block' }}>38 Pending NDR Cases Requiring Action</strong>
                  <span style={{ fontSize: '11px', color: '#1d4ed8' }}>Delivery re-attempt instructions needed to prevent parcel return.</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button variant="outline" size="sm" onClick={() => navigate('/app/ndr')} style={{ fontSize: '11px', borderColor: '#93c5fd', color: '#1e40af' }}>
                  Take Action
                </Button>
                <button
                  onClick={() => setShowNdrAlert(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#1e40af', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Dismiss Alert"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Low Wallet Balance Alert (Shown conditionally) */}
          {isWalletLow && showWalletAlert && (
            <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CreditCard size={18} style={{ color: '#dc2626' }} />
                <div>
                  <strong style={{ fontSize: '13px', color: '#991b1b', display: 'block' }}>Low Wallet Balance (₹{walletBalanceINR})</strong>
                  <span style={{ fontSize: '11px', color: '#b91c1c' }}>Recharge your shipping wallet to ensure uninterrupted courier dispatch.</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button variant="primary" size="sm" onClick={() => navigate('/app/wallet')} style={{ fontSize: '11px', backgroundColor: '#dc2626', borderColor: '#dc2626' }}>
                  Recharge Now
                </Button>
                <button
                  onClick={() => setShowWalletAlert(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#991b1b', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Dismiss Alert"
                >
                  <X size={16} />
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
                  {typeof card.count === 'number' ? formatNumber(card.count) : card.count}
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

      {/* 4. 6 LARGE LOGISTICS ACTION CARDS GRID */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: '0 0 14px 0' }}>
          Core Operational Actions
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', width: '100%' }}>
          {mainActionCards.map((card) => {
            return (
              <div
                key={card.id}
                onClick={() => navigate(card.path)}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = '#0284c7';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                  <ThreeDIcon type={card.threeDType} size="md" />

                  <div>
                    <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                      {card.title}
                    </h4>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '4px 0 0 0', lineHeight: 1.4 }}>
                      {card.description}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
        
        {/* LEFT: SHIPMENT PERFORMANCE CHART PANEL */}
        <Card style={{ padding: '20px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={18} style={{ color: '#0284c7' }} /> Shipment Performance
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Order fulfillment breakdown across stages</span>
              </div>

              {/* Date Filters: Today, 7 Days, 30 Days */}
              <div style={{ display: 'flex', gap: '4px', backgroundColor: '#f1f5f9', padding: '3px', borderRadius: '6px' }}>
                {(['today', '7d', '30d'] as const).map((rangeKey) => (
                  <button
                    key={rangeKey}
                    onClick={() => handleDateRangeChange(rangeKey)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '4px',
                      border: 'none',
                      fontSize: '11px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      backgroundColor: chartDateRange === rangeKey ? '#ffffff' : 'transparent',
                      color: chartDateRange === rangeKey ? '#0284c7' : '#64748b',
                      boxShadow: chartDateRange === rangeKey ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                    }}
                  >
                    {rangeKey === 'today' ? 'Today' : rangeKey === '7d' ? '7 Days' : '30 Days'}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Performance Progress Bar */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ height: '14px', width: '100%', backgroundColor: '#e2e8f0', borderRadius: '7px', overflow: 'hidden', display: 'flex' }}>
                <div style={{ width: '85%', backgroundColor: '#16a34a' }} title="Delivered: 85%" />
                <div style={{ width: '10%', backgroundColor: '#0284c7' }} title="In Transit: 10%" />
                <div style={{ width: '4%', backgroundColor: '#d97706' }} title="NDR: 4%" />
                <div style={{ width: '1%', backgroundColor: '#dc2626' }} title="RTO: 1%" />
              </div>
            </div>

            {/* 4 Metrics Stage Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              <div style={{ padding: '10px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', color: '#0369a1', fontWeight: '700', display: 'block', textTransform: 'uppercase' }}>Created</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#0c4a6e' }}>{formatNumber(performanceChartStats.created)}</span>
              </div>

              <div style={{ padding: '10px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', color: '#15803d', fontWeight: '700', display: 'block', textTransform: 'uppercase' }}>In Transit</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#14532d' }}>{formatNumber(performanceChartStats.inTransit)}</span>
              </div>

              <div style={{ padding: '10px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', color: '#047857', fontWeight: '700', display: 'block', textTransform: 'uppercase' }}>Delivered</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#064e3b' }}>{formatNumber(performanceChartStats.delivered)}</span>
              </div>

              <div style={{ padding: '10px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', color: '#b91c1c', fontWeight: '700', display: 'block', textTransform: 'uppercase' }}>RTO</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#7f1d1d' }}>{formatNumber(performanceChartStats.rto)}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
            <span>Success Rate: <strong style={{ color: '#16a34a' }}>98.6%</strong></span>
            <span>Average Transit Time: <strong style={{ color: '#0f172a' }}>2.4 Business Days</strong></span>
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

            {/* Big Current Balance Readout */}
            <div style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: '8px', padding: '16px', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#6d28d9', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>
                Current Balance
              </span>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#5b21b6', marginTop: '2px' }}>
                ₹ {formatNumber(parseFloat(walletBalanceINR))}
              </div>
            </div>

            {/* Hold Balance & Monthly Spend breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>Hold Balance</span>
                <strong style={{ color: '#0f172a', fontSize: '14px' }}>₹ 1,200.00</strong>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>Monthly Spend</span>
                <strong style={{ color: '#0f172a', fontSize: '14px' }}>₹ 48,920.00</strong>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Package size={18} style={{ color: '#0284c7' }} /> Recent Orders
            </h3>
            <button
              onClick={() => navigate('/app/shipments')}
              style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View All Orders <ArrowRight size={12} />
            </button>
          </div>

          <Table
            columns={[
              {
                key: 'awb',
                header: 'AWB',
                render: (r) => <strong style={{ fontFamily: 'monospace', color: '#0284c7', fontSize: '12px' }}>{r.awb}</strong>,
              },
              {
                key: 'customer',
                header: 'Customer',
                render: (r) => <span style={{ fontWeight: '600', color: '#1e293b', fontSize: '12px' }}>{r.customer}</span>,
              },
              {
                key: 'courier',
                header: 'Courier',
                render: (r) => (
                  <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 6px', borderRadius: '4px', backgroundColor: r.courierBg, color: '#ffffff' }}>
                    {r.courier}
                  </span>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (r) => <Badge variant={r.statusVariant}>{r.status}</Badge>,
              },
              {
                key: 'amount',
                header: 'Amount',
                align: 'right',
                render: (r) => <strong style={{ color: '#0f172a', fontSize: '12px' }}>{r.amount}</strong>,
              },
            ]}
            data={recentOrdersData}
            keyExtractor={(r) => r.awb}
          />
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
                    <p style={{ fontSize: '11px', color: '#475569', margin: '2px 0 0 0', lineHeight: 1.3 }}>
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

          <Badge variant="neutral">Total 1,248 Shipments</Badge>
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

    </div>
  );
};
