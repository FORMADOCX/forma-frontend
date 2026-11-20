const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const js=ts.transpileModule(read('src/lib/breadcrumbs.ts'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const moduleExports={};
vm.runInNewContext(js,{exports:moduleExports,require:name=>{
 if(name==='./i18n')return {dictionary:{en:{searchTitle:'Search templates',templates:'All Templates'},uk:{searchTitle:'Пошук шаблонів',templates:'Усі шаблони'}}};
 throw Error(name);
}});
const plain=x=>JSON.parse(JSON.stringify(x));
test('category breadcrumbs are Home / Category in both locales, independent of nesting',()=>{
 const cat={slug:'invoices',name:'Invoices',parent_slug:'business'};
 assert.deepEqual(plain(moduleExports.categoryBreadcrumbs('en',cat)),[{name:'Home',path:'/'},{name:'Invoices',path:'/categories/invoices'}]);
 assert.deepEqual(plain(moduleExports.categoryBreadcrumbs('uk',{...cat,name:'Рахунки'})),[{name:'Головна',path:'/'},{name:'Рахунки',path:'/categories/invoices'}]);
 const page=read('src/components/catalog-data-pages.tsx');
 assert.match(page,/categoryBreadcrumbs\(locale,category\)/);
 assert.doesNotMatch(page,/getCategory\(category\.parent_slug,locale\)/);
});
test('search breadcrumbs show actual query and preserve URL-safe encoding for EN and UK',()=>{
 assert.deepEqual(plain(moduleExports.searchBreadcrumbs('en','  rent invoice  ')),[{name:'Home',path:'/'},{name:'rent invoice',path:'/search?q=rent%20invoice'}]);
 assert.deepEqual(plain(moduleExports.searchBreadcrumbs('uk','рахунок & оренда')),[{name:'Головна',path:'/'},{name:'рахунок & оренда',path:'/search?q='+encodeURIComponent('рахунок & оренда')}]);
});
test('empty search query has localized search page label, not empty breadcrumb',()=>{
 assert.deepEqual(plain(moduleExports.searchBreadcrumbs('en','')),[{name:'Home',path:'/'},{name:'Search templates',path:'/search'}]);
 assert.deepEqual(plain(moduleExports.searchBreadcrumbs('uk','  ')),[{name:'Головна',path:'/'},{name:'Пошук шаблонів',path:'/search'}]);
});
test('search route renders semantic shared breadcrumbs from parsed query; JSON-LD shares items',()=>{
 const catalog=read('src/components/catalog.tsx');
 const crumb=read('src/components/breadcrumbs.tsx');
 assert.match(catalog,/search&&!embedded&&<Breadcrumbs locale=\{locale\} items=\{searchBreadcrumbs\(locale,params\.q\)\}\/>/);
 assert.match(crumb,/breadcrumbData\(locale,\[\.\.\.items\]\)/);
 assert.match(crumb,/aria-current="page"/);
 assert.match(crumb,/localizedPath\(locale,item\.path\)/);
});
test('template breadcrumbs remain unchanged with explicit category and uncategorized fallback',()=>{
 assert.deepEqual(plain(moduleExports.templateBreadcrumbs('en','My Invoice','my-invoice',{slug:'invoices',name:'Invoices'})).map(x=>x.path),['/','/categories/invoices','/templates/my-invoice']);
 assert.deepEqual(plain(moduleExports.templateBreadcrumbs('en','My Invoice','my-invoice',null)).map(x=>x.path),['/','/templates','/templates/my-invoice']);
});
