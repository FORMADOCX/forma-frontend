const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const source=fs.readFileSync('src/lib/api/query.ts','utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const sandboxModule={exports:{}};
vm.runInNewContext(`(function(module,exports){${js}})`,{URLSearchParams})(sandboxModule,sandboxModule.exports);
const {parseCatalogQuery,catalogHref,applyCatalogFilters,clearCatalogFilters,removeCatalogFilter,normalizedAttributes}=sandboxModule.exports;
const url=value=>new URL(value,'https://example.test');
const qs=value=>url(value).searchParams;
test('Django receives one CSV attr.* parameter even when incoming URL repeats attributes',()=>{
 const p=parseCatalogQuery({'attr.page-size':['a4','us-letter','a4'],'attr.design-style':'minimal',page:'4'});
 const out=qs(catalogHref('/templates',p));
 assert.deepEqual(out.getAll('attr.page-size'),['a4,us-letter']);
 assert.equal(out.get('attr.design-style'),'minimal');
 assert.equal(out.get('page'),'4');
});
test('single and multiple selections maintain AND across keys and OR inside key',()=>{
 const p=applyCatalogFilters(parseCatalogQuery({q:'invoice',category:'invoices',sort:'title',page:'5'}),'docx',{'page-size':['a4','us-letter'],'design-style':['minimal']});
 const out=qs(catalogHref('/templates',p));
 assert.equal(out.get('attr.page-size'),'a4,us-letter');assert.equal(out.get('attr.design-style'),'minimal');
 assert.equal(out.get('format'),'docx');assert.equal(out.get('category'),'invoices');assert.equal(out.get('q'),'invoice');assert.equal(out.get('sort'),'title');assert.equal(out.has('page'),false);
});
test('remove one active OR chip retains sibling option and resets pagination',()=>{
 const p=parseCatalogQuery({'attr.page-size':'a4,us-letter',format:'docx',sort:'oldest',page:'8'});
 const out=qs(catalogHref('/templates',removeCatalogFilter(p,'page-size','a4')));
 assert.equal(out.get('attr.page-size'),'us-letter');assert.equal(out.get('sort'),'oldest');assert.equal(out.get('format'),'docx');assert.equal(out.has('page'),false);
});
test('clear all facets preserves current query, category and sort',()=>{
 const p=parseCatalogQuery({q:'lease',category:'legal',sort:'-title',format:'pdf','attr.page-size':'a4',page:'5'});
 const out=qs(catalogHref('/search',clearCatalogFilters(p)));
 assert.equal(out.get('q'),'lease');assert.equal(out.get('category'),'legal');assert.equal(out.get('sort'),'-title');
 assert.equal(out.has('format'),false);assert.equal(out.has('attr.page-size'),false);assert.equal(out.has('page'),false);
});
test('URL parse/serialize roundtrip stabilizes duplicate values, whitespace and empty values',()=>{
 const p=parseCatalogQuery({'attr.page-size':['a4,us-letter',' a4 , '], 'attr.orientation':'portrait',q:'invoice',sort:'title'});
 const first=catalogHref('/templates',p);const query=Object.fromEntries(qs(first));
 const second=catalogHref('/templates',parseCatalogQuery(query));
 assert.equal(second,first);
 assert.deepEqual(qs(first).getAll('attr.page-size'),['a4,us-letter']);
});
test('normalizing attrs drops empty and duplicate options, caps Django limits',()=>{
 const result=normalizedAttributes({'page-size':'a4, a4,,us-letter'});
 assert.equal(result['page-size'],'a4,us-letter');
 assert.equal(Object.keys(normalizedAttributes(Object.fromEntries(Array.from({length:12},(_,i)=>[`a${i}`,'yes'])))).length,8);
});
test('sort/category changes happen via client router without apply button',()=>{
 const toolbar=fs.readFileSync('src/components/catalog-toolbar.tsx','utf8');
 assert.match(toolbar,/router\.push\(next\)/);assert.match(toolbar,/\.\.\.patch,page:1/);
 assert.match(toolbar,/onChange=\{value=>/);assert.match(toolbar,/onChange=\{category=>/);
 assert.doesNotMatch(toolbar,/type="submit"/);
});
test('search is scoped, all catalog links and chips share serialization',()=>{
 const catalog=fs.readFileSync('src/components/catalog.tsx','utf8');
 const chips=fs.readFileSync('src/components/catalog-active-filters.tsx','utf8');
 assert.match(catalog,/search&&<form className="catalog-search-form"/);
 assert.match(catalog,/getTemplates\(/);assert.match(catalog,/status===400/);
 assert.match(chips,/removeCatalogFilter\(/);assert.match(chips,/clearCatalogFilters\(/);
});
test('mobile sheet batches selections; desktop applies immediately via the same helper',()=>{
 const source=fs.readFileSync('src/components/catalog-filters.tsx','utf8');
 assert.match(source,/if\(mobile\)setSelection\(next\);else navigate\(/);
 assert.match(source,/function submit\(/);assert.match(source,/showModal\(\)/);
 assert.match(source,/applyCatalogFilters\(params,nextFormat,next\)/);
});
test('API client forwards normalized scalar attribute values, not duplicate arrays',()=>{
 const client=fs.readFileSync('src/lib/api/client.ts','utf8');
 assert.match(client,/normalizedAttributes\(query.attributes,query.rawAttributes\)/);
 assert.doesNotMatch(client,/\[`attr\.\$\{key\}`,values\]/);
});
