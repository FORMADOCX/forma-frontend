const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=(path)=>fs.readFileSync(path,'utf8');

test('the approved hero, illustration, search and shared card component remain intact',()=>{
 const page=read('src/components/pages.tsx');
 assert.match(page,/<Image src="\/images\/forma-hero\.webp" alt="" fill priority/);
 assert.match(page,/<SearchSection locale=\{locale\}\/>/);
 assert.match(page,/<TemplateCard key=\{item\.id\} template=\{item\} locale=\{locale\} featured\/>/);
 assert.doesNotMatch(page,/fakeTemplate|mockDocument|Recently Added/);
});
test('featured collection adapts to the count of actual published results without inventing documents',()=>{
 const page=read('src/components/pages.tsx');
 const css=read('src/app/globals.css');
 assert.match(page,/featuredTemplates=actualTemplates\.slice\(0,4\)/);
 assert.match(page,/featuredCount=Math\.min\(featuredTemplates\.length,4\)/);
 assert.match(page,/home-featured-count-\$\{featuredCount\}/);
 for(const size of [1,2,3])assert.match(css,new RegExp(`\\.homepage \\.home-featured-count-${size} \\.template-grid`));
});
test('optional CMS API errors are logged on the server without visual error text after the homepage',()=>{
 const page=read('src/components/pages.tsx');
 assert.match(page,/console\.error\('\[FORMA homepage\] CMS homepage categories request failed'/);
 assert.doesNotMatch(page,/home-content-error/);
 assert.match(page,/actualCategories\.length>0&&<section/);
});
test('document cover handles a failed real preview without generating a replacement document image',()=>{
 const cover=read('src/components/document-cover.tsx');
 assert.match(cover,/getPreviewSource\(url,backendOrigin\)/);
 assert.match(cover,/onError=\{\(\)=>setFailedSource\(source\.src\)\}/);
 assert.match(cover,/failedSource===source\.src/);
 assert.match(cover,/unoptimized className=/);
 assert.doesNotMatch(cover,/data:image|placeholder\.png|fake-preview/);
});
test('new layout styles are restricted to homepage and responsive breakpoints',()=>{
 const css=read('src/app/globals.css');
 assert.match(css,/\/\* Homepage editorial refinement — scoped to the homepage/);
 assert.match(css,/@media\(max-width:768px\)/);
 assert.match(css,/@media\(max-width:520px\)/);
 assert.match(css,/\.homepage \.home-how-steps li\{display:block/);
});
