import fs from 'fs';
import path from 'path';
import { handleShypfyTestEndpoint } from '../src/server/shypfyTestEndpoint.js';

console.log('=== SHYPFY API PHASE 1 INTEGRATION TEST ===');

// Check environment configuration
const envPath = path.resolve(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);
console.log(`1. Environment file (.env) exists: ${envExists}`);
console.log(`   SHYPFY_CLIENT_ID: ${process.env.SHYPFY_CLIENT_ID || 'NOT_SET'}`);
console.log(`   SHYPFY_API_USERNAME: ${process.env.SHYPFY_API_USERNAME ? '[CONFIGURED]' : 'NOT_SET'}`);
console.log(`   SHYPFY_API_PASSWORD: ${process.env.SHYPFY_API_PASSWORD ? '[CONFIGURED]' : 'NOT_SET'}`);

console.log('\n2. Executing server-side test endpoint handler (handleShypfyTestEndpoint)...');

handleShypfyTestEndpoint().then((res) => {
  console.log('\n=== TEST ENDPOINT RESULT ===');
  console.log(JSON.stringify(res, null, 2));
  console.log('\n=== SUMMARY REPORT ===');
  console.log(`1. Environment variables configured: ${Boolean(process.env.SHYPFY_CLIENT_ID && process.env.SHYPFY_API_USERNAME && process.env.SHYPFY_API_PASSWORD)}`);
  console.log(`2. Token authentication succeeded: ${res.success}`);
  console.log(`3. HTTP Status received from Shypfy: ${res.httpStatus || 'N/A'}`);
  console.log(`4. Backend test endpoint works: YES (returned structured response)`);
  console.log(`5. Shypfy error response (safe): ${res.error || 'None'}`);
}).catch(err => {
  console.error('Execution error:', err);
});
