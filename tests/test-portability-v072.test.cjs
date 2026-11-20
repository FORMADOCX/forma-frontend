const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

// Cross-platform portability guard: project-local TS resolution only.
test('all CommonJS tests resolve TypeScript through standard package resolution', () => {
  const files = fs.readdirSync(__dirname).filter(name => name.endsWith('.test.cjs'));
  for (const name of files) {
    if (name === 'test-portability-v072.test.cjs') continue; // This guard contains path patterns as test fixtures.
    const source = fs.readFileSync(path.join(__dirname, name), 'utf8');
    assert.doesNotMatch(source, /GLOBAL_TYPESCRIPT_PATH|\/opt\/nvm\/|\/usr\/local\/lib\/node_modules\/typescript/,
      `${name} depends on a global Unix TypeScript path`);
    if (source.includes('transpileModule(')) {
      assert.match(source, /require\(['"]typescript['"]\)/, `${name} must use local TypeScript`);
    }
  }
});

test('CMS client fixture tests use package-resolved TypeScript and real transpilation', () => {
  const source = fs.readFileSync(path.join(__dirname, 'cms-dto-v071.test.cjs'), 'utf8');
  assert.match(source, /const ts=require\(['"]typescript['"]\)/);
  assert.match(source, /ts\.transpileModule\(source/);
  assert.match(source, /vm\.runInNewContext\(js/);
});
