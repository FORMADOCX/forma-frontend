const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const read=file=>fs.readFileSync(file,'utf8');

function apiWith(fetchImpl){
 const js=ts.transpileModule(read('src/lib/api/client.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const compiledModule={exports:{}};
 new Function('require','module','exports','process','fetch',js)(name=>{
  if(name==='./query') return {normalizedAttributes:()=>({})};
  if(name==='./normalize-document-urls') return {normalizeTemplateUrls:v=>v};
  return {};
 },compiledModule,compiledModule.exports,{env:{FORMA_API_URL:'https://api.example.test'}},fetchImpl);
 return compiledModule.exports;
}
function page(items,next=null){return {count:items.length,next,previous:null,results:items};}
function category(id,visible=true){return {id,slug:id,name:id,icon:'file-text',show_on_homepage:visible};}

test('homepage CMS endpoint requests homepage=true with EN/UK locale and follows multiple pages',async()=>{
 const urls=[];
 const fetchImpl=async url=>{
  urls.push(new URL(url));
  const p=new URL(url).searchParams.get('page');
  return {ok:true,json:async()=>p==='1'?page([category('one'),category('hidden',false)],'https://api.example.test/api/v1/categories/?lang=uk&homepage=true&page=2&page_size=100'):page([category('two'),category('one')])};
 };
 const items=await apiWith(fetchImpl).getHomepageCategories('uk');
 assert.deepEqual(items.map(c=>c.slug),['one','two']);
 assert.equal(urls.length,2);
 assert.ok(urls.every(u=>u.pathname==='/api/v1/categories/'&&u.searchParams.get('homepage')==='true'&&u.searchParams.get('lang')==='uk'));
});
test('an empty homepage CMS response does not fall back to generic categories',async()=>{
 let calls=0;
 const items=await apiWith(async()=>{calls++;return {ok:true,json:async()=>page([])};}).getHomepageCategories('en');
 assert.deepEqual(items,[]);assert.equal(calls,1);
 const jsx=read('src/components/pages.tsx');
 assert.match(jsx,/actualCategories\.length>0&&<section className="section section-border home-categories"/);
});
test('unsafe pagination URLs are rejected, rather than fetched',async()=>{
 let calls=0;
 const api=apiWith(async()=>{calls++;return {ok:true,json:async()=>page([category('one')],'https://unsafe.example/api/v1/categories/?homepage=true&lang=en&page=2')};});
 await assert.rejects(api.getHomepageCategories('en'),/Invalid categories pagination URL/);
 assert.equal(calls,1);
});
test('icon component has a controlled registry and does not interpolate untrusted HTML',()=>{
 const icons=read('src/components/category-icon.tsx');
 for(const name of ['briefcase-business','file-text','receipt-text','wallet','calendar-days','user-round','folders','clipboard-list','chart-no-axes-column','calculator','file-spreadsheet','book-open','graduation-cap','house','scale','notebook-pen']) assert.ok(icons.includes(name));
 assert.match(icons,/if \(!symbol\) return null/);
 assert.match(icons,/aria-hidden="true"/);
 assert.doesNotMatch(icons,/dangerouslySetInnerHTML|<img|dynamic\(/);
});
test('existing hero, cards, search, quick preview, and template download variant components remain intact',()=>{
 const page=read('src/components/pages.tsx');
 assert.match(page,/<Image src="\/images\/forma-hero\.webp" alt="" fill priority/);
 assert.match(page,/<SearchSection locale=\{locale\}\/>/);
 assert.match(page,/<TemplateCard key=\{item\.id\} template=\{item\} locale=\{locale\} featured\/>/);
 assert.match(page,/getCategories\(locale,1,8\)/); // Original hero links remain independent.
 assert.match(read('src/components/template-card.tsx'),/<QuickPreview slug=\{template\.slug\}/);
 assert.match(read('src/components/catalog-data-pages.tsx'),/<TemplateDocumentSelection key=\{item.slug\}/);
 assert.ok(fs.statSync('public/images/forma-hero.webp').size>1000);
});
test('one new explanation section follows Featured Templates, with localized copy',()=>{
 const page=read('src/components/pages.tsx');
 assert.ok(page.indexOf('home-how')>page.indexOf('home-featured'));
 assert.match(page,/aria-labelledby="home-how-title"/);
 assert.match(page,/<ol className="home-how-steps">/);
 const i18n=read('src/lib/i18n.ts');
 assert.match(i18n,/Find\. Preview\. Download\./);
 assert.match(i18n,/Знайдіть\. Перегляньте\. Завантажте\./);
});
test('homepage CSS changes are limited to scoped category icon and explanation selectors',()=>{
 const css=read('src/app/globals.css');
 assert.match(css,/\.home-category-icon\{/);
 assert.match(css,/\.home-how-steps\{/);
 assert.match(css,/@media\(max-width:520px\)\{\.home-how-steps/);
 assert.match(read('src/lib/seo.ts'),/indexingEnabled = false/);
});
