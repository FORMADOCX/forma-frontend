const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const shell=read('src/components/site-shell.tsx');
const css=read('src/app/globals.css');
const nav=read('src/components/mobile-bottom-navigation.tsx');
test('mobile burger menu is removed at component level, not merely visually hidden',()=>{
 assert.doesNotMatch(shell,/<details className="mobile-navigation"|<summary aria-label=/);
 assert.match(shell,/<MobileBottomNavigation locale={locale}\/>/);
});
test('active mobile tab is solid forest green with white icon and label and no underline',()=>{
 assert.match(css,/\.mobile-bottom-navigation>a\.is-active\{background:var\(--accent\);color:#fff/);
 assert.match(css,/\.mobile-bottom-navigation>a\.is-active span\{box-shadow:none\}/);
 assert.match(nav,/aria-current=\{key===active\?'page':undefined\}/);
});
test('footer retains real CMS and categories links in both locales',()=>{
 assert.match(shell,/<Footer locale=\{locale\} pages=\{footerLinks\}\/>/);
 assert.match(shell,/pages\.map\(page=>/);
 assert.match(shell,/localizedPath\(locale,'\/categories'\)/);
});
