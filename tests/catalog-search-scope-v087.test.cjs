const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'src/components/catalog.tsx'),'utf8');
const css=fs.readFileSync(path.join(root,'src/app/globals.css'),'utf8');
const searchForm=fs.readFileSync(path.join(root,'src/components/search-form.tsx'),'utf8');

test('Catalog search input is rendered on Search only, not All Templates or Category Detail',()=>{
 assert.match(source,/search\?<label>\{t\.search\}<input type="search" name="q"/);
 assert.match(source,/role=\{search\?'search':undefined\}/);
 assert.match(source,/fixedCategory\?`\/categories\/\$\{fixedCategory\}`:search\?'\/search':'\/templates'/);
});
test('Catalog and Category preserve an incoming q on filter submission without visible search UI',()=>{
 assert.match(source,/:params\.q\?<input type="hidden" name="q" value=\{params\.q\}\/>:null/);
 assert.match(source,/getTemplates\(\{\.\.\.params,/);
 assert.match(source,/catalogHref\(base,params\)/);
});
test('Catalog controls occupy three columns on desktop without search field',()=>{
 assert.match(source,/catalog-controls-no-search/);
 assert.match(css,/\.catalog-controls-no-search\{grid-template-columns:/);
});
test('Dedicated Search page and global search remain available',()=>{
 assert.match(searchForm,/localizedPath\(locale,'\/search'\)/);
 assert.match(searchForm,/name="q"/);
 assert.match(source,/searchBreadcrumbs\(locale,params\.q\)/);
});
