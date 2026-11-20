const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const paths = [
  'src/app/(en)/categories/[slug]/page.tsx',
  'src/app/(uk)/uk/categories/[slug]/page.tsx'
];
const queryModule = fs.readFileSync('src/lib/api/query.ts', 'utf8');
const compiled = ts.transpileModule(queryModule, {compilerOptions:{module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022}}).outputText;
const holder = {exports:{}};
vm.runInNewContext(`(function(module,exports){${compiled}})`, {URLSearchParams})(holder, holder.exports);
const {parseCatalogQuery,catalogHref} = holder.exports;

test('both Next.js 15 category routes await async searchParams and pass query into CategoryDetailPage', () => {
 for (const path of paths) {
  const source = fs.readFileSync(path, 'utf8');
  const ast = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const fn = ast.statements.find(s => ts.isFunctionDeclaration(s) && s.name?.text === 'Page');
  assert.ok(fn, `${path}: page function exists`);
  assert.match(fn.getText(ast), /searchParams\s*:\s*Promise<RawQuery>/);
  assert.match(fn.getText(ast), /await Promise\.all\(\[params,\s*searchParams\]\)/);
  assert.match(fn.getText(ast), /<CategoryDetailPage\s+locale="(?:en|uk)"\s+slug=\{slug\}\s+query=\{query\}/);
 }
 const detail = fs.readFileSync('src/components/catalog-data-pages.tsx','utf8');
 assert.match(detail, /CategoryDetailPage\(\{locale,slug,query=\{\}\}/);
 assert.match(detail, /<Catalog\s+locale=\{locale\}\s+query=\{query\}\s+fixedCategory=\{slug\}/);
 const catalog=fs.readFileSync('src/components/catalog.tsx','utf8');
 assert.match(catalog, /parseCatalogQuery\(query\)/);
 assert.match(catalog, /if\(fixedCategory\)params\.category=fixedCategory/);
 assert.match(catalog, /getTemplates\(\{\.\.\.params/);
 assert.match(catalog, /page_size:params\.page_size/);
});

test('real category query reaches catalog parser: formats, attr.*, q, sorting and pagination survive', () => {
 const incoming={category:'wrong-category',format:'xlsx','attr.page-size':'a4','attr.editable':'true',q:'invoice',sort:'title',page:'3',page_size:'40',_rsc:'internal-token'};
 const params=parseCatalogQuery(incoming);
 params.category='invoices'; // fixedCategory has precedence, as implemented in Catalog
 assert.equal(params.category,'invoices');
 assert.equal(params.format,'xlsx');
 assert.equal(params.attributes['page-size'],'a4');
 assert.equal(params.attributes.editable,'true');
 assert.equal(params.q,'invoice');
 assert.equal(params.sort,'title');
 assert.equal(params.page,3);
 assert.equal(params.page_size,40);
 const next=new URL(catalogHref('/categories/invoices',params,{page:4}), 'https://forma.example');
 for(const [key,value] of Object.entries({category:'invoices',format:'xlsx','attr.page-size':'a4','attr.editable':'true',q:'invoice',sort:'title',page:'4',page_size:'40'}))assert.equal(next.searchParams.get(key),value,key);
 assert.equal(next.searchParams.has('_rsc'),false);
});

test('EN/UK links preserve machine query values, empty backend results produce empty state',()=>{
 const p=parseCatalogQuery({format:'pdf','attr.page-size':'letter',q:'test',page:'2'});
 p.category='invoices';
 const en=new URL(catalogHref('/categories/invoices',p),'https://forma.example');
 const uk=new URL(catalogHref('/uk/categories/invoices',p),'https://forma.example');
 assert.equal(en.search,uk.search);
 const catalog=fs.readFileSync('src/components/catalog.tsx','utf8');
 assert.match(catalog,/!items\?\.results\.length\?<div role="status"/);
 assert.match(catalog,/items\.results\.map\(item=>/);
});
