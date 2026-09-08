import React, { useState, useMemo, useEffect } from 'react';
import {
  Wallet,
  CheckCircle2,
  Building2,
  Home,
  Plus,
  ArrowLeft,
  ArrowRight,
  Printer,
  Download,
  Package,
  CreditCard,
  Truck,
  Check,
  Star,
  Zap,
  Tag,
  ThumbsUp,
  FileText,
  Save,
  RotateCcw,
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import {
  Button,
  Card,
  Badge,
  Input,
  Alert,
  Modal,
} from '../../components/ui';
import { WalletService } from '../../mocks/wallet.mock';
import { CustomerBookingService } from '../../services/customerBookingService';
import { CustomerRateAssignmentService, type EligibleCourierResult } from '../../services/customerRateAssignmentService';
import { CustomerWarehouseService, type CustomerWarehouse } from '../../services/customerWarehouseService';
import { OnboardingService } from '../../services/onboardingService';
import { useRbac } from '../../context/RbacContext';
import { formatCurrency } from '../../utils/formatters';

export interface MultiPackageFormItem {
  id: string;
  packageNumber: number;
  packageType: string;
  actualWeightKg: number;
  lengthCm: number;
  widthCm: number;
  heightCm: number;
  quantity: number;
  packageContents: string;
}

export const WIZARD_STEPS = [
  { step: 1, label: '1. Pickup Warehouse', icon: Building2 },
  { step: 2, label: '2. Receiver Details', icon: Home },
  { step: 3, label: '3. Package Details', icon: Package },
  { step: 4, label: '4. Rate Comparison', icon: Truck },
  { step: 5, label: '5. Review & Confirm', icon: CreditCard },
  { step: 6, label: '6. Label & Success', icon: CheckCircle2 },
];

// Pincode to City/State Database Helper
const PINCODE_MAP: Record<string, { city: string; state: string }> = {
  '110001': { city: 'New Delhi', state: 'Delhi' },
  '110020': { city: 'New Delhi', state: 'Delhi' },
  '560038': { city: 'Bengaluru', state: 'Karnataka' },
  '560001': { city: 'Bengaluru', state: 'Karnataka' },
  '400001': { city: 'Mumbai', state: 'Maharashtra' },
  '400005': { city: 'Mumbai', state: 'Maharashtra' },
  '700001': { city: 'Kolkata', state: 'West Bengal' },
  '700016': { city: 'Kolkata', state: 'West Bengal' },
  '600001': { city: 'Chennai', state: 'Tamil Nadu' },
  '600017': { city: 'Chennai', state: 'Tamil Nadu' },
  '380015': { city: 'Ahmedabad', state: 'Gujarat' },
  '201301': { city: 'Noida', state: 'Uttar Pradesh' },
  '173205': { city: 'Solan', state: 'Himachal Pradesh' },
};

const DRAFT_STORAGE_KEY = 'COURRIER3_CREATE_SHIPMENT_DRAFT';

export const CreateShipmentWizardPage: React.FC = () => {
  const tenantId = 'tenant-demo-01';
  const { logActivity } = useRbac();

  // Step State (1 to 6)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formError, setFormError] = useState<string | null>(null);

  // Draft Saved Indicator
  const [draftSavedTime, setDraftSavedTime] = useState<string | null>(null);

  // 1. Pickup Warehouses Engine
  const [warehouses, setWarehouses] = useState<CustomerWarehouse[]>(() =>
    CustomerWarehouseService.getActiveWarehouses(tenantId)
  );
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>(() => {
    const active = CustomerWarehouseService.getActiveWarehouses(tenantId);
    return active.find((w) => w.isDefault)?.id || active[0]?.id || '';
  });

  // In-flow Add Warehouse Modal State
  const [isAddWhModalOpen, setIsAddWhModalOpen] = useState(false);
  const [newWhName, setNewWhName] = useState('');
  const [newWhContact, setNewWhContact] = useState('');
  const [newWhPhone, setNewWhPhone] = useState('');
  const [newWhEmail, setNewWhEmail] = useState('');
  const [newWhAddress, setNewWhAddress] = useState('');
  const [newWhPincode, setNewWhPincode] = useState('110001');
  const [newWhCity, setNewWhCity] = useState('New Delhi');
  const [newWhState, setNewWhState] = useState('Delhi');

  // Step 2: Receiver Details
  const [receiverName, setReceiverName] = useState('Rahul Sharma');
  const [receiverPhone, setReceiverPhone] = useState('9876543210');
  const [altPhone, setAltPhone] = useState('9811234567');
  const [receiverCompany, setReceiverCompany] = useState('Sharma Retail Enterprises');
  const [receiverEmail, setReceiverEmail] = useState('rahul.sharma@example.com');
  const [deliveryAddress1, setDeliveryAddress1] = useState('Flat 402, Sunshine Heights, Koramangala');
  const [deliveryAddress2, setDeliveryAddress2] = useState('Near Forum Mall');
  const [landmark, setLandmark] = useState('Opposite Passport Seva Kendra');
  const [deliveryPincode, setDeliveryPincode] = useState('560038');
  const [deliveryCity, setDeliveryCity] = useState('Bengaluru');
  const [deliveryState, setDeliveryState] = useState('Karnataka');

  // Step 3: Package Details, Shipment Type, Payment Mode, Insurance
  const [shipmentCategory, setShipmentCategory] = useState<'document' | 'parcel' | 'b2b_freight'>('parcel');
  const [deadWeight, setDeadWeight] = useState<string>('2.5');
  const [pkgLength, setPkgLength] = useState<string>('30');
  const [pkgWidth, setPkgWidth] = useState<string>('20');
  const [pkgHeight, setPkgHeight] = useState<string>('15');
  const [numPackages, setNumPackages] = useState<number>(1);
  const [invoiceValue, setInvoiceValue] = useState<string>('1500');
  const [contentsDescription, setContentsDescription] = useState<string>('Apparel & Fashion Accessories');
  
  const [orderId] = useState(() => `ORD-${Date.now().toString().slice(-5)}`);
  const [paymentMode, setPaymentMode] = useState<'prepaid' | 'cod'>('cod');
  const [codAmount, setCodAmount] = useState('1500');
  
  const [insuranceEnabled, setInsuranceEnabled] = useState(false);
  const [insuredValue, setInsuredValue] = useState('1500');

  // Multi-box List
  const [packages, setPackages] = useState<MultiPackageFormItem[]>([
    {
      id: 'pkg-1',
      packageNumber: 1,
      packageType: 'Box',
      actualWeightKg: 2.5,
      lengthCm: 30,
      widthCm: 20,
      heightCm: 15,
      quantity: 1,
      packageContents: 'Apparel & Fashion Accessories',
    },
  ]);

  // Step 4: Rate Comparison & Breakdown Modal
  const [selectedCourier, setSelectedCourier] = useState<EligibleCourierResult | null>(null);
  const [breakdownModalCourier, setBreakdownModalCourier] = useState<EligibleCourierResult | null>(null);

  // Step 6: Label Format & Success Execution Result
  const [labelFormat, setLabelFormat] = useState<'thermal_4x6' | 'a4_sheet' | 'single' | 'bulk'>('thermal_4x6');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState<{
    shipmentId: string;
    orderId: string;
    awbNumber: string;
    courierName: string;
    serviceName: string;
    amountPaid: number;
    packageCount: number;
  } | null>(null);

  // Wallet Balance
  const wallet = WalletService.getWallet(tenantId);
  const walletBalanceINR = wallet.availableBalanceMinor / 100;

  // Selected Warehouse Object
  const currentWarehouse = useMemo(() => {
    return warehouses.find((w) => w.id === selectedWarehouseId) || warehouses[0];
  }, [warehouses, selectedWarehouseId]);

  // Pincode Auto-Fill for Receiver
  const handlePincodeChange = (pin: string) => {
    setDeliveryPincode(pin);
    if (pin.length === 6 && PINCODE_MAP[pin]) {
      setDeliveryCity(PINCODE_MAP[pin].city);
      setDeliveryState(PINCODE_MAP[pin].state);
    }
  };

  // Synchronize single-box inputs with package math
  useEffect(() => {
    const dw = Math.max(0.1, Number(deadWeight) || 0.5);
    const l = Math.max(1, Number(pkgLength) || 10);
    const w = Math.max(1, Number(pkgWidth) || 10);
    const h = Math.max(1, Number(pkgHeight) || 10);

    setPackages([
      {
        id: 'pkg-1',
        packageNumber: 1,
        packageType: shipmentCategory === 'document' ? 'Flyer' : 'Box',
        actualWeightKg: dw,
        lengthCm: l,
        widthCm: w,
        heightCm: h,
        quantity: numPackages,
        packageContents: contentsDescription,
      },
    ]);
  }, [deadWeight, pkgLength, pkgWidth, pkgHeight, numPackages, contentsDescription, shipmentCategory]);

  // Live Volumetric & Chargeable Weight Calculations
  const packageMath = useMemo(() => {
    let totalActual = 0;
    let totalVolumetric = 0;
    let totalQty = 0;

    packages.forEach((pkg) => {
      const q = pkg.quantity || 1;
      totalQty += q;
      totalActual += (pkg.actualWeightKg || 0) * q;
      const vol = ((pkg.lengthCm || 0) * (pkg.widthCm || 0) * (pkg.heightCm || 0)) / 5000;
      totalVolumetric += vol * q;
    });

    const roundedActual = Math.round(totalActual * 10) / 10;
    const roundedVolumetric = Math.round(totalVolumetric * 10) / 10;
    const totalChargeable = Math.max(roundedActual, roundedVolumetric);

    return {
      totalPackages: packages.length,
      totalUnitsCount: totalQty,
      totalActualWeightKg: roundedActual,
      totalVolumetricWeightKg: roundedVolumetric,
      totalChargeableWeightKg: Math.max(0.5, totalChargeable),
    };
  }, [packages]);

  // Eligible Couriers list via Centralized Rate Assignment Service
  const eligibleCouriers = useMemo(() => {
    if (!currentWarehouse || !deliveryPincode || deliveryPincode.length !== 6) return [];
    
    const mode = shipmentCategory === 'b2b_freight' ? 'B2B' : 'B2C';
    const list = CustomerRateAssignmentService.getEligibleCouriersForCustomer(
      tenantId,
      mode as 'B2B' | 'B2C',
      currentWarehouse.pincode as string,
      deliveryPincode,
      packageMath.totalChargeableWeightKg * 1000,
      paymentMode === 'cod' ? 'COD' : 'PREPAID',
      paymentMode === 'cod' ? Number(codAmount || 0) * 100 : 0
    );

    // Decorate couriers with rating, zone, and badges (Cheapest, Fastest, Recommended)
    if (list.length === 0) return [];

    const sortedByPrice = [...list].sort((a, b) => Number(a.customerPriceINR) - Number(b.customerPriceINR));
    const cheapestId = sortedByPrice[0]?.courierId;
    const fastestId = list.find((c) => (c.estimatedDeliveryDays as string)?.includes('1') || (c.estimatedDeliveryDays as string)?.includes('2'))?.courierId || list[0]?.courierId;

    return list.map((c) => ({
      ...c,
      rating: 4.8,
      zoneRoute: `${currentWarehouse.pincode.slice(0, 2)} → ${deliveryPincode.slice(0, 2)}`,
      isCheapest: c.courierId === cheapestId,
      isFastest: c.courierId === fastestId,
      isRecommended: c.courierId === cheapestId || c.courierId === fastestId,
    }));
  }, [tenantId, currentWarehouse, deliveryPincode, packageMath.totalChargeableWeightKg, paymentMode, codAmount, shipmentCategory]);

  // Calculate Price Breakdown Function
  const calculateDetailedBreakdown = (courier: EligibleCourierResult | null) => {
    if (!courier) return null;
    const baseFreight: number = Number(courier.customerPriceINR || 0);
    const fuelSurcharge = Math.round(baseFreight * 0.1 * 100) / 100;
    const docketCharge = 15.0;
    const fmCharge = 15.0;
    const codFee = paymentMode === 'cod' ? Math.max(40, Math.round(Number(codAmount || 0) * 0.015 * 100) / 100) : 0;
    const rovFee = insuranceEnabled ? Math.max(50, Math.round(Number(insuredValue || 0) * 0.005 * 100) / 100) : 0;
    const odaCharge = 0.0;
    const subtotal = baseFreight + fuelSurcharge + docketCharge + fmCharge + codFee + rovFee + odaCharge;
    const gst = Math.round(subtotal * 0.18 * 100) / 100;
    const totalPayable = Math.round((subtotal + gst) * 100) / 100;

    return {
      baseFreight,
      fuelSurcharge,
      docketCharge,
      fmCharge,
      codFee,
      rovFee,
      odaCharge,
      subtotal,
      gst,
      totalPayable,
    };
  };

  const quoteBreakdown = useMemo(() => {
    return calculateDetailedBreakdown(selectedCourier);
  }, [selectedCourier, paymentMode, codAmount, insuranceEnabled, insuredValue]);

  // Auto-Save Draft to LocalStorage
  const handleSaveDraft = () => {
    const draftData = {
      selectedWarehouseId,
      receiverName,
      receiverPhone,
      altPhone,
      receiverCompany,
      receiverEmail,
      deliveryAddress1,
      deliveryAddress2,
      landmark,
      deliveryPincode,
      deliveryCity,
      deliveryState,
      shipmentCategory,
      deadWeight,
      pkgLength,
      pkgWidth,
      pkgHeight,
      numPackages,
      invoiceValue,
      contentsDescription,
      paymentMode,
      codAmount,
      insuranceEnabled,
      insuredValue,
      savedAt: new Date().toLocaleTimeString(),
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
    setDraftSavedTime(new Date().toLocaleTimeString());
    setTimeout(() => setDraftSavedTime(null), 3000);
  };

  // Load Saved Draft on mount if available
  useEffect(() => {
    const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.receiverName) setReceiverName(parsed.receiverName);
        if (parsed.receiverPhone) setReceiverPhone(parsed.receiverPhone);
        if (parsed.deliveryPincode) setDeliveryPincode(parsed.deliveryPincode);
        if (parsed.deliveryCity) setDeliveryCity(parsed.deliveryCity);
        if (parsed.deliveryState) setDeliveryState(parsed.deliveryState);
        if (parsed.deadWeight) setDeadWeight(parsed.deadWeight);
      } catch (e) {
        // Ignore parse error
      }
    }
  }, []);

  // Handle In-Flow New Warehouse Save
  const handleSaveInFlowWarehouse = () => {
    setFormError(null);
    if (!newWhName.trim() || !newWhContact.trim() || !newWhPhone.trim() || !newWhAddress.trim() || !newWhPincode.trim()) {
      setFormError('Please fill in all required warehouse fields (*).');
      return;
    }
    if (!/^\d{6}$/.test(newWhPincode.trim())) {
      setFormError('Please enter a valid 6-digit Indian Pincode.');
      return;
    }

    const created = CustomerWarehouseService.addWarehouse({
      tenantId,
      warehouseName: newWhName.trim(),
      contactPerson: newWhContact.trim(),
      phone: newWhPhone.trim(),
      email: newWhEmail.trim(),
      addressLine1: newWhAddress.trim(),
      pincode: newWhPincode.trim(),
      city: newWhCity.trim(),
      state: newWhState.trim(),
      isDefault: true,
    });

    const activeList = CustomerWarehouseService.getActiveWarehouses(tenantId);
    setWarehouses(activeList);
    setSelectedWarehouseId(created.warehouse.id);
    setIsAddWhModalOpen(false);

    // Reset Form
    setNewWhName('');
    setNewWhContact('');
    setNewWhPhone('');
    setNewWhAddress('');
  };

  // Step Validation Handlers
  const validateStep1 = (): boolean => {
    setFormError(null);
    if (!selectedWarehouseId || !currentWarehouse) {
      setFormError('Please select or add a pickup warehouse location before proceeding.');
      return false;
    }
    return true;
  };

  const validateStep2 = (): boolean => {
    setFormError(null);
    if (!receiverName.trim()) {
      setFormError('Please enter Customer / Receiver Name.');
      return false;
    }
    if (!receiverPhone.trim() || receiverPhone.trim().length < 10) {
      setFormError('Please enter a valid 10-digit mobile number.');
      return false;
    }
    if (!deliveryAddress1.trim()) {
      setFormError('Please enter Delivery Address Line 1.');
      return false;
    }
    if (!deliveryPincode.trim() || !/^\d{6}$/.test(deliveryPincode.trim())) {
      setFormError('Please enter a valid 6-digit Indian delivery pincode.');
      return false;
    }
    return true;
  };

  const validateStep3 = (): boolean => {
    setFormError(null);
    const dw = Number(deadWeight);
    if (isNaN(dw) || dw <= 0) {
      setFormError('Please enter a valid Dead Weight greater than 0 KG.');
      return false;
    }
    const val = Number(invoiceValue);
    if (isNaN(val) || val <= 0) {
      setFormError('Please enter a valid Invoice Value greater than 0.');
      return false;
    }
    if (paymentMode === 'cod') {
      const codVal = Number(codAmount);
      if (isNaN(codVal) || codVal <= 0) {
        setFormError('Please enter a valid COD Amount greater than 0.');
        return false;
      }
      if (codVal > val) {
        setFormError('COD Amount cannot exceed the total Invoice Value.');
        return false;
      }
    }
    return true;
  };

  const validateStep4 = (): boolean => {
    setFormError(null);
    if (!selectedCourier) {
      setFormError('Please select a courier option from the comparison list to proceed.');
      return false;
    }
    return true;
  };

  const validateStep5 = (): boolean => {
    setFormError(null);
    if (!selectedCourier || !quoteBreakdown) return false;

    const goLiveCheck = OnboardingService.validateGoLiveRules('CUST-1001');
    if (!goLiveCheck.canGoLive) {
      setFormError(`Account Go-Live activation is pending. Unfulfilled requirements: ${goLiveCheck.missingRequirements.join(', ')}.`);
      return false;
    }

    if (walletBalanceINR < quoteBreakdown.totalPayable) {
      setFormError(`Insufficient Wallet Balance. Required ₹${quoteBreakdown.totalPayable.toFixed(2)}, Available ₹${walletBalanceINR.toFixed(2)}. Please recharge your wallet.`);
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    if (currentStep === 4 && !validateStep4()) return;
    if (currentStep === 5 && !validateStep5()) return;

    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Final Booking Execution
  const handleConfirmAndBook = async () => {
    if (!selectedCourier || !quoteBreakdown || !currentWarehouse) return;

    setIsSubmitting(true);

    try {
      const modeStr = shipmentCategory === 'b2b_freight' ? 'b2b' : 'b2c';
      const result = await CustomerBookingService.bookShipmentWithWalletDebit({
        tenantId,
        orderId: orderId.trim(),
        customerName: receiverName.trim(),
        customerPhone: receiverPhone.trim(),
        customerEmail: receiverEmail.trim(),
        shipmentType: modeStr as 'b2b' | 'b2c',
        pickupContactName: currentWarehouse.contactPerson as string,
        pickupPhone: currentWarehouse.phone as string,
        pickupAddressLine1: currentWarehouse.addressLine1 as string,
        pickupCity: currentWarehouse.city as string,
        pickupPincode: currentWarehouse.pincode as string,
        deliveryContactName: receiverName.trim(),
        deliveryCompany: receiverCompany.trim(),
        deliveryPhone: receiverPhone.trim(),
        deliveryAddressLine1: deliveryAddress1.trim(),
        deliveryAddressLine2: deliveryAddress2.trim(),
        deliveryCity: deliveryCity.trim(),
        deliveryState: deliveryState.trim(),
        deliveryPincode: deliveryPincode.trim(),
        invoiceNumber: `INV-${Date.now().toString().slice(-4)}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        invoiceValueINR: Number(invoiceValue),
        paymentMode,
        codAmount: paymentMode === 'cod' ? Number(codAmount) : 0,
        insuranceEnabled,
        insuredValueINR: insuranceEnabled ? Number(insuredValue) : 0,
        packageType: shipmentCategory === 'document' ? 'Flyer' : 'Box',
        packages: packages.map((p) => ({
          id: p.id,
          packageNumber: p.packageNumber,
          packageType: p.packageType,
          actualWeightKg: p.actualWeightKg,
          lengthCm: p.lengthCm,
          widthCm: p.widthCm,
          heightCm: p.heightCm,
          volumetricWeightKg: Math.round((p.lengthCm * p.widthCm * p.heightCm) / 5000 * 10) / 10,
          chargeableWeightKg: Math.max(p.actualWeightKg, Math.round((p.lengthCm * p.widthCm * p.heightCm) / 5000 * 10) / 10),
          quantity: p.quantity,
          packageContents: p.packageContents,
        })),
        actualWeightKg: packageMath.totalActualWeightKg,
        chargeableWeightKg: packageMath.totalChargeableWeightKg,
        courierId: selectedCourier.courierId,
        courierName: selectedCourier.courierName,
        serviceName: selectedCourier.serviceName as string,
        baseFreightINR: quoteBreakdown.baseFreight,
        fuelSurchargeINR: quoteBreakdown.fuelSurcharge,
        codFeeINR: quoteBreakdown.codFee,
        insuranceFeeINR: quoteBreakdown.rovFee,
        gstINR: quoteBreakdown.gst,
        shippingChargeINR: quoteBreakdown.totalPayable,
      });

      setIsSubmitting(false);

      if (result.success && result.shipmentId && result.awbNumber) {
        setBookingResult({
          shipmentId: result.shipmentId,
          orderId: orderId.trim(),
          awbNumber: result.awbNumber,
          courierName: selectedCourier.courierName,
          serviceName: selectedCourier.serviceName as string,
          amountPaid: quoteBreakdown.totalPayable,
          packageCount: packages.length,
        });
        logActivity('Shipment Creation', result.awbNumber, `Created shipment ${result.awbNumber} for order ${orderId.trim()} via ${selectedCourier.courierName}`);
        setCurrentStep(6);
      } else {
        alert(result.message || 'Shipment booking failed.');
      }
    } catch (err: any) {
      setIsSubmitting(false);
      alert(err?.message || 'Error occurred during shipment creation.');
    }
  };

  const breadcrumbs = [
    { label: 'Merchant Portal', path: '/app' },
    { label: 'Shipment Creation Wizard', path: '/app/orders/create' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '1280px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* Page Header */}
      <PageHeader
        title="Shipment Creation Wizard"
        description="Guided 6-step shipment booking flow for B2C Express & B2B Freight."
        breadcrumbs={breadcrumbs}
        style={{ marginBottom: '0px' }}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {draftSavedTime && (
              <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>✓ Draft saved at {draftSavedTime}</span>
            )}
            <Button variant="outline" size="sm" leftIcon={<Save size={14} />} onClick={handleSaveDraft}>
              Save Draft
            </Button>
          </div>
        }
      />

      {formError && (
        <Alert variant="danger" title="Validation Warning">
          {formError}
        </Alert>
      )}

      {/* HORIZONTAL STEP WIZARD BAR */}
      <Card style={{ padding: '16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', overflowX: 'auto' }}>
          {WIZARD_STEPS.map((s) => {
            const isActive = currentStep === s.step;
            const isCompleted = currentStep > s.step;

            return (
              <div
                key={s.step}
                onClick={() => {
                  if (isCompleted) setCurrentStep(s.step);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  backgroundColor: isActive ? '#0284c7' : isCompleted ? '#f0f9ff' : 'transparent',
                  color: isActive ? '#ffffff' : isCompleted ? '#0284c7' : '#64748b',
                  fontWeight: isActive || isCompleted ? '700' : '500',
                  fontSize: '13px',
                  cursor: isCompleted ? 'pointer' : 'default',
                  whiteSpace: 'nowrap',
                  border: isCompleted ? '1px solid #bae6fd' : '1px solid transparent',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? '#ffffff' : isCompleted ? '#0284c7' : '#cbd5e1',
                    color: isActive ? '#0284c7' : '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    fontWeight: '800',
                  }}
                >
                  {isCompleted ? <Check size={14} /> : s.step}
                </div>
                <span style={{ fontSize: '13px' }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* WIZARD CONTENT AREA WITH DESKTOP STICKY SUMMARY SIDEBAR */}
      <div style={{ display: 'grid', gridTemplateColumns: currentStep < 6 ? '1fr 340px' : '1fr', gap: '20px' }}>
        
        {/* LEFT COLUMN: STEP FORM CONTENT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* STEP 1: PICKUP WAREHOUSE */}
          {currentStep === 1 && (
            <Card style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={20} style={{ color: '#0284c7' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Step 1: Select Pickup Warehouse</h3>
                </div>

                <Button variant="outline" size="sm" leftIcon={<Plus size={14} />} onClick={() => setIsAddWhModalOpen(true)}>
                  + Add New Warehouse
                </Button>
              </div>

              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
                Select the origin dispatch warehouse where courier pickup agents will collect the package.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {warehouses.map((wh) => {
                  const isSelected = selectedWarehouseId === wh.id;
                  return (
                    <div
                      key={wh.id}
                      onClick={() => setSelectedWarehouseId(wh.id)}
                      style={{
                        padding: '16px',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #0284c7' : '1px solid #cbd5e1',
                        backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        boxShadow: isSelected ? '0 4px 12px rgba(2,132,199,0.1)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ fontSize: '15px', color: '#0f172a' }}>{wh.warehouseName}</strong>
                        {wh.isDefault && <Badge variant="brand">Default Hub</Badge>}
                      </div>

                      <div style={{ fontSize: '12px', color: '#475569' }}>
                        {wh.addressLine1}, {wh.city}, {wh.state} - <strong>{wh.pincode}</strong>
                      </div>

                      <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                        Contact: <strong>{wh.contactPerson}</strong> ({wh.phone})
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* STEP 2: RECEIVER DETAILS */}
          {currentStep === 2 && (
            <Card style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', marginBottom: '16px' }}>
                <Home size={20} style={{ color: '#0284c7' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Step 2: Enter Receiver / Consignee Details</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Input label="Customer Name *" placeholder="e.g. Rahul Sharma" value={receiverName} onChange={(e) => setReceiverName(e.target.value)} />
                <Input label="Mobile Number *" placeholder="10-digit mobile number" value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} />
                <Input label="Alternate Mobile" placeholder="Optional 2nd phone number" value={altPhone} onChange={(e) => setAltPhone(e.target.value)} />
                <Input label="Company Name (Optional)" placeholder="e.g. Sharma Retail Pvt Ltd" value={receiverCompany} onChange={(e) => setReceiverCompany(e.target.value)} />
                <Input label="Email Address" placeholder="rahul@example.com" value={receiverEmail} onChange={(e) => setReceiverEmail(e.target.value)} />
                <Input label="Landmark / Locality" placeholder="e.g. Near Metro Station" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
              </div>

              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Input label="Address Line 1 *" placeholder="Flat/Door No, Building Name, Street" value={deliveryAddress1} onChange={(e) => setDeliveryAddress1(e.target.value)} />
                <Input label="Address Line 2 (Optional)" placeholder="Area name, Phase, Sector" value={deliveryAddress2} onChange={(e) => setDeliveryAddress2(e.target.value)} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
                  <Input
                    label="Pincode *"
                    placeholder="e.g. 560038"
                    value={deliveryPincode}
                    onChange={(e) => handlePincodeChange(e.target.value)}
                  />
                  <Input label="City *" value={deliveryCity} onChange={(e) => setDeliveryCity(e.target.value)} />
                  <Input label="State *" value={deliveryState} onChange={(e) => setDeliveryState(e.target.value)} />
                </div>
              </div>
            </Card>
          )}

          {/* STEP 3: PACKAGE DETAILS */}
          {currentStep === 3 && (
            <Card style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <Package size={20} style={{ color: '#0284c7' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Step 3: Package Details & Payment Mode</h3>
              </div>

              {/* Shipment Type Selector */}
              <div>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '8px' }}>Shipment Type *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div
                    onClick={() => setShipmentCategory('document')}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: shipmentCategory === 'document' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                      backgroundColor: shipmentCategory === 'document' ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>📄 Document Flyer</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Letters & envelope docs</span>
                  </div>

                  <div
                    onClick={() => setShipmentCategory('parcel')}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: shipmentCategory === 'parcel' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                      backgroundColor: shipmentCategory === 'parcel' ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>📦 Retail Parcel (B2C)</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Standard parcel box</span>
                  </div>

                  <div
                    onClick={() => setShipmentCategory('b2b_freight')}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: shipmentCategory === 'b2b_freight' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                      backgroundColor: shipmentCategory === 'b2b_freight' ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>🏢 Commercial B2B Freight</strong>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>Heavy cargo & pallets</span>
                  </div>
                </div>
              </div>

              {/* Dead Weight & Dimensions */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
                <Input label="Dead Weight (KG) *" type="number" value={deadWeight} onChange={(e) => setDeadWeight(e.target.value)} />
                <Input label="Length (CM) *" type="number" value={pkgLength} onChange={(e) => setPkgLength(e.target.value)} />
                <Input label="Width (CM) *" type="number" value={pkgWidth} onChange={(e) => setPkgWidth(e.target.value)} />
                <Input label="Height (CM) *" type="number" value={pkgHeight} onChange={(e) => setPkgHeight(e.target.value)} />
                <Input label="No. of Packages *" type="number" value={numPackages.toString()} onChange={(e) => setNumPackages(Math.max(1, Number(e.target.value)))} />
              </div>

              {/* Contents & Invoice Value */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Input label="Contents Description *" placeholder="e.g. Apparel, Electronics" value={contentsDescription} onChange={(e) => setContentsDescription(e.target.value)} />
                <Input label="Declared Invoice Value (₹) *" type="number" value={invoiceValue} onChange={(e) => setInvoiceValue(e.target.value)} />
              </div>

              {/* Payment Mode Selection */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '8px' }}>Payment Mode *</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div
                    onClick={() => setPaymentMode('prepaid')}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: paymentMode === 'prepaid' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                      backgroundColor: paymentMode === 'prepaid' ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <strong style={{ color: '#0f172a' }}>Prepaid</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Freight debited from wallet balance</div>
                  </div>

                  <div
                    onClick={() => setPaymentMode('cod')}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: paymentMode === 'cod' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                      backgroundColor: paymentMode === 'cod' ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                    }}
                  >
                    <strong style={{ color: '#0f172a' }}>Cash On Delivery (COD)</strong>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>Collectible from consignee upon delivery</div>
                  </div>
                </div>

                {paymentMode === 'cod' && (
                  <div style={{ marginTop: '12px', width: '260px' }}>
                    <Input label="COD Collectible Amount (₹) *" type="number" value={codAmount} onChange={(e) => setCodAmount(e.target.value)} />
                  </div>
                )}
              </div>

              {/* Insurance Toggle */}
              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '700', cursor: 'pointer', color: '#0f172a' }}>
                  <input type="checkbox" checked={insuranceEnabled} onChange={(e) => setInsuranceEnabled(e.target.checked)} />
                  <span>Add Transit Insurance Coverage (ROV Cover)</span>
                </label>

                {insuranceEnabled && (
                  <div style={{ marginTop: '10px', width: '260px' }}>
                    <Input label="Insured Declared Value (₹)" type="number" value={insuredValue} onChange={(e) => setInsuredValue(e.target.value)} />
                  </div>
                )}
              </div>

              {/* Live Volumetric Weight Box */}
              <div style={{ backgroundColor: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Dead Weight: <strong>{packageMath.totalActualWeightKg} KG</strong> | Volumetric: <strong>{packageMath.totalVolumetricWeightKg} KG</strong></div>
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#0284c7' }}>Chargeable Weight: {packageMath.totalChargeableWeightKg} KG</div>
                </div>
                <Badge variant="brand">{shipmentCategory.toUpperCase()}</Badge>
              </div>

            </Card>
          )}

          {/* STEP 4: RATE COMPARISON */}
          {currentStep === 4 && (
            <Card style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <Truck size={20} style={{ color: '#0284c7' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Step 4: Select Courier Partner</h3>
              </div>

              {eligibleCouriers.length === 0 ? (
                <Alert variant="warning" title="No Configured Couriers">
                  No couriers available for pickup pin {currentWarehouse?.pincode} to delivery pin {deliveryPincode}.
                </Alert>
              ) : (
                <>
                  {/* AI SMART RECOMMENDATION SUMMARY STRIP */}
                  {(() => {
                    const cheapestCourier = eligibleCouriers.find((c) => c.isCheapest);
                    const fastestCourier = eligibleCouriers.find((c) => c.isFastest);
                    const recommendedCourier = eligibleCouriers.find((c) => c.isRecommended) || eligibleCouriers[0];

                    return (
                      <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Zap size={20} style={{ color: '#2563eb' }} />
                          </div>
                          <div>
                            <strong style={{ fontSize: '14px', color: '#1e3a8a', display: 'block' }}>🤖 AI Smart Courier Recommendation Engine</strong>
                            <span style={{ fontSize: '12px', color: '#1e40af' }}>
                              Recommended Pick: <strong>{recommendedCourier?.courierName as string}</strong> ({recommendedCourier?.reliabilityScore as string || '98.4% On-Time'} • Best cost-to-speed balance).
                            </span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {cheapestCourier && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCourier(cheapestCourier)}
                              style={{ fontSize: '11px', borderColor: '#93c5fd', color: '#1d4ed8', fontWeight: '700', backgroundColor: '#ffffff' }}
                            >
                              🏆 Auto-Select Best Value (₹{Number(cheapestCourier.customerPriceINR).toFixed(2)})
                            </Button>
                          )}
                          {fastestCourier && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setSelectedCourier(fastestCourier)}
                              style={{ fontSize: '11px', backgroundColor: '#2563eb', borderColor: '#2563eb', fontWeight: '700' }}
                            >
                              ⚡ Auto-Select Fastest ({fastestCourier.estimatedDeliveryDays as string})
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                  {eligibleCouriers.map((courier) => {
                    const isSelected = selectedCourier?.courierId === courier.courierId;
                    const price = Number(courier.customerPriceINR || 0);

                    return (
                      <div
                        key={courier.courierId}
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          border: isSelected ? '2px solid #0284c7' : '1px solid #cbd5e1',
                          backgroundColor: isSelected ? '#f0f9ff' : '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          gap: '12px',
                          boxShadow: isSelected ? '0 4px 12px rgba(2,132,199,0.12)' : 'none',
                        }}
                      >
                        <div>
                          {/* Courier Header & Badges */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <strong style={{ fontSize: '16px', color: '#0f172a' }}>{courier.courierName as string}</strong>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Star size={12} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                              <span style={{ fontSize: '11px', fontWeight: '700' }}>{courier.rating}</span>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                            {courier.isCheapest && <Badge variant="success"><Tag size={10} style={{ marginRight: '2px' }} /> Cheapest</Badge>}
                            {courier.isFastest && <Badge variant="brand"><Zap size={10} style={{ marginRight: '2px' }} /> Fastest</Badge>}
                            {courier.isRecommended && <Badge variant="info"><ThumbsUp size={10} style={{ marginRight: '2px' }} /> Recommended</Badge>}
                          </div>

                          <div style={{ fontSize: '12px', color: '#475569' }}>
                            Service: <strong>{courier.serviceName as string}</strong> | Route: <strong>{courier.zoneRoute}</strong>
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                            Expected Delivery: <strong>{courier.estimatedDeliveryDays as string}</strong>
                          </div>
                        </div>

                        {/* Price & Action Buttons */}
                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', display: 'block' }}>Base Rate</span>
                            <strong style={{ fontSize: '18px', color: '#0284c7' }}>₹ {price.toFixed(2)}</strong>
                          </div>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setBreakdownModalCourier(courier)}
                              style={{ fontSize: '11px', padding: '4px 8px' }}
                            >
                              View Breakdown
                            </Button>

                            <Button
                              variant={isSelected ? 'primary' : 'outline'}
                              size="sm"
                              onClick={() => setSelectedCourier(courier)}
                              style={{ fontSize: '11px', padding: '4px 10px', backgroundColor: isSelected ? '#0284c7' : 'transparent' }}
                            >
                              {isSelected ? '✓ Selected' : 'Select'}
                            </Button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              </>
              )}
            </Card>
          )}

          {/* STEP 5: REVIEW & CONFIRM */}
          {currentStep === 5 && (
            <Card style={{ padding: '24px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
                <CheckCircle2 size={20} style={{ color: '#0284c7' }} />
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: 0 }}>Step 5: Review & Confirm Booking</h3>
              </div>

              {/* Summary Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {/* Pickup Summary */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: '#0284c7', textTransform: 'uppercase', fontSize: '11px' }}>PICKUP DETAILS</strong>
                    <button onClick={() => setCurrentStep(1)} style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}>Edit</button>
                  </div>
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>{currentWarehouse?.warehouseName}</div>
                  <div style={{ color: '#475569' }}>{currentWarehouse?.addressLine1}, {currentWarehouse?.city} - {currentWarehouse?.pincode}</div>
                  <div style={{ color: '#64748b' }}>Contact: {currentWarehouse?.contactPerson} ({currentWarehouse?.phone})</div>
                </div>

                {/* Receiver Summary */}
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <strong style={{ color: '#0284c7', textTransform: 'uppercase', fontSize: '11px' }}>RECEIVER DETAILS</strong>
                    <button onClick={() => setCurrentStep(2)} style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}>Edit</button>
                  </div>
                  <div style={{ fontWeight: '700', color: '#0f172a' }}>{receiverName} ({receiverPhone})</div>
                  <div style={{ color: '#475569' }}>{deliveryAddress1}, {deliveryCity}, {deliveryState} - {deliveryPincode}</div>
                  <div style={{ color: '#64748b' }}>{receiverEmail}</div>
                </div>
              </div>

              {/* Package & Courier Review */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong style={{ color: '#0284c7', textTransform: 'uppercase', fontSize: '11px' }}>PACKAGE & COURIER SPECS</strong>
                  <button onClick={() => setCurrentStep(3)} style={{ background: 'none', border: 'none', color: '#0284c7', fontSize: '11px', cursor: 'pointer', fontWeight: '700' }}>Edit</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '8px', color: '#334155' }}>
                  <div>Selected Courier: <strong>{selectedCourier?.courierName} ({selectedCourier?.serviceName})</strong></div>
                  <div>Dead Weight: <strong>{deadWeight} KG</strong></div>
                  <div>Chargeable Weight: <strong>{packageMath.totalChargeableWeightKg} KG</strong></div>
                  <div>Payment Mode: <strong>{paymentMode.toUpperCase()} {paymentMode === 'cod' ? `(₹ ${codAmount})` : ''}</strong></div>
                  <div>Transit Insurance: <strong>{insuranceEnabled ? `Enabled (₹ ${insuredValue})` : 'Disabled'}</strong></div>
                  <div>Invoice Value: <strong>₹ {invoiceValue}</strong></div>
                </div>
              </div>

            </Card>
          )}

          {/* STEP 6: LABEL & SUCCESS */}
          {currentStep === 6 && (
            <Card style={{ padding: '32px', backgroundColor: '#ffffff', border: '2px solid #16a34a', borderRadius: '12px', textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <CheckCircle2 size={36} style={{ color: '#16a34a' }} />
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                Shipment Booked Successfully!
              </h2>
              <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                AWB generated and shipment registered on courier network.
              </p>

              {bookingResult && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', margin: '24px 0', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>ORDER ID</span>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>{bookingResult.orderId}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>AWB NUMBER</span>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#0284c7', fontFamily: 'monospace' }}>{bookingResult.awbNumber}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>COURIER PARTNER</span>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>{bookingResult.courierName}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>FREIGHT CHARGE</span>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#16a34a' }}>₹ {bookingResult.amountPaid.toFixed(2)}</div>
                  </div>
                </div>
              )}

              {/* Thermal Label Selection Controls */}
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '24px', backgroundColor: '#ffffff', textAlign: 'left' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#334155', display: 'block', marginBottom: '8px' }}>
                  Select Label Print Format *
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px' }}>
                  <button
                    onClick={() => setLabelFormat('thermal_4x6')}
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: labelFormat === 'thermal_4x6' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                      backgroundColor: labelFormat === 'thermal_4x6' ? '#f0f9ff' : '#ffffff',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    🏷️ 4x6 Thermal Label
                  </button>

                  <button
                    onClick={() => setLabelFormat('a4_sheet')}
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: labelFormat === 'a4_sheet' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                      backgroundColor: labelFormat === 'a4_sheet' ? '#f0f9ff' : '#ffffff',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    📄 A4 Sheet Format
                  </button>

                  <button
                    onClick={() => setLabelFormat('single')}
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: labelFormat === 'single' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                      backgroundColor: labelFormat === 'single' ? '#f0f9ff' : '#ffffff',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    🔖 Single Sticker
                  </button>

                  <button
                    onClick={() => setLabelFormat('bulk')}
                    style={{
                      padding: '10px',
                      borderRadius: '6px',
                      border: labelFormat === 'bulk' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                      backgroundColor: labelFormat === 'bulk' ? '#f0f9ff' : '#ffffff',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer',
                    }}
                  >
                    📑 Bulk Label Sheet
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <Button
                  variant="primary"
                  leftIcon={<Printer size={16} />}
                  onClick={() => alert(`Printing ${labelFormat.toUpperCase()} label for AWB ${bookingResult?.awbNumber}...`)}
                  style={{ backgroundColor: '#0284c7', borderColor: '#0284c7' }}
                >
                  Print Label ({labelFormat.replace('_', ' ').toUpperCase()})
                </Button>

                <Button
                  variant="outline"
                  leftIcon={<Download size={16} />}
                  onClick={() => alert(`Downloading PDF Label...`)}
                >
                  Download Label PDF
                </Button>

                <Button
                  variant="outline"
                  leftIcon={<FileText size={16} />}
                  onClick={() => alert(`Downloading GST Shipping Invoice...`)}
                >
                  Download Invoice
                </Button>

                <Button
                  variant="secondary"
                  leftIcon={<RotateCcw size={16} />}
                  onClick={() => window.location.reload()}
                >
                  Create New Shipment
                </Button>
              </div>
            </Card>
          )}

          {/* STEP WIZARD NAVIGATION FOOTER BUTTONS */}
          {currentStep < 6 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <Button
                variant="outline"
                onClick={handlePrevStep}
                disabled={currentStep === 1 || isSubmitting}
                leftIcon={<ArrowLeft size={16} />}
              >
                Back
              </Button>

              {currentStep < 5 ? (
                <Button
                  variant="primary"
                  onClick={handleNextStep}
                  rightIcon={<ArrowRight size={16} />}
                  style={{ backgroundColor: '#0284c7', borderColor: '#0284c7' }}
                >
                  Continue to Step {currentStep + 1}
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleConfirmAndBook}
                  disabled={isSubmitting || (quoteBreakdown ? walletBalanceINR < quoteBreakdown.totalPayable : false)}
                  isLoading={isSubmitting}
                  leftIcon={<Wallet size={16} />}
                  style={{ backgroundColor: '#0284c7', borderColor: '#0284c7', fontWeight: '800' }}
                >
                  Confirm & Book Shipment ({quoteBreakdown ? formatCurrency(quoteBreakdown.totalPayable) : ''})
                </Button>
              )}
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: DESKTOP STICKY BOOKING SUMMARY SIDEBAR */}
        {currentStep < 6 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Card style={{ padding: '16px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', position: 'sticky', top: '80px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a', margin: '0 0 12px 0', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                Booking Summary
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Origin Hub:</span>
                  <strong style={{ color: '#0f172a' }}>{currentWarehouse?.city} ({currentWarehouse?.pincode})</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Destination:</span>
                  <strong style={{ color: '#0f172a' }}>{deliveryCity || '—'} ({deliveryPincode})</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Chargeable Weight:</span>
                  <strong>{packageMath.totalChargeableWeightKg} KG</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#64748b' }}>Payment Mode:</span>
                  <strong>{paymentMode.toUpperCase()}</strong>
                </div>

                {selectedCourier && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed #e2e8f0', paddingTop: '6px' }}>
                    <span style={{ color: '#64748b' }}>Courier Selected:</span>
                    <strong style={{ color: '#0284c7' }}>{selectedCourier.courierName}</strong>
                  </div>
                )}

                {quoteBreakdown && (
                  <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
                      <span>Base Freight:</span>
                      <span>₹ {quoteBreakdown.baseFreight.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                      <span>GST (18%):</span>
                      <span>₹ {quoteBreakdown.gst.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: '800', color: '#0284c7', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid #f1f5f9' }}>
                      <span>Total Payable:</span>
                      <span>₹ {quoteBreakdown.totalPayable.toFixed(2)}</span>
                    </div>
                  </div>
                )}

                {/* Wallet Balance Widget */}
                <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                    <span style={{ color: '#64748b' }}>Wallet Balance:</span>
                    <strong style={{ color: walletBalanceINR < (quoteBreakdown?.totalPayable || 0) ? '#dc2626' : '#16a34a' }}>
                      ₹ {walletBalanceINR.toFixed(2)}
                    </strong>
                  </div>
                </div>

              </div>
            </Card>
          </div>
        )}

      </div>

      {/* RATE BREAKDOWN MODAL */}
      {breakdownModalCourier && (
        <Modal
          isOpen={!!breakdownModalCourier}
          onClose={() => setBreakdownModalCourier(null)}
          title={`Rate Breakdown — ${breakdownModalCourier.courierName}`}
        >
          {(() => {
            const b = calculateDetailedBreakdown(breakdownModalCourier);
            if (!b) return null;
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Base Freight Charge:</span>
                  <strong>₹ {b.baseFreight.toFixed(2)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Fuel Surcharge (10%):</span>
                  <span>₹ {b.fuelSurcharge.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Docket & Documentation:</span>
                  <span>₹ {b.docketCharge.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>First Mile (FM) Collection:</span>
                  <span>₹ {b.fmCharge.toFixed(2)}</span>
                </div>

                {b.codFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>COD Collection Fee:</span>
                    <span>₹ {b.codFee.toFixed(2)}</span>
                  </div>
                )}

                {b.rovFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                    <span style={{ color: '#64748b' }}>Transit Insurance (ROV Cover):</span>
                    <span>₹ {b.rovFee.toFixed(2)}</span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>Subtotal Charges:</span>
                  <strong>₹ {b.subtotal.toFixed(2)}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                  <span style={{ color: '#64748b' }}>GST (18%):</span>
                  <span>₹ {b.gst.toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f0f9ff', padding: '10px', borderRadius: '6px', fontSize: '15px', fontWeight: '800', color: '#0284c7', marginTop: '4px' }}>
                  <span>Final Payable Amount:</span>
                  <span>₹ {b.totalPayable.toFixed(2)}</span>
                </div>

                <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSelectedCourier(breakdownModalCourier);
                      setBreakdownModalCourier(null);
                    }}
                    style={{ backgroundColor: '#0284c7', borderColor: '#0284c7' }}
                  >
                    Select This Courier (₹ {b.totalPayable.toFixed(2)})
                  </Button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* IN-FLOW ADD WAREHOUSE MODAL DIALOG */}
      {isAddWhModalOpen && (
        <Modal isOpen={isAddWhModalOpen} onClose={() => setIsAddWhModalOpen(false)} title="+ Add New Pickup Warehouse Location">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Input label="Warehouse Name *" placeholder="e.g. Okhla Logistics Hub" value={newWhName} onChange={(e) => setNewWhName(e.target.value)} />
            <Input label="Contact Person Name *" placeholder="e.g. Suresh Kumar" value={newWhContact} onChange={(e) => setNewWhContact(e.target.value)} />
            <Input label="Phone Number *" placeholder="+91 98765 43210" value={newWhPhone} onChange={(e) => setNewWhPhone(e.target.value)} />
            <Input label="Email Address (Optional)" placeholder="warehouse@domain.com" value={newWhEmail} onChange={(e) => setNewWhEmail(e.target.value)} />
            <Input label="Address Line 1 *" placeholder="Plot 42, Industrial Area" value={newWhAddress} onChange={(e) => setNewWhAddress(e.target.value)} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <Input label="City *" value={newWhCity} onChange={(e) => setNewWhCity(e.target.value)} />
              <Input label="State *" value={newWhState} onChange={(e) => setNewWhState(e.target.value)} />
              <Input label="Pincode *" value={newWhPincode} onChange={(e) => setNewWhPincode(e.target.value)} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
              <Button variant="ghost" onClick={() => setIsAddWhModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveInFlowWarehouse} style={{ backgroundColor: '#0284c7', borderColor: '#0284c7' }}>Save & Select Warehouse</Button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
