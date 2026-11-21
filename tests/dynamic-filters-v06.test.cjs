const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript')
const source=fs.readFileSync('src/lib/api/query.ts','utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const holder={exports:{}};
vm.runInNewContext(`(function(module,exports){${compiled}})`,{URLSearchParams})(holder,holder.exports);
const {parseCatalogQuery,catalogHref,applyCatalogFilters,clearCatalogFilters}=holder.exports;
const asQuery=(url)=>new URL(url,'https://forma.example').searchParams;
test('backend v0.6 contract includes only supported dynamic filter DTO fields and grammar',()=>{
 const backend=fs.readFileSync('docs/FRONTEND_V06_CHANGES.md','utf8');
 for(const term of ['GET /api/v1/filters/','multi_select','attr.orientation','format','attr.page-size=a4,letter','2048'])assert.ok(backend.includes(term),term);
});
test('selection types are data driven; combined URL filters keep machine keys',()=>{
 const data=[{key:'page-size',type:'multi_select',options:[{value:'a4'},{value:'letter'}]},{key:'orientation',type:'single_select',options:[{value:'portrait'}]},{key:'editable',type:'boolean',options:[{value:'true'}]}];
 const selected=Object.fromEntries(data.map(f=>[f.key,f.options.map(o=>o.value)]));
 const params=applyCatalogFilters(parseCatalogQuery({q:'invoice',category:'business',page:'9',sort:'title'}),'docx',selected);
 const query=asQuery(catalogHref('/templates',params));
 assert.equal(query.get('format'),'docx');assert.equal(query.get('attr.page-size'),'a4,letter');assert.equal(query.get('attr.orientation'),'portrait');assert.equal(query.get('attr.editable'),'true');
 assert.equal(query.get('q'),'invoice');assert.equal(query.get('category'),'business');assert.equal(query.get('sort'),'title');assert.equal(query.has('page'),false);
});
test('pagination preserves attributes format and query',()=>{
 const params=parseCatalogQuery({'attr.page-size':'a4,letter','attr.editable':'false',format:'pdf',q:'estimate',sort:'-title',page:'2'});
 const url=asQuery(catalogHref('/templates',params,{page:3}));
 for(const [key,value] of [['attr.page-size','a4,letter'],['attr.editable','false'],['format','pdf'],['q','estimate'],['sort','-title'],['page','3']])assert.equal(url.get(key),value);
});
test('clear filters preserves search and category but resets page',()=>{
 const p=clearCatalogFilters(parseCatalogQuery({'attr.page-size':'a4',format:'docx',q:'hello',category:'legal',page:'4'}));
 const query=asQuery(catalogHref('/templates',p));assert.equal(query.toString(),'q=hello&category=legal');
});
test('duplicated attribute values normalize to one backend CSV parameter',()=>{
 const p=parseCatalogQuery({'attr.not-registered':['x','y'],'attr.unusual':'invalid!',q:'foo'});
 const query=asQuery(catalogHref('/templates',p));
 assert.deepEqual(query.getAll('attr.not-registered'),['x,y']);assert.equal(query.get('attr.unusual'),'invalid!');
});
test('locale URLs retain filters by using the same query suffix',()=>{
 const p=parseCatalogQuery({'attr.page-size':'a4',format:'xlsx',q:'forms'});
 const en=asQuery(catalogHref('/templates',p));const uk=asQuery(catalogHref('/uk/templates',p));
 assert.equal(en.toString(),uk.toString());
});
test('catalog uses backend filter discovery and real API list, including category route reuse',()=>{
 const source=fs.readFileSync('src/components/catalog.tsx','utf8');
 const detail=fs.readFileSync('src/components/catalog-data-pages.tsx','utf8');
 assert.match(source,/getFilters\(locale/);assert.match(source,/getTemplates\(/);
 assert.match(source,/items\.results\.map/);assert.match(detail,/fixedCategory=\{slug\}/);
 assert.match(source,/status===400/);assert.match(source,/status===429/);assert.match(source,/status===404/);
});
test('mobile dialog preserves native Escape and focus return; all groups map their API types',()=>{
 const form=fs.readFileSync('src/components/catalog-filters.tsx','utf8');
 assert.match(form,/showModal\(\)/);assert.match(form,/onClose=/);assert.match(form,/trigger\.current\?\.focus/);
 assert.match(form,/group\.type==='multi_select'/);assert.match(form,/group\.options\.map/);
 assert.match(form,/router\.push\(catalogHref/);
});
test('filter routes remain noindex; no fabricated sitemap entries',()=>{
 for(const route of ['src/app/(en)/templates/page.tsx','src/app/(en)/search/page.tsx'])assert.match(fs.readFileSync(route,'utf8'),/index:false/);
 const sitemap=fs.readFileSync('src/app/sitemap.ts','utf8');assert.doesNotMatch(sitemap,/attr\./);
});

test('duplicate format parameters survive initial server filtering and pagination for DRF rejection',()=>{
 const p=parseCatalogQuery({format:['docx','pdf'],page:'2'});
 assert.deepEqual(asQuery(catalogHref('/templates',p,{page:3})).getAll('format'),['docx','pdf']);
});
