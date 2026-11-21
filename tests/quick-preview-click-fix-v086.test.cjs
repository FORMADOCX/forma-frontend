const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('drawer is portaled to document.body, outside hover panel visibility/pointer-events ancestry', () => {
 const source = read('src/components/quick-preview.tsx');
 const css = read('src/app/globals.css');
 assert.match(source, /import \{createPortal\} from 'react-dom'/);
 assert.match(source, /setPortalRoot\(document\.body\)/);
 assert.match(source, /portalRoot&&createPortal\(<dialog/);
 assert.match(source, /<\/dialog>,portalRoot\)/);
 assert.match(css, /\.template-card-hover-actions\{[^}]*pointer-events:none/);
 assert.match(css, /\.template-card:is\(:hover,:focus-within\) \.template-card-hover-actions\{[^}]*pointer-events:auto/);
});

test('quick preview retains accessible interactive buttons, links and Escape/Close/backdrop', () => {
 const source = read('src/components/quick-preview.tsx');
 assert.match(source, /\.showModal\(\)/);
 assert.match(source, /onClose=\{onClose\}/);
 assert.match(source, /onClick=\{event=>\{if\(event\.target===dialog\.current\)close\(\)\}\}/);
 assert.match(source, /autoFocus aria-label=\{t\.close\}/);
 assert.match(source, /trigger\.current\?\.focus\(\)/);
 assert.match(source, /<Link href=\{localizedPath\(locale,`\/templates\/\$\{data\.slug\}`\)\}/);
 assert.match(source, /href=\{url\} rel="noopener noreferrer"/);
 assert.match(source, /DocumentLightbox/);
 assert.match(source, /window\.matchMedia\('\(max-width: 767px\)'\)\.matches\)return/);
});

test('detail does not redundantly render quick preview, but retains gallery and download', () => {
 const source = read('src/components/catalog-data-pages.tsx');
 assert.doesNotMatch(source, /\bQuickPreview\b/);
 assert.match(source, /<SelectedDocumentGallery item=\{item/);
 assert.match(source, /DocumentDownloadSelector/);
 const card = read('src/components/template-card.tsx');
 assert.match(card, /<QuickPreview slug=\{template\.slug\}/);
});
