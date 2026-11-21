const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
const read=path=>fs.readFileSync(path,'utf8');

function executeRoute(file){
 const js=ts.transpileModule(read(file),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const exports={};let called=0;
 vm.runInNewContext(js,{exports,require(name){assert.equal(name,'next/navigation');return {notFound(){called++;throw Error('NEXT_HTTP_ERROR_FALLBACK;404')}}}});
 assert.throws(()=>exports.default(),/404/);
 assert.equal(called,1);
}

test('EN and UK public submission routes return a real Next.js 404',()=>{
 executeRoute('src/app/(en)/submit/page.tsx');
 executeRoute('src/app/(uk)/uk/submit/page.tsx');
});
test('homepage and navigation contain no public submission CTA or links',()=>{
 const homepage=read('src/components/pages.tsx');
 const shell=read('src/components/site-shell.tsx');
 assert.doesNotMatch(homepage,/submit|submission|community-strip|Contribute to the Library|Долучіться до бібліотеки/i);
 assert.doesNotMatch(shell,/\/submit|t\.submit|dictionary\[locale\]\.submit/);
 assert.match(homepage,/getTemplates\(\{lang:locale,page:1,page_size:8,sort:'newest'\}\)/);
 assert.match(shell,/headerLinks\.map/);
 assert.match(shell,/pages\.map/);
});
test('no user file intake components or code survive in shipping source',()=>{
 assert.equal(fs.existsSync('src/components/submission-form.tsx'),false);
 assert.equal(fs.existsSync('src/lib/submission.ts'),false);
 const app=read('src/lib/i18n.ts');
 assert.doesNotMatch(app,/submitUnavailable|submit:\s*'/);
 assert.doesNotMatch(read('src/components/locale-switch.tsx'),/\|submit/);
 assert.doesNotMatch(read('src/app/globals.css'),/community-strip|submission-form|forma-contribute\.webp/);
});
test('reserved CMS route cannot silently reactivate a submit slug',()=>{
 for(const path of ['src/app/(en)/[slug]/page.tsx','src/app/(uk)/uk/[slug]/page.tsx']){
  const file=read(path);assert.match(file,/['"]submit['"]/);assert.match(file,/notFound\(\)/);
 }
 const nav=read('src/lib/api/cms-navigation.ts');
 assert.match(nav,/item\.slug!==['"]submit['"]/);
 const sitemap=read('src/app/sitemap.ts');
 assert.match(sitemap,/p\.slug!==['"]submit['"]/);
 assert.doesNotMatch(sitemap,/\/submit/);
});
test('backend CMS flags, EN/UK, filter and download logic remain wired',()=>{
 const shell=read('src/components/site-shell.tsx');
 assert.match(shell,/getCmsNavigation\(locale\)/);
 assert.match(shell,/headerLinks=\{headerLinks\}/);
 assert.match(shell,/pages=\{footerLinks\}/);
 assert.match(read('src/components/catalog.tsx'),/getFilters|filters/i);
 assert.match(read('src/components/template-document-selection.tsx'),/getDownloadUrl/);
 for(const locale of ['en','uk'])assert.ok(fs.existsSync(locale==='en'?'src/app/(en)/templates/page.tsx':'src/app/(uk)/uk/templates/page.tsx'));
});
