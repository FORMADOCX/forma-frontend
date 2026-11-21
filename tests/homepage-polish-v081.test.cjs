const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const read = path => fs.readFileSync(path,'utf8');

test('hero illustration remains separate from real backend document covers', () => {
 const page = read('src/components/pages.tsx');
 assert.match(page,/\/images\/forma-hero\.webp/);
 assert.doesNotMatch(page,/hero-visual-empty|showcase\.cover_preview_url/);
 assert.match(page,/getTemplates\(\{lang:locale,page_size:8\}\)/);
 assert.match(page,/actualTemplates\.slice\(0,4\)/);
});
test('magnifier is a proper accessible decorative SVG and search stays functional', () => {
 const form=read('src/components/search-form.tsx');
 const css=read('src/app/globals.css');
 assert.match(form,/<svg viewBox="0 0 24 24"/);
 assert.match(form,/name="q"/);
 assert.match(form,/method="get"/);
 assert.match(css,/\.home-hero \.search-form input\{[^}]*padding:12px 14px 12px 45px/);
 assert.match(css,/\.home-hero \.search-magnifier\{[^}]*position:absolute/);
});
test('real document cover cards are portrait in homepage and catalog',()=>{
 const css=read('src/app/globals.css');
 assert.match(css,/\.home-featured \.template-card-media\{aspect-ratio:3\/4\}/);
 assert.match(css,/\.template-card-media\{aspect-ratio:4\/5;background/);
 assert.match(read('src/components/template-card.tsx'),/template.cover_preview_url/);
});
test('static About removed from desktop and mobile header; CMS pages remain in footer',()=>{
 const shell=read('src/components/site-shell.tsx');
 const header=shell.split('export function Footer')[0];
 assert.doesNotMatch(header,/localizedPath\(locale,'\/about'\)/);
 assert.match(read('src/lib/api/cms-navigation.ts'),/show_in_footer/);
 assert.match(shell,/pages.map\(page=>/);
});
