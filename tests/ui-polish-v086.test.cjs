const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=(name)=>fs.readFileSync(path.join(root,name),'utf8');

test('brand icons are valid SVG/PNG with native signatures',()=>{
 const svg=read('src/app/icon.svg');assert.match(svg,/<svg\s/);assert.match(svg,/viewBox="0 0 64 64"/);
 for(const name of ['favicon-16.png','favicon-32.png','apple-icon.png']){
  const b=fs.readFileSync(path.join(root,'src/app',name));assert.deepEqual([...b.subarray(0,8)],[137,80,78,71,13,10,26,10]);
 }
});
test('search magnifier is a real submit button; enter uses identical form action',()=>{
 const s=read('src/components/search-form.tsx');assert.match(s,/<form method="get" action=\{localizedPath\(locale,'\/search'\)\}/);
 assert.match(s,/type="submit" className="search-magnifier"/);assert.match(s,/aria-label=/);assert.match(s,/name="q"/);
 assert.doesNotMatch(s,/<span aria-hidden="true" className="search-magnifier"/);
});
test('featured sections are conditional and error states remain distinct',()=>{
 const s=read('src/components/pages.tsx');assert.match(s,/actualCategories.length>0&&<section className="section section-border home-categories"/);
 assert.match(s,/actualTemplates.length>0&&<section className="section section-border home-featured"/);
 assert.match(s,/templates.status==='rejected'&&<p role="alert"/);
 assert.match(s,/categories.status==='rejected'&&<p role="alert"/);
});
test('skip-to-content is keyboard-revealed and targets main',()=>{
 const shell=read('src/components/site-shell.tsx'),css=read('src/app/globals.css');assert.match(shell,/href="#content" className="skip-link"/);assert.match(shell,/<main id="content" tabIndex=\{-1\}>/);
 assert.match(css,/\.skip-link:focus-visible/);assert.match(css,/transform:translateY\(-160%\)/);
});
test('shared document lightbox uses real trusted URLs and native modal, supports keyboard and zoom',()=>{
 const lb=read('src/components/document-lightbox.tsx');assert.match(lb,/showModal\(\)/);assert.match(lb,/onClose=/);assert.match(lb,/onClick=\{event=>\{if\(event.target===dialog.current\)close\(\)\}\}/);
 assert.match(lb,/ArrowRight/);assert.match(lb,/ArrowLeft/);assert.match(lb,/setScale/);assert.match(lb,/pages.length/);assert.match(lb,/unoptimized=/);
 const gal=read('src/components/document-gallery.tsx'),qp=read('src/components/quick-preview.tsx');assert.match(gal,/DocumentLightbox/);assert.match(gal,/getPreviewSource\(p.url,backendOrigin\)/);
 assert.match(qp,/DocumentLightbox/);assert.match(qp,/getPreviewSource\(data.cover_preview_url,backendOrigin\)/);
});
test('shared loading indicator used by route loaders and Quick Preview',()=>{
 const loader=read('src/components/loading-indicator.tsx');assert.match(loader,/role="status"/);assert.match(loader,/forma-loading-symbol/);
 assert.match(read('src/components/quick-preview.tsx'),/LoadingIndicator locale=\{locale\}/);
 const pages=['src/app/(en)/templates/loading.tsx','src/app/(uk)/uk/templates/loading.tsx'];
 for(const p of pages)assert.match(read(p),/LoadingIndicator/);
});
test('unified editorial dropdowns retain submitted category, sort and format values',()=>{
 const css=read('src/app/globals.css');assert.match(css,/\.forma-select-menu/);assert.match(css,/\.forma-select-option/);
 const select=read('src/components/forma-select.tsx');assert.match(select,/role="listbox"/);assert.match(select,/type="hidden" name=\{name\}/);
 const catalog=read('src/components/catalog.tsx');assert.match(catalog,/FormaSelect name="sort"/);assert.match(catalog,/FormaSelect name="category"/);
 assert.match(read('src/components/catalog-filters.tsx'),/<FormaSelect label=/);
});
test('numbered pagination keeps all Django catalog filters and valid limits',()=>{
 const pagination=read('src/components/catalog-pagination.tsx');assert.match(pagination,/Math.ceil\(count\/params.page_size\)/);
 assert.match(pagination,/catalogHref\(base,params,\{page\}\)/);assert.match(pagination,/aria-current=\{page===current\?'page':undefined\}/);
 assert.match(pagination,/current>1/);assert.match(pagination,/current<total/);assert.match(pagination,/paginationPages\(current,total\)/);
 assert.match(read('src/components/catalog.tsx'),/<CatalogPagination base=\{base\} params=\{params\} count=\{items.count\} locale=\{locale\}/);
 const query=read('src/lib/api/query.ts');assert.match(query,/rawAttributes/);assert.match(query,/rawFormat/);
});
test('interactive cursor and isolated image zoom respect reduced motion',()=>{
 const css=read('src/app/globals.css');assert.match(css,/cursor:pointer/);
 assert.match(css,/\.template-card:hover \.template-card-media img/);assert.match(css,/scale\(1\.03\)/);
 assert.match(css,/@media\(hover:hover\) and \(pointer:fine\)/);assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(css,/\.template-card-media img.*transition:transform \.25s ease/);
});
test('publishing stays admin only, no backend contract changed',()=>{
 const s=read('src/components/site-shell.tsx');assert.doesNotMatch(s,/\/submit|SubmissionForm/);
 for(const p of ['src/app/(en)/submit/page.tsx','src/app/(uk)/uk/submit/page.tsx'])assert.match(read(p),/notFound\(\)/);
 assert.equal(JSON.parse(read('package.json')).version,'0.8.7');
});
