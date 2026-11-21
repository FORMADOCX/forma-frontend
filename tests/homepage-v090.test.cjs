const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const read=p=>fs.readFileSync(p,'utf8');
function compile(file,exports){
 const js=ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const moduleRef={exports:{}};
 vm.runInNewContext(js,{module:moduleRef,exports:moduleRef.exports,require:()=>({})});
 return moduleRef.exports[exports];
}
const pick=compile('src/lib/homepage-collections.ts','homepageCollections');
const template=id=>({id,slug:`template-${id}`,title:`Document ${id}`,categories:[]});
const page=read('src/components/pages.tsx');
const api=read('src/lib/api/client.ts');
const icons=read('src/components/category-icons.tsx');
const css=read('src/app/globals.css');

test('homepage-only category API is used with the exact CMS filter',()=>{
 assert.match(api,/getHomepageCategories\(lang:Language\)/);
 assert.match(api,/homepage:'true'/);
 assert.match(page,/getHomepageCategories\(locale\)/);
});
test('CMS explicitly enabled categories only, no inferred visibility',()=>{
 assert.match(api,/category\?\.show_on_homepage!==true/);
 assert.doesNotMatch(page,/getCategories\(locale/);
});
test('paginated categories preserve ordering and deduplicate IDs',()=>{
 assert.match(api,/for\(let page=1;page<=100;page\+\+\)/);
 assert.match(api,/if\(!response.next\)return collected/);
 assert.match(api,/seen.has\(category.id\)/);
 assert.match(api,/collected.push\(category\)/);
 assert.match(api,/throw new ApiError\(502/);
});
test('categories hide when empty and real IDs and slugs become links',()=>{
 assert.match(page,/categories.length>0&&<section/);
 assert.match(page,/categories.map\(category=>/);
 assert.match(page,/key=\{category.id\}/);
 assert.match(page,/\/categories\/\$\{category.slug\}/);
});
test('category icons use finite closed registry, unknowns become null',()=>{
 for(const icon of ['briefcase-business','file-text','receipt-text','wallet','calendar-days','user-round','folders','clipboard-list','chart-no-axes-column','calculator','file-spreadsheet','book-open','graduation-cap','house','scale','notebook-pen'])assert.ok(icons.includes(`'${icon}'`),`Missing ${icon}`);
 assert.match(icons,/hasOwnProperty.call\(paths,name\)/);
 assert.match(icons,/\)return null/);
 assert.match(icons,/aria-hidden="true"/);
 assert.doesNotMatch(icons,/dangerouslySetInnerHTML|import\(|fetch\(/);
});
test('categories use API-supplied names not manufactured labels',()=>{
 assert.match(page,/\{category.name\}/);
 assert.match(page,/<CategoryIcon name=\{category.icon\}/);
 assert.doesNotMatch(page,/Business|Invoices|Popular categories/);
});
test('featured list uses real newest sorted API, no fake editorial ranking',()=>{
 assert.match(page,/getTemplates\(\{lang:locale,page:1,page_size:8,sort:'newest'\}\)/);
 assert.match(page,/homepageCollections\(templates\)/);
 assert.doesNotMatch(page,/is_featured|featured_rank|mockTemplates/);
});
test('featured and recently added are disjoint and deterministic',()=>{
 const out=pick(Array.from({length:8},(_,i)=>template(String(i))),4);
 assert.deepEqual(Array.from(out.featured,x=>x.id),['0','1','2','3']);
 assert.deepEqual(Array.from(out.recent,x=>x.id),['4','5','6','7']);
});
test('small catalog hides recent instead of repeating featured',()=>{
 assert.equal(pick([template('one')],4).recent.length,0);
 assert.equal(pick([template('a'),template('b'),template('c'),template('d'),template('e')],4).recent.length,0);
});
test('duplicate IDs do not produce duplicate cards',()=>{
 const result=pick([template('a'),template('a'),template('b'),template('b'),template('c')],4);
 assert.deepEqual(Array.from(result.featured,x=>x.id),['a','b','c']);
});
test('empty catalog hides both template sections',()=>{
 assert.equal(pick([]).featured.length,0);
 assert.equal(pick([]).recent.length,0);
 assert.match(page,/featured.length>0&&<section/);
 assert.match(page,/recent.length>0&&<section/);
});
test('hero is text-first and search uses unchanged functional search form',()=>{
 assert.match(page,/Documents for better work\./);
 assert.match(page,/<SearchSection locale=\{locale\}/);
 assert.doesNotMatch(page,/hero-art|<Image|forma-hero/);
 assert.match(read('src/components/search-form.tsx'),/action=\{localizedPath\(locale,'\/search'\)\}/);
});
test('both EN/UK have localized content with no hardcoded template names',()=>{
 assert.match(page,/Документи для ефективнішої роботи/);
 assert.match(page,/Find\. Preview\. Download\./);
 assert.match(page,/Знайдіть\. Перегляньте\. Завантажте\./);
 assert.doesNotMatch(page,/studio-project-proposal|rent-invoice/);
});
test('API errors are isolated, server-logged and no false empty catalog is shown',()=>{
 assert.match(page,/Promise.allSettled/);
 assert.match(page,/console.error\('\[FORMA homepage\] categories request failed'/);
 assert.match(page,/console.error\('\[FORMA homepage\] templates request failed'/);
 assert.match(page,/role="status"/);
 assert.doesNotMatch(page,/No templates found|No categories found/);
});
test('homepage keeps real TemplateCard and Quick Preview',()=>{
 assert.match(page,/<TemplateCard key=\{template.id\} template=\{template\} locale=\{locale\} featured\/>/);
 assert.match(read('src/components/template-card.tsx'),/<QuickPreview slug=\{template.slug\}/);
 assert.match(read('src/components/template-card.tsx'),/template.cover_preview_url/);
});
test('responsive grids use existing palette and bottom navigation stays',()=>{
 assert.match(css,/\.home-category-grid\{grid-template-columns:repeat\(4/);
 assert.match(css,/@media\(max-width:768px\)\{\.homepage \.home-hero/);
 assert.match(css,/\.home-how-steps\{grid-template-columns:1fr/);
 assert.match(read('src/components/site-shell.tsx'),/<MobileBottomNavigation locale=\{locale\}/);
});
test('one H1, section H2 and nested template H3 headings',()=>{
 assert.equal((page.match(/<h1>/g)||[]).length,1);
 assert.match(page,/<h2 id="home-categories-heading">/);
 assert.match(page,/<h2 id="home-featured-heading">/);
 assert.match(read('src/components/template-card.tsx'),/featured\?<h3>/);
});
test('SEO noindex and template variant selector remain untouched',()=>{
 assert.match(read('src/lib/seo.ts'),/indexingEnabled = false/);
 assert.match(read('src/components/catalog-data-pages.tsx'),/<DocumentDownloadSelector item=\{item\}/);
});
function categoryClient(responses){
 const script=ts.transpileModule(read('src/lib/api/client.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const urls=[];
 let index=0;
 const moduleRef={exports:{}};
 vm.runInNewContext(script,{
  module:moduleRef,exports:moduleRef.exports,
  process:{env:{FORMA_API_URL:'https://api.example.test'}},
  URL,Set,Error,console,
  require:specifier=>{
   if(specifier==='server-only')return {};
   if(specifier.endsWith('normalize-document-urls'))return {normalizeTemplateUrls:x=>x};
   if(specifier.endsWith('query'))return {normalizedAttributes:()=>({})};
   throw Error(`Unexpected module: ${specifier}`);
  },
  fetch:async url=>{
   urls.push(String(url));
   const response=responses[index++];
   if(response instanceof Error)throw response;
   return {ok:true,status:200,json:async()=>response};
  }
 });
 return {getHomepageCategories:moduleRef.exports.getHomepageCategories,urls};
}
test('live client contract: paginated opt-in CMS categories keep order and filter flags',async()=>{
 const selected=(id,enabled=true)=>({id,slug:id,name:id,show_on_homepage:enabled,icon:'file-text'});
 const client=categoryClient([
  {count:4,next:'https://api.example.test/api/v1/categories/?page=2',results:[selected('first'),selected('hidden',false),selected('second')]},
  {count:4,next:null,results:[selected('first'),selected('third')]}
 ]);
 const categories=await client.getHomepageCategories('uk');
 assert.deepEqual(Array.from(categories,x=>x.id),['first','second','third']);
 assert.equal(client.urls.length,2);
 for(const u of client.urls){const url=new URL(u);assert.equal(url.searchParams.get('homepage'),'true');assert.equal(url.searchParams.get('lang'),'uk');}
 assert.equal(new URL(client.urls[1]).searchParams.get('page'),'2');
});
test('live client contract: no enabled categories returns []',async()=>{
 const client=categoryClient([{count:1,next:null,results:[{id:'hidden',slug:'hidden',show_on_homepage:false}]}]);
 assert.equal((await client.getHomepageCategories('en')).length,0);
});
test('live client contract: unreachable CMS API rejects rather than fabricating content',async()=>{
 const client=categoryClient([new Error('network unavailable')]);
 await assert.rejects(()=>client.getHomepageCategories('en'),/Catalog API unreachable/);
});
