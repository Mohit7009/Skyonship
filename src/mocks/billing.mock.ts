import type {
  Invoice,
  BillingSettings,
  BillingFilterState,
} from '../types/billing';

// TAX SERVICE ENGINE
export const TaxService = {
  calculateTaxBreakdown: (taxableAmountMinor: number, isIntraState: boolean = true) => {
    if (isIntraState) {
      // 9% CGST + 9% SGST
      const cgstMinor = Math.round(taxableAmountMinor * 0.09);
      const sgstMinor = Math.round(taxableAmountMinor * 0.09);
      return {
        cgstMinor,
        sgstMinor,
        igstMinor: 0,
        totalTaxMinor: cgstMinor + sgstMinor,
      };
    } else {
      // 18% IGST
      const igstMinor = Math.round(taxableAmountMinor * 0.18);
      return {
        cgstMinor: 0,
        sgstMinor: 0,
        igstMinor,
        totalTaxMinor: igstMinor,
      };
    }
  },
};

// DEFAULT BILLING SETTINGS
export const DEFAULT_BILLING_SETTINGS: BillingSettings = {
  tenantId: 'tenant-demo-01',
  legalBusinessName: 'Apex Shipping Aggregation SaaS Pvt Ltd',
  displayBusinessName: 'Shipping SaaS Logistics',
  gstin: '27AAAAA0000A1Z5',
  pan: 'AAAAA0000A',
  businessAddress: 'Plot 42, Logistics Hub, MIDC Industrial Area',
  city: 'Mumbai',
  state: 'Maharashtra',
  postalCode: '400093',
  email: 'billing@shipping-saas.com',
  phone: '+91 1800 123 4567',
  invoicePrefix: 'INV-2026-',
  startingNumber: 1001,
  taxMode: 'TAX_EXCLUSIVE',
  footerText: 'Thank you for shipping with us! This is a computer-generated tax invoice.',
};

// INITIAL DEMO INVOICES
export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-101',
    tenantId: 'tenant-demo-01',
    invoiceNumber: 'INV-2026-000001',
    type: 'TAX_INVOICE',
    status: 'PAID',
    customerId: 'cust-101',
    customerName: 'Rahul Sharma',
    customerEmail: 'rahul.sharma@example.com',
    billingAddress: 'Flat 402, Green Valley Apartments, Bandra West, Mumbai, MH - 400050',
    shippingAddress: 'Flat 402, Green Valley Apartments, Bandra West, Mumbai, MH - 400050',
    currency: 'INR',
    subtotalMinor: 7203, // ₹72.03
    discountMinor: 0,
    taxableAmountMinor: 7203,
    taxMinor: 1297, // ₹12.97 (18% GST)
    totalMinor: 8500, // ₹85.00
    lineItems: [
      {
        id: 'li-101-1',
        invoiceId: 'inv-101',
        description: 'Base Freight Charge (Delhivery Surface • DEMO-AWB-98401928)',
        quantity: 1,
        unitPriceMinor: 5950,
        taxableAmountMinor: 5950,
        taxRate: 18,
        taxAmountMinor: 1071,
        totalMinor: 7021,
        referenceType: 'SHIPMENT',
        referenceId: 'SHP-9840192',
      },
      {
        id: 'li-101-2',
        invoiceId: 'inv-101',
        description: 'Fuel Surcharge (15%)',
        quantity: 1,
        unitPriceMinor: 1253,
        taxableAmountMinor: 1253,
        taxRate: 18,
        taxAmountMinor: 226,
        totalMinor: 1479,
        referenceType: 'SHIPMENT',
        referenceId: 'SHP-9840192',
      },
    ],
    walletTransactionId: 'tx-102',
    issuedAt: '2026-08-20 16:35 PM',
    paidAt: '2026-08-20 16:35 PM',
    createdAt: '2026-08-20 16:35 PM',
    updatedAt: '2026-08-20 16:35 PM',
  },
  {
    id: 'inv-102',
    tenantId: 'tenant-demo-01',
    invoiceNumber: 'INV-2026-000002',
    type: 'TAX_INVOICE',
    status: 'PAID',
    customerId: 'cust-102',
    customerName: 'Priya Verma',
    customerEmail: 'priya.verma@example.com',
    billingAddress: 'House #12, Civil Lines, Jaipur, RJ - 302006',
    shippingAddress: 'House #12, Civil Lines, Jaipur, RJ - 302006',
    currency: 'INR',
    subtotalMinor: 84746, // ₹847.46
    discountMinor: 0,
    taxableAmountMinor: 84746,
    taxMinor: 15254, // ₹152.54 (18% GST)
    totalMinor: 100000, // ₹1,000.00
    lineItems: [
      {
        id: 'li-102-1',
        invoiceId: 'inv-102',
        description: 'Bulk Shipping Freight & Express Handling (Order ORD-9840193)',
        quantity: 1,
        unitPriceMinor: 84746,
        taxableAmountMinor: 84746,
        taxRate: 18,
        taxAmountMinor: 15254,
        totalMinor: 100000,
        referenceType: 'SHIPMENT',
        referenceId: 'SHP-9840193',
      },
    ],
    walletTransactionId: 'tx-101',
    issuedAt: '2026-08-19 11:00 AM',
    paidAt: '2026-08-19 11:00 AM',
    createdAt: '2026-08-19 11:00 AM',
    updatedAt: '2026-08-19 11:00 AM',
  },
  {
    id: 'inv-103',
    tenantId: 'tenant-demo-01',
    invoiceNumber: 'CN-2026-000001',
    type: 'CREDIT_NOTE',
    status: 'ISSUED',
    customerId: 'cust-101',
    customerName: 'Rahul Sharma',
    customerEmail: 'rahul.sharma@example.com',
    billingAddress: 'Flat 402, Green Valley Apartments, Bandra West, Mumbai, MH - 400050',
    shippingAddress: 'Flat 402, Green Valley Apartments, Bandra West, Mumbai, MH - 400050',
    currency: 'INR',
    subtotalMinor: 7203,
    discountMinor: 0,
    taxableAmountMinor: 7203,
    taxMinor: 1297,
    totalMinor: 8500,
    lineItems: [
      {
        id: 'li-103-1',
        invoiceId: 'inv-103',
        description: 'Freight Correction Refund for INV-2026-000001',
        quantity: 1,
        unitPriceMinor: 7203,
        taxableAmountMinor: 7203,
        taxRate: 18,
        taxAmountMinor: 1297,
        totalMinor: 8500,
        referenceType: 'SERVICE',
        referenceId: 'INV-2026-000001',
      },
    ],
    originalInvoiceId: 'inv-101',
    issuedAt: '2026-08-21 09:15 AM',
    createdAt: '2026-08-21 09:15 AM',
    updatedAt: '2026-08-21 09:15 AM',
  },
];

// STORES
let SETTINGS_STORE: BillingSettings = { ...DEFAULT_BILLING_SETTINGS };
const INVOICE_STORE: Map<string, Invoice> = new Map();
let INVOICE_COUNTER = 3;

INITIAL_INVOICES.forEach((inv) => INVOICE_STORE.set(inv.id, inv));

export const BillingService = {
  getBillingSettings: (): BillingSettings => {
    return { ...SETTINGS_STORE };
  },

  updateBillingSettings: (input: Partial<BillingSettings>): BillingSettings => {
    SETTINGS_STORE = { ...SETTINGS_STORE, ...input };
    return { ...SETTINGS_STORE };
  },

  getInvoices: (filters?: BillingFilterState): Invoice[] => {
    const list = Array.from(INVOICE_STORE.values());
    if (!filters) return list;

    return list.filter((item) => {
      if (filters.status !== 'all' && item.status !== filters.status) return false;
      if (filters.type !== 'all' && item.type !== filters.type) return false;
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const match =
          item.invoiceNumber.toLowerCase().includes(q) ||
          item.customerName.toLowerCase().includes(q) ||
          item.id.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  },

  getInvoiceById: (id: string): Invoice | null => {
    return INVOICE_STORE.get(id) || Array.from(INVOICE_STORE.values()).find((i) => i.invoiceNumber === id) || null;
  },

  issueInvoice: (id: string): { success: boolean; message: string; invoice: Invoice | null } => {
    const inv = INVOICE_STORE.get(id);
    if (!inv) return { success: false, message: 'Invoice not found.', invoice: null };

    if (inv.status !== 'DRAFT') {
      return { success: false, message: `Cannot issue invoice in ${inv.status} state.`, invoice: inv };
    }

    inv.status = 'ISSUED';
    inv.issuedAt = new Date().toLocaleString();
    inv.updatedAt = new Date().toLocaleString();
    INVOICE_STORE.set(inv.id, inv);

    return { success: true, message: `Invoice ${inv.invoiceNumber} issued successfully.`, invoice: inv };
  },

  voidInvoice: (id: string): { success: boolean; message: string; invoice: Invoice | null } => {
    const inv = INVOICE_STORE.get(id);
    if (!inv) return { success: false, message: 'Invoice not found.', invoice: null };

    if (inv.status === 'PAID' || inv.status === 'VOID') {
      return { success: false, message: `Cannot void invoice in ${inv.status} state.`, invoice: inv };
    }

    inv.status = 'VOID';
    inv.updatedAt = new Date().toLocaleString();
    INVOICE_STORE.set(inv.id, inv);

    return { success: true, message: `Invoice ${inv.invoiceNumber} has been voided.`, invoice: inv };
  },

  createCreditNote: (
    originalInvoiceId: string,
    amountMinor: number,
    reason: string
  ): { success: boolean; message: string; creditNote: Invoice | null } => {
    const original = INVOICE_STORE.get(originalInvoiceId);
    if (!original) return { success: false, message: 'Original invoice not found.', creditNote: null };

    INVOICE_COUNTER += 1;
    const numStr = String(INVOICE_COUNTER).padStart(6, '0');
    const id = `inv-${Date.now()}`;
    const nowStr = new Date().toLocaleString();

    const taxableAmountMinor = Math.round(amountMinor / 1.18);
    const taxMinor = amountMinor - taxableAmountMinor;

    const creditNote: Invoice = {
      id,
      tenantId: original.tenantId,
      invoiceNumber: `CN-2026-${numStr}`,
      type: 'CREDIT_NOTE',
      status: 'ISSUED',
      customerId: original.customerId,
      customerName: original.customerName,
      customerEmail: original.customerEmail,
      billingAddress: original.billingAddress,
      shippingAddress: original.shippingAddress,
      currency: 'INR',
      subtotalMinor: taxableAmountMinor,
      discountMinor: 0,
      taxableAmountMinor,
      taxMinor,
      totalMinor: amountMinor,
      lineItems: [
        {
          id: `li-${id}-1`,
          invoiceId: id,
          description: `Credit Note / Refund for ${original.invoiceNumber} (${reason})`,
          quantity: 1,
          unitPriceMinor: taxableAmountMinor,
          taxableAmountMinor,
          taxRate: 18,
          taxAmountMinor: taxMinor,
          totalMinor: amountMinor,
          referenceType: 'SERVICE',
          referenceId: original.invoiceNumber,
        },
      ],
      originalInvoiceId: original.id,
      issuedAt: nowStr,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    INVOICE_STORE.set(id, creditNote);
    return { success: true, message: `Credit Note ${creditNote.invoiceNumber} generated.`, creditNote };
  },

  createDebitNote: (
    originalInvoiceId: string,
    amountMinor: number,
    reason: string
  ): { success: boolean; message: string; debitNote: Invoice | null } => {
    const original = INVOICE_STORE.get(originalInvoiceId);
    if (!original) return { success: false, message: 'Original invoice not found.', debitNote: null };

    INVOICE_COUNTER += 1;
    const numStr = String(INVOICE_COUNTER).padStart(6, '0');
    const id = `inv-${Date.now()}`;
    const nowStr = new Date().toLocaleString();

    const taxableAmountMinor = Math.round(amountMinor / 1.18);
    const taxMinor = amountMinor - taxableAmountMinor;

    const debitNote: Invoice = {
      id,
      tenantId: original.tenantId,
      invoiceNumber: `DN-2026-${numStr}`,
      type: 'DEBIT_NOTE',
      status: 'ISSUED',
      customerId: original.customerId,
      customerName: original.customerName,
      customerEmail: original.customerEmail,
      billingAddress: original.billingAddress,
      shippingAddress: original.shippingAddress,
      currency: 'INR',
      subtotalMinor: taxableAmountMinor,
      discountMinor: 0,
      taxableAmountMinor,
      taxMinor,
      totalMinor: amountMinor,
      lineItems: [
        {
          id: `li-${id}-1`,
          invoiceId: id,
          description: `Debit Note / Supplementary Charge for ${original.invoiceNumber} (${reason})`,
          quantity: 1,
          unitPriceMinor: taxableAmountMinor,
          taxableAmountMinor,
          taxRate: 18,
          taxAmountMinor: taxMinor,
          totalMinor: amountMinor,
          referenceType: 'SERVICE',
          referenceId: original.invoiceNumber,
        },
      ],
      originalInvoiceId: original.id,
      issuedAt: nowStr,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    INVOICE_STORE.set(id, debitNote);
    return { success: true, message: `Debit Note ${debitNote.invoiceNumber} generated.`, debitNote };
  },

  createDemoInvoice: (customerName = 'Rahul Sharma', totalINR = 150.0): Invoice => {
    INVOICE_COUNTER += 1;
    const numStr = String(INVOICE_COUNTER).padStart(6, '0');
    const id = `inv-${Date.now()}`;
    const nowStr = new Date().toLocaleString();

    const totalMinor = Math.round(totalINR * 100);
    const taxableAmountMinor = Math.round(totalMinor / 1.18);
    const taxMinor = totalMinor - taxableAmountMinor;

    const newInvoice: Invoice = {
      id,
      tenantId: 'tenant-demo-01',
      invoiceNumber: `INV-2026-${numStr}`,
      type: 'TAX_INVOICE',
      status: 'ISSUED',
      customerId: `cust-${Date.now()}`,
      customerName,
      customerEmail: `${customerName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      billingAddress: 'Plot 18, Business Park, Andheri East, Mumbai, MH - 400069',
      shippingAddress: 'Plot 18, Business Park, Andheri East, Mumbai, MH - 400069',
      currency: 'INR',
      subtotalMinor: taxableAmountMinor,
      discountMinor: 0,
      taxableAmountMinor,
      taxMinor,
      totalMinor,
      lineItems: [
        {
          id: `li-${id}-1`,
          invoiceId: id,
          description: 'Shipment Freight Charge (Delhivery Surface • DEMO-AWB-98401955)',
          quantity: 1,
          unitPriceMinor: taxableAmountMinor,
          taxableAmountMinor,
          taxRate: 18,
          taxAmountMinor: taxMinor,
          totalMinor,
          referenceType: 'SHIPMENT',
          referenceId: 'SHP-9840195',
        },
      ],
      issuedAt: nowStr,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    INVOICE_STORE.set(id, newInvoice);
    return newInvoice;
  },
};
