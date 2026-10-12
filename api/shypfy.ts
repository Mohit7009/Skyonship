import {
  handleShypfyTestEndpoint,
  handleShypfyServiceabilityEndpoint,
  handleShypfyCreateShipmentEndpoint,
  handleShypfyLabelEndpoint,
  handleShypfyTrackEndpoint,
  handleShypfyCancelEndpoint,
} from '../src/server/shypfyTestEndpoint.ts';

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
