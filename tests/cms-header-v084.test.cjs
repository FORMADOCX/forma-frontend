const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const vm=require('node:vm');
const root=require('node:path').join(__dirname,'..');
function loadNavigation(list,details){
 const source=fs.readFileSync(`${root}/src/lib/api/cms-navigation.ts`,'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const calls={list:[],detail:[]};
 const exports={};
 vm.runInNewContext(js,{exports,Set,Promise,require:(name)=>{
  if(name==='server-only')return {};
  if(name==='./cms')return {
   getCmsPages:async(locale,page)=>{calls.list.push({locale,page});return typeof list==='function'?list(locale,page):list},
   getCmsPage:async(slug,locale)=>{calls.detail.push({slug,locale});const value=details[`${locale}:${slug}`];if(value instanceof Error)throw value;return value}
  };
  throw Error(`Unexpected import ${name}`);
 }},{filename:'cms-navigation.js'});
 return {getCmsNavigation:exports.getCmsNavigation,calls};
}
const make=(slug,flags={})=>({slug,title:slug,locale:'en',show_in_navigation:false,show_in_footer:false,...flags});
const response=(pages,next=null)=>({results:pages.map(p=>({slug:p.slug,title:p.title,locale:p.locale,available_translations:[p.locale],summary:''})),next,count:pages.length});
const plain=async result=>({headerLinks:JSON.parse(JSON.stringify(result.headerLinks)),footerLinks:JSON.parse(JSON.stringify(result.footerLinks))});

test('all four independent visibility combinations; single detail fetch per page',async()=>{
 const pages=[make('header',{show_in_navigation:true}),make('footer',{show_in_footer:true}),make('both',{show_in_navigation:true,show_in_footer:true}),make('neither')];
 const details=Object.fromEntries(pages.map(p=>[`en:${p.slug}`,p]));
 const {getCmsNavigation,calls}=loadNavigation(response(pages),details);
 const menus=await plain(await getCmsNavigation('en'));
 assert.deepEqual(menus.headerLinks.map(p=>p.slug),['header','both']);
 assert.deepEqual(menus.footerLinks.map(p=>p.slug),['footer','both']);
 assert.deepEqual(calls.detail.map(p=>p.slug),['header','footer','both','neither']);
 assert.equal(calls.list.length,1);
});
test('sort_order from detail is respected; absent sort_order retains API order',async()=>{
 const pages=[make('last',{sort_order:10,show_in_navigation:true}),make('first',{sort_order:0,show_in_navigation:true}),make('middle',{sort_order:5,show_in_navigation:true})];
 const details=Object.fromEntries(pages.map(p=>[`en:${p.slug}`,p]));
 const {getCmsNavigation}=loadNavigation(response(pages),details);
 assert.deepEqual((await plain(await getCmsNavigation('en'))).headerLinks.map(p=>p.slug),['first','middle','last']);
 const unsorted=pages.map(p=>{const copy={...p};delete copy.sort_order;return copy});
 const {getCmsNavigation:withoutOrder}=loadNavigation(response(unsorted),Object.fromEntries(unsorted.map(p=>[`en:${p.slug}`,p])));
 assert.deepEqual((await plain(await withoutOrder('en'))).headerLinks.map(p=>p.slug),['last','first','middle']);
});
test('localized EN/UK menus use real translated titles and reject English fallback',async()=>{
 const en=[make('about',{title:'About',show_in_navigation:true})];
 const uk=[make('about',{locale:'uk',title:'Про нас',show_in_navigation:true}),make('fallback',{locale:'uk'})];
 const details={'en:about':en[0],'uk:about':uk[0],'uk:fallback':make('fallback',{locale:'en',show_in_navigation:true})};
 const {getCmsNavigation}=loadNavigation((locale)=>response(locale==='en'?en:uk),details);
 assert.deepEqual((await plain(await getCmsNavigation('uk'))).headerLinks,[{slug:'about',title:'Про нас'}]);
 assert.deepEqual((await plain(await getCmsNavigation('en'))).headerLinks,[{slug:'about',title:'About'}]);
});
test('unpublished/missing CMS details are skipped; list failure yields empty menus',async()=>{
 const pages=[make('good',{show_in_footer:true}),make('draft',{show_in_navigation:true}),make('broken')];
 const details={'en:good':pages[0],'en:draft':new Error('404'),'en:broken':new Error('503')};
 const {getCmsNavigation}=loadNavigation(response(pages),details);
 assert.deepEqual(await plain(await getCmsNavigation('en')),{headerLinks:[],footerLinks:[{slug:'good',title:'good'}]});
 const failed=loadNavigation(()=>{throw new Error('503')},{});
 assert.deepEqual(await plain(await failed.getCmsNavigation('en')),{headerLinks:[],footerLinks:[]});
});
test('pagination, deduplication, and six-at-a-time detail batches',async()=>{
 const pages=Array.from({length:9},(_,i)=>make(`page-${i}`,{show_in_navigation:true}));
 const detail=Object.fromEntries(pages.map(p=>[`en:${p.slug}`,p]));
 const {getCmsNavigation,calls}=loadNavigation((locale,page)=>page===1?response(pages.slice(0,8),'next'):response([pages[0],pages[8]]),detail);
 const menus=await plain(await getCmsNavigation('en'));
 assert.equal(menus.headerLinks.length,9);assert.equal(calls.detail.length,9);assert.equal(calls.list.length,2);
});
test('desktop header renders CMS links; mobile has no hamburger, footer renders independently',()=>{
 const jsxRuntime={jsx:(type,props)=>({type,props}),jsxs:(type,props)=>({type,props})};
 const source=fs.readFileSync(`${root}/src/components/site-shell.tsx`,'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 const compiledModule={exports:{}};
 const stubs={
  'next/link':{__esModule:true,default:'LINK'},
  react:{Suspense:'Suspense'},
  './locale-switch':{LocaleSwitch:'LocaleSwitch'},
  '@/lib/i18n':{localizedPath:(locale,path='/')=>locale==='uk'?`/uk${path==='/ ' ? '' : path==='/'?'':path}`:path,dictionary:{en:{categories:'Categories',templates:'Templates',search:'Search',footer:'Text'},uk:{categories:'Категорії',templates:'Шаблони',search:'Пошук',footer:'Текст'}}},
  '@/lib/api/cms-navigation':{getCmsNavigation:async()=>({headerLinks:[],footerLinks:[]})},
  './search-form':{SearchForm:'SearchForm'},'./mobile-bottom-navigation':{MobileBottomNavigation:'MobileBottomNavigation'},'react/jsx-runtime':jsxRuntime
 };
 new Function('module','exports','require',js)(compiledModule,compiledModule.exports,name=>{if(name in stubs)return stubs[name];throw Error(name)});
 const {Header,Footer}=compiledModule.exports;
 function collect(node,items=[]){if(Array.isArray(node))node.forEach(n=>collect(n,items));else if(node&&typeof node==='object'){if(node.type==='LINK')items.push(node.props);collect(node.props?.children,items)}return items}
 for(const locale of ['en','uk']){
  const cms=[{slug:'about',title:locale==='uk'?'Про нас':'About'}];
  const header=Header({locale,headerLinks:cms});
  const found=collect(header).filter(p=>p.children===cms[0].title);
  assert.equal(found.length,1);assert.ok(found.every(p=>p.href===(locale==='uk'?'/uk/about':'/about')));
  const footer=collect(Footer({locale,pages:cms})).filter(p=>p.children===cms[0].title);
  assert.equal(footer.length,1);
 }
});
