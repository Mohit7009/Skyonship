// Vercel serverless production endpoint for Shypfy Logistics
import fs from 'node:fs';
import path from 'node:path';

/**
 * Ensures server-side environment variables are loaded dynamically from .env on disk during local development.
 * On Vercel, platform environment variables are injected directly, so file reading is bypassed.
 */
let envLoaded = false;

function ensureEnvLoaded(): void {
  if (envLoaded) return;
  envLoaded = true;
  if (process.env.VERCEL) {
    return;
  }
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      for (const line of envContent.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const eqIdx = trimmed.indexOf('=');
          const key = trimmed.slice(0, eqIdx).trim();
          let val = trimmed.slice(eqIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (key && val && !(key in process.env)) {
            process.env[key] = val;
          }
        }
      }
    }
  } catch {
    // Ignore read errors
  }
}

ensureEnvLoaded();

export type ShypfyPaymentType = 'COD' | 'Pickup' | 'Prepaid';

/**
 * Normalizes input payment strings to strict Shypfy API paymentType: 'COD' | 'Pickup' | 'Prepaid'.
 */
export function normalizeShypfyPaymentType(val: any): ShypfyPaymentType {
  const s = String(val || '').trim().toLowerCase();
  if (s === 'cod') return 'COD';
  if (s === 'pickup') return 'Pickup';
  return 'Prepaid';
}

const SHYPFY_BASE_URL = 'https://app.shypfy.com';

export interface ShypfyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

let cachedToken: CachedToken | null = null;

export class ShypfyAuthError extends Error {
  public httpStatus: number;
  public details: string;

  constructor(message: string, httpStatus: number, details: string) {
    super(message);
    this.name = 'ShypfyAuthError';
    this.httpStatus = httpStatus;
    this.details = details;
  }
}

export function resetShypfyTokenCache(): void {
  cachedToken = null;
}

export function checkClientIdWhitespace() {
  ensureEnvLoaded();
  const rawClientId = process.env.SHYPFY_CLIENT_ID || '';
  return {
    hasLeadingWhitespace: /^\s/.test(rawClientId),
    hasTrailingWhitespace: /\s$/.test(rawClientId),
    rawLength: rawClientId.length,
    trimmedLength: rawClientId.trim().length,
  };
}

export async function getShypfyAccessToken(): Promise<string> {
  ensureEnvLoaded();

  const rawClientId = process.env.SHYPFY_CLIENT_ID || '';
  const rawUsername = process.env.SHYPFY_API_USERNAME || '';
  const rawPassword = process.env.SHYPFY_API_PASSWORD || '';

  const hasLeadingWhitespace = /^\s/.test(rawClientId);
  const hasTrailingWhitespace = /\s$/.test(rawClientId);
  const clientId = rawClientId.trim();
  const username = rawUsername.trim();
  const password = rawPassword.trim();

  console.log('[Shypfy Auth Service] Safe Diagnostics Check:');
  console.log(`  - client ID present: ${clientId ? 'yes' : 'no'}`);
  console.log(`  - username present: ${username ? 'yes' : 'no'}`);
  console.log(`  - password present: ${password ? 'yes' : 'no'}`);
  console.log(`  - client ID raw length: ${rawClientId.length}`);
  console.log(`  - client ID trimmed length: ${clientId.length}`);
  console.log(`  - client ID leading whitespace: ${hasLeadingWhitespace ? 'Yes' : 'No'}`);
  console.log(`  - client ID trailing whitespace: ${hasTrailingWhitespace ? 'Yes' : 'No'}`);

  if (!clientId || !username || !password) {
    const missing = [
      !clientId ? 'SHYPFY_CLIENT_ID' : null,
      !username ? 'SHYPFY_API_USERNAME' : null,
      !password ? 'SHYPFY_API_PASSWORD' : null,
    ].filter(Boolean).join(', ');
    console.error(`[Shypfy Auth Service] Configuration Error: Required server-side environment variable(s) missing or incomplete: ${missing}`);
    throw new Error(`Shypfy API environment variable(s) missing or incomplete: ${missing}`);
  }

  const now = Date.now();
  if (cachedToken && cachedToken.expiresAt > now + 60000) {
    console.log('[Shypfy Auth Service] Utilizing valid cached access token.');
    return cachedToken.accessToken;
  }

  const requestUrl = `${SHYPFY_BASE_URL}/integrations/v2/auth/token/${encodeURIComponent(clientId)}`;
  console.log(`[Shypfy Auth Service] Requesting POST token from URL: ${requestUrl}`);

  try {
    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    console.log(`[Shypfy Auth Service] HTTP status received from Shypfy: ${response.status}`);

    if (!response.ok) {
      let errorMsg = response.statusText || 'Authentication Failed';
      try {
        const errorJson = await response.json();
        if (errorJson && typeof errorJson === 'object') {
          errorMsg = errorJson.description || errorJson.message || errorJson.code || JSON.stringify(errorJson);
        }
      } catch {
        // Not JSON
      }

      console.error(`[Shypfy Auth Service] Shypfy error message: ${errorMsg}`);
      throw new ShypfyAuthError(`Shypfy API authentication failed with status ${response.status}: ${errorMsg}`, response.status, errorMsg);
    }

    const data = (await response.json()) as ShypfyTokenResponse;

    if (!data || !data.access_token) {
      console.error('[Shypfy Auth Service] Token Request Error: Invalid response payload missing access_token.');
      throw new Error('Shypfy API authentication response did not contain an access_token');
    }

    const expiresInSeconds = typeof data.expires_in === 'number' ? data.expires_in : 3600;
    cachedToken = {
      accessToken: data.access_token,
      expiresAt: now + expiresInSeconds * 1000,
    };

    console.log(`[Shypfy Auth Service] Authentication successful. Token cached for ${expiresInSeconds} seconds.`);
    return cachedToken.accessToken;
  } catch (err) {
    if (err instanceof ShypfyAuthError) {
      throw err;
    }
    const msg = err instanceof Error ? err.message : 'Network failure';
    console.error(`[Shypfy Auth Service] Connection/API error: ${msg}`);
    throw new Error(`Shypfy API connection failure: ${msg}`);
  }
}

export interface ShypfyServiceabilityInput {
  pickupPincode: string;
  dropPincode: string;
  length?: number;
  width?: number;
  height?: number;
  weight: number;
  paymentType: ShypfyPaymentType | string;
  codAmount?: number;
  invoiceAmount?: number;
}

export async function checkShypfyServiceability(input: ShypfyServiceabilityInput): Promise<any> {
  const token = await getShypfyAccessToken();
  const normalizedPaymentType = normalizeShypfyPaymentType(input.paymentType);
  const response = await fetch(`${SHYPFY_BASE_URL}/data/v3/serviceability`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      pickupPincode: input.pickupPincode,
      dropPincode: input.dropPincode,
      length: input.length || 10,
      width: input.width || 10,
      height: input.height || 10,
      weight: input.weight || 0.5,
      paymentType: normalizedPaymentType,
      codAmount: input.codAmount || 0,
      invoiceAmount: input.invoiceAmount || 500,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Shypfy Serviceability failed (${response.status}): ${errText}`);
  }

  return await response.json();
}

/**
 * Normalizes and translates any incoming shipment payload into 100% compliant Shypfy OpenAPI schema:
 * https://storage.googleapis.com/fs-site.goswift.in/public_api_yamls/SHYPFY/spec.yaml
 */
export function buildShypfyShipmentPayload(input: Record<string, any>): Record<string, any> {
  const rawPayment = input.payment_mode || input.payment_method || input.paymentType || 'Prepaid';
  const paymentMode = normalizeShypfyPaymentType(rawPayment);

  const totalAmount = Number(
    input.total_amount || input.sub_total || input.invoiceValueINR || input.sellingPriceINR || 500
  );
  const codAmount = paymentMode === 'COD' ? Number(input.cod_amount || input.codAmount || totalAmount) : 0;
  const taxableAmount = Number(input.taxable_amount || input.total_amount || totalAmount);
  const taxValue = Number(input.tax_value || 0);

  // Phone normalization: extract digits, ensure 10-digit integer
  const rawPhone = String(
    input.drop_location?.phone ||
    input.billing_phone ||
    input.deliveryPhone ||
    input.customerPhone ||
    '9876543210'
  ).replace(/\D/g, '');
  const customerPhoneInt = parseInt(rawPhone.slice(-10) || '9876543210', 10);

  // Pincode normalization: 6-digit integer
  const rawPin = String(
    input.drop_location?.pin ||
    input.billing_pincode ||
    input.destinationPincode ||
    input.deliveryPincode ||
    '110001'
  ).replace(/\D/g, '');
  const dropPinInt = parseInt(rawPin || '110001', 10);

  // Weight normalization: Shypfy expects integer in grams (e.g. 1000 for 1kg)
  let rawWeight = Number(input.weight || input.actualWeight || input.chargeableWeight || 0.5);
  if (rawWeight <= 30) {
    rawWeight = Math.round(rawWeight * 1000);
  }
  const weightGrams = Math.max(1, Math.round(rawWeight));

  const lengthCm = Math.max(1, Math.round(Number(input.length || 10)));
  const widthCm = Math.max(1, Math.round(Number(input.width || 10)));
  const heightCm = Math.max(1, Math.round(Number(input.height || 10)));

  // Drop location
  const dropLocation = {
    name: String(
      input.drop_location?.name ||
      input.consignee_name ||
      input.billing_customer_name ||
      input.deliveryContactName ||
      input.customerName ||
      'Customer'
    ),
    phone: customerPhoneInt,
    address: String(
      input.drop_location?.address ||
      input.billing_address ||
      input.deliveryAddress ||
      'Address Details'
    ),
    city: String(
      input.drop_location?.city ||
      input.billing_city ||
      input.deliveryCity ||
      'City'
    ),
    state: String(
      input.drop_location?.state ||
      input.billing_state ||
      input.deliveryState ||
      'State'
    ),
    country: 'India',
    pin: dropPinInt,
  };

  // Pickup location alias resolution:
  // Match known user registered aliases on Shypfy:
  // 'SKYONSHIP' (173205), 'DIVYANSH ENTERPRISES' (134113), 'BARWALA' (134204),
  // 'ELVIA CARE LIMITED' (133103), 'CONNET LIFE PHARMA PVT LTD' (110024)
  const originPin = String(input.originPincode || input.pickupPincode || '').replace(/\D/g, '');
  let alias = 'SKYONSHIP';
  if (originPin === '134113') {
    alias = 'DIVYANSH ENTERPRISES';
  } else if (originPin === '173205') {
    alias = 'SKYONSHIP';
  } else if (originPin === '134204') {
    alias = 'BARWALA';
  } else if (originPin === '133103') {
    alias = 'ELVIA CARE LIMITED';
  } else if (originPin === '110024') {
    alias = 'CONNET LIFE PHARMA PVT LTD';
  } else if (typeof input.pickup_location === 'string' && input.pickup_location.trim().length > 0 && input.pickup_location !== 'Primary') {
    alias = input.pickup_location.trim();
  } else if (typeof input.pickupLocation === 'string' && input.pickupLocation.trim().length > 0 && input.pickupLocation !== 'Primary') {
    alias = input.pickupLocation.trim();
  } else if (input.pickup_location?.name) {
    alias = input.pickup_location.name;
  }

  const pickupLocation = { name: alias };
  const returnLocation = { name: alias };

  // Courier Group & Service Type resolution based on user active Shypfy rate cards:
  // e.g., 'Delhivery 500g', 'Delhivery 2kg', 'Delhivery 5Kg', 'Delhivery 10Kg',
  // 'Amazon Transportation Services 500g', 'Amazon Transportation Services 2Kg',
  // 'Ekart 500g', 'Ekart 2Kg'
  let courierGroup = input.courier_group || input.courierGroup || '';
  if (!courierGroup) {
    const courierHint = String(input.courierName || input.courierId || input.serviceName || '').toLowerCase();
    if (courierHint.includes('amazon')) {
      if (weightGrams <= 500) courierGroup = 'Amazon Transportation Services 500g';
      else if (weightGrams <= 2000) courierGroup = 'Amazon Transportation Services 2Kg';
      else if (weightGrams <= 5000) courierGroup = 'Amazon Transportation Services 5Kg';
      else courierGroup = 'Amazon Transportation Services 10 kg';
    } else if (courierHint.includes('ekart')) {
      if (weightGrams <= 500) courierGroup = 'Ekart 500g';
      else courierGroup = 'Ekart 2Kg';
    } else {
      // Default to Delhivery (primary Shypfy courier partner)
      if (weightGrams <= 500) courierGroup = 'Delhivery 500g';
      else if (weightGrams <= 2000) courierGroup = 'Delhivery 2kg';
      else if (weightGrams <= 5000) courierGroup = 'Delhivery 5Kg';
      else courierGroup = 'Delhivery 10Kg';
    }
  }

  const serviceType = String(input.serviceType || input.service_type || 'SURFACE').toUpperCase();

  return {
    order_number: String(input.order_number || input.order_id || input.orderId || `ORD-${Date.now()}`),
    invoice_number: String(input.invoice_number || input.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`),
    invoice_date: String(input.invoice_date || input.invoiceDate || new Date().toISOString().slice(0, 10)),
    seller_name: String(input.seller_name || alias),
    seller_address: String(input.seller_address || input.pickupAddress || 'Warehouse Address'),
    seller_gst_tin: String(input.seller_gst_tin || '06AAAAA0000A1Z5'),
    consignee_name: dropLocation.name,
    consignee_gst_amount: 0,
    payment_mode: paymentMode,
    category_of_goods: String(input.category_of_goods || 'General'),
    products_desc: String(
      input.products_desc ||
      input.order_items?.[0]?.name ||
      input.packageContents ||
      'General Merchandise'
    ),
    total_amount: totalAmount,
    cod_amount: codAmount,
    taxable_amount: taxableAmount,
    tax_value: taxValue,
    commodity_value: String(taxableAmount),
    quantity: Math.max(1, Number(input.quantity || input.numPackages || 1)),
    weight: weightGrams,
    length: lengthCm,
    width: widthCm,
    height: heightCm,
    courier_group: courierGroup,
    courierGroup: courierGroup,
    serviceType: serviceType,
    pickup_location: pickupLocation,
    return_location: returnLocation,
    drop_location: dropLocation,
  };
}

export async function createShypfyShipment(payload: Record<string, any>): Promise<any> {
  const token = await getShypfyAccessToken();
  const compliantPayload = buildShypfyShipmentPayload(payload);

  const response = await fetch(`${SHYPFY_BASE_URL}/api/v1/package/create`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(compliantPayload),
  });

  if (!response.ok) {
    const errText = await response.text();
    let readableError = errText;
    try {
      const errJson = JSON.parse(errText);
      const desc = errJson.description || errJson.message;
      if (desc) {
        if (desc.includes('Could not find a rate card with matching weight brackets')) {
          readableError = `Shypfy Account Error: No active rate card / weight brackets configured for your account on ship.shypfy.com. Please activate your courier rate card on Shypfy dashboard or contact Shypfy support. (${desc})`;
        } else {
          readableError = `${desc} (${errJson.code || response.status})`;
        }
      }
    } catch {
      // not json
    }
    throw new Error(`Shypfy Create Shipment failed (${response.status}): ${readableError}`);
  }

  return await response.json();
}

export async function getShypfyAddresses(): Promise<any> {
  const token = await getShypfyAccessToken();
  const response = await fetch(`${SHYPFY_BASE_URL}/api/v2/addresses`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Shypfy fetch addresses failed (${response.status}): ${errText}`);
  }

  return await response.json();
}

export async function getShypfyLabel(ids: string[]): Promise<any> {
  const token = await getShypfyAccessToken();
  const response = await fetch(`${SHYPFY_BASE_URL}/api/v1/package/label`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ids }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Shypfy Label download failed (${response.status}): ${errText}`);
  }

  return await response.json();
}

export async function trackShypfyShipment(trackingId: string): Promise<any> {
  const token = await getShypfyAccessToken();
  const response = await fetch(`${SHYPFY_BASE_URL}/api/v1/track/${encodeURIComponent(trackingId)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Shypfy Track Shipment failed (${response.status}): ${errText}`);
  }

  return await response.json();
}

export async function cancelShypfyShipment(trackingId: string): Promise<any> {
  const token = await getShypfyAccessToken();
  const response = await fetch(`${SHYPFY_BASE_URL}/api/v1/package/cancel?tracking_id=${encodeURIComponent(trackingId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Shypfy Cancel Shipment failed (${response.status}): ${errText}`);
  }

  return await response.json();
}

export interface ShypfyTestResponse {
  success: boolean;
  provider: string;
  message: string;
  httpStatus?: number;
  error?: string;
  data?: any;
}

export async function handleShypfyTestEndpoint(): Promise<ShypfyTestResponse> {
  try {
    await getShypfyAccessToken();
    return {
      success: true,
      provider: 'Shypfy',
      message: 'Shypfy API authentication successful',
      httpStatus: 200,
    };
  } catch (err) {
    let httpStatus = 500;
    let errorMessage = 'Shypfy API authentication failed';
    let errorDetail = err instanceof Error ? err.message : 'Unknown error';

    if (err instanceof ShypfyAuthError) {
      httpStatus = err.httpStatus;
      errorDetail = err.details;
    }

    return {
      success: false,
      provider: 'Shypfy',
      message: errorMessage,
      httpStatus,
      error: errorDetail,
    };
  }
}

export async function handleShypfyServiceabilityEndpoint(input: any): Promise<ShypfyTestResponse> {
  try {
    const data = await checkShypfyServiceability(input);
    return {
      success: true,
      provider: 'Shypfy',
      message: 'Serviceability check successful',
      httpStatus: 200,
      data,
    };
  } catch (err: any) {
    return {
      success: false,
      provider: 'Shypfy',
      message: 'Serviceability check failed',
      httpStatus: 500,
      error: err.message,
    };
  }
}

export async function handleShypfyCreateShipmentEndpoint(payload: any): Promise<ShypfyTestResponse> {
  try {
    const data = await createShypfyShipment(payload);
    return {
      success: true,
      provider: 'Shypfy',
      message: 'Shipment created successfully',
      httpStatus: 200,
      data,
    };
  } catch (err: any) {
    return {
      success: false,
      provider: 'Shypfy',
      message: 'Shipment creation failed',
      httpStatus: 500,
      error: err.message,
    };
  }
}

export async function handleShypfyLabelEndpoint(ids: string[]): Promise<ShypfyTestResponse> {
  try {
    const data = await getShypfyLabel(ids);
    return {
      success: true,
      provider: 'Shypfy',
      message: 'Label fetched successfully',
      httpStatus: 200,
      data,
    };
  } catch (err: any) {
    return {
      success: false,
      provider: 'Shypfy',
      message: 'Label download failed',
      httpStatus: 500,
      error: err.message,
    };
  }
}

export async function handleShypfyTrackEndpoint(trackingId: string): Promise<ShypfyTestResponse> {
  try {
    const data = await trackShypfyShipment(trackingId);
    return {
      success: true,
      provider: 'Shypfy',
      message: 'Tracking info retrieved successfully',
      httpStatus: 200,
      data,
    };
  } catch (err: any) {
    return {
      success: false,
      provider: 'Shypfy',
      message: 'Tracking request failed',
      httpStatus: 500,
      error: err.message,
    };
  }
}

export async function handleShypfyCancelEndpoint(trackingId: string): Promise<ShypfyTestResponse> {
  try {
    const data = await cancelShypfyShipment(trackingId);
    return {
      success: true,
      provider: 'Shypfy',
      message: 'Shipment cancelled successfully',
      httpStatus: 200,
      data,
    };
  } catch (err: any) {
    return {
      success: false,
      provider: 'Shypfy',
      message: 'Cancellation failed',
      httpStatus: 500,
      error: err.message,
    };
  }
}

export async function handleShypfyAddressesEndpoint(): Promise<ShypfyTestResponse> {
  try {
    const data = await getShypfyAddresses();
    return {
      success: true,
      provider: 'Shypfy',
      message: 'Addresses fetched successfully',
      httpStatus: 200,
      data,
    };
  } catch (err: any) {
    return {
      success: false,
      provider: 'Shypfy',
      message: 'Address fetch failed',
      httpStatus: 500,
      error: err.message,
    };
  }
}

/**
 * Resolves the intended subpath from either:
 * 1. Vercel rewrite query parameter: req.query.path (e.g., /api/shypfy?path=shipment/create)
 * 2. URL searchParams: ?path=...
 * 3. Direct path structure: /api/integrations/shypfy/... or /api/shypfy/...
 */
export function resolveShypfySubpath(req: any): string {
  const queryPath = req.query?.path;
  if (Array.isArray(queryPath)) {
    return queryPath.join('/').trim();
  }
  if (typeof queryPath === 'string' && queryPath.trim().length > 0) {
    return queryPath.trim();
  }

  const rawUrl = req.url || '';
  try {
    const parsed = new URL(rawUrl, 'http://localhost');
    const pathParam = parsed.searchParams.get('path');
    if (pathParam) {
      return pathParam.trim();
    }

    const pathname = parsed.pathname;
    const marker = '/shypfy';
    const markerIndex = pathname.indexOf(marker);
    if (markerIndex !== -1) {
      const remainder = pathname.slice(markerIndex + marker.length);
      return remainder.replace(/^\/+/, '').trim();
    }

    return pathname.replace(/^\/+/, '').trim();
  } catch {
    return rawUrl.replace(/^\/+/, '').trim();
  }
}

export default async function handler(req: any, res: any) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    let bodyData = req.body;

    if (typeof bodyData === 'string' && bodyData.length > 0) {
      try {
        bodyData = JSON.parse(bodyData);
      } catch {
        bodyData = {};
      }
    }

    bodyData = bodyData || {};

    const rawSubpath = resolveShypfySubpath(req);
    const subpath = rawSubpath.replace(/^\/+|\/+$/g, '').toLowerCase();

    let result: any = null;

    if (subpath === 'test' || subpath === 'test/') {
      result = await handleShypfyTestEndpoint();
    } else if (subpath === 'serviceability' || subpath.startsWith('serviceability/')) {
      result = await handleShypfyServiceabilityEndpoint(bodyData);
    } else if (subpath === 'shipment/create' || subpath === 'package/create') {
      result = await handleShypfyCreateShipmentEndpoint(bodyData);
    } else if (subpath === 'label' || subpath.startsWith('label/') || subpath === 'package/label') {
      let ids: string[] = [];
      if (Array.isArray(bodyData?.ids)) {
        ids = bodyData.ids.map(String);
      } else if (bodyData?.id) {
        ids = [String(bodyData.id)];
      } else if (req.query?.ids) {
        ids = Array.isArray(req.query.ids)
          ? req.query.ids.map(String)
          : String(req.query.ids).split(',').map((s: string) => s.trim());
      } else if (req.query?.id) {
        ids = [String(req.query.id)];
      }
      result = await handleShypfyLabelEndpoint(ids);
    } else if (subpath === 'track' || subpath.startsWith('track/')) {
      const trackingId = String(
        req.query?.id || req.query?.tracking_id || req.query?.awb || bodyData?.id || bodyData?.tracking_id || ''
      );
      result = await handleShypfyTrackEndpoint(trackingId);
    } else if (subpath === 'cancel' || subpath.startsWith('cancel/') || subpath === 'package/cancel') {
      const trackingId = String(
        req.query?.id || req.query?.tracking_id || req.query?.awb || bodyData?.id || bodyData?.tracking_id || ''
      );
      result = await handleShypfyCancelEndpoint(trackingId);
    } else if (subpath === 'addresses' || subpath === 'address' || subpath === 'warehouse/list' || subpath === 'warehouses') {
      result = await handleShypfyAddressesEndpoint();
    } else {
      // Unknown route - strictly return 404. Never fall back to test endpoint!
      res.status(404).json({
        success: false,
        error: `Endpoint not found: ${rawSubpath || 'empty path'}`,
      });
      return;
    }

    if (result) {
      const statusCode = result.success ? 200 : (result.httpStatus || 500);
      res.status(statusCode).json(result);
      return;
    }

    res.status(404).json({ success: false, error: 'Endpoint not found' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Server error' });
  }
}
