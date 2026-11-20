const test = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');

test('catalogue flex controls use the compatible cross-axis end alignment', () => {
  const css = readFileSync(join(__dirname, '../src/app/globals.css'), 'utf8');
  const rule = css.match(/\.catalog-controls\{([^}]*)\}/)?.[1];
  assert.ok(rule, 'catalogue controls rule must exist');
  assert.match(rule, /(?:^|;)align-items:flex-end(?:;|$)/);
  assert.doesNotMatch(rule, /(?:^|;)align-items:end(?:;|$)/);
});
