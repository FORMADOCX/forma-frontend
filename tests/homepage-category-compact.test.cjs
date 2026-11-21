const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const css = fs.readFileSync(path.join(__dirname,'../src/app/globals.css'),'utf8');
const compact = css.slice(css.indexOf('/* Homepage category reference layout'));
test('category section uses compact spacing and preserves the existing reference composition',()=>{
 assert.match(compact,/\.homepage \.home-categories\{display:block;padding:clamp\(25px,3vw,42px\)/);
 assert.match(compact,/\.home-categories \.home-category-card\{[^}]*min-height:108px/);
 assert.match(compact,/\.home-category-art \.home-category-icon\{width:31px;height:31px/);
 assert.match(compact,/\.home-categories \.home-category-title\{[^}]*font-size:clamp\(19px,1\.75vw,25px\)/);
 assert.match(compact,/\.home-category-description\{[^}]*-webkit-line-clamp:2/);
});
test('responsive category cards remain compact with intact 3/2/1 column breakpoints',()=>{
 assert.match(compact,/grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/);
 assert.match(compact,/@media\(max-width:1120px\).*repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(compact,/@media\(max-width:560px\).*grid-template-columns:1fr/);
 assert.match(compact,/@media\(max-width:560px\).*min-height:104px/);
});
