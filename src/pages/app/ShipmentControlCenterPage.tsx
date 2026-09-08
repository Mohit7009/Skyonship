import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Package,
  Truck,
  User,
  MapPin,
  FileText,
  Download,
  Search,
  Printer,
  AlertTriangle,
  Scale,
  Building2,
  Eye,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import {
  Button,
  Card,
  Badge,
  Alert,
  Table,
  Modal,
} from '../../components/ui';
import { DEMO_ORDERS_DATA, type OrderRecord } from './CustomerOrdersPage';
import { formatCurrency } from '../../utils/formatters';

export const ShipmentControlCenterPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'TIMELINE' | 'CHARGES' | 'DOCUMENTS' | 'BILLING' | 'ACTIVITY'
  >('OVERVIEW');

  const [order, setOrder] = useState<OrderRecord | null>(null);
  const [actionAlert, setActionAlert] = useState<string | null>(null);
  const [previewDocTitle, setPreviewDocTitle] = useState<string | null>(null);

  useEffect(() => {
    const targetId = id || 'ord-1001';
    const match =
      DEMO_ORDERS_DATA.find((o) => o.id === targetId || o.orderId === targetId || o.awbNumber === targetId) ||
      DEMO_ORDERS_DATA[0];
    setOrder(match);
  }, [id]);

  if (!order) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert variant="danger" title="Shipment Record Not Found">
          The requested shipment reference could not be located in your workspace.
        </Alert>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/app/orders')}
          style={{ marginTop: '16px' }}
        >
          Back to Orders
        </Button>
      </div>
    );
  }

  const handleAction = (actionName: string) => {
    setActionAlert(`Action executed: ${actionName}`);
    setTimeout(() => setActionAlert(null), 4000);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'In Transit':
      case 'Picked Up':
      case 'Pickup Scheduled':
        return 'info';
      case 'OFD':
      case 'NDR':
        return 'warning';
      case 'RTO':
      case 'Cancelled':
        return 'danger';
      case 'Booked':
      default:
        return 'brand';
    }
  };

  const breadcrumbs = [
    { label: 'Merchant Portal', path: '/app' },
    { label: 'Orders Center', path: '/app/orders' },
    { label: order.orderId, path: `/app/shipments/${order.id}` },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1400px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* 1. Page Header */}
      <PageHeader
        title={`Shipment Control Center — ${order.orderId}`}
        description={`AWB: ${order.awbNumber} • LRN: LRN-2026-${order.orderId.replace(/\D/g, '')} • Created: ${order.createdDate}`}
        breadcrumbs={breadcrumbs}
        actions={
          <Button
            variant="outline"
            size="sm"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => navigate('/app/orders')}
          >
            Back to Orders Center
          </Button>
        }
      />

      {actionAlert && (
        <Alert variant="success" title="Shipment Action Status">
          {actionAlert}
        </Alert>
      )}

      {/* 2. SHIPMENT MASTER HEADER CARD */}
      <Card style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          
          {/* Left Block: AWB, Order ID, LRN, Courier Partner Logo & Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '12px',
                backgroundColor: order.courierBg || '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                fontWeight: 'bold',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              🚚
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: '#0f172a' }}>
                  AWB: {order.awbNumber}
                </h2>
                <Badge variant={getStatusVariant(order.status)} style={{ fontSize: '13px', padding: '4px 10px' }}>
                  {order.status}
                </Badge>
                <Badge variant={order.mode === 'B2B' ? 'warning' : 'info'}>
                  {order.mode} - {order.serviceType}
                </Badge>
                <Badge variant={order.paymentType === 'COD' ? 'warning' : 'success'}>
                  {order.paymentType}
                </Badge>
              </div>

              <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span>Order ID: <strong style={{ color: '#0f172a' }}>{order.orderId}</strong></span>
                <span>LRN Number: <strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>LRN-2026-{order.orderId.replace(/\D/g, '')}</strong></span>
                <span>Courier Partner: <strong style={{ color: '#0f172a' }}>{order.courierName}</strong></span>
              </div>
            </div>
          </div>

          {/* Right Action Buttons Bar */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download size={14} />}
              onClick={() => handleAction('Downloading 4x6 Thermal Shipping Label')}
            >
              Download Label
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<FileText size={14} />}
              onClick={() => handleAction('Downloading Customer GST Tax Invoice')}
            >
              Download Invoice
            </Button>

            <Button
              variant="primary"
              size="sm"
              leftIcon={<Search size={14} />}
              onClick={() => navigate('/app/tracking')}
              style={{ backgroundColor: '#0284c7', borderColor: '#0284c7' }}
            >
              Track Shipment
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<AlertTriangle size={14} />}
              onClick={() => navigate('/app/weight-discrepancies')}
              style={{ color: '#be123c', borderColor: '#fca5a5' }}
            >
              Raise Dispute
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer size={14} />}
              onClick={() => handleAction('Printing Dispatch Handover Document')}
            >
              Print
            </Button>
          </div>

        </div>
      </Card>

      {/* 3. CONTROL CENTER NAVIGATION TABS */}
      <Card style={{ padding: '16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
        
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '20px', overflowX: 'auto' }}>
          {[
            { id: 'OVERVIEW', label: '1. Overview' },
            { id: 'TIMELINE', label: '2. Tracking Timeline' },
            { id: 'CHARGES', label: '3. Charges Breakdown' },
            { id: 'DOCUMENTS', label: '4. Documents' },
            { id: 'BILLING', label: '5. Billing & Settlement' },
            { id: 'ACTIVITY', label: '6. Activity Logs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                padding: '10px 18px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: activeTab === tab.id ? '#0284c7' : 'transparent',
                color: activeTab === tab.id ? '#ffffff' : '#64748b',
                fontWeight: activeTab === tab.id ? '700' : '500',
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'OVERVIEW' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              
              {/* Order Information Card */}
              <Card style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Package size={16} style={{ color: '#0284c7' }} /> Order Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#334155' }}>
                  <div>Order Reference: <strong style={{ color: '#0f172a' }}>{order.orderId}</strong></div>
                  <div>Booking Date: <strong>{order.createdDate}</strong></div>
                  <div>Payment Mode: <Badge variant={order.paymentType === 'COD' ? 'warning' : 'success'}>{order.paymentType}</Badge></div>
                  {order.paymentType === 'COD' && (
                    <div>Collectable COD Amount: <strong style={{ color: '#d97706' }}>{formatCurrency(order.codAmount)}</strong></div>
                  )}
                  <div>Shipment Direction: <strong>{order.shipmentType} Delivery</strong></div>
                </div>
              </Card>

              {/* Customer Information Card */}
              <Card style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={16} style={{ color: '#0284c7' }} /> Customer Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#334155' }}>
                  <div>Consignee Name: <strong style={{ color: '#0f172a' }}>{order.customerName}</strong></div>
                  <div>Mobile Number: <strong>{order.customerPhone}</strong></div>
                  <div>Email Address: <strong>{order.customerEmail}</strong></div>
                </div>
              </Card>

              {/* Pickup Address Card */}
              <Card style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={16} style={{ color: '#0284c7' }} /> Pickup Origin Location
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#334155' }}>
                  <div>Warehouse Name: <strong style={{ color: '#0f172a' }}>{order.warehouseName}</strong></div>
                  <div>City & State: <strong>{order.originCity}</strong></div>
                  <div>Origin Pincode: <strong>{order.originPincode}</strong></div>
                </div>
              </Card>

              {/* Delivery Address Card */}
              <Card style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} style={{ color: '#dc2626' }} /> Delivery Destination Address
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#334155' }}>
                  <div>Street Address: <strong>{order.deliveryAddress}</strong></div>
                  <div>Destination City: <strong>{order.deliveryCity}</strong></div>
                  <div>Pincode: <strong>{order.deliveryPincode}</strong></div>
                </div>
              </Card>

              {/* Package Details Card */}
              <Card style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Scale size={16} style={{ color: '#0284c7' }} /> Package Physical Specs
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px', color: '#334155' }}>
                  <div>Actual Weight: <strong>{order.deadWeightKg} KG</strong></div>
                  <div>Volumetric Weight: <strong>{order.volumetricWeightKg} KG</strong></div>
                  <div>Chargeable Weight: <strong style={{ color: '#0284c7' }}>{order.chargeableWeightKg} KG</strong></div>
                  <div>Boxes Count: <strong>1 Box</strong></div>
                  <div style={{ gridColumn: 'span 2' }}>Dimensions: <strong>{order.dimensionsCm}</strong></div>
                </div>
              </Card>

              {/* Courier Details Card */}
              <Card style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Truck size={16} style={{ color: '#0284c7' }} /> Courier SLA & Route
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: '#334155' }}>
                  <div>Courier Name: <strong style={{ color: '#0f172a' }}>{order.courierName}</strong></div>
                  <div>Service Type & Mode: <strong>{order.mode} - {order.serviceType}</strong></div>
                  <div>Booking Date: <strong>{order.createdDate}</strong></div>
                  <div>Expected Delivery Date: <strong style={{ color: '#16a34a' }}>Expected 29 Aug 2026</strong></div>
                </div>
              </Card>

            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TRACKING TIMELINE */}
        {/* ========================================================================= */}
        {activeTab === 'TIMELINE' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Live Carrier Tracking Event Log
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', paddingLeft: '24px', borderLeft: '2px solid #cbd5e1' }}>
              {order.timeline.map((event, idx) => {
                const isCompleted = event.completed;
                const isActive = event.active;
                const isError = event.isError;

                return (
                  <div key={idx} style={{ position: 'relative' }}>
                    {/* Event Indicator Dot */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '-31px',
                        top: '2px',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: isError ? '#dc2626' : isActive ? '#0284c7' : isCompleted ? '#16a34a' : '#cbd5e1',
                        border: '2px solid #ffffff',
                        boxShadow: '0 0 0 2px ' + (isError ? '#fecaca' : isActive ? '#bae6fd' : isCompleted ? '#bbf7d0' : '#e2e8f0'),
                      }}
                    />

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '14px', color: isError ? '#dc2626' : isActive ? '#0284c7' : isCompleted ? '#16a34a' : '#475569' }}>
                          {event.title}
                        </strong>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{event.timestamp}</span>
                      </div>
                      <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#334155' }}>
                        {event.description}
                      </p>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Location: {idx <= 2 ? order.originCity : order.deliveryCity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CHARGES BREAKDOWN */}
        {/* ========================================================================= */}
        {activeTab === 'CHARGES' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Complete Freight Billing Breakdown
            </h3>

            {/* CHARGES BREAKDOWN TABLE */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                  <th style={{ padding: '10px' }}>Charge Component</th>
                  <th style={{ padding: '10px' }}>Description</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>Base Freight Charge</td>
                  <td style={{ padding: '10px' }}>Weight rate for {order.chargeableWeightKg} KG ({order.mode} - {order.serviceType})</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold' }}>{formatCurrency(order.baseFreight)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>Fuel Surcharge</td>
                  <td style={{ padding: '10px' }}>Carrier monthly fuel index adjustment</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(order.fuelSurcharge)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>Docket / AWB Fee</td>
                  <td style={{ padding: '10px' }}>Manifest & documentation fee</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(order.docketCharge)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>COD Collection Fee</td>
                  <td style={{ padding: '10px' }}>Doorstep cash collection & bank remittance fee</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(order.codCharge)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>Handling / First-Mile Charge</td>
                  <td style={{ padding: '10px' }}>Warehouse pickup & sorting handling</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>{formatCurrency(order.fmCharge)}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>ODA (Out of Delivery Area)</td>
                  <td style={{ padding: '10px' }}>Special pin-code delivery surcharge</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>₹0.00</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>Transit Insurance Charge</td>
                  <td style={{ padding: '10px' }}>Declared shipment value risk coverage</td>
                  <td style={{ padding: '10px', textAlign: 'right' }}>₹0.00</td>
                </tr>
                <tr style={{ borderBottom: '2px solid #0284c7', backgroundColor: '#f0f9ff' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>GST (18% Statutory Tax)</td>
                  <td style={{ padding: '10px' }}>Integrated GST tax on logistics service</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#0284c7' }}>{formatCurrency(order.gstAmount)}</td>
                </tr>
              </tbody>
            </table>

            {/* TOTALS SUMMARY CARD */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '10px' }}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', backgroundColor: '#f8fafc' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>TOTAL NET FREIGHT</span>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{formatCurrency(order.totalAmount - order.gstAmount)}</div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', backgroundColor: '#f8fafc' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>TOTAL GST TAX</span>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a' }}>{formatCurrency(order.gstAmount)}</div>
              </div>

              <div style={{ border: '2px solid #0284c7', borderRadius: '8px', padding: '14px', backgroundColor: '#f0f9ff' }}>
                <span style={{ fontSize: '11px', color: '#0284c7', fontWeight: '800' }}>GRAND TOTAL AMOUNT</span>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#0284c7' }}>{formatCurrency(order.totalAmount)}</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: DOCUMENTS */}
        {/* ========================================================================= */}
        {activeTab === 'DOCUMENTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Shipment Document Center
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {[
                { title: '4x6 Thermal Shipping Label', format: 'PDF Format', desc: 'Barcode & QR thermal sticker for package box' },
                { title: 'Tax Invoice (Commercial)', format: 'PDF Format', desc: 'Official customer invoice with GST breakdown' },
                { title: 'Dispatch Handover Manifest', format: 'PDF Format', desc: 'Driver sign-off sheet for warehouse pickup' },
                { title: 'Proof of Delivery (POD)', format: 'JPG Scan', desc: 'Consignee OTP & signature confirmation' },
                { title: 'E-Way Bill Compliance Document', format: 'PDF Format', desc: 'Government GST portal E-Way bill receipt' },
              ].map((doc, idx) => (
                <Card key={idx} style={{ padding: '16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <strong style={{ fontSize: '14px', color: '#0f172a' }}>{doc.title}</strong>
                    <Badge variant="brand">{doc.format}</Badge>
                  </div>

                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>{doc.desc}</p>

                  <div style={{ display: 'flex', gap: '6px', marginTop: 'auto', paddingTop: '8px' }}>
                    <Button variant="outline" size="sm" leftIcon={<Eye size={13} />} onClick={() => setPreviewDocTitle(doc.title)}>
                      Preview
                    </Button>

                    <Button variant="outline" size="sm" leftIcon={<Download size={13} />} onClick={() => handleAction(`Downloading ${doc.title}`)}>
                      Download
                    </Button>

                    <Button variant="outline" size="sm" leftIcon={<Printer size={13} />} onClick={() => handleAction(`Printing ${doc.title}`)}>
                      Print
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: BILLING & SETTLEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'BILLING' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', backgroundColor: '#f8fafc' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>INVOICE NUMBER</span>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0284c7', fontFamily: 'monospace' }}>INV-2026-08492</div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', backgroundColor: '#f8fafc' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>INVOICE DATE</span>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>28 Aug 2026</div>
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', backgroundColor: '#f8fafc' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700' }}>B2C INVOICE AMOUNT</span>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>{formatCurrency(order.totalAmount)}</div>
              </div>

              <div style={{ border: '1px solid #16a34a', borderRadius: '8px', padding: '14px', backgroundColor: '#f0fdf4' }}>
                <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '800' }}>PAYMENT STATUS</span>
                <div style={{ fontSize: '16px', fontWeight: '800', color: '#16a34a' }}>PAID (Wallet Debit)</div>
              </div>
            </div>

            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '10px 0 0 0' }}>
              Settlement Ledger History
            </h3>

            <Table
              keyExtractor={(r: any) => r.invoiceNo}
              columns={[
                { key: 'invoiceNo', header: 'Invoice Number', render: (r: any) => <strong style={{ color: '#0284c7', fontFamily: 'monospace' }}>{r.invoiceNo}</strong> },
                { key: 'cycle', header: 'Billing Cycle', render: (r: any) => <span>{r.cycle}</span> },
                { key: 'amount', header: 'Freight Amount', render: (r: any) => formatCurrency(r.amount) },
                { key: 'gst', header: 'GST Tax', render: (r: any) => formatCurrency(r.gst) },
                { key: 'total', header: 'Total Settlement', render: (r: any) => <strong>{formatCurrency(r.total)}</strong> },
                { key: 'status', header: 'Status', render: (r: any) => <Badge variant="success">{r.status}</Badge> },
              ]}
              data={[
                { invoiceNo: 'INV-2026-08492', cycle: 'August 2026 Cycle 2', amount: order.totalAmount - order.gstAmount, gst: order.gstAmount, total: order.totalAmount, status: 'PAID' },
              ]}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: ACTIVITY LOGS */}
        {/* ========================================================================= */}
        {activeTab === 'ACTIVITY' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Shipment Operational Audit Log Trail
            </h3>

            <Table
              keyExtractor={(r: any) => r.id}
              columns={[
                { key: 'timestamp', header: 'Date & Time', render: (r: any) => <span style={{ fontSize: '11px', color: '#64748b' }}>{r.timestamp}</span> },
                { key: 'user', header: 'Actor / System', render: (r: any) => <strong>{r.user}</strong> },
                { key: 'action', header: 'Action Event', render: (r: any) => <Badge variant="info">{r.action}</Badge> },
                { key: 'remarks', header: 'Remarks & Metadata', render: (r: any) => <span style={{ fontSize: '12px', color: '#334155' }}>{r.remarks}</span> },
              ]}
              data={[
                { id: '1', timestamp: '27 Aug, 10:30 AM', user: 'Merchant Admin', action: 'Shipment Created', remarks: `Order ${order.orderId} created in workspace` },
                { id: '2', timestamp: '27 Aug, 10:31 AM', user: 'Rate Engine', action: 'Rate Calculated', remarks: `Selected ${order.courierName} at ${formatCurrency(order.totalAmount)}` },
                { id: '3', timestamp: '27 Aug, 10:32 AM', user: 'Courier API', action: 'Courier Assigned', remarks: `AWB ${order.awbNumber} allocated by carrier` },
                { id: '4', timestamp: '27 Aug, 10:35 AM', user: 'System Worker', action: 'Label Generated', remarks: 'Compiled 4x6 thermal shipping barcode PDF' },
                { id: '5', timestamp: '27 Aug, 11:15 AM', user: 'Warehouse Dispatcher', action: 'Pickup Requested', remarks: 'Assigned to pickup driver handover manifest' },
                { id: '6', timestamp: '28 Aug, 09:15 AM', user: 'Webhook Engine', action: 'Status Updated', remarks: `Status updated to ${order.status}` },
                { id: '7', timestamp: '28 Aug, 09:30 AM', user: 'Finance Engine', action: 'Invoice Generated', remarks: 'Generated customer GST invoice INV-2026-08492' },
              ]}
            />
          </div>
        )}

      </Card>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDocTitle && (
        <Modal
          isOpen={!!previewDocTitle}
          onClose={() => setPreviewDocTitle(null)}
          title={`Document Preview — ${previewDocTitle}`}
          maxWidth="700px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center', padding: '20px' }}>
            <div style={{ width: '100%', border: '2px solid #0f172a', borderRadius: '8px', padding: '24px', backgroundColor: '#ffffff', color: '#0f172a', fontFamily: 'monospace' }}>
              <div style={{ borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '14px' }}>
                <h3 style={{ margin: 0, textTransform: 'uppercase' }}>{order.courierName} OFFICIAL {previewDocTitle}</h3>
                <div style={{ fontSize: '12px' }}>AWB: {order.awbNumber} • Order Ref: {order.orderId}</div>
              </div>
              <div style={{ fontSize: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>Origin: {order.originCity} ({order.originPincode})</div>
                <div>Destination: {order.deliveryCity} ({order.deliveryPincode})</div>
                <div>Weight: {order.chargeableWeightKg} KG</div>
                <div>Amount: ₹{order.totalAmount.toFixed(2)}</div>
              </div>
              <div style={{ marginTop: '20px', textAlign: 'center', border: '1px dashed #000', padding: '12px' }}>
                [ SIMULATED DOCUMENT PREVIEW CONTENT ]
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', width: '100%' }}>
              <Button variant="outline" onClick={() => setPreviewDocTitle(null)}>Close</Button>
              <Button variant="primary" leftIcon={<Printer size={14} />} onClick={() => setPreviewDocTitle(null)} style={{ backgroundColor: '#0284c7', borderColor: '#0284c7' }}>
                Print Document
              </Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
