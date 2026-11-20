const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=(file)=>fs.readFileSync(file,'utf8');

test('public header has navigation, search, locale switch and no customer authentication',()=>{
 const src=read('src/components/site-shell.tsx');
 assert.match(src,/className="wordmark"/);
 assert.match(src,/\/templates/);assert.match(src,/\/categories/);assert.doesNotMatch(src,/localizedPath\(locale,\s*['"]\/about['"]\)/);
 assert.match(src,/<SearchForm locale=\{locale\} compact\/>/);
 assert.match(src,/<LocaleSwitch locale=\{locale\}\/>/);
 assert.match(src,/mobile-navigation/);
 assert.doesNotMatch(src,/Sign In|Log In|Register|Create Account|login\/|register\/|account dropdown/i);
});

test('homepage featured data derive from live catalog and hero uses a separate editorial artwork',()=>{
 const src=read('src/components/pages.tsx');
 assert.match(src,/getTemplates\(\{lang:locale,page_size:8\}\)/);
 assert.match(src,/getCategories\(locale,1,8\)/);
 assert.match(src,/\/images\/forma-hero\.webp/);
 assert.doesNotMatch(src,/showcase\.cover_preview_url/);
 assert.match(src,/actualCategories\.slice\(0,5\)/);
 assert.match(src,/actualTemplates\.slice\(0,5\)/);
 assert.doesNotMatch(src,/placeholder\.png|fake-templates|mockTemplates/);
});

test('template card links real preview, details and preserved live Quick Preview',()=>{
 const src=read('src/components/template-card.tsx');
 assert.match(src,/template\.cover_preview_url/);
 assert.match(src,/\/templates\/\$\{template\.slug\}/);
 assert.match(src,/<QuickPreview slug=\{template.slug\}/);
 assert.match(src,/backendOrigin=\{getBrowserApiOrigin\(\)/);
});

test('detail binds real gallery pages, attributes and controlled download URLs',()=>{
 const src=read('src/components/catalog-data-pages.tsx');
 const gallery=read('src/components/document-gallery.tsx');
 assert.match(src,/previews=\{item\.previews\?\?\[\]\}/);
 assert.match(src,/getDownloadUrl\(file,item.slug,backendOrigin\)/);
 assert.match(src,/item\.attributes\.map/);
 assert.match(src,/firstDownload\?\.url/);
 assert.match(src,/<QuickPreview slug=\{item.slug\}/);
 assert.match(gallery,/groupDocumentPreviews\(previews,formats\)/);
 assert.match(gallery,/getPreviewSource\(p\.url,backendOrigin\)/);
 assert.match(gallery,/aria-current=\{index===activePageIndex/);
 assert.match(gallery,/ArrowRight/);
});

test('dynamic filters, category query forwarding and CMS navigation remain integrated',()=>{
 assert.match(read('src/components/catalog.tsx'),/getFilters\(locale/);
 assert.match(read('src/components/catalog.tsx'),/<CatalogFilters/);
 assert.match(read('src/app/(en)/categories/[slug]/page.tsx'),/searchParams/);
 assert.match(read('src/app/(uk)/uk/categories/[slug]/page.tsx'),/searchParams/);
 assert.match(read('src/lib/api/cms-navigation.ts'),/show_in_footer/);
});

test('responsive styles contain all requested breakpoints with no forced horizontal overflow',()=>{
 const css=read('src/app/globals.css');
 assert.match(css,/@media\(max-width:1250px\)/);
 assert.match(css,/@media\(max-width:1024px\)/);
 assert.match(css,/@media\(max-width:768px\)/);
 assert.match(css,/@media\(max-width:520px\)/);
 assert.match(css,/\.detail-body\{grid-template-columns:1fr\}/);
 assert.match(css,/\.gallery-pages\{flex:1;flex-wrap:nowrap/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});

test('SEO indexing config and PostCSS override are preserved',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert.equal(pkg.overrides.next.postcss,'8.5.23');
 assert.equal(pkg.version,'0.8.6');
 assert.match(read('src/lib/seo.ts'),/indexingEnabled = false/);
});
