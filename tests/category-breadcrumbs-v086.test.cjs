const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
const root=path.resolve(__dirname,'..');
const source=name=>fs.readFileSync(path.join(root,name),'utf8');
function loadBreadcrumbs(){
 const js=ts.transpileModule(source('src/lib/breadcrumbs.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={};
 vm.runInNewContext(js,{exports,require:name=>{if(name==='./i18n')return {dictionary:{en:{templates:'All Templates',categories:'Categories'},uk:{templates:'Усі шаблони',categories:'Категорії'}}};throw Error(name)}},{filename:'breadcrumbs.js'});
 return exports;
}
const helpers=loadBreadcrumbs();
const plain=value=>JSON.parse(JSON.stringify(value));
test('uncategorized template breadcrumb uses Home / All Templates / Title',()=>{
 assert.equal(helpers.selectBreadcrumbCategory([]),null);
 assert.deepEqual(plain(helpers.templateBreadcrumbs('en','Clean Invoice','clean-invoice',null)),[
  {name:'Home',path:'/'},{name:'All Templates',path:'/templates'},{name:'Clean Invoice',path:'/templates/clean-invoice'}]);
});
test('first-level category replaces All Templates with direct localized category link',()=>{
 const category={slug:'business',name:'Business'};
 assert.deepEqual(plain(helpers.templateBreadcrumbs('en','Invoice','invoice',category)).map(x=>x.path),['/','/categories/business','/templates/invoice']);
});
test('second-level category is the only category in template breadcrumbs; no parent added',()=>{
 const category={slug:'invoices',name:'Invoices'};
 assert.deepEqual(plain(helpers.templateBreadcrumbs('uk','Рахунок','invoice',category)),[
  {name:'Головна',path:'/'},{name:'Invoices',path:'/categories/invoices'},{name:'Рахунок',path:'/templates/invoice'}]);
});
test('multiple categories are selected deterministically by public slug, not input ordering',()=>{
 const categories=[{slug:'z-tax',name:'Tax'},{slug:'b-budget',name:'Budget'},{slug:'a-invoice',name:'Invoice'}];
 const chosen=helpers.selectBreadcrumbCategory(categories);
 assert.equal(chosen.slug,'a-invoice');
 assert.equal(helpers.selectBreadcrumbCategory(categories.slice().reverse()).slug,chosen.slug);
 assert.equal(helpers.selectBreadcrumbCategory([categories[1],categories[2],categories[0]]).slug,chosen.slug);
 assert.deepEqual(plain(categories),[{slug:'z-tax',name:'Tax'},{slug:'b-budget',name:'Budget'},{slug:'a-invoice',name:'Invoice'}]);
});
test('missing or invalid public categories fall back safely without invented ancestors',()=>{
 assert.equal(helpers.selectBreadcrumbCategory(null),null);
 assert.equal(helpers.selectBreadcrumbCategory([{slug:'',name:'No slug'},{slug:'good',name:' '}]),null);
 assert.deepEqual(plain(helpers.categoryBreadcrumbs('en',{slug:'invoice',name:'Invoice'},null)).map(x=>x.path),['/','/categories','/categories/invoice']);
});
test('category page can show actual parent, unlike shortened template breadcrumb',()=>{
 const parent={slug:'business',name:'Business'},child={slug:'invoices',name:'Invoices'};
 assert.deepEqual(plain(helpers.categoryBreadcrumbs('en',child,parent)).map(x=>x.path),['/','/categories','/categories/business','/categories/invoices']);
 assert.deepEqual(plain(helpers.templateBreadcrumbs('en','Invoice','invoice',child)).map(x=>x.path),['/','/categories/invoices','/templates/invoice']);
});
test('UI breadcrumb and JSON-LD consume one shared array with current item not linked',()=>{
 const jsx=source('src/components/breadcrumbs.tsx');
 assert.match(jsx,/breadcrumbData\(locale,\[\.\.\.items\]\)/);
 assert.match(jsx,/<nav aria-label="Breadcrumb"/);
 assert.match(jsx,/aria-current="page"/);
 assert.match(jsx,/i===items\.length-1\?/);
 assert.match(jsx,/localizedPath\(locale,item\.path\)/);
 const json=source('src/lib/json-ld.tsx');
 assert.match(json,/position:i\+1,name:p\.name,item:siteUrl\+localizedPath\(locale,p\.path\)/);
});
test('detail and category routes load only actual Django DTOs and preserve backend filtering / 404',()=>{
 const page=source('src/components/catalog-data-pages.tsx');
 assert.match(page,/getTemplate\(slug,locale\)/);
 assert.match(page,/selectBreadcrumbCategory\(item\.categories\)/);
 assert.match(page,/getTemplates\(\{lang:locale,category:chosenCategory\.slug/);
 assert.match(page,/getCategory\(category\.parent_slug,locale\)/);
 assert.match(page,/fixedCategory=\{slug\}/);
 assert.match(page,/e\.status===404\)notFound\(\)/);
 assert.doesNotMatch(page,/item\.categories\[0\]/);
});
