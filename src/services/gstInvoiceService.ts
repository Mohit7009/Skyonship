import type {
  CustomerGstProfile,
  TaxCategoryConfig,
  SupplierGstProfile,
  MonthlyGstInvoiceRecord,
  CreditDebitNoteRecord,
  AWBLedgerRecord,
  InvoiceType,
} from '../types/gstInvoice';

// Supplier Platform GST Profile (Delhi Hub)
export const SUPPLIER_PROFILE: SupplierGstProfile = {
  legalName: 'Courrier3 Logistics India Private Limited',
  tradeName: 'Courrier3 Post-Purchase Aggregator',
  gstin: '07AAACC8899A1Z4',
  pan: 'AAACC8899A',
  address: 'Plot 42, Okhla Industrial Estate Phase 3',
  city: 'New Delhi',
  state: 'Delhi',
  stateCode: '07',
  pincode: '110020',
  supportEmail: 'billing@courrier3.com',
  supportPhone: '+91 11 4988 2000',
};

// Initial Tax Category Configurations
const INITIAL_TAX_CATEGORIES: TaxCategoryConfig[] = [
  {
    id: 'tax-cat-101',
    categoryName: 'Goods Transport Logistics & Freight',
    sacCode: '996511',
    gstRatePercent: 18.0,
    description: 'Road transportation freight & courier aggregation services',
    effectiveFrom: '2026-01-01',
    status: 'ACTIVE',
  },
  {
    id: 'tax-cat-102',
    categoryName: 'Courier Handling & Fulfillment Services',
    sacCode: '996719',
    gstRatePercent: 18.0,
    description: 'Special handling, dockets, insurance & warehouse operations',
    effectiveFrom: '2026-01-01',
    status: 'ACTIVE',
  },
];

// Demo Customer Profiles
const CUSTOMER_PROFILES: Record<string, CustomerGstProfile> = {
  'tenant-demo-01': {
    tenantId: 'tenant-demo-01',
    legalBusinessName: 'Acme Electronics India Private Limited',
    tradeName: 'Acme Store',
    registrationType: 'REGISTERED',
    gstin: '27AAACA1234A1Z8',
    pan: 'AAACA1234A',
    billingAddress: 'Unit 402, Trade Tower, Lower Parel',
    city: 'Mumbai',
    state: 'Maharashtra',
    stateCode: '27',
    pincode: '400013',
    email: 'accounts@acmestore.com',
    phone: '+91 98765 43210',
    isVerified: true,
    verifiedAt: '2026-08-01 10:00 AM',
    updatedAt: '2026-08-20 14:00 PM',
  },
};

// DEMO AWB LEDGER DATABASE (Detailed AWB / LRN Itemized Charges)
export const DEMO_AWB_LEDGER_ITEMS: AWBLedgerRecord[] = [
  {
    id: 'ledger-001',
    awbNumber: 'DEL98401928',
    lrnNumber: 'LRN-98401',
    bookingDate: '2026-08-22',
    courierName: 'Delhivery Surface',
    mode: 'B2C',
    originCity: 'Delhi',
    destinationCity: 'Bengaluru',
    deadWeightKg: 2.5,
    chargeableWeightKg: 2.5,
    baseFreight: 180.0,
    fuelSurcharge: 21.6,
    docketCharges: 15.0,
    codCharges: 40.0,
    firstMileFee: 10.0,
    rovCoverFee: 0.0,
    odaFee: 0.0,
    taxableValue: 266.6,
    gstAmount: 47.99,
    totalAmount: 314.59,
    billingStatus: 'Paid',
    invoiceNumber: 'B2C-2026-000001',
  },
  {
    id: 'ledger-002',
    awbNumber: 'BD749102834',
    lrnNumber: 'LRN-98402',
    bookingDate: '2026-08-20',
    courierName: 'Blue Dart Air',
    mode: 'B2C',
    originCity: 'Delhi',
    destinationCity: 'Mumbai',
    deadWeightKg: 1.0,
    chargeableWeightKg: 1.2,
    baseFreight: 220.0,
    fuelSurcharge: 33.0,
    docketCharges: 25.0,
    codCharges: 0.0,
    firstMileFee: 15.0,
    rovCoverFee: 0.0,
    odaFee: 0.0,
    taxableValue: 293.0,
    gstAmount: 52.74,
    totalAmount: 345.74,
    billingStatus: 'Paid',
    invoiceNumber: 'B2C-2026-000001',
  },
  {
    id: 'ledger-003',
    awbNumber: 'GAT10284910',
    lrnNumber: 'LRN-98403',
    bookingDate: '2026-08-26',
    courierName: 'Gati Cargo',
    mode: 'B2B',
    originCity: 'Solan',
    destinationCity: 'Ahmedabad',
    deadWeightKg: 45.0,
    chargeableWeightKg: 45.0,
    baseFreight: 350.0,
    fuelSurcharge: 42.0,
    docketCharges: 30.0,
    codCharges: 0.0,
    firstMileFee: 25.0,
    rovCoverFee: 25.0,
    odaFee: 0.0,
    taxableValue: 472.0,
    gstAmount: 84.96,
    totalAmount: 556.96,
    billingStatus: 'Invoice Generated',
    invoiceNumber: 'B2B-2026-000001',
  },
  {
    id: 'ledger-004',
    awbNumber: 'TCI74829102',
    lrnNumber: 'LRN-98405',
    bookingDate: '2026-08-24',
    courierName: 'TCI Express',
    mode: 'B2B',
    originCity: 'Delhi',
    destinationCity: 'Kolkata',
    deadWeightKg: 30.0,
    chargeableWeightKg: 30.0,
    baseFreight: 350.0,
    fuelSurcharge: 35.0,
    docketCharges: 30.0,
    codCharges: 0.0,
    firstMileFee: 20.0,
    rovCoverFee: 0.0,
    odaFee: 0.0,
    taxableValue: 435.0,
    gstAmount: 78.3,
    totalAmount: 513.3,
    billingStatus: 'Invoice Generated',
    invoiceNumber: 'B2B-2026-000001',
  },
  {
    id: 'ledger-005',
    awbNumber: 'XPR98401920',
    lrnNumber: 'LRN-98406',
    bookingDate: '2026-08-27',
    courierName: 'Xpressbees Express',
    mode: 'B2C',
    originCity: 'Delhi',
    destinationCity: 'Jaipur',
    deadWeightKg: 1.5,
    chargeableWeightKg: 1.5,
    baseFreight: 140.0,
    fuelSurcharge: 16.8,
    docketCharges: 10.0,
    codCharges: 30.0,
    firstMileFee: 10.0,
    rovCoverFee: 0.0,
    odaFee: 0.0,
    taxableValue: 206.8,
    gstAmount: 37.22,
    totalAmount: 244.02,
    billingStatus: 'Bill Pending',
  },
  {
    id: 'ledger-006',
    awbNumber: 'DEL88401931',
    lrnNumber: 'LRN-98407',
    bookingDate: '2026-08-28',
    courierName: 'Delhivery Surface',
    mode: 'B2C',
    originCity: 'Gurugram',
    destinationCity: 'Chennai',
    deadWeightKg: 3.0,
    chargeableWeightKg: 3.5,
    baseFreight: 210.0,
    fuelSurcharge: 25.2,
    docketCharges: 15.0,
    codCharges: 0.0,
    firstMileFee: 15.0,
    rovCoverFee: 0.0,
    odaFee: 35.0,
    taxableValue: 300.2,
    gstAmount: 54.04,
    totalAmount: 354.24,
    billingStatus: 'Delivered',
  },
];

// DEMO INVOICES DATA STORE (B2B vs B2C Separated)
export const DEMO_INVOICES: MonthlyGstInvoiceRecord[] = [
  {
    id: 'inv-b2b-001',
    invoiceNumber: 'B2B-2026-000001',
    invoiceType: 'B2B',
    billingRunId: 'BR-2026-08-001',
    billingPeriodMonth: 'August 2026',
    billingPeriodStartDate: '2026-08-01',
    billingPeriodEndDate: '2026-08-31',
    issueDate: '2026-08-25',
    dueDate: '2026-09-24',
    tenantId: 'tenant-demo-01',

    supplierSnapshot: { ...SUPPLIER_PROFILE },
    customerSnapshot: {
      customerLegalName: 'Acme Electronics India Private Limited',
      customerTradeName: 'Acme Store',
      customerGstin: '27AAACA1234A1Z8',
      customerPan: 'AAACA1234A',
      customerAddress: 'Unit 402, Trade Tower, Lower Parel',
      customerCity: 'Mumbai',
      customerState: 'Maharashtra',
      customerStateCode: '27',
      customerPincode: '400013',
      customerEmail: 'accounts@acmestore.com',
      customerPhone: '+91 98765 43210',
    },

    isInterState: true,
    sacCode: '996511',
    taxableValueINR: 907.0,
    cgstAmountINR: 0,
    sgstAmountINR: 0,
    igstAmountINR: 163.26,
    totalGstAmountINR: 163.26,
    roundOffINR: 0,
    grandTotalINR: 1070.26,
    amountInWords: 'Rupees One Thousand Seventy And Twenty-Six Paise Only',

    status: 'ISSUED',
    shipmentCount: 2,
    lineItems: [
      {
        srNo: 1,
        description: 'Commercial B2B Heavy Freight & Cargo Logistics Aggregation (SAC 996511)',
        sacCode: '996511',
        quantity: 2,
        taxableValueINR: 907.0,
        gstRatePercent: 18.0,
        cgstRatePercent: 0,
        cgstAmountINR: 0,
        sgstRatePercent: 0,
        sgstAmountINR: 0,
        igstRatePercent: 18.0,
        igstAmountINR: 163.26,
        totalAmountINR: 1070.26,
      },
    ],
    annexureItems: [
      {
        shipmentId: 'shp-103',
        awbNumber: 'GAT10284910',
        lrnNumber: 'LRN-98403',
        bookingDate: '2026-08-26',
        courierName: 'Gati Cargo',
        mode: 'B2B',
        originCity: 'Solan',
        destinationCity: 'Ahmedabad',
        deadWeightKg: 45.0,
        chargeableWeightKg: 45.0,
        baseFreightINR: 350.0,
        fuelSurchargeINR: 42.0,
        docketChargesINR: 30.0,
        codChargesINR: 0.0,
        firstMileFeeINR: 25.0,
        rovCoverFeeINR: 25.0,
        odaFeeINR: 0.0,
        taxableValueINR: 472.0,
        gstAmountINR: 84.96,
        totalAmountINR: 556.96,
        ledgerTxnRef: 'tx-debit-98403',
      },
      {
        shipmentId: 'shp-104',
        awbNumber: 'TCI74829102',
        lrnNumber: 'LRN-98405',
        bookingDate: '2026-08-24',
        courierName: 'TCI Express',
        mode: 'B2B',
        originCity: 'Delhi',
        destinationCity: 'Kolkata',
        deadWeightKg: 30.0,
        chargeableWeightKg: 30.0,
        baseFreightINR: 350.0,
        fuelSurchargeINR: 35.0,
        docketChargesINR: 30.0,
        codChargesINR: 0.0,
        firstMileFeeINR: 20.0,
        rovCoverFeeINR: 0.0,
        odaFeeINR: 0.0,
        taxableValueINR: 435.0,
        gstAmountINR: 78.3,
        totalAmountINR: 513.3,
        ledgerTxnRef: 'tx-debit-98405',
      },
    ],
    creditNotes: [],
    createdAt: '2026-08-25 10:00 AM',
    issuedBy: 'Super Admin Finance',
  },
  {
    id: 'inv-b2c-001',
    invoiceNumber: 'B2C-2026-000001',
    invoiceType: 'B2C',
    billingRunId: 'BR-2026-08-001',
    billingPeriodMonth: 'August 2026',
    billingPeriodStartDate: '2026-08-01',
    billingPeriodEndDate: '2026-08-31',
    issueDate: '2026-08-25',
    dueDate: '2026-09-24',
    tenantId: 'tenant-demo-01',

    supplierSnapshot: { ...SUPPLIER_PROFILE },
    customerSnapshot: {
      customerLegalName: 'Acme Electronics India Private Limited',
      customerTradeName: 'Acme Store',
      customerGstin: '27AAACA1234A1Z8',
      customerPan: 'AAACA1234A',
      customerAddress: 'Unit 402, Trade Tower, Lower Parel',
      customerCity: 'Mumbai',
      customerState: 'Maharashtra',
      customerStateCode: '27',
      customerPincode: '400013',
      customerEmail: 'accounts@acmestore.com',
      customerPhone: '+91 98765 43210',
    },

    isInterState: true,
    sacCode: '996511',
    taxableValueINR: 559.6,
    cgstAmountINR: 0,
    sgstAmountINR: 0,
    igstAmountINR: 100.73,
    totalGstAmountINR: 100.73,
    roundOffINR: 0,
    grandTotalINR: 660.33,
    amountInWords: 'Rupees Six Hundred Sixty And Thirty-Three Paise Only',

    status: 'PAID',
    shipmentCount: 2,
    lineItems: [
      {
        srNo: 1,
        description: 'Retail B2C Parcel Express Courier Aggregation (SAC 996511)',
        sacCode: '996511',
        quantity: 2,
        taxableValueINR: 559.6,
        gstRatePercent: 18.0,
        cgstRatePercent: 0,
        cgstAmountINR: 0,
        sgstRatePercent: 0,
        sgstAmountINR: 0,
        igstRatePercent: 18.0,
        igstAmountINR: 100.73,
        totalAmountINR: 660.33,
      },
    ],
    annexureItems: [
      {
        shipmentId: 'shp-101',
        awbNumber: 'DEL98401928',
        lrnNumber: 'LRN-98401',
        bookingDate: '2026-08-22',
        courierName: 'Delhivery Surface',
        mode: 'B2C',
        originCity: 'Delhi',
        destinationCity: 'Bengaluru',
        deadWeightKg: 2.5,
        chargeableWeightKg: 2.5,
        baseFreightINR: 180.0,
        fuelSurchargeINR: 21.6,
        docketChargesINR: 15.0,
        codChargesINR: 40.0,
        firstMileFeeINR: 10.0,
        rovCoverFeeINR: 0.0,
        odaFeeINR: 0.0,
        taxableValueINR: 266.6,
        gstAmountINR: 47.99,
        totalAmountINR: 314.59,
        ledgerTxnRef: 'tx-debit-98401',
      },
      {
        shipmentId: 'shp-102',
        awbNumber: 'BD749102834',
        lrnNumber: 'LRN-98402',
        bookingDate: '2026-08-20',
        courierName: 'Blue Dart Air',
        mode: 'B2C',
        originCity: 'Delhi',
        destinationCity: 'Mumbai',
        deadWeightKg: 1.0,
        chargeableWeightKg: 1.2,
        baseFreightINR: 220.0,
        fuelSurchargeINR: 33.0,
        docketChargesINR: 25.0,
        codChargesINR: 0.0,
        firstMileFeeINR: 15.0,
        rovCoverFeeINR: 0.0,
        odaFeeINR: 0.0,
        taxableValueINR: 293.0,
        gstAmountINR: 52.74,
        totalAmountINR: 345.74,
        ledgerTxnRef: 'tx-debit-98402',
      },
    ],
    creditNotes: [],
    createdAt: '2026-08-25 10:00 AM',
    issuedBy: 'Super Admin Finance',
  },
];

export const DEMO_CREDIT_NOTES: CreditDebitNoteRecord[] = [
  {
    id: 'cn-101',
    noteNumber: 'CN-2026-000001',
    noteType: 'CREDIT_NOTE',
    adjustmentCategory: 'Weight Dispute Adjustment',
    originalInvoiceNumber: 'B2B-2026-000001',
    disputeRef: 'DISP-98401',
    tenantId: 'tenant-demo-01',
    merchantName: 'Acme Electronics India Private Limited',
    issueDate: '2026-08-27',
    reason: 'Courier reweigh error refund approved after factory dimension audit',
    adjustedTaxableINR: 150.0,
    adjustedGstINR: 27.0,
    adjustedTotalINR: 177.0,
    status: 'ISSUED',
    createdBy: 'Super Admin Finance',
  },
];

let INVOICES_STORE: MonthlyGstInvoiceRecord[] = [...DEMO_INVOICES];
let AWB_LEDGER_STORE: AWBLedgerRecord[] = [...DEMO_AWB_LEDGER_ITEMS];
let CREDIT_NOTES_STORE: CreditDebitNoteRecord[] = [...DEMO_CREDIT_NOTES];

export function numberToWordsINR(amount: number): string {
  const rounded = Math.round(amount);
  if (rounded === 0) return 'Rupees Zero Only';

  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty ', 'Thirty ', 'Forty ', 'Fifty ', 'Sixty ', 'Seventy ', 'Eighty ', 'Ninety '];

  function formatGroup(num: number): string {
    let str = '';
    if (num > 99) {
      str += a[Math.floor(num / 100)] + 'Hundred ';
      num %= 100;
    }
    if (num > 19) {
      str += b[Math.floor(num / 10)] + a[num % 10];
    } else {
      str += a[num];
    }
    return str;
  }

  let n = rounded;
  let result = '';

  const crore = Math.floor(n / 10000000);
  n %= 10000000;
  const lakh = Math.floor(n / 100000);
  n %= 100000;
  const thousand = Math.floor(n / 1000);
  n %= 1000;

  if (crore > 0) result += formatGroup(crore) + 'Crore ';
  if (lakh > 0) result += formatGroup(lakh) + 'Lakh ';
  if (thousand > 0) result += formatGroup(thousand) + 'Thousand ';
  if (n > 0) result += formatGroup(n);

  return `Rupees ${result.trim()} Only`;
}

export function validateGstin(gstin: string): boolean {
  const regex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return regex.test(gstin.trim());
}

export const GstInvoiceService = {
  getCustomerProfile: (tenantId = 'tenant-demo-01'): CustomerGstProfile => {
    if (CUSTOMER_PROFILES[tenantId]) {
      return { ...CUSTOMER_PROFILES[tenantId] };
    }
    return {
      tenantId,
      legalBusinessName: 'Acme Electronics India Private Limited',
      tradeName: 'Acme Store',
      registrationType: 'REGISTERED',
      gstin: '27AAACA1234A1Z8',
      pan: 'AAACA1234A',
      billingAddress: 'Unit 402, Trade Tower, Lower Parel',
      city: 'Mumbai',
      state: 'Maharashtra',
      stateCode: '27',
      pincode: '400013',
      email: 'accounts@acmestore.com',
      phone: '+91 98765 43210',
      isVerified: true,
      updatedAt: new Date().toLocaleString(),
    };
  },

  updateCustomerProfile: (
    tenantId: string,
    updates: Partial<CustomerGstProfile>
  ): { success: boolean; message: string; profile: CustomerGstProfile } => {
    if (updates.gstin && !validateGstin(updates.gstin)) {
      return {
        success: false,
        message: 'Invalid GSTIN format. Must be 15 characters (e.g. 27AAACA1234A1Z8).',
        profile: GstInvoiceService.getCustomerProfile(tenantId),
      };
    }

    const current = GstInvoiceService.getCustomerProfile(tenantId);
    const updated: CustomerGstProfile = {
      ...current,
      ...updates,
      updatedAt: new Date().toLocaleString(),
    };

    CUSTOMER_PROFILES[tenantId] = updated;
    return {
      success: true,
      message: 'GST Profile saved successfully. Future invoices will use this snapshot.',
      profile: updated,
    };
  },

  getInvoices: (tenantId = 'all', invoiceType?: InvoiceType): MonthlyGstInvoiceRecord[] => {
    return INVOICES_STORE.filter((inv) => {
      if (tenantId !== 'all' && inv.tenantId !== tenantId) return false;
      if (invoiceType && inv.invoiceType !== invoiceType) return false;
      return true;
    });
  },

  getInvoiceById: (id: string): MonthlyGstInvoiceRecord | null => {
    return INVOICES_STORE.find((inv) => inv.id === id || inv.invoiceNumber === id) || null;
  },

  getAwbLedger: (
    modeFilter = 'all',
    statusFilter = 'all',
    searchQuery = ''
  ): AWBLedgerRecord[] => {
    return AWB_LEDGER_STORE.filter((item) => {
      if (modeFilter !== 'all' && item.mode !== modeFilter) return false;
      if (statusFilter !== 'all' && item.billingStatus !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchAwb = item.awbNumber.toLowerCase().includes(q);
        const matchLrn = item.lrnNumber.toLowerCase().includes(q);
        const matchCourier = item.courierName.toLowerCase().includes(q);
        const matchInvoice = item.invoiceNumber?.toLowerCase().includes(q);
        if (!matchAwb && !matchLrn && !matchCourier && !matchInvoice) return false;
      }
      return true;
    });
  },

  getCreditNotes: (): CreditDebitNoteRecord[] => {
    return [...CREDIT_NOTES_STORE];
  },

  getTaxCategories: (): TaxCategoryConfig[] => {
    return [...INITIAL_TAX_CATEGORIES];
  },

  // Auto Invoice Generation (B2B vs B2C)
  generateMonthlyInvoices: (
    invoiceType: InvoiceType = 'B2B',
    billingMonth = 'August 2026',
    adminUser = 'Super Admin Finance'
  ): { success: boolean; message: string; invoice?: MonthlyGstInvoiceRecord } => {
    const customer = GstInvoiceService.getCustomerProfile('tenant-demo-01');
    const isInterState = customer.stateCode !== SUPPLIER_PROFILE.stateCode;

    // Filter unbilled delivered ledger shipments matching invoiceType
    const eligibleItems = AWB_LEDGER_STORE.filter(
      (l) => l.mode === invoiceType && ['Delivered', 'Bill Pending'].includes(l.billingStatus)
    );

    const count = eligibleItems.length > 0 ? eligibleItems.length : 2;
    const totalTaxable = eligibleItems.length > 0
      ? eligibleItems.reduce((s, i) => s + i.taxableValue, 0)
      : invoiceType === 'B2B' ? 907.0 : 559.6;

    const cgstAmount = isInterState ? 0 : totalTaxable * 0.09;
    const sgstAmount = isInterState ? 0 : totalTaxable * 0.09;
    const igstAmount = isInterState ? totalTaxable * 0.18 : 0;
    const totalGst = cgstAmount + sgstAmount + igstAmount;
    const grandTotal = totalTaxable + totalGst;

    const seq = (INVOICES_STORE.filter((i) => i.invoiceType === invoiceType).length + 2).toString().padStart(6, '0');
    const newInvoiceNo = `${invoiceType}-2026-${seq}`;

    const newInvoice: MonthlyGstInvoiceRecord = {
      id: `inv-${invoiceType.toLowerCase()}-${Date.now()}`,
      invoiceNumber: newInvoiceNo,
      invoiceType,
      billingRunId: `BR-2026-${Date.now().toString().slice(-4)}`,
      billingPeriodMonth: billingMonth,
      billingPeriodStartDate: '2026-08-01',
      billingPeriodEndDate: '2026-08-31',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      tenantId: customer.tenantId,

      supplierSnapshot: { ...SUPPLIER_PROFILE },
      customerSnapshot: {
        customerLegalName: customer.legalBusinessName,
        customerTradeName: customer.tradeName,
        customerGstin: customer.gstin,
        customerPan: customer.pan,
        customerAddress: customer.billingAddress,
        customerCity: customer.city,
        customerState: customer.state,
        customerStateCode: customer.stateCode,
        customerPincode: customer.pincode,
        customerEmail: customer.email,
        customerPhone: customer.phone,
      },

      isInterState,
      sacCode: '996511',
      taxableValueINR: totalTaxable,
      cgstAmountINR: cgstAmount,
      sgstAmountINR: sgstAmount,
      igstAmountINR: igstAmount,
      totalGstAmountINR: totalGst,
      roundOffINR: 0,
      grandTotalINR: grandTotal,
      amountInWords: numberToWordsINR(grandTotal),

      status: 'ISSUED',
      shipmentCount: count,
      lineItems: [
        {
          srNo: 1,
          description: `${invoiceType} Logistics Aggregation Services (SAC 996511)`,
          sacCode: '996511',
          quantity: count,
          taxableValueINR: totalTaxable,
          gstRatePercent: 18.0,
          cgstRatePercent: isInterState ? 0 : 9.0,
          cgstAmountINR: cgstAmount,
          sgstRatePercent: isInterState ? 0 : 9.0,
          sgstAmountINR: sgstAmount,
          igstRatePercent: isInterState ? 18.0 : 0,
          igstAmountINR: igstAmount,
          totalAmountINR: grandTotal,
        },
      ],
      annexureItems: eligibleItems.map((l) => ({
        shipmentId: `shp-${l.awbNumber}`,
        awbNumber: l.awbNumber,
        lrnNumber: l.lrnNumber,
        bookingDate: l.bookingDate,
        courierName: l.courierName,
        mode: l.mode,
        originCity: l.originCity,
        destinationCity: l.destinationCity,
        deadWeightKg: l.deadWeightKg,
        chargeableWeightKg: l.chargeableWeightKg,
        baseFreightINR: l.baseFreight,
        fuelSurchargeINR: l.fuelSurcharge,
        docketChargesINR: l.docketCharges,
        codChargesINR: l.codCharges,
        firstMileFeeINR: l.firstMileFee,
        rovCoverFeeINR: l.rovCoverFee,
        odaFeeINR: l.odaFee,
        taxableValueINR: l.taxableValue,
        gstAmountINR: l.gstAmount,
        totalAmountINR: l.totalAmount,
        ledgerTxnRef: `tx-debit-${l.awbNumber}`,
      })),
      creditNotes: [],
      createdAt: new Date().toLocaleString(),
      issuedBy: adminUser,
    };

    // Update Ledger Items Status to 'Invoice Generated'
    eligibleItems.forEach((item) => {
      item.billingStatus = 'Invoice Generated';
      item.invoiceNumber = newInvoiceNo;
    });

    INVOICES_STORE.unshift(newInvoice);

    return {
      success: true,
      message: `Generated ${invoiceType} Invoice ${newInvoiceNo} for ${count} delivered shipments!`,
      invoice: newInvoice,
    };
  },

  // Credit Note Creation
  createCreditNote: (input: {
    invoiceNumber: string;
    adjustmentCategory: 'Weight Dispute Adjustment' | 'Manual Discount' | 'Refund' | 'Courier Adjustment';
    adjustedTaxableINR: number;
    reason: string;
    adminUser?: string;
  }): { success: boolean; message: string; creditNote?: CreditDebitNoteRecord } => {
    const inv = GstInvoiceService.getInvoiceById(input.invoiceNumber);
    if (!inv) return { success: false, message: `Invoice ${input.invoiceNumber} not found.` };

    const gstRate = 0.18;
    const adjustedGstINR = Math.round(input.adjustedTaxableINR * gstRate * 100) / 100;
    const adjustedTotalINR = input.adjustedTaxableINR + adjustedGstINR;

    const cnSeq = (CREDIT_NOTES_STORE.length + 1).toString().padStart(6, '0');
    const cnNumber = `CN-2026-${cnSeq}`;

    const creditNote: CreditDebitNoteRecord = {
      id: `cn-${Date.now()}`,
      noteNumber: cnNumber,
      noteType: 'CREDIT_NOTE',
      adjustmentCategory: input.adjustmentCategory,
      originalInvoiceNumber: inv.invoiceNumber,
      tenantId: inv.tenantId,
      merchantName: inv.customerSnapshot.customerLegalName,
      issueDate: new Date().toISOString().split('T')[0],
      reason: input.reason,
      adjustedTaxableINR: input.adjustedTaxableINR,
      adjustedGstINR,
      adjustedTotalINR,
      status: 'ISSUED',
      createdBy: input.adminUser || 'Super Admin Finance',
    };

    CREDIT_NOTES_STORE.unshift(creditNote);
    if (!inv.creditNotes) inv.creditNotes = [];
    inv.creditNotes.push(creditNote);
    inv.status = 'ADJUSTED';

    return {
      success: true,
      message: `Issued Credit Note ${cnNumber} for ₹${adjustedTotalINR.toFixed(2)} against Invoice ${inv.invoiceNumber}.`,
      creditNote,
    };
  },

  // Export CSV Format
  exportGstrCsvData: (invoices: MonthlyGstInvoiceRecord[]): string => {
    const headers = [
      'Invoice Number',
      'Invoice Type',
      'Issue Date',
      'Customer GSTIN',
      'Customer Legal Name',
      'State Code',
      'Taxable Value (INR)',
      'CGST (INR)',
      'SGST (INR)',
      'IGST (INR)',
      'Grand Total (INR)',
      'Status',
    ];

    const rows = invoices.map((inv) => [
      inv.invoiceNumber,
      inv.invoiceType,
      inv.issueDate,
      inv.customerSnapshot.customerGstin,
      `"${inv.customerSnapshot.customerLegalName.replace(/"/g, '""')}"`,
      inv.customerSnapshot.customerStateCode,
      inv.taxableValueINR.toFixed(2),
      inv.cgstAmountINR.toFixed(2),
      inv.sgstAmountINR.toFixed(2),
      inv.igstAmountINR.toFixed(2),
      inv.grandTotalINR.toFixed(2),
      inv.status,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },

  // Export AWB Ledger CSV
  exportAwbLedgerCsv: (ledger: AWBLedgerRecord[]): string => {
    const headers = [
      'AWB Number',
      'LRN Number',
      'Booking Date',
      'Courier Partner',
      'Mode',
      'Origin',
      'Destination',
      'Dead Weight (KG)',
      'Chargeable Weight (KG)',
      'Base Freight (INR)',
      'Fuel Surcharge (INR)',
      'Docket Charges (INR)',
      'COD Fee (INR)',
      'First Mile (INR)',
      'ROV Fee (INR)',
      'ODA Fee (INR)',
      'GST Amount (INR)',
      'Total Amount (INR)',
      'Billing Status',
      'Invoice Ref',
    ];

    const rows = ledger.map((l) => [
      l.awbNumber,
      l.lrnNumber,
      l.bookingDate,
      `"${l.courierName}"`,
      l.mode,
      l.originCity,
      l.destinationCity,
      l.deadWeightKg,
      l.chargeableWeightKg,
      l.baseFreight.toFixed(2),
      l.fuelSurcharge.toFixed(2),
      l.docketCharges.toFixed(2),
      l.codCharges.toFixed(2),
      l.firstMileFee.toFixed(2),
      l.rovCoverFee.toFixed(2),
      l.odaFee.toFixed(2),
      l.gstAmount.toFixed(2),
      l.totalAmount.toFixed(2),
      l.billingStatus,
      l.invoiceNumber || 'Unbilled',
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },
};
