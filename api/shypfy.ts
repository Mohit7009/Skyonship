import {
  handleShypfyTestEndpoint,
  handleShypfyServiceabilityEndpoint,
  handleShypfyCreateShipmentEndpoint,
  handleShypfyLabelEndpoint,
  handleShypfyTrackEndpoint,
  handleShypfyCancelEndpoint,
} from '../src/server/shypfyTestEndpoint.ts';

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
    const url = req.url || '';
    let bodyData = req.body;

    if (typeof bodyData === 'string' && bodyData.length > 0) {
      try {
        bodyData = JSON.parse(bodyData);
      } catch {
        bodyData = {};
      }
    }

    bodyData = bodyData || {};

    let result: any = null;

    if (url.includes('/test')) {
      result = await handleShypfyTestEndpoint();
    } else if (url.includes('/serviceability')) {
      result = await handleShypfyServiceabilityEndpoint(bodyData);
    } else if (url.includes('/shipment/create')) {
      result = await handleShypfyCreateShipmentEndpoint(bodyData);
    } else if (url.includes('/label')) {
      const ids = Array.isArray(bodyData?.ids) ? bodyData.ids : bodyData?.id ? [bodyData.id] : [];
      result = await handleShypfyLabelEndpoint(ids);
    } else if (url.includes('/track')) {
      const queryId = req.query?.id || '';
      result = await handleShypfyTrackEndpoint(String(queryId));
    } else if (url.includes('/cancel')) {
      const queryId = req.query?.id || '';
      result = await handleShypfyCancelEndpoint(String(queryId));
    } else {
      result = await handleShypfyTestEndpoint();
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
