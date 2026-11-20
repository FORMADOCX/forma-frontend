const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');

test('catalog dropdowns preserve native GET query names and backend options',()=>{
 const catalog=read('src/components/catalog.tsx');
 assert.match(catalog,/<FormaSelect name="category"/);
 assert.match(catalog,/<FormaSelect name="sort"/);
 assert.match(catalog,/value:c.slug,label:c.name/);
 assert.match(catalog,/defaultValue=\{params.category\}/);
 assert.match(catalog,/defaultValue=\{params.sort\}/);
 assert.match(catalog,/params.rawAttributes/);
 assert.match(catalog,/params.rawFormat/);
});
test('filter format remains a controlled dropdown with unchanged selection handlers',()=>{
 const source=read('src/components/catalog-filters.tsx');
 assert.match(source,/<FormaSelect label=/);
 assert.match(source,/value=\{format\} onChange=\{setFormat\}/);
 assert.match(source,/applyCatalogFilters\(params,format,selection\)/);
 assert.match(source,/group.type==='multi_select'\?'checkbox':'radio'/);
});
test('shared dropdown includes accessible keyboard controls and focus return',()=>{
 const source=read('src/components/forma-select.tsx');
 for(const mark of ['aria-haspopup="listbox"','aria-expanded={open}','role="listbox"','role="option"','aria-selected=','ArrowDown','ArrowUp','Home','End','Escape','Enter','pointerdown','focusin','trigger.current?.focus()','type="hidden" name={name}'])assert.ok(source.includes(mark),mark);
 assert.match(source,/disabled=\{disabled\}/);
 assert.match(source,/options\.map/);
});
test('locale and mobile navigation use custom styled dropdown surfaces while keeping link destinations',()=>{
 const locale=read('src/components/locale-switch.tsx');
 assert.match(locale,/<details className="locale-dropdown">/);
 assert.match(locale,/localeDestination\(pathname,query,'en'\)/);
 assert.match(locale,/localeDestination\(pathname,query,'uk'\)/);
 const css=read('src/app/globals.css');
 for(const mark of ['.forma-select-menu','.forma-select-chevron','.forma-select-option','.locale-dropdown-menu','.mobile-navigation nav a:hover','@media(prefers-reduced-motion:reduce)'])assert.ok(css.includes(mark),mark);
});
