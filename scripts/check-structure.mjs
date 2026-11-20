import {existsSync,readFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const files=['src/app/(en)/layout.tsx','src/app/(uk)/layout.tsx','src/app/(en)/page.tsx','src/app/(uk)/uk/page.tsx','src/components/quick-preview.tsx','src/styles/tokens.css','src/lib/api/client.ts','src/lib/api/types.ts','docs/openapi.backend-v0.2.yaml','docs/FRONTEND_INTEGRATION.md','AGENTS.md','README.md'];
for(const file of files)assert.ok(existsSync(file),`Missing: ${file}`);
const api=readFileSync('src/lib/api/client.ts','utf8');
for(const route of ['categories/','templates/','quick-preview/'])assert.ok(api.includes(route),`Missing API route: ${route}`);
assert.ok(!api.includes('download/'),'Download contract is not available');
assert.ok(!readFileSync('src/components/template-card.tsx','utf8').includes('<img'),'Do not invent document previews');
console.log('Structure / contract guard checks passed.');
