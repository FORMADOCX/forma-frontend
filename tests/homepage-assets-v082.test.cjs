const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const read = file => fs.readFileSync(file,'utf8');

test('CMS homepage categories use a trusted icon registry and not invented cards',()=>{
 const page=read('src/components/pages.tsx');
 assert.match(page,/getHomepageCategories\(locale\)/);
 assert.match(page,/categories\.map\(category=>/);
 assert.match(page,/<CategoryIcon name=\{category.icon\}\/>/);
 assert.match(page,/home-category-title/);
 assert.doesNotMatch(page,/mockCategories|category-symbol/);
 const icons=read('src/components/category-icons.tsx');
 assert.match(icons,/hasOwnProperty/);
});
test('compact text hero keeps real search and no promotional illustration',()=>{
 const page=read('src/components/pages.tsx');
 assert.match(page,/<SearchSection locale=\{locale\}\/>/);
 assert.doesNotMatch(page,/<Image|forma-hero\.webp|community-strip|\/submit/);
 assert.match(page,/getTemplates\(\{lang:locale,page:1,page_size:8,sort:'newest'\}\)/);
 assert.match(read('src/components/template-card.tsx'),/template\.cover_preview_url/);
});
test('hero search and listing CTA are available',()=>{
 const search=read('src/components/search-form.tsx');
 const page=read('src/components/pages.tsx');
 assert.match(search,/Search invoices, proposals, planners\.\.\./);
 assert.match(page,/t\.allTemplates/);
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
