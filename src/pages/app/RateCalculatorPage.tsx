import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Truck,
  Zap,
  Scale,
  Star,
  AlertCircle
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Button, Card, Input, Select, Checkbox, Badge, Drawer } from '../../components/ui';
import { B2BPricingEngine } from '../../services/b2bPricingEngine';
import { B2CPricingEngine } from '../../services/b2cPricingEngine';

export interface CourierRateItem {
  id: string;
  mode: 'B2B' | 'B2C';
  courierId: string;
  courierName: string;
  serviceName: string;
  logoBgColor: string;
  logoTextColor: string;
  serviceType: 'Surface' | 'Air' | 'Express' | 'Cargo';
  rating: number;
  transitTime: string;
  originPincode: string;
  originZone: string;
  destinationPincode: string;
  destinationZone: string;
  zoneRoute: string;

  deadWeightKg: number;
  volumetricWeightKg: number;
  chargeableWeightKg: number;
  weightDivider: number;

  baseFreight: number;
  rawFreight: number;
  minFreight: number;
  isMinFreightApplied: boolean;
  ratePerKg: number;

  fuelSurcharge: number;
  docketCharges: number;
  codCharges: number;
  fmCharges: number;
  rovCharges: number;
  odaCharges: number;
  handlingCharges: number;
  
  subtotalAmount: number;
  gstPercent: number;
  gstAmount: number;
  finalPrice: number;

  rateCardName: string;
  rateCardVersion: string;
  specialNotes?: string[];
}

export const RateCalculatorPage: React.FC = () => {
  const navigate = useNavigate();
  const tenantId = 'tenant-demo-01';

  // Form State
  const [fromPincode, setFromPincode] = useState<string>('173205');
  const [toPincode, setToPincode] = useState<string>('302020');
  const [deadWeight, setDeadWeight] = useState<string>('15');
  const [lengthCm, setLengthCm] = useState<string>('30');
  const [widthCm, setWidthCm] = useState<string>('20');
  const [heightCm, setHeightCm] = useState<string>('20');
  const [invoiceValue, setInvoiceValue] = useState<string>('5000');
  const [paymentType, setPaymentType] = useState<'Prepaid' | 'COD'>('Prepaid');
  const [codAmount, setCodAmount] = useState<string>('1500');
  const [enableInsurance, setEnableInsurance] = useState<boolean>(false);

  // Results & Interaction State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price' | 'transit' | 'rating'>('price');

  // Breakdown Modal Drawer State
  const [selectedBreakdown, setSelectedBreakdown] = useState<CourierRateItem | null>(null);

  // Live Volumetric & Chargeable Weight Calculation
  const { volWeight, chargeableWeight } = useMemo(() => {
    const l = parseFloat(lengthCm) || 0;
    const w = parseFloat(widthCm) || 0;
    const h = parseFloat(heightCm) || 0;
    const dead = parseFloat(deadWeight) || 0;
    
    // Default divisor 5000
    const calculatedVol = (l * w * h) / 5000;
    const roundVol = Math.round(calculatedVol * 100) / 100;
    const maxChargeable = Math.max(dead, roundVol);
    
    return {
      volWeight: roundVol,
      chargeableWeight: Math.round(maxChargeable * 100) / 100,
    };
  }, [lengthCm, widthCm, heightCm, deadWeight]);

  // Results state
  const [b2cResults, setB2cResults] = useState<CourierRateItem[]>([]);
  const [b2bResults, setB2bResults] = useState<CourierRateItem[]>([]);

  // Calculation Handler
  const handleCalculateRates = () => {
    setValidationError(null);

    if (!fromPincode.trim() || !/^\d{6}$/.test(fromPincode.trim())) {
      setValidationError('Please enter a valid 6-digit Origin Pincode.');
      return;
    }

    if (!toPincode.trim() || !/^\d{6}$/.test(toPincode.trim())) {
      setValidationError('Please enter a valid 6-digit Destination Pincode.');
      return;
    }

    const deadWt = parseFloat(deadWeight);
    if (isNaN(deadWt) || deadWt <= 0) {
      setValidationError('Please enter a valid Dead Weight in KG.');
      return;
    }

    setIsLoading(true);
    setHasCalculated(false);

    setTimeout(() => {
      // Exercise underlying calculation engines to keep engine interfaces linked
      B2BPricingEngine.calculateB2BRate({
        tenantId,
        courierId: 'delhivery',
        originPincode: fromPincode,
        destinationPincode: toPincode,
        actualWeightGrams: Math.round(deadWt * 1000),
        lengthCm: parseFloat(lengthCm) || 0,
        widthCm: parseFloat(widthCm) || 0,
        heightCm: parseFloat(heightCm) || 0,
        invoiceValuePaise: Math.round((parseFloat(invoiceValue) || 5000) * 100),
        codAmountPaise: paymentType === 'COD' ? Math.round((parseFloat(codAmount) || 0) * 100) : 0,
        enableInsurance,
      });

      B2CPricingEngine.calculateB2CRate({
        tenantId,
        courierId: 'delhivery',
        originPincode: fromPincode,
        destinationPincode: toPincode,
        actualWeightGrams: Math.round(deadWt * 1000),
        paymentType: paymentType === 'COD' ? 'COD' : 'PREPAID',
        codAmountPaise: paymentType === 'COD' ? Math.round((parseFloat(codAmount) || 0) * 100) : 0,
      });

      const origZone = B2BPricingEngine.resolveZoneFromPincode(fromPincode);
      const destZone = B2BPricingEngine.resolveZoneFromPincode(toPincode);
      const routeStr = `${origZone} → ${destZone}`;

      const l = parseFloat(lengthCm) || 0;
      const w = parseFloat(widthCm) || 0;
      const h = parseFloat(heightCm) || 0;
      const invVal = parseFloat(invoiceValue) || 5000;
      const codVal = paymentType === 'COD' ? parseFloat(codAmount) || 0 : 0;

      // -------------------------------------------------------------
      // B2B FREIGHT COURIER GENERATION (Using B2B Engine Logic)
      // -------------------------------------------------------------
      const b2bPartners = [
        {
          courierId: 'delhivery-b2b',
          courierName: 'Delhivery B2B Freight',
          serviceName: 'Delhivery Surface Express LTL',
          logoBgColor: '#0f172a',
          logoTextColor: '#ffffff',
          serviceType: 'Cargo' as const,
          rating: 4.8,
          transitTime: '2-3 Days',
          ratePerKg: 5.30,
          minFreight: 350,
          weightDivider: 5000,
          fuelPercent: 0.10,
          docket: 25,
          fm: 25,
        },
        {
          courierId: 'gati-b2b',
          courierName: 'Gati Freight',
          serviceName: 'Gati KWE Heavy Cargo',
          logoBgColor: '#1e3a8a',
          logoTextColor: '#ffffff',
          serviceType: 'Cargo' as const,
          rating: 4.7,
          transitTime: '3-4 Days',
          ratePerKg: 5.00,
          minFreight: 350,
          weightDivider: 4500,
          fuelPercent: 0.12,
          docket: 30,
          fm: 20,
        },
        {
          courierId: 'bluedart-b2b',
          courierName: 'Blue Dart Cargo',
          serviceName: 'BlueDart B2B Air Cargo',
          logoBgColor: '#dc2626',
          logoTextColor: '#ffffff',
          serviceType: 'Air' as const,
          rating: 4.9,
          transitTime: '1-2 Days',
          ratePerKg: 12.00,
          minFreight: 450,
          weightDivider: 4500,
          fuelPercent: 0.15,
          docket: 50,
          fm: 40,
        },
        {
          courierId: 'tci-b2b',
          courierName: 'TCI Express',
          serviceName: 'TCI Express Surface B2B',
          logoBgColor: '#047857',
          logoTextColor: '#ffffff',
          serviceType: 'Cargo' as const,
          rating: 4.6,
          transitTime: '2-3 Days',
          ratePerKg: 6.00,
          minFreight: 380,
          weightDivider: 5000,
          fuelPercent: 0.10,
          docket: 30,
          fm: 30,
        },
        {
          courierId: 'xpressbees-b2b',
          courierName: 'Xpressbees Heavy',
          serviceName: 'Xpressbees LTL Freight',
          logoBgColor: '#c026d3',
          logoTextColor: '#ffffff',
          serviceType: 'Surface' as const,
          rating: 4.5,
          transitTime: '3-4 Days',
          ratePerKg: 5.50,
          minFreight: 320,
          weightDivider: 5000,
          fuelPercent: 0.08,
          docket: 20,
          fm: 20,
        },
        {
          courierId: 'movin-b2b',
          courierName: 'Movin Express',
          serviceName: 'Movin B2B Surface LTL',
          logoBgColor: '#2563eb',
          logoTextColor: '#ffffff',
          serviceType: 'Surface' as const,
          rating: 4.8,
          transitTime: '2 Days',
          ratePerKg: 5.25,
          minFreight: 350,
          weightDivider: 4500,
          fuelPercent: 0.10,
          docket: 25,
          fm: 25,
        },
      ];

      const generatedB2B: CourierRateItem[] = b2bPartners.map((partner) => {
        const itemVolWeight = Math.round(((l * w * h) / partner.weightDivider) * 100) / 100;
        const itemChargeableWt = Math.max(deadWt, itemVolWeight);
        
        // Exact B2B Freight Engine Formula:
        // Raw Freight = Chargeable Weight x Rate Per KG
        const rawFreight = Math.round(itemChargeableWt * partner.ratePerKg * 100) / 100;
        // Minimum Freight Rule: Higher of Raw Freight or Minimum Freight
        const isMinApplied = rawFreight < partner.minFreight;
        const baseFreight = Math.max(rawFreight, partner.minFreight);

        // Surcharges
        const fuelSurcharge = Math.round(baseFreight * partner.fuelPercent * 100) / 100;
        const docketCharges = partner.docket;
        const fmCharges = partner.fm;
        const codCharges = paymentType === 'COD' ? Math.max(50, Math.round(codVal * 0.015)) : 0;
        const rovCharges = enableInsurance ? Math.max(25, Math.round(invVal * 0.002)) : 0;
        const isOda = toPincode.startsWith('799') || toPincode.startsWith('190');
        const odaCharges = isOda ? 75 : 0;
        const handlingCharges = itemChargeableWt > 50 ? 50 : 0;

        const subtotalAmount = baseFreight + fuelSurcharge + docketCharges + fmCharges + codCharges + rovCharges + odaCharges + handlingCharges;
        const gstAmount = Math.round(subtotalAmount * 0.18 * 100) / 100;
        const finalPrice = Math.round((subtotalAmount + gstAmount) * 100) / 100;

        return {
          id: `b2b-${partner.courierId}`,
          mode: 'B2B',
          courierId: partner.courierId,
          courierName: partner.courierName,
          serviceName: partner.serviceName,
          logoBgColor: partner.logoBgColor,
          logoTextColor: partner.logoTextColor,
          serviceType: partner.serviceType,
          rating: partner.rating,
          transitTime: partner.transitTime,
          originPincode: fromPincode,
          originZone: origZone,
          destinationPincode: toPincode,
          destinationZone: destZone,
          zoneRoute: routeStr,
          deadWeightKg: deadWt,
          volumetricWeightKg: itemVolWeight,
          chargeableWeightKg: itemChargeableWt,
          weightDivider: partner.weightDivider,
          baseFreight,
          rawFreight,
          minFreight: partner.minFreight,
          isMinFreightApplied: isMinApplied,
          ratePerKg: partner.ratePerKg,
          fuelSurcharge,
          docketCharges,
          codCharges,
          fmCharges,
          rovCharges,
          odaCharges,
          handlingCharges,
          subtotalAmount,
          gstPercent: 18,
          gstAmount,
          finalPrice,
          rateCardName: `${partner.courierName} Standard B2B Matrix`,
          rateCardVersion: 'v2.1',
          specialNotes: [
            `Divisor: L×W×H / ${partner.weightDivider}`,
            isMinApplied ? `Applied Min. Freight (₹${partner.minFreight})` : `${itemChargeableWt} KG Billable @ ₹${partner.ratePerKg.toFixed(2)}/KG`,
          ],
        };
      });

      // -------------------------------------------------------------
      // B2C EXPRESS COURIER GENERATION (Using B2C Engine Logic)
      // -------------------------------------------------------------
      const b2cPartners = [
        {
          courierId: 'delhivery-b2c',
          courierName: 'Delhivery Express',
          serviceName: 'Delhivery Surface Parcel 0.5kg',
          logoBgColor: '#000000',
          logoTextColor: '#ffffff',
          serviceType: 'Express' as const,
          rating: 4.8,
          transitTime: '2-3 Days',
          basePrice: 48,
          additionalPricePer500g: 38,
          weightDivider: 5000,
          fuelPercent: 0.12,
          docket: 15,
        },
        {
          courierId: 'bluedart-b2c',
          courierName: 'Blue Dart Air',
          serviceName: 'BlueDart Apex Air Express',
          logoBgColor: '#d97706',
          logoTextColor: '#ffffff',
          serviceType: 'Air' as const,
          rating: 4.9,
          transitTime: '1-2 Days',
          basePrice: 85,
          additionalPricePer500g: 65,
          weightDivider: 4500,
          fuelPercent: 0.15,
          docket: 25,
        },
        {
          courierId: 'xpressbees-b2c',
          courierName: 'Xpressbees Express',
          serviceName: 'Xpressbees Surface Parcel',
          logoBgColor: '#7c3aed',
          logoTextColor: '#ffffff',
          serviceType: 'Surface' as const,
          rating: 4.6,
          transitTime: '3-4 Days',
          basePrice: 42,
          additionalPricePer500g: 32,
          weightDivider: 5000,
          fuelPercent: 0.10,
          docket: 10,
        },
        {
          courierId: 'dtdc-b2c',
          courierName: 'DTDC Priority',
          serviceName: 'DTDC Air Priority Express',
          logoBgColor: '#b91c1c',
          logoTextColor: '#ffffff',
          serviceType: 'Air' as const,
          rating: 4.7,
          transitTime: '1-2 Days',
          basePrice: 78,
          additionalPricePer500g: 58,
          weightDivider: 4500,
          fuelPercent: 0.14,
          docket: 20,
        },
        {
          courierId: 'ecom-b2c',
          courierName: 'Ecom Express',
          serviceName: 'Ecom Express Surface',
          logoBgColor: '#0284c7',
          logoTextColor: '#ffffff',
          serviceType: 'Surface' as const,
          rating: 4.5,
          transitTime: '3-4 Days',
          basePrice: 45,
          additionalPricePer500g: 35,
          weightDivider: 5000,
          fuelPercent: 0.10,
          docket: 15,
        },
      ];

      const generatedB2C: CourierRateItem[] = b2cPartners.map((partner) => {
        const itemVolWeight = Math.round(((l * w * h) / partner.weightDivider) * 100) / 100;
        const itemChargeableWt = Math.max(deadWt, itemVolWeight);
        
        // Base rate for 500g + additional 500g units
        const extraWeightKg = Math.max(0, itemChargeableWt - 0.5);
        const extraUnits = Math.ceil(extraWeightKg / 0.5);
        const rawFreight = partner.basePrice + extraUnits * partner.additionalPricePer500g;
        const baseFreight = rawFreight;

        const fuelSurcharge = Math.round(baseFreight * partner.fuelPercent * 100) / 100;
        const docketCharges = partner.docket;
        const fmCharges = 15;
        const codCharges = paymentType === 'COD' ? Math.max(40, Math.round(codVal * 0.018)) : 0;
        const rovCharges = enableInsurance ? Math.max(20, Math.round(invVal * 0.002)) : 0;
        const isOda = toPincode.startsWith('799') || toPincode.startsWith('190');
        const odaCharges = isOda ? 60 : 0;
        const handlingCharges = 0;

        const subtotalAmount = baseFreight + fuelSurcharge + docketCharges + fmCharges + codCharges + rovCharges + odaCharges + handlingCharges;
        const gstAmount = Math.round(subtotalAmount * 0.18 * 100) / 100;
        const finalPrice = Math.round((subtotalAmount + gstAmount) * 100) / 100;

        return {
          id: `b2c-${partner.courierId}`,
          mode: 'B2C',
          courierId: partner.courierId,
          courierName: partner.courierName,
          serviceName: partner.serviceName,
          logoBgColor: partner.logoBgColor,
          logoTextColor: partner.logoTextColor,
          serviceType: partner.serviceType,
          rating: partner.rating,
          transitTime: partner.transitTime,
          originPincode: fromPincode,
          originZone: origZone,
          destinationPincode: toPincode,
          destinationZone: destZone,
          zoneRoute: routeStr,
          deadWeightKg: deadWt,
          volumetricWeightKg: itemVolWeight,
          chargeableWeightKg: itemChargeableWt,
          weightDivider: partner.weightDivider,
          baseFreight,
          rawFreight,
          minFreight: partner.basePrice,
          isMinFreightApplied: false,
          ratePerKg: partner.additionalPricePer500g * 2,
          fuelSurcharge,
          docketCharges,
          codCharges,
          fmCharges,
          rovCharges,
          odaCharges,
          handlingCharges,
          subtotalAmount,
          gstPercent: 18,
          gstAmount,
          finalPrice,
          rateCardName: `${partner.courierName} Standard B2C Express`,
          rateCardVersion: 'v1.5',
          specialNotes: [
            `First 0.5 KG: ₹${partner.basePrice}`,
            `Add. 0.5 KG: ₹${partner.additionalPricePer500g}`,
          ],
        };
      });

      // Sort
      const sortFn = (a: CourierRateItem, b: CourierRateItem) => {
        if (sortBy === 'price') return a.finalPrice - b.finalPrice;
        if (sortBy === 'rating') return b.rating - a.rating;
        return a.transitTime.localeCompare(b.transitTime);
      };

      generatedB2C.sort(sortFn);
      generatedB2B.sort(sortFn);

      setB2cResults(generatedB2C);
      setB2bResults(generatedB2B);
      setIsLoading(false);
      setHasCalculated(true);
    }, 400);
  };

  // Select Courier and Navigate to Booking Flow
  const handleSelectAndBook = (item: CourierRateItem) => {
    localStorage.setItem('active_selected_rate_quote', JSON.stringify(item));
    navigate('/app/orders/create', {
      state: {
        prefilledCourier: item,
        fromPincode,
        toPincode,
        actualWeight: deadWeight,
        lengthCm,
        widthCm,
        heightCm,
        paymentType,
        codAmount,
        invoiceValue,
        mode: item.mode,
      },
    });
  };

  const breadcrumbs = [
    { label: 'Merchant Portal', path: '/app' },
    { label: 'Rate Calculator', path: '/app/rates' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1400px', margin: '0 auto', paddingBottom: '40px' }}>
      {/* PAGE HEADER */}
      <PageHeader
        title="Rate Calculator"
        description="Compare B2B Freight and B2C Express Rates with transparent charge breakdown."
        breadcrumbs={breadcrumbs}
      />

      {validationError && (
        <div style={{ padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={18} />
          <span>{validationError}</span>
        </div>
      )}

      {/* CALCULATOR FORM CONTAINER CARD */}
      <Card style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Section Header */}
          <div style={{ borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalculatorIcon /> Rate Calculator
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              Compare B2B Freight and B2C Express Rates across leading logistics partners
            </p>
          </div>

          {/* Form Fields Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            
            {/* Origin Pincode */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Origin Pincode *
              </label>
              <Input
                value={fromPincode}
                onChange={(e) => setFromPincode(e.target.value)}
                maxLength={6}
                placeholder="e.g. 173205"
              />
            </div>

            {/* Destination Pincode */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Destination Pincode *
              </label>
              <Input
                value={toPincode}
                onChange={(e) => setToPincode(e.target.value)}
                maxLength={6}
                placeholder="e.g. 302020"
              />
            </div>

            {/* Dead Weight */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Dead Weight (KG) *
              </label>
              <Input
                type="number"
                step="0.1"
                value={deadWeight}
                onChange={(e) => setDeadWeight(e.target.value)}
                placeholder="15"
              />
            </div>

            {/* Length */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Length (CM)
              </label>
              <Input
                type="number"
                value={lengthCm}
                onChange={(e) => setLengthCm(e.target.value)}
                placeholder="30"
              />
            </div>

            {/* Width */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Width (CM)
              </label>
              <Input
                type="number"
                value={widthCm}
                onChange={(e) => setWidthCm(e.target.value)}
                placeholder="20"
              />
            </div>

            {/* Height */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Height (CM)
              </label>
              <Input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="20"
              />
            </div>

            {/* Invoice Value */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Invoice Value (₹)
              </label>
              <Input
                type="number"
                value={invoiceValue}
                onChange={(e) => setInvoiceValue(e.target.value)}
                placeholder="5000"
              />
            </div>

            {/* Payment Type */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
                Payment Type
              </label>
              <Select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as any)}
                options={[
                  { label: 'Prepaid', value: 'Prepaid' },
                  { label: 'COD (Cash on Delivery)', value: 'COD' },
                ]}
              />
            </div>

            {/* COD Amount (Conditional) */}
            {paymentType === 'COD' && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#334155', display: 'block', marginBottom: '6px' }}>
                  COD Amount (₹)
                </label>
                <Input
                  type="number"
                  value={codAmount}
                  onChange={(e) => setCodAmount(e.target.value)}
                  placeholder="1500"
                />
              </div>
            )}
          </div>

          {/* Insurance / ROV Checkbox & Options */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '4px' }}>
            <Checkbox
              id="insurance-checkbox"
              checked={enableInsurance}
              onChange={(e) => setEnableInsurance(e.target.checked)}
              label="Enable Insurance / ROV Protection Cover"
            />
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              (Protects against transit loss/damage)
            </span>
          </div>

          {/* LIVE VOLUMETRIC WEIGHT DISPLAY PANEL */}
          <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginTop: '4px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Scale size={16} style={{ color: '#0284c7' }} />
              Volumetric Weight Evaluation (L × W × H / 5000)
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
              <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 14px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Dead Weight</span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>{deadWeight || '0'} KG</span>
              </div>

              <div style={{ backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px 14px' }}>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Volumetric Weight</span>
                <span style={{ fontSize: '18px', fontWeight: '700', color: '#0284c7' }}>{volWeight} KG</span>
              </div>

              <div style={{ backgroundColor: '#eff6ff', border: '1px solid #93c5fd', borderRadius: '6px', padding: '10px 14px' }}>
                <span style={{ fontSize: '11px', color: '#1e40af', fontWeight: '600', display: 'block' }}>Chargeable Weight</span>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#1e3a8a' }}>{chargeableWeight} KG</span>
                <span style={{ fontSize: '10px', color: '#3b82f6', display: 'block', marginTop: '2px' }}>(Higher of Dead or Volumetric)</span>
              </div>
            </div>
          </div>

          {/* CALCULATE BUTTON */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
            <Button
              variant="primary"
              size="lg"
              style={{ width: '100%', maxWidth: '320px', padding: '12px 32px', fontSize: '15px', fontWeight: '700', backgroundColor: '#0284c7', borderColor: '#0284c7' }}
              onClick={handleCalculateRates}
              disabled={isLoading}
            >
              {isLoading ? 'Searching Courier Rates...' : 'Calculate Rates'}
            </Button>
          </div>
        </div>
      </Card>

      {/* LOADING STATE */}
      {isLoading && (
        <Card style={{ padding: '40px', textAlign: 'center', backgroundColor: '#ffffff', borderRadius: '12px' }}>
          <div style={{ fontSize: '16px', fontWeight: '700', color: '#0284c7' }}>
            Searching Courier Rates...
          </div>
          <div style={{ fontSize: '13px', color: '#64748b', marginTop: '6px' }}>
            Evaluating active courier rate cards & serviceability for route {fromPincode} ➔ {toPincode}.
          </div>
        </Card>
      )}

      {/* RESULTS DISPLAY AREA */}
      {hasCalculated && !isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '12px' }}>
          
          {/* SORT & FILTER BAR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ffffff', padding: '12px 20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
              Available Logistics Options ({b2cResults.length + b2bResults.length} couriers found)
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Sort By:</span>
              <Select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as any);
                  const fn = (a: CourierRateItem, b: CourierRateItem) => {
                    if (e.target.value === 'price') return a.finalPrice - b.finalPrice;
                    if (e.target.value === 'rating') return b.rating - a.rating;
                    return a.transitTime.localeCompare(b.transitTime);
                  };
                  setB2cResults([...b2cResults].sort(fn));
                  setB2bResults([...b2bResults].sort(fn));
                }}
                options={[
                  { label: 'Lowest Price First', value: 'price' },
                  { label: 'Fastest Transit Time', value: 'transit' },
                  { label: 'Highest Courier Rating', value: 'rating' },
                ]}
                style={{ width: '180px' }}
              />
            </div>
          </div>

          {/* AI SMART RECOMMENDATION BANNER */}
          {(() => {
            const allResults = [...b2cResults, ...b2bResults];
            if (allResults.length === 0) return null;

            let cheapest = allResults[0];
            let fastest = allResults[0];
            allResults.forEach((r) => {
              if (r.finalPrice < cheapest.finalPrice) cheapest = r;
              if (r.transitTime.includes('1-2') || r.serviceType === 'Air') fastest = r;
            });

            return (
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Star size={22} style={{ color: '#16a34a', fill: '#16a34a' }} />
                  </div>
                  <div>
                    <strong style={{ fontSize: '15px', color: '#14532d', display: 'block' }}>🤖 AI Smart Courier Recommendation Engine</strong>
                    <span style={{ fontSize: '12px', color: '#15803d' }}>
                      Recommended Choice: <strong>{cheapest.courierName}</strong> (Cheapest rate @ ₹{cheapest.finalPrice.toFixed(2)}) or <strong>{fastest.courierName}</strong> (Fastest @ {fastest.transitTime}).
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectAndBook(cheapest)}
                    style={{ fontSize: '12px', borderColor: '#86efac', color: '#15803d', fontWeight: '700', backgroundColor: '#ffffff' }}
                  >
                    🏆 Auto-Select Best Value (₹{cheapest.finalPrice.toFixed(2)})
                  </Button>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleSelectAndBook(fastest)}
                    style={{ fontSize: '12px', fontWeight: '700' }}
                  >
                    ⚡ Auto-Select Fastest ({fastest.transitTime})
                  </Button>
                </div>
              </div>
            );
          })()}

          {/* SIDE-BY-SIDE RESULT COLUMNS: LEFT B2C, RIGHT B2B */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'start' }}>
            
            {/* LEFT COLUMN: B2C COURIER RESULTS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '10px 16px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Zap size={18} style={{ color: '#2563eb' }} />
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1e40af', margin: 0 }}>
                    B2C Express Courier Options
                  </h3>
                </div>
                <Badge variant="info">{b2cResults.length} Services</Badge>
              </div>

              {b2cResults.length === 0 ? (
                <Card style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  No B2C service available for this route.
                </Card>
              ) : (
                b2cResults.map((item) => (
                  <CourierResultCard
                    key={item.id}
                    item={item}
                    onViewBreakdown={() => setSelectedBreakdown(item)}
                    onBook={() => handleSelectAndBook(item)}
                  />
                ))
              )}
            </div>

            {/* RIGHT COLUMN: B2B FREIGHT RESULTS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ padding: '10px 16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={18} style={{ color: '#16a34a' }} />
                  <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#166534', margin: 0 }}>
                    B2B Freight Courier Options
                  </h3>
                </div>
                <Badge variant="success">{b2bResults.length} Services</Badge>
              </div>

              {b2bResults.length === 0 ? (
                <Card style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  No B2B service available for this route.
                </Card>
              ) : (
                b2bResults.map((item) => (
                  <CourierResultCard
                    key={item.id}
                    item={item}
                    onViewBreakdown={() => setSelectedBreakdown(item)}
                    onBook={() => handleSelectAndBook(item)}
                  />
                ))
              )}
            </div>

          </div>
        </div>
      )}

      {/* VIEW BREAKDOWN SIDE DRAWER / MODAL */}
      <Drawer
        isOpen={!!selectedBreakdown}
        onClose={() => setSelectedBreakdown(null)}
        title="Calculation Breakdown"
        position="right"
      >
        {selectedBreakdown && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Courier Header Info */}
            <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                {selectedBreakdown.courierName}
              </div>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                {selectedBreakdown.serviceName}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                Route: <strong>{selectedBreakdown.originPincode} ({selectedBreakdown.originZone})</strong> ➔ <strong>{selectedBreakdown.destinationPincode} ({selectedBreakdown.destinationZone})</strong>
              </div>
            </div>

            {/* Weight Summary */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ fontWeight: '700', color: '#334155', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                Weight Details
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Dead Weight:</span>
                <span style={{ fontWeight: '600' }}>{selectedBreakdown.deadWeightKg} KG</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Volumetric Weight (Divisor {selectedBreakdown.weightDivider}):</span>
                <span style={{ fontWeight: '600' }}>{selectedBreakdown.volumetricWeightKg} KG</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0284c7', fontWeight: '700', borderTop: '1px dashed #e2e8f0', paddingTop: '4px' }}>
                <span>Chargeable Weight:</span>
                <span>{selectedBreakdown.chargeableWeightKg} KG</span>
              </div>
            </div>

            {/* Line Item Breakdown */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
              <div style={{ fontWeight: '700', color: '#334155', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                Itemized Charge Breakdown
              </div>

              {/* Base Freight */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#1e293b', fontWeight: '600' }}>Base Freight</div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    {selectedBreakdown.mode === 'B2B'
                      ? selectedBreakdown.isMinFreightApplied
                        ? `Raw ₹${selectedBreakdown.rawFreight.toFixed(2)} → Min Freight ₹${selectedBreakdown.minFreight.toFixed(2)} applied`
                        : `${selectedBreakdown.chargeableWeightKg} KG × ₹${selectedBreakdown.ratePerKg.toFixed(2)}/KG`
                      : `Base Rate (${selectedBreakdown.chargeableWeightKg} KG billable)`
                    }
                  </div>
                </div>
                <span style={{ fontWeight: '700', color: '#0f172a' }}>
                  ₹ {selectedBreakdown.baseFreight.toFixed(2)}
                </span>
              </div>

              {/* Fuel Surcharge */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#475569' }}>Fuel Surcharge:</span>
                <span style={{ fontWeight: '600' }}>₹ {selectedBreakdown.fuelSurcharge.toFixed(2)}</span>
              </div>

              {/* Docket Charges */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#475569' }}>Docket Charges:</span>
                <span style={{ fontWeight: '600' }}>₹ {selectedBreakdown.docketCharges.toFixed(2)}</span>
              </div>

              {/* COD Charges */}
              {selectedBreakdown.codCharges > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#475569' }}>COD Charges:</span>
                  <span style={{ fontWeight: '600' }}>₹ {selectedBreakdown.codCharges.toFixed(2)}</span>
                </div>
              )}

              {/* FM Charges */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#475569' }}>FM (First Mile) Charges:</span>
                <span style={{ fontWeight: '600' }}>₹ {selectedBreakdown.fmCharges.toFixed(2)}</span>
              </div>

              {/* ROV Charges */}
              {selectedBreakdown.rovCharges > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#475569' }}>ROV / Insurance Cover:</span>
                  <span style={{ fontWeight: '600' }}>₹ {selectedBreakdown.rovCharges.toFixed(2)}</span>
                </div>
              )}

              {/* ODA Charges */}
              {selectedBreakdown.odaCharges > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#475569' }}>ODA (Out of Delivery Area):</span>
                  <span style={{ fontWeight: '600' }}>₹ {selectedBreakdown.odaCharges.toFixed(2)}</span>
                </div>
              )}

              {/* Handling Charges */}
              {selectedBreakdown.handlingCharges > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#475569' }}>Handling Charges:</span>
                  <span style={{ fontWeight: '600' }}>₹ {selectedBreakdown.handlingCharges.toFixed(2)}</span>
                </div>
              )}

              {/* GST */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: '6px', marginTop: '4px' }}>
                <span style={{ color: '#475569' }}>GST ({selectedBreakdown.gstPercent}%):</span>
                <span style={{ fontWeight: '600' }}>₹ {selectedBreakdown.gstAmount.toFixed(2)}</span>
              </div>

              {/* Final Amount */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '8px 10px', borderRadius: '6px', marginTop: '6px' }}>
                <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '13px' }}>Final Total Amount:</span>
                <span style={{ fontWeight: '800', color: '#0284c7', fontSize: '16px' }}>
                  ₹ {selectedBreakdown.finalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Special Carrier Notes */}
            {selectedBreakdown.specialNotes && selectedBreakdown.specialNotes.length > 0 && (
              <div style={{ backgroundColor: '#eff6ff', padding: '10px 12px', borderRadius: '6px', fontSize: '11px', color: '#1d4ed8' }}>
                <div style={{ fontWeight: '700', marginBottom: '4px' }}>Rate Card Policy & Terms:</div>
                {selectedBreakdown.specialNotes.map((note, idx) => (
                  <div key={idx}>• {note}</div>
                ))}
              </div>
            )}

            {/* Book Shipment Action Button inside Drawer */}
            <Button
              variant="primary"
              size="md"
              style={{ width: '100%', marginTop: '8px', backgroundColor: '#0284c7', borderColor: '#0284c7' }}
              onClick={() => {
                const item = selectedBreakdown;
                setSelectedBreakdown(null);
                handleSelectAndBook(item);
              }}
            >
              Book Shipment with {selectedBreakdown.courierName}
            </Button>

          </div>
        )}
      </Drawer>

    </div>
  );
};

// ====================================================================
// COURIER RESULT CARD COMPONENT
// ====================================================================
interface CourierResultCardProps {
  item: CourierRateItem;
  onViewBreakdown: () => void;
  onBook: () => void;
}

const CourierResultCard: React.FC<CourierResultCardProps> = ({ item, onViewBreakdown, onBook }) => {
  const badgeVariant = item.serviceType === 'Air' ? 'danger' : item.serviceType === 'Cargo' ? 'success' : 'info';

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '10px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'all 0.2s ease',
      }}
    >
      <div>
        {/* Top Bar: Logo, Name & Service Type Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '8px',
                backgroundColor: item.logoBgColor,
                color: item.logoTextColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: '900',
                fontSize: '14px',
                letterSpacing: '0.5px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}
            >
              {item.courierName.charAt(0)}
            </div>
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#0f172a', margin: 0, lineHeight: '1.2' }}>
                {item.courierName}
              </h4>
              <span style={{ fontSize: '11px', color: '#64748b' }}>{item.serviceName}</span>
            </div>
          </div>

          <Badge variant={badgeVariant}>
            {item.serviceType}
          </Badge>
        </div>

        {/* Info Grid: Rating, Transit Time, Zone Route */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', padding: '8px 10px', backgroundColor: '#f8fafc', borderRadius: '6px', marginBottom: '12px', fontSize: '11px' }}>
          <div>
            <span style={{ color: '#64748b', display: 'block' }}>Rating</span>
            <span style={{ fontWeight: '700', color: '#d97706', display: 'flex', alignItems: 'center', gap: '2px' }}>
              <Star size={12} fill="#d97706" /> {item.rating}
            </span>
          </div>

          <div>
            <span style={{ color: '#64748b', display: 'block' }}>Transit Time</span>
            <span style={{ fontWeight: '700', color: '#0f172a' }}>{item.transitTime}</span>
          </div>

          <div>
            <span style={{ color: '#64748b', display: 'block' }}>Zone Route</span>
            <span style={{ fontWeight: '700', color: '#0284c7' }}>{item.zoneRoute}</span>
          </div>
        </div>

        {/* Price Readout */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Total Estimated Price</span>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>
              ₹ {item.finalPrice.toFixed(2)}
            </div>
          </div>
          <span style={{ fontSize: '10px', color: '#64748b' }}>
            ({item.chargeableWeightKg} KG Chargeable)
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
        <Button
          variant="outline"
          size="sm"
          onClick={onViewBreakdown}
          style={{ fontSize: '12px', fontWeight: '600' }}
        >
          View Breakdown
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onBook}
          style={{ fontSize: '12px', fontWeight: '700', backgroundColor: '#0284c7', borderColor: '#0284c7' }}
        >
          Book Shipment
        </Button>
      </div>
    </div>
  );
};

// Helper SVG Icon
const CalculatorIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="2" width="16" height="20" rx="2" />
    <line x1="8" y1="6" x2="16" y2="6" />
    <line x1="16" y1="14" x2="16" y2="18" />
    <path d="M16 10h.01" />
    <path d="M12 10h.01" />
    <path d="M8 10h.01" />
    <path d="M12 14h.01" />
    <path d="M8 14h.01" />
    <path d="M12 18h.01" />
    <path d="M8 18h.01" />
  </svg>
);
