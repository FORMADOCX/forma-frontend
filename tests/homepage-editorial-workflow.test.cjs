const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const page=read('src/components/pages.tsx');
const css=read('src/app/globals.css');
const translations=read('src/lib/i18n.ts');
test('new workflow replaces former three-column process layout',()=>{
 assert.match(page,/home-how-panel/);
 assert.match(page,/home-how-editorial/);
 assert.match(page,/home-how-sequence/);
 assert.doesNotMatch(page,/home-how-steps/);
 assert.doesNotMatch(css,/\.home-how-steps/);
});
test('workflow CTA uses a real localized catalogue URL',()=>{
 assert.match(page,/className="home-how-link" href=\{localizedPath\(locale,'\/templates'\)\}/);
 assert.match(page,/t.howExplore/);
 assert.match(translations,/howExplore: 'Explore all templates'/);
 assert.match(translations,/howExplore: 'Переглянути всі шаблони'/);
});
test('semantic three-step list with a proper heading and translated copy',()=>{
 assert.match(page,/aria-labelledby="home-how-heading"/);
 assert.match(page,/id="home-how-heading"/);
 assert.equal((page.match(/<li><span className="home-how-number"/g)||[]).length,3);
 for(const key of ['howFind','howPreview','howDownload','howText','howEyebrow'])assert.ok(page.includes(`t.${key}`));
});
test('workflow CSS is scoped and responsive',()=>{
 assert.match(css,/\.homepage \.home-how\{/);
 assert.match(css,/\.home-how-panel\{/);
 assert.match(css,/@media\(max-width:800px\)/);
 assert.match(css,/@media\(max-width:520px\)/);
 assert.match(css,/\.home-how-link:is\(:hover,:focus-visible\)/);
});
