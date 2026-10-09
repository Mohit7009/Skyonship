import fs from 'fs';
import path from 'path';

/**
 * Ensures server-side environment variables are loaded dynamically from .env on disk.
 * This guarantees the application reads the latest secrets even if updated after initial boot.
 */
function ensureEnvLoaded(): void {
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
          if (key && val) {
            process.env[key] = val;
          }
        }
      }
    }
  } catch {
    // Ignore read errors
  }
}

export interface ShypfyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

interface CachedToken {
  accessToken: string;
  expiresAt: number; // Timestamp in milliseconds
}

let cachedToken: CachedToken | null = null;

const SHYPFY_BASE_URL = 'https://app.shypfy.com';

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

export interface ClientIdWhitespaceReport {
  hasLeadingWhitespace: boolean;
  hasTrailingWhitespace: boolean;
  rawLength: number;
  trimmedLength: number;
}

/**
 * Returns whitespace diagnostic report for SHYPFY_CLIENT_ID without exposing secret values.
 */
export function checkClientIdWhitespace(): ClientIdWhitespaceReport {
  ensureEnvLoaded();
  const rawClientId = process.env.SHYPFY_CLIENT_ID || '';
  const hasLeadingWhitespace = /^\s/.test(rawClientId);
  const hasTrailingWhitespace = /\s$/.test(rawClientId);
  return {
    hasLeadingWhitespace,
    hasTrailingWhitespace,
    rawLength: rawClientId.length,
    trimmedLength: rawClientId.trim().length,
  };
}

/**
 * Backend-only secure function to request or retrieve cached Shypfy access token.
 * 
 * SECURITY RULES ENFORCED:
 * - Credentials (username/password) are read strictly from server-side process.env.
 * - Passwords, usernames, and access tokens are NEVER logged to server logs.
 * - Leading and trailing whitespace are trimmed automatically before dispatching request.
 * - Access token is cached in memory based on `expires_in` duration.
 */
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

  // Safe diagnostics logging (WITHOUT exposing actual credentials or tokens)
  console.log('[Shypfy Auth Service] Safe Diagnostics Check:');
  console.log(`  - client ID present: ${clientId ? 'yes' : 'no'}`);
  console.log(`  - username present: ${username ? 'yes' : 'no'}`);
  console.log(`  - password present: ${password ? 'yes' : 'no'}`);
  console.log(`  - client ID raw length: ${rawClientId.length}`);
  console.log(`  - client ID trimmed length: ${clientId.length}`);
  console.log(`  - client ID leading whitespace: ${hasLeadingWhitespace ? 'Yes' : 'No'}`);
  console.log(`  - client ID trailing whitespace: ${hasTrailingWhitespace ? 'Yes' : 'No'}`);

  if (!clientId || !username || !password) {
    console.error('[Shypfy Auth Service] Configuration Error: One or more required server-side environment variables are missing.');
    throw new Error('Shypfy API environment variables are missing or incomplete');
  }

  const now = Date.now();
  // Check if valid token is already cached (with a 60-second safety buffer before actual expiry)
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
        // Response body was not JSON
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

/**
 * Resets the in-memory access token cache.
 */
export function resetShypfyTokenCache(): void {
  cachedToken = null;
}

export interface ShypfyServiceabilityInput {
  pickupPincode: string;
  dropPincode: string;
  length?: number;
  width?: number;
  height?: number;
  weight: number;
  paymentType: 'COD' | 'PREPAID';
  codAmount?: number;
  invoiceAmount?: number;
}

export async function checkShypfyServiceability(input: ShypfyServiceabilityInput): Promise<any> {
  const token = await getShypfyAccessToken();
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
      paymentType: input.paymentType,
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

export async function createShypfyShipment(payload: Record<string, any>): Promise<any> {
  const token = await getShypfyAccessToken();
  const response = await fetch(`${SHYPFY_BASE_URL}/api/v1/package/create`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Shypfy Create Shipment failed (${response.status}): ${errText}`);
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

