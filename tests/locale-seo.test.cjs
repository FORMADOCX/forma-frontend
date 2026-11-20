const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript')
function extractFunction(source,name){const start=source.indexOf(`export function ${name}(`);assert.ok(start>=0,name);const body=source.slice(start);const end=body.indexOf('\nexport ',1);return end<0?body:body.slice(0,end);}
test('locale-specific root documents expose correct html language and mirrored route groups',()=>{
 assert.match(fs.readFileSync('src/app/(en)/layout.tsx','utf8'),/<html lang="en">/);
 assert.match(fs.readFileSync('src/app/(uk)/layout.tsx','utf8'),/<html lang="uk">/);
 for(const path of ['page.tsx','templates/page.tsx','templates/[slug]/page.tsx','categories/[slug]/page.tsx','search/page.tsx']){
 assert.ok(fs.existsSync(`src/app/(en)/${path}`)); assert.ok(fs.existsSync(`src/app/(uk)/uk/${path}`));
 }
});
test('switch preserves corresponding URLs and query string; unknown URLs fall back to home',()=>{
 const source=fs.readFileSync('src/components/locale-switch.tsx','utf8');
 const localeSource=fs.readFileSync('src/lib/i18n.ts','utf8');
 const locJs=ts.transpileModule(localeSource,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 const mod={exports:{}};new Function('module','exports',locJs)(mod,mod.exports);
 const fn=ts.transpileModule(extractFunction(source,'localeDestination').replace('export function ','function '),{compilerOptions:{module:ts.ModuleKind.None,target:ts.ScriptTarget.ES2020}}).outputText;
 const get=new Function('localizedPath',`${fn};return localeDestination;`)(mod.exports.localizedPath);
 assert.equal(get('/uk/templates/my-document','q=a&page=2','en'),'/templates/my-document?q=a&page=2');
 assert.equal(get('/templates/my-document','','uk'),'/uk/templates/my-document');
 assert.equal(get('/uk/search','q=test&sort=title','en'),'/search?q=test&sort=title');
 assert.equal(get('/unknown','','uk'),'/uk');
});
test('all dynamic and static routes remain noindex; no fabricated entity hreflang',()=>{
 const entity=fs.readFileSync('src/lib/api/seo.ts','utf8');
 const staticSeo=fs.readFileSync('src/lib/seo.ts','utf8');
 assert.match(entity,/index:false/);assert.doesNotMatch(entity,/languages:/);
 assert.match(staticSeo,/indexingEnabled = false/);
 assert.match(fs.readFileSync('src/app/robots.ts','utf8'),/disallow:'\/'/);
 assert.match(fs.readFileSync('src/app/sitemap.ts','utf8'),/return \[\]/);
});
test('missing resources go to 404, network/JSON errors remain service errors',()=>{
 const pages=fs.readFileSync('src/components/catalog-data-pages.tsx','utf8');
 assert.match(pages,/e.status===404\)notFound\(\)/);
 assert.match(pages,/actual!==locale/);
 const client=fs.readFileSync('src/lib/api/client.ts','utf8');
 assert.match(client,/new ApiError\(503,'Catalog API unreachable'\)/);
 assert.match(client,/new ApiError\(502,'Catalog API returned invalid JSON'\)/);
});
