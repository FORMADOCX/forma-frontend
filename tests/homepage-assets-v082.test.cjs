const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const read = file => fs.readFileSync(file,'utf8');

test('real published categories remain API driven with no fabricated category icons',()=>{
 const page = read('src/components/pages.tsx');
 assert.match(page,/getCategories\(locale,1,8\)/);
 assert.match(page,/actualCategories\.slice\(0,5\)/);
 assert.doesNotMatch(page,/category-symbol/);
 assert.match(page,/home-category-title/);
 const css=read('src/app/globals.css');
 assert.match(css,/\.home-category-card\{background:#edf5ef/);
 assert.match(css,/\.home-category-title\{[^}]*white-space:nowrap/);
});

test('hero artwork remains optimized and independent of real document previews',()=>{
 const page=read('src/components/pages.tsx');
 const css=read('src/app/globals.css');
 for(const asset of ['public/images/forma-hero.webp']){
  assert.ok(fs.statSync(asset).size > 1000, `${asset} missing`);
  assert.ok(fs.statSync(asset).size < 250000, `${asset} not optimized`);
 }
 assert.match(page,/<Image src="\/images\/forma-hero\.webp" alt="" fill priority/);
 assert.doesNotMatch(page,/community-strip|\/submit/);
 assert.doesNotMatch(css,/forma-contribute\.webp/);
 assert.match(page,/getTemplates\(\{lang:locale,page_size:8\}\)/);
 assert.match(read('src/components/template-card.tsx'),/template\.cover_preview_url/);
});

test('hero search placeholder and template listing CTA match approved reference',()=>{
 const search=read('src/components/search-form.tsx');
 const page=read('src/components/pages.tsx');
 assert.match(search,/Search templates \(e\.g\., invoice, report, proposal\)/);
 assert.match(page,/View All Templates/);
 assert.match(search,/method="get"/);
});

test('card summary is shown when present; quick preview is visually revealed below without moving grid',()=>{
 const card=read('src/components/template-card.tsx');
 const css=read('src/app/globals.css');
 assert.match(card,/template\.summary\?\.trim\(\)/);
 assert.match(card,/className="template-card-hover-actions"/);
 assert.match(card,/<QuickPreview slug=\{template\.slug\}/);
 assert.match(css,/\.template-card-hover-actions\{position:absolute;top:calc\(100% - 1px\)/);
 assert.match(css,/\.template-card:is\(:hover,:focus-within\) \.template-card-hover-actions/);
 assert.match(css,/@media\(hover:none\)/);
 assert.match(css,/prefers-reduced-motion:reduce/);
});

test('header avoids static About link while preserving CMS footer navigation',()=>{
 const shell=read('src/components/site-shell.tsx');
 assert.doesNotMatch(shell.split('export function Footer')[0],/\/about/);
 assert.match(read('src/lib/api/cms-navigation.ts'),/show_in_footer/);
});
