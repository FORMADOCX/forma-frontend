const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(base,p),'utf8');
test('homepage retains original hero artwork and layout',()=>{
 const home=read('src/components/pages.tsx');
 assert.match(home,/className="home-hero"/);assert.match(home,/\/images\/forma-hero.webp/);
 assert.match(home,/<SearchSection locale=\{locale\}/);
 assert.match(home,/className="hero-categories"/);
 assert.ok(fs.existsSync(path.join(base,'public/images/forma-hero.webp')));
});
test('featured cards remain the original TemplateCard and Quick Preview',()=>{
 const home=read('src/components/pages.tsx');
 assert.match(home,/<TemplateCard key=\{item.id\} template=\{item\} locale=\{locale\} featured\/>/);
 assert.doesNotMatch(home,/Recently Added|Recently added/);
 assert.match(read('src/components/template-card.tsx'),/QuickPreview/);
});
test('CMS categories are separate from original hero popular links',()=>{
 const home=read('src/components/pages.tsx');
 assert.match(home,/getHomepageCategories\(locale\)/);
 assert.match(home,/featuredCategories.length>0&&<section/);
 assert.match(home,/actualCategories.slice\(0,5\)/);
 assert.match(home,/featuredCategories.slice\(0,5\)/);
 assert.doesNotMatch(home,/No categories published yet/);
});
test('homepage endpoint uses a single allowlisted server API helper',()=>{
 const api=read('src/lib/api/client.ts');
 assert.match(api,/read<Page<Category>>\('categories\/',\{lang,homepage:'true',page,page_size:100\}\)/);
 assert.match(api,/show_on_homepage===true/);
 assert.match(api,/batch.next/);assert.match(api,/next.origin!==expected.origin/);
 assert.match(api,/seenIds.has\(category.id\)/);
});
test('approved icons are decorative and unknown identifiers render nothing',()=>{
 const icon=read('src/components/category-icon.tsx');
 for(const code of ['briefcase-business','receipt-text','notebook-pen','file-spreadsheet','scale'])assert.ok(icon.includes(code));
 assert.match(icon,/if \(!symbol\) return null/);assert.match(icon,/aria-hidden="true"/);
});
test('editorial workflow is below Featured, localized in both languages',()=>{
 const home=read('src/components/pages.tsx'),i18n=read('src/lib/i18n.ts');
 assert.ok(home.indexOf('home-featured')<home.indexOf('home-how'));
 assert.match(home,/<ol className="home-how-sequence">/);assert.match(home,/t.howTitle/);
 assert.match(i18n,/The right document\. A simpler way\./);assert.match(i18n,/Потрібний документ\. Простий шлях\./);
});
test('new CSS is scoped and existing template and hero styles remain',()=>{
 const css=read('src/app/globals.css');
 assert.match(css,/\.home-hero\{display:grid/);
 assert.match(css,/\.home-featured \.template-grid/);
 assert.match(css,/\.home-category-icon/);assert.match(css,/\.home-how-sequence/);
});
