const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const source=p=>fs.readFileSync(path.join(root,p),'utf8');
for(const [locale,base] of [['en','src/app/(en)'],['uk','src/app/(uk)/uk']]){
 test(`${locale}: published CMS routes share the safe renderer`,()=>{
  for(const slug of ['about','privacy','terms']){
   const code=source(`${base}/${slug}/page.tsx`);
   assert.match(code,/CmsPageView/);
   assert.match(code,/getCmsPage/);
   assert.doesNotMatch(code,/StaticPage/);
  }
  const route=source(`${base}/[slug]/page.tsx`);
  assert.match(route,/reserved\.has\(slug\)/);
  assert.match(route,/CmsPageView/);
 });
}
test('CMS client uses only published public read endpoints and requires validated payload',()=>{
 const code=source('src/lib/api/cms.ts');
 assert.match(code,/api\/v1\/pages/);
 assert.match(code,/response\.ok/);
 assert.match(code,/v\.status!==\x27published\x27/);
 assert.match(code,/v\.locale/); assert.match(code,/available_translations/);
 assert.match(code,/throw new ApiError\(502/);
 assert.doesNotMatch(code,/method:\s*[\x27\x22]POST/);
});
test('Markdown renderer escapes raw markup by React and prevents unsafe links',()=>{
 const code=source('src/components/safe-markdown.tsx');
 assert.match(code,/https:/);
 assert.match(code,/mailto:/);
 assert.match(code,/startsWith\('\/'\)/);
 assert.doesNotMatch(code,/dangerouslySetInnerHTML|innerHTML|eval\(/);
 assert.match(code,/<h2/);assert.match(code,/<ol/);assert.match(code,/<ul/);
});
test('SEO remains noindex and excludes filter URLs from sitemap',()=>{
 const seo=source('src/lib/seo.ts');
 const sitemap=source('src/app/sitemap.ts');
 assert.match(seo,/indexingEnabled = false/);
 assert.match(sitemap,/if\(!indexingEnabled\|\|!siteUrl\)return \[\]/);
 assert.doesNotMatch(sitemap,/attr\.|searchParams|\?q=/);
 assert.match(source('src/app/robots.ts'),/disallow:\s*'\/'/);
});
test('structured data JSON is escaped and uses actual source records',()=>{
 const code=source('src/lib/json-ld.tsx');
 assert.match(code,/JSON\.stringify\(data\)/);
 assert.match(code,/replace\(\/<\/g/);
 assert.match(code,/BreadcrumbList/);
 assert.doesNotMatch(code,/aggregateRating|reviewCount/);
});
test('CMS footer resolves detail visibility rather than assuming list fields',()=>{
 const shell=source('src/components/site-shell.tsx');
 const nav=source('src/lib/api/cms-navigation.ts');
 assert.match(shell,/getCmsNavigation/);
 assert.match(nav,/page\.show_in_footer/);assert.match(nav,/getCmsPage/);
 assert.match(nav,/getCmsPages/);
 assert.match(nav,/listing\.results\.filter/);
});
test('v0.6.1 category searchParams regression remains retained',()=>{
 for(const f of ['src/app/(en)/categories/[slug]/page.tsx','src/app/(uk)/uk/categories/[slug]/page.tsx']){
  const code=source(f);assert.match(code,/searchParams/);assert.match(code,/query=\{query\}/);
 }
});
