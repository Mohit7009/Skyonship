import fs from 'fs';
import path from 'path';
import { handleShypfyTestEndpoint } from '../src/server/shypfyTestEndpoint.ts';
import { checkClientIdWhitespace, resetShypfyTokenCache } from '../src/server/shypfyService.ts';

console.log('=== SHYPFY API PHASE 1 INTEGRATION TEST & WHITESPACE CHECK ===\n');

// Force reset token cache before testing
resetShypfyTokenCache();

// Check environment configuration
const envPath = path.resolve(process.cwd(), '.env');
const envExists = fs.existsSync(envPath);
console.log(`1. Environment file (.env) exists: ${envExists}`);

const wsReport = checkClientIdWhitespace();
console.log('\n2. Whitespace Inspection for SHYPFY_CLIENT_ID:');
console.log(`   - Raw string length: ${wsReport.rawLength}`);
console.log(`   - Trimmed string length: ${wsReport.trimmedLength}`);
console.log(`   - Leading whitespace: ${wsReport.hasLeadingWhitespace ? 'Yes' : 'No'}`);
console.log(`   - Trailing whitespace: ${wsReport.hasTrailingWhitespace ? 'Yes' : 'No'}`);

console.log('\n3. Executing server-side test endpoint handler (handleShypfyTestEndpoint)...');

handleShypfyTestEndpoint().then((res) => {
  console.log('\n=== TEST ENDPOINT RESULT ===');
  console.log(JSON.stringify(res, null, 2));
  console.log('\n=== SUMMARY REPORT ===');
  console.log(`- Leading whitespace: ${wsReport.hasLeadingWhitespace ? 'Yes' : 'No'}`);
  console.log(`- Trailing whitespace: ${wsReport.hasTrailingWhitespace ? 'Yes' : 'No'}`);
  console.log(`- Authentication HTTP status: ${res.httpStatus || 'N/A'}`);
  console.log(`- Shypfy safe error/success message: ${res.error || res.message}`);
}).catch((err) => {
  console.error('Execution error:', err);
});
