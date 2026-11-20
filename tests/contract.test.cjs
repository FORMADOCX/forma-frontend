const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript')
const vm=require('node:vm');
function moduleFromTs(path){const source=fs.readFileSync(path,'utf8');const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;const loadedModule={exports:{}};vm.runInNewContext(`(function(module,exports,require){${compiled}})`,{URLSearchParams})(loadedModule,loadedModule.exports,()=>({}));return loadedModule.exports;}
const q=moduleFromTs('src/lib/api/query.ts');
test('pagination respects 1-based backend API and caps invalid data',()=>{
 assert.equal(q.parseCatalogQuery({page:'0'}).page,1);
 assert.equal(q.parseCatalogQuery({page:'NaN'}).page,1);
 assert.equal(q.parseCatalogQuery({page:'4'}).page,4);
});
test('sort values are restricted to OpenAPI enum',()=>{
 assert.equal(q.parseCatalogQuery({sort:'-title'}).sort,'-title');
 assert.equal(q.parseCatalogQuery({sort:'other'}).sort,'newest');
});
test('search text follows DRF maximum length',()=>assert.equal(q.parseCatalogQuery({q:'a'.repeat(160)}).q.length,120));
test('pagination links preserve category, q and sort',()=>{
 const base=q.parseCatalogQuery({q:'invoice',category:'legal',sort:'title',page:'2'});
 assert.equal(q.catalogHref('/templates',base,{page:3}),'/templates?q=invoice&category=legal&sort=title&page=3');
});
test('OpenAPI contract includes distinct summary / quick preview / detail API',()=>{
 const spec=fs.readFileSync('docs/openapi.backend-v0.2.yaml','utf8');
 for(const endpoint of ['/api/v1/categories/','/api/v1/templates/','/api/v1/templates/{slug}/quick-preview/','/api/v1/templates/{slug}/'])assert.ok(spec.includes(endpoint),endpoint);
 assert.ok(!spec.includes('/download/'));
});
