import { WalletService } from '../mocks/wallet.mock';

export type CodRemittanceStatus = 'PENDING' | 'PROCESSING' | 'REMITTED' | 'FAILED' | 'ON_HOLD';
export type EarlyCodPlanType = 'STANDARD_T7' | 'EARLY_T2' | 'INSTANT_T0';
export type PayoutDestinationType = 'BANK' | 'WALLET';

export interface CodRemittanceRecord extends Record<string, unknown> {
  id: string;
  remittanceId: string;
  tenantId: string;
  shipmentCount: number;
  grossCodAmountINR: number;
  deductionINR: number;
  earlyFeeINR: number;
  netRemittanceINR: number;
  status: CodRemittanceStatus;
  payoutType: EarlyCodPlanType;
  payoutDestination: PayoutDestinationType;
  remittanceDate: string;
  bankReferenceId?: string;
  createdAt: string;
}

export interface CodTransactionRecord extends Record<string, unknown> {
  id: string;
  tenantId: string;
  shipmentId: string;
  awbNumber: string;
  orderId: string;
  deliveredDate: string;
  codAmountINR: number;
  netAmountINR: number;
  remittanceId?: string;
  status: 'PENDING_DELIVERY' | 'ELIGIBLE_FOR_REMITTANCE' | 'REMITTED';
}

export interface MerchantEarlyCodConfig extends Record<string, unknown> {
  tenantId: string;
  activePlan: EarlyCodPlanType;
  bankAccountName: string;
  bankAccountNumber: string;
  ifscCode: string;
  updatedAt: string;
}

export const INITIAL_COD_REMITTANCES: CodRemittanceRecord[] = [
  {
    id: 'rem-101',
    remittanceId: 'REM-982103',
    tenantId: 'tenant-demo-01',
    shipmentCount: 2,
    grossCodAmountINR: 4200.0,
    deductionINR: 50.0,
    earlyFeeINR: 0.0,
    netRemittanceINR: 4150.0,
    status: 'REMITTED',
    payoutType: 'STANDARD_T7',
    payoutDestination: 'BANK',
    remittanceDate: '2026-08-18 11:30 AM',
    bankReferenceId: 'UTR-HDFC-991823019',
    createdAt: '2026-08-18 10:00 AM',
  },
];

export const INITIAL_COD_TRANSACTIONS: CodTransactionRecord[] = [
  {
    id: 'cod-tx-101',
    tenantId: 'tenant-demo-01',
    shipmentId: 'SHP-ORD-2026-8812',
    awbNumber: 'BD749102834',
    orderId: 'ORD-2026-8812',
    deliveredDate: 'In Transit',
    codAmountINR: 4200.0,
    netAmountINR: 4150.0,
    status: 'PENDING_DELIVERY',
  },
  {
    id: 'cod-tx-102',
    tenantId: 'tenant-demo-01',
    shipmentId: 'SHP-ORD-2026-7734',
    awbNumber: 'DTDC991823',
    orderId: 'ORD-2026-7734',
    deliveredDate: '2026-08-18 10:15 AM',
    codAmountINR: 4200.0,
    netAmountINR: 4150.0,
    remittanceId: 'REM-982103',
    status: 'REMITTED',
  },
  {
    id: 'cod-tx-103',
    tenantId: 'tenant-demo-01',
    shipmentId: 'SHP-ORD-2026-9011',
    awbNumber: 'DEL99482109',
    orderId: 'ORD-2026-9011',
    deliveredDate: '2026-08-23 04:30 PM',
    codAmountINR: 18500.0,
    netAmountINR: 18315.0,
    status: 'ELIGIBLE_FOR_REMITTANCE',
  },
  {
    id: 'cod-tx-104',
    tenantId: 'tenant-demo-01',
    shipmentId: 'SHP-ORD-2026-9012',
    awbNumber: 'BD33910884',
    orderId: 'ORD-2026-9012',
    deliveredDate: '2026-08-24 09:15 AM',
    codAmountINR: 14750.0,
    netAmountINR: 14602.5,
    status: 'ELIGIBLE_FOR_REMITTANCE',
  },
  {
    id: 'cod-tx-105',
    tenantId: 'tenant-demo-01',
    shipmentId: 'SHP-ORD-2026-9013',
    awbNumber: 'XPR8830192',
    orderId: 'ORD-2026-9013',
    deliveredDate: '2026-08-24 01:20 PM',
    codAmountINR: 15000.0,
    netAmountINR: 14850.0,
    status: 'ELIGIBLE_FOR_REMITTANCE',
  },
];

let REMITTANCE_STORE = [...INITIAL_COD_REMITTANCES];
let COD_TX_STORE = [...INITIAL_COD_TRANSACTIONS];

const MERCHANT_EARLY_COD_CONFIGS: Record<string, MerchantEarlyCodConfig> = {
  'tenant-demo-01': {
    tenantId: 'tenant-demo-01',
    activePlan: 'STANDARD_T7',
    bankAccountName: 'Acme Logistics Operations HDFC',
    bankAccountNumber: '502000491823019',
    ifscCode: 'HDFC0000128',
    updatedAt: '2026-08-01',
  },
};

export const CustomerCodService = {
  getRemittances: (tenantId = 'tenant-demo-01', statusFilter = 'all'): CodRemittanceRecord[] => {
    return CustomerCodService.queryRemittances({ tenantId, statusFilter });
  },

  queryRemittances: (params: {
    tenantId?: string;
    searchQuery?: string;
    statusFilter?: string;
  }): CodRemittanceRecord[] => {
    const { tenantId = 'tenant-demo-01', searchQuery = '', statusFilter = 'all' } = params;
    return REMITTANCE_STORE.filter((r) => {
      if (r.tenantId !== tenantId) return false;
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = r.remittanceId.toLowerCase().includes(q);
        const matchUtr = r.bankReferenceId ? r.bankReferenceId.toLowerCase().includes(q) : false;
        if (!matchId && !matchUtr) return false;
      }
      return true;
    });
  },

  getCodTransactions: (tenantId = 'tenant-demo-01'): CodTransactionRecord[] => {
    return CustomerCodService.queryCodTransactions({ tenantId });
  },

  queryCodTransactions: (params: {
    tenantId?: string;
    searchQuery?: string;
    statusFilter?: string;
  }): CodTransactionRecord[] => {
    const { tenantId = 'tenant-demo-01', searchQuery = '', statusFilter = 'all' } = params;
    return COD_TX_STORE.filter((t) => {
      if (t.tenantId !== tenantId) return false;
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = t.shipmentId.toLowerCase().includes(q);
        const matchAwb = t.awbNumber ? t.awbNumber.toLowerCase().includes(q) : false;
        const matchOrder = t.orderId.toLowerCase().includes(q);
        if (!matchId && !matchAwb && !matchOrder) return false;
      }
      return true;
    });
  },

  getRemittanceById: (remittanceId: string, tenantId = 'tenant-demo-01'): CodRemittanceRecord | null => {
    return REMITTANCE_STORE.find((r) => r.tenantId === tenantId && (r.remittanceId === remittanceId || r.id === remittanceId)) || null;
  },

  getEarlyCodConfig: (tenantId = 'tenant-demo-01'): MerchantEarlyCodConfig => {
    if (!MERCHANT_EARLY_COD_CONFIGS[tenantId]) {
      MERCHANT_EARLY_COD_CONFIGS[tenantId] = {
        tenantId,
        activePlan: 'STANDARD_T7',
        bankAccountName: 'Merchant Account',
        bankAccountNumber: '99182301982',
        ifscCode: 'ICIC0000102',
        updatedAt: new Date().toISOString().split('T')[0],
      };
    }
    return MERCHANT_EARLY_COD_CONFIGS[tenantId];
  },

  updateEarlyCodPlan: (tenantId: string, planType: EarlyCodPlanType): MerchantEarlyCodConfig => {
    const config = CustomerCodService.getEarlyCodConfig(tenantId);
    config.activePlan = planType;
    config.updatedAt = new Date().toISOString().split('T')[0];
    return config;
  },

  getCodSummaryStats: (tenantId = 'tenant-demo-01') => {
    const txs = CustomerCodService.getCodTransactions(tenantId);
    const totalCodShipments = txs.length;
    const deliveredCodCount = txs.filter((t) => t.status === 'ELIGIBLE_FOR_REMITTANCE' || t.status === 'REMITTED').length;
    const pendingRemittanceINR = txs.filter((t) => t.status === 'ELIGIBLE_FOR_REMITTANCE').reduce((sum, t) => sum + t.codAmountINR, 0);
    const remittedCodINR = txs.filter((t) => t.status === 'REMITTED').reduce((sum, t) => sum + t.codAmountINR, 0);
    const totalCodValueINR = txs.reduce((sum, t) => sum + t.codAmountINR, 0);

    return {
      totalCodShipments,
      deliveredCodCount,
      pendingRemittanceINR,
      remittedCodINR,
      totalCodValueINR,
    };
  },

  // Process Instant COD Remittance Claim (Requirement #7)
  claimInstantCodPayout: (
    tenantId = 'tenant-demo-01',
    payoutDestination: PayoutDestinationType = 'WALLET',
    feePercent = 1.0
  ): CodRemittanceRecord => {
    const eligibleTxs = COD_TX_STORE.filter(
      (t) => t.tenantId === tenantId && t.status === 'ELIGIBLE_FOR_REMITTANCE'
    );

    if (eligibleTxs.length === 0) {
      throw new Error('No delivered COD shipments currently eligible for instant remittance.');
    }

    const grossAmount = eligibleTxs.reduce((sum, t) => sum + t.codAmountINR, 0);
    const standardDeductions = Math.round(grossAmount * 0.01); // 1% standard handling
    const earlyFee = Math.round(grossAmount * (feePercent / 100));
    const netRemittance = grossAmount - standardDeductions - earlyFee;

    const remittanceId = `INST-${Date.now().toString().slice(-6)}`;
    const utr = payoutDestination === 'WALLET'
      ? `WALLET-INST-${Date.now().toString().slice(-8)}`
      : `UTR-IMPS-INST-${Date.now().toString().slice(-8)}`;

    const newRemittance: CodRemittanceRecord = {
      id: `rem-${Date.now()}`,
      remittanceId,
      tenantId,
      shipmentCount: eligibleTxs.length,
      grossCodAmountINR: grossAmount,
      deductionINR: standardDeductions,
      earlyFeeINR: earlyFee,
      netRemittanceINR: netRemittance,
      status: 'REMITTED',
      payoutType: feePercent >= 1.0 ? 'INSTANT_T0' : 'EARLY_T2',
      payoutDestination,
      remittanceDate: `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      bankReferenceId: utr,
      createdAt: new Date().toISOString(),
    };

    // Update transactions to REMITTED
    eligibleTxs.forEach((tx) => {
      tx.status = 'REMITTED';
      tx.remittanceId = remittanceId;
    });

    REMITTANCE_STORE.unshift(newRemittance);

    // If destination is WALLET, credit wallet instantly!
    if (payoutDestination === 'WALLET') {
      WalletService.recharge(netRemittance, `Instant COD Remittance (${remittanceId})`);
    }

    return newRemittance;
  },
};
