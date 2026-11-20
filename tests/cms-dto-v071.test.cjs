const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
const root=path.join(__dirname,'..');
const load=name=>JSON.parse(fs.readFileSync(path.join(__dirname,'fixtures/cms-v071',name),'utf8'));
function client(getResponse){
 const source=fs.readFileSync(path.join(root,'src/lib/api/cms.ts'),'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 class ApiError extends Error {constructor(status,message){super(message);this.status=status}}
 const exports={};
 const context={exports,process:{env:{FORMA_API_URL:'http://127.0.0.1:8000'}},URL,Set,encodeURIComponent,
  fetch:async url=>{const response=await getResponse(String(url));if(response instanceof Error)throw response;return {ok:response.status>=200&&response.status<300,status:response.status,json:async()=>response.data}},
  require(id){if(id==='server-only')return {};if(id==='./client')return {ApiError};throw Error(`Unexpected import ${id}`)}};
 vm.runInNewContext(js,context,{filename:'cms.js'});
 return {api:exports,ApiError};
}
test('v0.7.1 Page List accepts locale and missing visibility flags',async()=>{
 const {api}=client(()=>({status:200,data:load('page-list.json')}));
 const data=await api.getCmsPages('en');
 assert.equal(data.count,2);assert.equal(data.results[0].locale,'en');
 assert.equal(Object.hasOwn(data.results[0],'show_in_navigation'),false);
 assert.equal(data.results[0].available_translations[1],'uk');
});
test('published Page Detail accepts locale, SEO and hidden-in-navigation visibility',async()=>{
 const {api}=client(()=>({status:200,data:load('page-detail.json')}));
 const p=await api.getCmsPage('about','en');
 assert.equal(p.show_in_navigation,false);assert.equal(p.show_in_footer,true);
 assert.equal(p.seo.title,'About FORMA');assert.equal(p.locale,'en');
});
test('fallback English detail reports real locale and no fabricated Ukrainian translation',async()=>{
 const {api}=client(()=>({status:200,data:load('english-fallback.json')}));
 const p=await api.getCmsPage('privacy','uk');
 assert.equal(p.locale,'en');assert.deepEqual(Array.from(p.available_translations),['en']);
});
test('unpublished resource 404 stays a 404',async()=>{
 const {api}=client(()=>({status:404,data:{detail:'Not found.'}}));
 await assert.rejects(()=>api.getCmsPage('draft','en'),e=>e.status===404);
});
test('unpublished detail is rejected if status is present',async()=>{
 const data={...load('page-detail.json'),status:'archived'};
 const {api}=client(()=>({status:200,data}));
 await assert.rejects(()=>api.getCmsPage('about','en'),e=>e.status===404);
});
test('bad locale or missing translations fail rather than rendering invented data',async()=>{
 const detail={...load('page-detail.json'),locale:'de'};
 const {api}=client(()=>({status:200,data:detail}));
 await assert.rejects(()=>api.getCmsPage('about','en'),e=>e.status===502);
});
test('CMS route metadata and sitemap use locale rather than nonexistent language',()=>{
 for(const f of ['src/components/cms-page.tsx','src/app/sitemap.ts','src/app/(en)/about/page.tsx','src/app/(uk)/uk/about/page.tsx']){
  const s=fs.readFileSync(path.join(root,f),'utf8');assert.doesNotMatch(s,/\bp\.language\b|\bpage\.language\b/);
 }
 const shell=fs.readFileSync(path.join(root,'src/components/site-shell.tsx'),'utf8');
 assert.match(shell,/getCmsNavigation\(locale\)/);
 assert.match(shell,/headerLinks=\{headerLinks\}/);
 assert.match(shell,/pages=\{footerLinks\}/);
});
