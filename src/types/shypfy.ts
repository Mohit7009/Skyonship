export type ShypfyPaymentType = 'COD' | 'Pickup' | 'Prepaid';

/**
 * Normalizes payment mode string to exact Shypfy supported enumeration: [COD, Pickup, Prepaid].
 * Shypfy API throws SWIFT_MALFORMED_INPUT_EXCEPTION if uppercase 'PREPAID' or unmapped values are passed.
 */
export function normalizeShypfyPaymentType(mode?: string): ShypfyPaymentType {
  if (!mode) return 'Prepaid';
  const m = mode.trim().toLowerCase();
  if (m === 'cod') return 'COD';
  if (m === 'pickup') return 'Pickup';
  return 'Prepaid';
}
