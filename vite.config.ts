import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import {
  handleShypfyTestEndpoint,
  handleShypfyServiceabilityEndpoint,
  handleShypfyCreateShipmentEndpoint,
  handleShypfyLabelEndpoint,
  handleShypfyTrackEndpoint,
  handleShypfyCancelEndpoint,
} from './src/server/shypfyTestEndpoint.ts';

/**
 * Server plugin to serve protected backend API endpoints for Shypfy Logistics
 */
function shypfyServerPlugin(): Plugin {
  const handleRequest = async (req: any, res: any, next: any) => {
    if (!req.url || !req.url.startsWith('/api/integrations/shypfy')) {
      return next();
    }

    try {
      let bodyData: any = null;
      if (req.method === 'POST' || req.method === 'PUT') {
        const buffers: Buffer[] = [];
        for await (const chunk of req) {
          buffers.push(chunk);
        }
        const str = Buffer.concat(buffers).toString('utf-8');
        try {
          bodyData = JSON.parse(str);
        } catch {
          bodyData = {};
        }
      }

      let result: any = null;
      const url = req.url;

      if (url.startsWith('/api/integrations/shypfy/test')) {
        result = await handleShypfyTestEndpoint();
      } else if (url.startsWith('/api/integrations/shypfy/serviceability')) {
        result = await handleShypfyServiceabilityEndpoint(bodyData || {});
      } else if (url.startsWith('/api/integrations/shypfy/shipment/create')) {
        result = await handleShypfyCreateShipmentEndpoint(bodyData || {});
      } else if (url.startsWith('/api/integrations/shypfy/label')) {
        result = await handleShypfyLabelEndpoint(bodyData?.ids || []);
      } else if (url.startsWith('/api/integrations/shypfy/track')) {
        const urlObj = new URL(url, 'http://localhost');
        const trackingId = urlObj.searchParams.get('id') || '';
        result = await handleShypfyTrackEndpoint(trackingId);
      } else if (url.startsWith('/api/integrations/shypfy/cancel')) {
        const urlObj = new URL(url, 'http://localhost');
        const trackingId = urlObj.searchParams.get('id') || '';
        result = await handleShypfyCancelEndpoint(trackingId);
      }

      if (result) {
        res.statusCode = result.success ? 200 : (result.httpStatus || 500);
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result, null, 2));
        return;
      }
    } catch (err: any) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, error: err.message }));
      return;
    }

    next();
  };

  return {
    name: 'shypfy-server-plugin',
    configureServer(server) {
      server.middlewares.use(handleRequest);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleRequest);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), shypfyServerPlugin()],
});
