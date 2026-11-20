const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const css = fs.readFileSync('src/app/globals.css','utf8');
const card = fs.readFileSync('src/components/template-card.tsx','utf8');

test('revealed Quick Preview is a flush card extension, not a floating separate panel', () => {
  assert.match(css,/\.template-card-hover-actions\{position:absolute;top:calc\(100% - 1px\);left:-1px;right:-1px/);
  assert.match(css,/border-top:0;border-radius:0 0 9px 9px;background:var\(--card-surface\)/);
  assert.match(css,/border-bottom-color:transparent;border-radius:9px 9px 0 0/);
  assert.doesNotMatch(css,/\.template-card-hover-actions\{[^}]*box-shadow:/);
  assert.doesNotMatch(css,/\.template-card-hover-actions\{[^}]*transform:/);
});
test('extension does not shift grid and is accessible by keyboard and touch', () => {
  assert.match(css,/\.template-card:is\(:hover,:focus-within\) \.template-card-hover-actions/);
  assert.match(css,/@media\(hover:none\)\{\.template-card\{overflow:hidden\}/);
  assert.match(css,/\.template-card-hover-actions\{position:static;visibility:visible/);
  assert.match(css,/prefers-reduced-motion:reduce/);
  assert.match(card,/<QuickPreview slug=\{template\.slug\}/);
});
