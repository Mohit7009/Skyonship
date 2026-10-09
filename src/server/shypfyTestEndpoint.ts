import {
  getShypfyAccessToken,
  ShypfyAuthError,
  checkShypfyServiceability,
  createShypfyShipment,
  getShypfyLabel,
  trackShypfyShipment,
  cancelShypfyShipment,
} from './shypfyService.ts';

export interface ShypfyTestResponse {
  success: boolean;
  provider: string;
  message: string;
  httpStatus?: number;
  error?: string;
  data?: any;
}

/**
 * Handles protected server-side GET /api/integrations/shypfy/test endpoint.
 * 
 * SECURITY RULES ENFORCED:
 * - NEVER exposes username, password, or access_token to the caller.
 * - Returns ONLY safe response metadata (success status, provider name, and message).
 */
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
