import type {
  Wallet,
  WalletTransaction,
  ShipmentCharge,
  TransactionFilterState,
  WalletStatus,
  ChargeBreakdown,
} from '../types/wallet';
import { parseINRToMinor } from '../utils/moneyFormat';

// INITIAL DEMO WALLET RECORD
export const INITIAL_WALLET: Wallet = {
  id: 'wal-demo-01',
  tenantId: 'tenant-demo-01',
  currency: 'INR',
  availableBalanceMinor: 91500, // ₹915.00
  reservedBalanceMinor: 0,
  totalSpentMinor: 8500, // ₹85.00
  totalRefundedMinor: 0,
  lowBalanceThresholdMinor: 50000, // ₹500.00 threshold
  status: 'ACTIVE',
  createdAt: '2026-08-01 10:00 AM',
  updatedAt: '2026-08-20 16:35 PM',
};

// INITIAL DEMO TRANSACTIONS
export const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'tx-101',
    tenantId: 'tenant-demo-01',
    walletId: 'wal-demo-01',
    type: 'RECHARGE',
    direction: 'CREDIT',
    amountMinor: 100000, // ₹1,000.00
    currency: 'INR',
    referenceType: 'RECHARGE',
    referenceId: 'DEMO-RECHARGE-849201',
    description: 'Wallet Balance Add (Demo Mode)',
    balanceBeforeMinor: 0,
    balanceAfterMinor: 100000,
    status: 'POSTED',
    idempotencyKey: 'recharge-849201',
    createdAt: '2026-08-01 10:00 AM',
    actorType: 'MERCHANT',
  },
  {
    id: 'tx-102',
    tenantId: 'tenant-demo-01',
    walletId: 'wal-demo-01',
    type: 'SHIPMENT_CHARGE',
    direction: 'DEBIT',
    amountMinor: 8500, // ₹85.00
    currency: 'INR',
    referenceType: 'SHIPMENT',
    referenceId: 'SHP-9840192',
    description: 'Shipment Freight Charge (Delhivery Surface • DEMO-AWB-98401928)',
    balanceBeforeMinor: 100000,
    balanceAfterMinor: 91500,
    status: 'POSTED',
    idempotencyKey: 'shipment-charge:SHP-9840192',
    createdAt: '2026-08-20 16:35 PM',
    actorType: 'SYSTEM',
  },
];

// STORES
let WALLET_STORE: Wallet = { ...INITIAL_WALLET };
const TRANSACTION_STORE: Map<string, WalletTransaction> = new Map();
const CHARGE_STORE: Map<string, ShipmentCharge> = new Map();

INITIAL_TRANSACTIONS.forEach((tx) => TRANSACTION_STORE.set(tx.id, tx));

export const WalletService = {
  getWallet: (_tenantId?: string): Wallet => {
    // Check low balance condition dynamically
    if (WALLET_STORE.availableBalanceMinor <= WALLET_STORE.lowBalanceThresholdMinor && WALLET_STORE.status === 'ACTIVE') {
      WALLET_STORE.status = 'LOW_BALANCE';
    } else if (WALLET_STORE.availableBalanceMinor > WALLET_STORE.lowBalanceThresholdMinor && WALLET_STORE.status === 'LOW_BALANCE') {
      WALLET_STORE.status = 'ACTIVE';
    }
    return { ...WALLET_STORE };
  },

  getWalletSummaryStats: (_tenantId?: string) => {
    const list = Array.from(TRANSACTION_STORE.values());
    let totalAddedMinor = 0;
    let totalUsedMinor = 0;

    list.forEach((tx) => {
      if (tx.direction === 'CREDIT' && tx.status === 'POSTED') {
        totalAddedMinor += tx.amountMinor;
      } else if (tx.direction === 'DEBIT' && tx.status === 'POSTED') {
        totalUsedMinor += tx.amountMinor;
      }
    });

    return {
      availableBalanceINR: WALLET_STORE.availableBalanceMinor / 100,
      totalAddedINR: totalAddedMinor / 100,
      totalUsedINR: totalUsedMinor / 100,
      lowBalanceThresholdINR: WALLET_STORE.lowBalanceThresholdMinor / 100,
      isLowBalance: WALLET_STORE.availableBalanceMinor <= WALLET_STORE.lowBalanceThresholdMinor,
    };
  },

  getTransactions: (filters?: TransactionFilterState): WalletTransaction[] => {
    const list = Array.from(TRANSACTION_STORE.values());
    if (!filters) return list;

    return list.filter((item) => {
      if (filters.status !== 'all' && item.status !== filters.status) return false;
      if (filters.direction !== 'all' && item.direction !== filters.direction) return false;
      if (filters.type !== 'all' && item.type !== filters.type) return false;
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const match = item.id.toLowerCase().includes(q) || item.referenceId.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  },

  getTransactionById: (id: string): WalletTransaction | null => {
    return TRANSACTION_STORE.get(id) || Array.from(TRANSACTION_STORE.values()).find((t) => t.referenceId === id) || null;
  },

  recharge: (amountINR: number, providerName = 'DemoPaymentProvider'): WalletTransaction => {
    const amountMinor = parseINRToMinor(amountINR);
    const balanceBefore = WALLET_STORE.availableBalanceMinor;
    const balanceAfter = balanceBefore + amountMinor;

    WALLET_STORE.availableBalanceMinor = balanceAfter;
    WALLET_STORE.updatedAt = new Date().toLocaleString();

    const txId = `tx-${Date.now()}`;
    const newTx: WalletTransaction = {
      id: txId,
      tenantId: 'tenant-demo-01',
      walletId: WALLET_STORE.id,
      type: 'RECHARGE',
      direction: 'CREDIT',
      amountMinor,
      currency: 'INR',
      referenceType: 'RECHARGE',
      referenceId: `DEMO-PAY-${Math.floor(100000 + Math.random() * 900000)}`,
      description: `Wallet Balance Added via ${providerName} (Demo Mode)`,
      balanceBeforeMinor: balanceBefore,
      balanceAfterMinor: balanceAfter,
      status: 'POSTED',
      idempotencyKey: `recharge-${txId}`,
      createdAt: new Date().toLocaleString(),
      actorType: 'MERCHANT',
    };

    TRANSACTION_STORE.set(txId, newTx);
    return newTx;
  },

  debit: (
    shipmentId: string,
    orderId: string,
    courierId: string,
    courierName: string,
    amountINR: number,
    breakdown?: Partial<ChargeBreakdown>
  ): { success: boolean; message: string; transaction: WalletTransaction | null } => {
    // 1. Wallet status check
    if (WALLET_STORE.status === 'SUSPENDED') {
      return { success: false, message: 'Wallet is suspended. Debit operations are blocked.', transaction: null };
    }

    // 2. Double charge protection check
    const idempotencyKey = `shipment-charge:${shipmentId}`;
    const existing = Array.from(TRANSACTION_STORE.values()).find((t) => t.idempotencyKey === idempotencyKey);
    if (existing) {
      return { success: false, message: 'Shipment has already been charged (Double charge protection).', transaction: existing };
    }

    // 3. Sufficient balance check
    const amountMinor = parseINRToMinor(amountINR);
    if (WALLET_STORE.availableBalanceMinor < amountMinor) {
      return { success: false, message: `Insufficient wallet balance. Required ₹${amountINR}, Available ₹${(WALLET_STORE.availableBalanceMinor / 100).toFixed(2)}.`, transaction: null };
    }

    // 4. Atomic balance deduction
    const balanceBefore = WALLET_STORE.availableBalanceMinor;
    const balanceAfter = balanceBefore - amountMinor;

    WALLET_STORE.availableBalanceMinor = balanceAfter;
    WALLET_STORE.totalSpentMinor += amountMinor;
    WALLET_STORE.updatedAt = new Date().toLocaleString();

    const txId = `tx-${Date.now()}`;
    const newTx: WalletTransaction = {
      id: txId,
      tenantId: 'tenant-demo-01',
      walletId: WALLET_STORE.id,
      type: 'SHIPMENT_CHARGE',
      direction: 'DEBIT',
      amountMinor,
      currency: 'INR',
      referenceType: 'SHIPMENT',
      referenceId: shipmentId,
      description: `Shipment Freight Charge (${courierName} • Order ${orderId})`,
      balanceBeforeMinor: balanceBefore,
      balanceAfterMinor: balanceAfter,
      status: 'POSTED',
      idempotencyKey,
      createdAt: new Date().toLocaleString(),
      actorType: 'SYSTEM',
    };

    TRANSACTION_STORE.set(txId, newTx);

    // Record shipment charge breakdown
    const nowStr = new Date().toLocaleString();
    const chargeRecord: ShipmentCharge = {
      id: `chg-${Date.now()}`,
      tenantId: 'tenant-demo-01',
      shipmentId,
      orderId,
      courierId,
      courierName,
      currency: 'INR',
      baseFreightMinor: breakdown?.baseFreightMinor || parseINRToMinor(amountINR * 0.7),
      fuelSurchargeMinor: breakdown?.fuelSurchargeMinor || parseINRToMinor(amountINR * 0.15),
      codFeeMinor: breakdown?.codFeeMinor || 0,
      handlingFeeMinor: breakdown?.handlingFeeMinor || 0,
      otherChargesMinor: breakdown?.otherChargesMinor || 0,
      discountMinor: breakdown?.discountMinor || 0,
      taxMinor: breakdown?.taxMinor || parseINRToMinor(amountINR * 0.15),
      totalMinor: amountMinor,
      status: 'POSTED',
      createdAt: nowStr,
    };
    CHARGE_STORE.set(shipmentId, chargeRecord);

    return { success: true, message: 'Shipment charge posted successfully.', transaction: newTx };
  },

  reserve: (amountINR: number, referenceId: string): { success: boolean; message: string } => {
    const amountMinor = parseINRToMinor(amountINR);
    if (WALLET_STORE.availableBalanceMinor < amountMinor) {
      return { success: false, message: 'Insufficient balance to reserve funds for booking.' };
    }

    WALLET_STORE.availableBalanceMinor -= amountMinor;
    WALLET_STORE.reservedBalanceMinor += amountMinor;
    WALLET_STORE.updatedAt = new Date().toLocaleString();

    const txId = `tx-${Date.now()}`;
    const newTx: WalletTransaction = {
      id: txId,
      tenantId: 'tenant-demo-01',
      walletId: WALLET_STORE.id,
      type: 'RESERVATION',
      direction: 'DEBIT',
      amountMinor,
      currency: 'INR',
      referenceType: 'RESERVATION',
      referenceId,
      description: `Hold reserved for booking (${referenceId})`,
      balanceBeforeMinor: WALLET_STORE.availableBalanceMinor + amountMinor,
      balanceAfterMinor: WALLET_STORE.availableBalanceMinor,
      status: 'POSTED',
      idempotencyKey: `reserve:${referenceId}`,
      createdAt: new Date().toLocaleString(),
      actorType: 'SYSTEM',
    };

    TRANSACTION_STORE.set(txId, newTx);
    return { success: true, message: 'Funds reserved successfully.' };
  },

  releaseReservation: (amountINR: number, referenceId: string): { success: boolean; message: string } => {
    const amountMinor = parseINRToMinor(amountINR);
    if (WALLET_STORE.reservedBalanceMinor < amountMinor) {
      return { success: false, message: 'Reserved balance is smaller than requested release amount.' };
    }

    WALLET_STORE.reservedBalanceMinor -= amountMinor;
    WALLET_STORE.availableBalanceMinor += amountMinor;
    WALLET_STORE.updatedAt = new Date().toLocaleString();

    const txId = `tx-${Date.now()}`;
    const newTx: WalletTransaction = {
      id: txId,
      tenantId: 'tenant-demo-01',
      walletId: WALLET_STORE.id,
      type: 'RESERVATION_RELEASE',
      direction: 'CREDIT',
      amountMinor,
      currency: 'INR',
      referenceType: 'RESERVATION',
      referenceId,
      description: `Reservation hold released (${referenceId})`,
      balanceBeforeMinor: WALLET_STORE.availableBalanceMinor - amountMinor,
      balanceAfterMinor: WALLET_STORE.availableBalanceMinor,
      status: 'POSTED',
      idempotencyKey: `release:${referenceId}`,
      createdAt: new Date().toLocaleString(),
      actorType: 'SYSTEM',
    };

    TRANSACTION_STORE.set(txId, newTx);
    return { success: true, message: 'Reservation released successfully.' };
  },

  withdraw: (amountINR: number, description: string): WalletTransaction => {
    const amountMinor = parseINRToMinor(amountINR);
    const balanceBefore = WALLET_STORE.availableBalanceMinor;
    const balanceAfter = Math.max(0, balanceBefore - amountMinor);

    WALLET_STORE.availableBalanceMinor = balanceAfter;
    WALLET_STORE.totalSpentMinor += amountMinor;
    WALLET_STORE.updatedAt = new Date().toLocaleString();

    const txId = `tx-${Date.now()}`;
    const newTx: WalletTransaction = {
      id: txId,
      tenantId: 'tenant-demo-01',
      walletId: WALLET_STORE.id,
      type: 'ADJUSTMENT',
      direction: 'DEBIT',
      amountMinor,
      currency: 'INR',
      referenceType: 'ADJUSTMENT',
      referenceId: `WD-ADJ-${Date.now()}`,
      description,
      balanceBeforeMinor: balanceBefore,
      balanceAfterMinor: balanceAfter,
      status: 'POSTED',
      idempotencyKey: `withdraw-${txId}`,
      createdAt: new Date().toLocaleString(),
      actorType: 'SYSTEM',
    };

    TRANSACTION_STORE.set(txId, newTx);
    return newTx;
  },

  refund: (
    targetTxId: string,
    refundAmountINR: number,
    reason: string
  ): { success: boolean; message: string; transaction: WalletTransaction | null } => {
    const originalTx = TRANSACTION_STORE.get(targetTxId);
    if (!originalTx) return { success: false, message: 'Original transaction not found.', transaction: null };

    if (originalTx.direction !== 'DEBIT') {
      return { success: false, message: 'Cannot refund a CREDIT transaction.', transaction: null };
    }

    const refundAmountMinor = parseINRToMinor(refundAmountINR);
    if (refundAmountMinor > originalTx.amountMinor) {
      return { success: false, message: 'Refund amount cannot exceed original debit transaction amount.', transaction: null };
    }

    const balanceBefore = WALLET_STORE.availableBalanceMinor;
    const balanceAfter = balanceBefore + refundAmountMinor;

    WALLET_STORE.availableBalanceMinor = balanceAfter;
    WALLET_STORE.totalRefundedMinor += refundAmountMinor;
    WALLET_STORE.updatedAt = new Date().toLocaleString();

    const txId = `tx-${Date.now()}`;
    const newTx: WalletTransaction = {
      id: txId,
      tenantId: 'tenant-demo-01',
      walletId: WALLET_STORE.id,
      type: 'REFUND',
      direction: 'CREDIT',
      amountMinor: refundAmountMinor,
      currency: 'INR',
      referenceType: originalTx.referenceType,
      referenceId: originalTx.referenceId,
      description: `Refund for ${originalTx.referenceId} (${reason})`,
      balanceBeforeMinor: balanceBefore,
      balanceAfterMinor: balanceAfter,
      status: 'POSTED',
      idempotencyKey: `refund:${targetTxId}:${Date.now()}`,
      createdAt: new Date().toLocaleString(),
      actorType: 'ADMIN',
    };

    TRANSACTION_STORE.set(txId, newTx);
    return { success: true, message: 'Refund posted successfully.', transaction: newTx };
  },

  adjust: (
    amountINR: number,
    direction: 'CREDIT' | 'DEBIT',
    reason: string
  ): { success: boolean; message: string; transaction: WalletTransaction | null } => {
    if (!reason || !reason.trim()) {
      return { success: false, message: 'Adjustment reason is required.', transaction: null };
    }

    const amountMinor = parseINRToMinor(amountINR);
    const balanceBefore = WALLET_STORE.availableBalanceMinor;

    if (direction === 'DEBIT' && balanceBefore < amountMinor) {
      return { success: false, message: 'Insufficient balance for debit adjustment.', transaction: null };
    }

    const balanceAfter = direction === 'CREDIT' ? balanceBefore + amountMinor : balanceBefore - amountMinor;

    WALLET_STORE.availableBalanceMinor = balanceAfter;
    WALLET_STORE.updatedAt = new Date().toLocaleString();

    const txId = `tx-${Date.now()}`;
    const newTx: WalletTransaction = {
      id: txId,
      tenantId: 'tenant-demo-01',
      walletId: WALLET_STORE.id,
      type: 'ADJUSTMENT',
      direction,
      amountMinor,
      currency: 'INR',
      referenceType: 'ADJUSTMENT',
      referenceId: `ADJ-${Math.floor(100000 + Math.random() * 900000)}`,
      description: `Balance Adjustment (${direction}) • ${reason}`,
      balanceBeforeMinor: balanceBefore,
      balanceAfterMinor: balanceAfter,
      status: 'POSTED',
      idempotencyKey: `adj-${txId}`,
      createdAt: new Date().toLocaleString(),
      actorType: 'ADMIN',
    };

    TRANSACTION_STORE.set(txId, newTx);
    return { success: true, message: 'Adjustment posted successfully.', transaction: newTx };
  },

  toggleWalletStatus: (status: WalletStatus): Wallet => {
    WALLET_STORE.status = status;
    WALLET_STORE.updatedAt = new Date().toLocaleString();
    return { ...WALLET_STORE };
  },

  getShipmentCharge: (shipmentId: string): ShipmentCharge | null => {
    return CHARGE_STORE.get(shipmentId) || null;
  },
};
