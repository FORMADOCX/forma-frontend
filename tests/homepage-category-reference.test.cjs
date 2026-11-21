const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
test('reference category grid uses six actual CMS categories and preserves backend order',()=>{
 const s=read('src/components/pages.tsx');
 assert.match(s,/getHomepageCategories\(locale\)/);
 assert.match(s,/featuredCategories\.slice\(0,6\)\.map\(\(c,index\)/);
 assert.match(s,/c\.description/);
 assert.match(s,/c\.icon/);
 assert.doesNotMatch(s,/Business.*Proposals.*Invoices/);
});
test('reference category layout has eyebrow, title, description and linked action',()=>{
 const s=read('src/components/pages.tsx');
 for(const part of ['home-categories-heading','home-categories-eyebrow','home-category-grid','home-category-art','home-category-description','home-category-copy','home-categories-all']) assert.ok(s.includes(part));
 assert.match(s,/localizedPath\(locale,'\/categories'\)/);
 assert.match(s,/localizedPath\(locale,`\/categories\/\$\{c\.slug\}`\)/);
});
test('category cards are real links, names and descriptions come from DTO',()=>{
 const s=read('src/components/pages.tsx');
 assert.match(s,/<Link className=\{`home-category-card/);
 assert.match(s,/\{c\.name\}/);
 assert.match(s,/\{c\.description\}/);
 assert.match(s,/c\.description\?\.trim\(\)/);
});
test('responsive grids have three columns on desktop, two on tablet and one on mobile',()=>{
 const css=read('src/app/globals.css');
 assert.match(css,/\.home-categories \.home-category-grid\{display:grid;grid-template-columns:repeat\(3/);
 assert.match(css,/@media\(max-width:1120px\).*grid-template-columns:repeat\(2/s);
 assert.match(css,/@media\(max-width:560px\).*home-category-grid\{grid-template-columns:1fr/s);
 assert.match(css,/\.home-category-art \.home-category-icon/);
});
test('hero, workflow and template cards remain unchanged',()=>{
 const s=read('src/components/pages.tsx');
 for(const cls of ['home-hero','hero-art','home-featured','home-how-panel'])assert.ok(s.includes(cls));
 assert.match(s,/TemplateCard key=\{item\.id\}/);
});
