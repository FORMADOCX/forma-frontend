const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('typescript');
const root=path.join(__dirname,'..');
const source=(name)=>fs.readFileSync(path.join(root,name),'utf8');
const nav=source('src/components/mobile-bottom-navigation.tsx');
const shell=source('src/components/site-shell.tsx');
const filters=source('src/components/catalog-filters.tsx');
const css=source('src/app/globals.css');
const detail=source('src/components/catalog-data-pages.tsx');
function activeSection(pathname){
 const js=ts.transpileModule(nav,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};
 vm.runInNewContext(js,{module,exports:module.exports,require:(id)=>id==='react/jsx-runtime'?{jsx:()=>null,jsxs:()=>null,Fragment:'Fragment'}:id==='next/link'?{default:'LINK'}:id==='next/navigation'?{usePathname:()=>'/'}:id==='@/lib/i18n'?{localizedPath:()=>'/'}:{},Object});
 return module.exports.activeMobileSection(pathname);
}
test('mobile bottom navigation active route includes EN/UK templates categories search and no false home on CMS pages',()=>{
 const active=activeSection;
 assert.equal(active('/'),'home');assert.equal(active('/uk'),'home');
 for(const path of ['/templates','/uk/templates','/categories/invoices','/uk/categories/invoices','/templates/an-invoice'])assert.equal(active(path),'templates');
 assert.equal(active('/search'),'search');assert.equal(active('/uk/search'),'search');
 assert.equal(active('/about'),null);
});
test('bottom navigation has exactly three real localized Next Links and active indication',()=>{
 assert.match(nav,/\['home'/);assert.match(nav,/\['templates'/);assert.match(nav,/\['search'/);
 assert.match(nav,/<Link key=\{key\} href=\{href\}/);
 assert.match(nav,/aria-current=\{key===active\?'page':undefined\}/);
 assert.match(nav,/localizedPath\(locale,'\/templates'\)/);
 assert.match(nav,/localizedPath\(locale,'\/search'\)/);
 assert.match(shell,/<MobileBottomNavigation locale=\{locale\}\/>/);
});
test('mobile header leaves Categories/CMS links but does not duplicate bottom navigation',()=>{
 const menu=shell.match(/<details className="mobile-navigation">([\s\S]*?)<\/details>/);
 assert.ok(menu);
 assert.match(menu[0],/categories/);
 assert.match(menu[0],/headerLinks\.map/);
 assert.doesNotMatch(menu[0],/localizedPath\(locale,'\/templates'\)/);
 assert.doesNotMatch(menu[0],/localizedPath\(locale,'\/search'\)/);
});
test('bottom navigation is mobile-only, respects iPhone safe area and reserves content space',()=>{
 assert.match(css,/\.mobile-bottom-navigation\{display:none\}/);
 assert.match(css,/@media\(max-width:767px\)/);
 assert.match(css,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
 assert.match(css,/env\(safe-area-inset-bottom,0px\)/);
 assert.match(css,/body\{padding-bottom:calc\(66px/);
});
test('existing real mobile filters are shown through native dialog styled as bottom sheet',()=>{
 assert.match(filters,/dialog\.current\?\.showModal\(\)/);
 assert.match(filters,/useRouter/);
 assert.match(filters,/applyCatalogFilters\(params,format,selection\)/);
 assert.match(filters,/clearCatalogFilters\(params\)/);
 assert.match(filters,/aria-modal="true"/);
 assert.match(filters,/document\.body\.style\.overflow='hidden'/);
 assert.match(css,/\.filter-mobile-dialog\{position:fixed;inset:auto 0 0/);
 assert.match(css,/overscroll-behavior:contain/);
});
test('real document display precedes download on mobile and never crops real preview',()=>{
 assert.match(css,/\.detail-summary>h1\{order:1/);
 assert.match(css,/\.detail-summary>\.lead\{order:2/);
 assert.match(css,/\.detail-gallery-column\{order:3/);
 assert.match(css,/\.mobile-detail-formats\{order:6/);
 assert.match(css,/\.detail-summary>\.detail-actions\{order:7/);
 assert.match(css,/\.gallery-frame \.gallery-image\{height:auto;max-height:none;width:100%;object-fit:contain\}/);
 assert.match(detail,/DocumentGallery previews=\{item\.previews\?\?\[\]\}/);
});
test('small screen cards are tap navigable, with no mobile Quick Preview',()=>{
 const card=source('src/components/template-card.tsx');
 assert.match(card,/<Link className="template-card-cover" href=\{href\}/);
 assert.match(css,/@media\(max-width:767px\)\{\.template-card-hover-actions\{display:none!important\}/);
 assert.match(css,/@media\(max-width:359px\)/);
});
test('no new public account/PWA/submission functionality or indexing policy changes',()=>{
 assert.doesNotMatch(nav,/profile|favorites|notifications|serviceWorker|\/submit/i);
 const indexing=source('.env.example');
 assert.match(indexing,/FORMA_ENABLE_INDEXING/);
});
