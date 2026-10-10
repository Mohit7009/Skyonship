import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, Badge, Button, Table } from '../../components/ui';
import {
  Truck,
  Package,
  ShieldCheck,
  FileText,
  Printer,
  Search,
  MapPin,
  CheckCircle2,
  Calculator,
  Percent,
  Receipt,
  Layers,
  ArrowRight,
  Sliders,
} from 'lucide-react';
import { DEMO_B2C_RATE_CARDS } from '../../mocks/b2cPricing.mock';
import { DEMO_B2B_RATE_CARDS } from '../../mocks/b2bPricing.mock';
import { B2B_ZONES } from '../../types/b2bPricing';

export const CustomerMyRateCardPage: React.FC = () => {
  // Main Tab: B2C vs B2B
  const [activeTab, setActiveTab] = useState<'B2C' | 'B2B'>('B2C');

  // Selected Courier Rate Card Filter
  const [selectedCourierId, setSelectedCourierId] = useState<string>('delhivery');

  // B2B Quick Route Matrix Lookup
  const [b2bOriginZone, setB2bOriginZone] = useState<string>('N1');
  const [b2bDestZone, setB2bDestZone] = useState<string>('W2');

  // Search Filter for Rate Tables
  const [tableSearch, setTableSearch] = useState<string>('');

  const breadcrumbs = [
    { label: 'Customer Portal', path: '/app' },
    { label: 'My Rate Card', path: '/app/my-rate-card' },
  ];

  // Active Rate Card Models
  const activeB2cCard =
    DEMO_B2C_RATE_CARDS.find((c) => c.courierId.toLowerCase() === selectedCourierId.toLowerCase()) ||
    DEMO_B2C_RATE_CARDS[0];

  const activeB2bCard =
    DEMO_B2B_RATE_CARDS.find((c) => c.courierId.toLowerCase() === selectedCourierId.toLowerCase()) ||
    DEMO_B2B_RATE_CARDS[0];

  // 7 Standard B2C Zones Config
  const b2cZonesList = [
    { code: 'ZONE_A', title: 'Local (Intra-City)', desc: 'Within same city limits', basePaise: 2800, addlPaise: 2200, icon: '🏙️', tag: 'Fastest Local' },
    { code: 'ZONE_B', title: 'Intra-State (Regional)', desc: 'Within same state boundaries', basePaise: 3500, addlPaise: 2800, icon: '📍', tag: 'Regional Surface' },
    { code: 'ZONE_C1', title: 'Metro to Metro', desc: 'Delhi, Mumbai, BLR, Kolkata, MAA, HYD', basePaise: 4500, addlPaise: 3800, icon: '✈️', tag: 'Air Express' },
    { code: 'ZONE_C2', title: 'Metro to Non-Metro', desc: 'Metros to Tier 2/3 cities', basePaise: 5000, addlPaise: 4200, icon: '🚚', tag: 'Pan-India Surface' },
    { code: 'ZONE_C3', title: 'Rest of India', desc: 'Tier 3/4 towns & rural hubs', basePaise: 5800, addlPaise: 4800, icon: '📦', tag: 'Standard Coverage' },
    { code: 'ZONE_D', title: 'Remote Locations', desc: 'Special interior pin codes', basePaise: 7200, addlPaise: 6200, icon: '🏞️', tag: 'Extended Reach' },
    { code: 'ZONE_E', title: 'NE & J&K Special', desc: 'North-East, J&K, Andaman & Nicobar', basePaise: 8800, addlPaise: 7500, icon: '🏔️', tag: 'Air Cargo Only' },
  ];

  // Selected B2B Quick Route Price Lookup
  const quickB2bRatePaise = activeB2bCard.matrixMap?.[b2bOriginZone]?.[b2bDestZone] || 680;
  const quickB2bRateINR = (quickB2bRatePaise / 100).toFixed(2);

  // Print Handler
  const handlePrintRateCard = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1400px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* 🌟 1. PAGE HEADER & ACTIONS */}
      <PageHeader
        title="My Assigned Tariff & Rate Card Schedule"
        description="View your active commercial rate cards, zonal pricing slabs, fuel surcharges, and COD terms assigned to your merchant account."
        breadcrumbs={breadcrumbs}
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Printer size={14} />}
              onClick={handlePrintRateCard}
              style={{ fontWeight: '600' }}
            >
              Print Tariff Sheet
            </Button>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Calculator size={14} />}
              onClick={() => window.location.href = '/app/rates'}
              style={{ backgroundColor: '#2563eb', borderColor: '#2563eb', fontWeight: '700' }}
            >
              Live Rate Calculator →
            </Button>
          </div>
        }
      />

      {/* 🌟 2. MERCHANT ACCOUNT ASSIGNED SCHEDULE BANNER */}
      <Card
        style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #2563eb 0%, #0284c7 100%)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)' }}>
              <FileText size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>
                  VIP Commercial Merchant Tariff Card
                </h2>
                <Badge variant="success" size="md">
                  <CheckCircle2 size={12} style={{ marginRight: '4px' }} /> Verified Active Contract
                </Badge>
              </div>
              <p style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                Assigned Tenant: <strong style={{ color: '#38bdf8' }}>Apex Logistics & Retail (TENANT-DEMO-01)</strong> • Plan: <strong>Enterprise Gold Commercial Card</strong>
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', backgroundColor: '#0f172a', padding: '10px 16px', borderRadius: '12px', border: '1px solid #334155' }}>
            <div>
              <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>Effective Date</span>
              <strong style={{ fontSize: '13px', color: '#ffffff' }}>01 Oct 2026</strong>
            </div>
            <div style={{ width: '1px', height: '24px', backgroundColor: '#334155' }} />
            <div>
              <span style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>Volume Discount</span>
              <strong style={{ fontSize: '13px', color: '#4ade80' }}>Up to 35% OFF API Base</strong>
            </div>
          </div>
        </div>
      </Card>

      {/* 🌟 3. TOP TABS: B2C EXPRESS RATES vs B2B FREIGHT MATRIX */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Main Category Tabs */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: '#e2e8f0', padding: '4px', borderRadius: '12px' }}>
          <button
            onClick={() => setActiveTab('B2C')}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '800',
              cursor: 'pointer',
              backgroundColor: activeTab === 'B2C' ? '#2563eb' : 'transparent',
              color: activeTab === 'B2C' ? '#ffffff' : '#475569',
              boxShadow: activeTab === 'B2C' ? '0 4px 12px rgba(37, 99, 235, 0.25)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Package size={16} /> B2C Express Rates (0-5kg Parcels)
          </button>
          <button
            onClick={() => setActiveTab('B2B')}
            style={{
              padding: '10px 24px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '800',
              cursor: 'pointer',
              backgroundColor: activeTab === 'B2B' ? '#7c3aed' : 'transparent',
              color: activeTab === 'B2B' ? '#ffffff' : '#475569',
              boxShadow: activeTab === 'B2B' ? '0 4px 12px rgba(124, 58, 237, 0.25)' : 'none',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Truck size={16} /> B2B Freight Matrix (50kg+ Heavy Cargo)
          </button>
        </div>

        {/* Courier Partner Selection Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '700', color: '#64748b' }}>Select Courier:</span>
          {[
            { id: 'delhivery', name: 'Delhivery', color: '#dc2626' },
            { id: 'bluedart', name: 'Blue Dart', color: '#2563eb' },
            { id: 'xpressbees', name: 'XpressBees', color: '#7c3aed' },
            { id: 'shadowfax', name: 'Shadowfax', color: '#059669' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCourierId(c.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                border: selectedCourierId === c.id ? `2px solid ${c.color}` : '1px solid #cbd5e1',
                backgroundColor: selectedCourierId === c.id ? '#ffffff' : '#f8fafc',
                color: selectedCourierId === c.id ? c.color : '#475569',
                cursor: 'pointer',
                boxShadow: selectedCourierId === c.id ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c.color }} />
              {c.name}
            </button>
          ))}
        </div>

      </div>

      {/* ------------------------------------------------------------------------- */}
      {/* 🌟 VIEW A: MY B2C EXPRESS RATES VIEW */}
      {/* ------------------------------------------------------------------------- */}
      {activeTab === 'B2C' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Active B2C Card Banner */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                  {activeB2cCard.name}
                </h3>
                <Badge variant="brand">{activeB2cCard.version}</Badge>
                <Badge variant="success">Standard 500g Base Slab</Badge>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Courier: <strong>{activeB2cCard.courierName}</strong> • Service Mode: <strong>{activeB2cCard.serviceType}</strong> • Volumetric Divisor: <strong>5000</strong>
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '800', backgroundColor: '#f0fdf4', padding: '4px 10px', borderRadius: '20px', border: '1px solid #bbf7d0' }}>
                ⚡ Auto-Applied to All B2C Shipments
              </span>
            </div>
          </div>

          {/* 🌟 VISUAL ZONE RATES GRID CARDS */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} style={{ color: '#2563eb' }} /> Zonal Base & Additional Slabs (First 500g / Addl 500g)
              </h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Prices are in INR (₹) excluding GST</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {b2cZonesList.map((z) => (
                <div
                  key={z.code}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.borderColor = '#2563eb';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.03)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '18px' }}>{z.icon}</span>
                      <span style={{ fontSize: '10px', fontWeight: '800', color: '#2563eb', backgroundColor: '#eff6ff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #bfdbfe' }}>
                        {z.tag}
                      </span>
                    </div>
                    <strong style={{ fontSize: '15px', color: '#0f172a', display: 'block' }}>{z.title}</strong>
                    <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '2px' }}>{z.desc}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '8px 10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', display: 'block', textTransform: 'uppercase' }}>First 500g Base</span>
                      <strong style={{ fontSize: '16px', color: '#0f172a', marginTop: '2px', display: 'block' }}>₹ {(z.basePaise / 100).toFixed(2)}</strong>
                    </div>
                    <div style={{ backgroundColor: '#eff6ff', padding: '8px 10px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                      <span style={{ fontSize: '10px', color: '#1d4ed8', fontWeight: '700', display: 'block', textTransform: 'uppercase' }}>Addl 500g</span>
                      <strong style={{ fontSize: '16px', color: '#1d4ed8', marginTop: '2px', display: 'block' }}>₹ {(z.addlPaise / 100).toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 🌟 WEIGHT SLABS COMPREHENSIVE MATRIX TABLE */}
          <Card style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} style={{ color: '#2563eb' }} /> Full Weight Slab Pricing Matrix
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Estimated billable freight charges for standard e-commerce parcel weights</span>
              </div>

              <div style={{ position: 'relative', minWidth: '220px' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="text"
                  placeholder="Filter weight slab..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  style={{ width: '100%', padding: '6px 12px 6px 30px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '12px 14px', textAlign: 'left', fontWeight: '800', color: '#0f172a' }}>Weight Slab</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '800', color: '#0f172a' }}>Local (Zone A)</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '800', color: '#0f172a' }}>Intra-State (Zone B)</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '800', color: '#0f172a' }}>Metro-Metro (Zone C1)</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '800', color: '#0f172a' }}>Rest of India (Zone C2)</th>
                    <th style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '800', color: '#0f172a' }}>NE & J&K (Zone E)</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { slab: '0.5 Kg (First Base 500g)', local: '28.00', state: '35.00', metro: '45.00', roi: '55.00', special: '88.00' },
                    { slab: '1.0 Kg (Base + 1 Addl)', local: '50.00', state: '63.00', metro: '83.00', roi: '101.00', special: '163.00' },
                    { slab: '1.5 Kg (Base + 2 Addl)', local: '72.00', state: '91.00', metro: '121.00', roi: '147.00', special: '238.00' },
                    { slab: '2.0 Kg (Base + 3 Addl)', local: '94.00', state: '119.00', metro: '159.00', roi: '193.00', special: '313.00' },
                    { slab: '3.0 Kg (Base + 5 Addl)', local: '138.00', state: '175.00', metro: '235.00', roi: '285.00', special: '463.00' },
                    { slab: '5.0 Kg (Base + 9 Addl)', local: '226.00', state: '287.00', metro: '387.00', roi: '469.00', special: '763.00' },
                  ]
                    .filter((r) => r.slab.toLowerCase().includes(tableSearch.toLowerCase()))
                    .map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                        <td style={{ padding: '12px 14px', fontWeight: '800', color: '#0f172a' }}>{row.slab}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>₹ {row.local}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>₹ {row.state}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '800', color: '#2563eb' }}>₹ {row.metro}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '700', color: '#0f172a' }}>₹ {row.roi}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: '700', color: '#dc2626' }}>₹ {row.special}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* 🌟 B2C SURCHARGES & CLAUSES GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            
            {/* Fuel & COD Terms */}
            <Card style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Percent size={18} style={{ color: '#2563eb' }} /> COD & Fuel Surcharge Terms
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>COD Collection Charge</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>1.5% of Order Value or Min ₹30.00</span>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#16a34a' }}>1.5% (Min ₹30)</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>Fuel Surcharge</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Applied on net freight subtotal</span>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#2563eb' }}>12.5%</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>ODA Surcharge</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Out of delivery area interior pins</span>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#d97706' }}>₹ 350.00 / Order</strong>
                </div>
              </div>
            </Card>

            {/* GST & Tax Guidelines */}
            <Card style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={18} style={{ color: '#16a34a' }} /> GST Billing & Remittance Schedule
              </h4>
              
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: 0, margin: 0, listStyle: 'none', fontSize: '12px', color: '#334155' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>18% GST Applicable</strong>: All freight charges and surcharges attract 18% IGST / CGST+SGST with B2B input tax credit.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Daily COD Remittance</strong>: Collected COD funds credited directly to merchant bank account on T+1 cycle.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Doorstop Pickup Included</strong>: Zero extra fees for doorstep rider parcel pickup across all active hubs.</span>
                </li>
              </ul>
            </Card>

          </div>

        </div>
      )}

      {/* ------------------------------------------------------------------------- */}
      {/* 🌟 VIEW B: MY B2B FREIGHT MATRIX VIEW */}
      {/* ------------------------------------------------------------------------- */}
      {activeTab === 'B2B' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* B2B Summary Card */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#0f172a', margin: 0 }}>
                  {activeB2bCard.name}
                </h3>
                <Badge variant="info">{activeB2bCard.version}</Badge>
                <Badge variant="warning">Heavy Freight Per-KG Matrix</Badge>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Courier: <strong>{activeB2bCard.courierName}</strong> • Volumetric Divisor: <strong>5000</strong> • Min Freight: <strong>₹ 500.00</strong>
              </span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: '#7c3aed', fontWeight: '800', backgroundColor: '#faf5ff', padding: '4px 10px', borderRadius: '20px', border: '1px solid #ddd6fe' }}>
                🚚 Bulk Commercial Heavy Cargo Schedule
              </span>
            </div>
          </div>

          {/* 🌟 INTERACTIVE ROUTE RATE FINDER WIDGET */}
          <Card style={{ padding: '20px', backgroundColor: '#faf5ff', border: '1.5px solid #ddd6fe', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '900', color: '#5b21b6', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sliders size={18} style={{ color: '#7c3aed' }} /> B2B Quick Route Rate Finder (₹ per KG)
                </h3>
                <span style={{ fontSize: '12px', color: '#6d28d9' }}>Select origin & destination zones to look up exact per-kg cargo rate</span>
              </div>
              <Badge variant="brand">16×16 Commercial Zone System</Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'center' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#6d28d9', display: 'block', marginBottom: '4px' }}>Origin Zone</label>
                <select
                  value={b2bOriginZone}
                  onChange={(e) => setB2bOriginZone(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #c4b5fd', fontSize: '13px', fontWeight: '700', backgroundColor: '#ffffff', outline: 'none' }}
                >
                  <option value="N1">N1 - Delhi NCR Metro</option>
                  <option value="N2">N2 - Punjab / Haryana / HP</option>
                  <option value="N3">N3 - Rajasthan / UP North</option>
                  <option value="W1">W1 - Gujarat Commercial</option>
                  <option value="W2">W2 - Mumbai & Maharashtra</option>
                  <option value="S1">S1 - Bengaluru & Karnataka</option>
                  <option value="S2">S2 - Chennai & Tamil Nadu</option>
                  <option value="E1">E1 - Kolkata & West Bengal</option>
                </select>
              </div>

              <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <ArrowRight size={22} style={{ color: '#7c3aed' }} />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: '#6d28d9', display: 'block', marginBottom: '4px' }}>Destination Zone</label>
                <select
                  value={b2bDestZone}
                  onChange={(e) => setB2bDestZone(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #c4b5fd', fontSize: '13px', fontWeight: '700', backgroundColor: '#ffffff', outline: 'none' }}
                >
                  <option value="W2">W2 - Mumbai & Maharashtra</option>
                  <option value="N1">N1 - Delhi NCR Metro</option>
                  <option value="S1">S1 - Bengaluru & Karnataka</option>
                  <option value="S2">S2 - Chennai & Tamil Nadu</option>
                  <option value="E1">E1 - Kolkata & West Bengal</option>
                  <option value="NE1">NE1 - Guwahati & Assam</option>
                  <option value="C1">C1 - MP & Chhattisgarh</option>
                </select>
              </div>

              {/* Readout Card */}
              <div style={{ backgroundColor: '#ffffff', border: '2px solid #a78bfa', borderRadius: '12px', padding: '12px 16px', textAlign: 'center' }}>
                <span style={{ fontSize: '10px', fontWeight: '800', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Route Cargo Freight</span>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#5b21b6', marginTop: '2px' }}>
                  ₹ {quickB2bRateINR} <span style={{ fontSize: '13px', fontWeight: '700', color: '#64748b' }}>/ KG</span>
                </div>
                <span style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700' }}>+ Docket Fee ₹100</span>
              </div>
            </div>
          </Card>

          {/* 🌟 16x16 B2B ZONE FREIGHT MATRIX TABLE */}
          <Card style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Table size={18} style={{ color: '#7c3aed' }} /> Complete 16×16 Zone-to-Zone Per KG Rate Matrix
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>All prices in INR (₹) per KG chargeable weight</span>
              </div>
            </div>

            <div style={{ overflowX: 'auto', maxHeight: '450px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr style={{ position: 'sticky', top: 0, backgroundColor: '#1e293b', color: '#ffffff', zIndex: 10 }}>
                    <th style={{ padding: '10px 12px', textAlign: 'left', minWidth: '80px', position: 'sticky', left: 0, backgroundColor: '#1e293b', zIndex: 11, borderRight: '1px solid #334155' }}>Origin \ Dest</th>
                    {B2B_ZONES.map((z) => (
                      <th key={z} style={{ padding: '10px 8px', textAlign: 'center', minWidth: '55px' }}>{z}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {B2B_ZONES.map((oz, idx) => (
                    <tr key={oz} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                      <td style={{ padding: '8px 12px', fontWeight: '800', position: 'sticky', left: 0, backgroundColor: '#f1f5f9', zIndex: 1, borderRight: '1px solid #cbd5e1', color: '#0f172a' }}>
                        {oz}
                      </td>
                      {B2B_ZONES.map((dz) => {
                        const ratePaise = activeB2bCard.matrixMap?.[oz]?.[dz] || 680;
                        const isMatch = oz === b2bOriginZone && dz === b2bDestZone;
                        return (
                          <td
                            key={dz}
                            style={{
                              padding: '8px 6px',
                              textAlign: 'center',
                              fontWeight: isMatch ? '900' : '600',
                              backgroundColor: isMatch ? '#f3e8ff' : 'transparent',
                              color: isMatch ? '#6b21a8' : '#334155',
                              border: isMatch ? '2px solid #a855f7' : 'none',
                            }}
                          >
                            ₹{(ratePaise / 100).toFixed(1)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* 🌟 B2B CARGO SURCHARGES & MINIMUM FEES */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
            
            {/* Cargo Surcharges List */}
            <Card style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt size={18} style={{ color: '#7c3aed' }} /> Mandatory B2B Cargo Surcharges
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#faf5ff', borderRadius: '8px', border: '1px solid #e9d5ff' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>Docket Fee (Consignment Note)</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Flat documentation charge per LR</span>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#7c3aed' }}>₹ 100.00 / LR</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#faf5ff', borderRadius: '8px', border: '1px solid #e9d5ff' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>FOV / Cargo Insurance</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>0.2% of Invoice Value (Min ₹100)</span>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#7c3aed' }}>0.2% (Min ₹100)</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#faf5ff', borderRadius: '8px', border: '1px solid #e9d5ff' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block' }}>Minimum Billable Freight</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Floor pricing protection per LR</span>
                  </div>
                  <strong style={{ fontSize: '14px', color: '#16a34a' }}>₹ 500.00 Floor</strong>
                </div>
              </div>
            </Card>

            {/* B2B Commercial Guidelines */}
            <Card style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} style={{ color: '#16a34a' }} /> Commercial Cargo Terms
              </h4>

              <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: 0, margin: 0, listStyle: 'none', fontSize: '12px', color: '#334155' }}>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>E-Way Bill Compliance</strong>: Mandatory E-Way Bill generation required for invoice values exceeding ₹50,000.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Door Pickup & Delivery</strong>: Standard doorstep loading & unloading included for warehouse locations.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <CheckCircle2 size={16} style={{ color: '#16a34a', flexShrink: 0, marginTop: '2px' }} />
                  <span><strong>Volumetric Factor</strong>: Freight charged on higher of Actual Weight or Volumetric Weight `(L × W × H) / 5000`.</span>
                </li>
              </ul>
            </Card>

          </div>

        </div>
      )}

    </div>
  );
};
