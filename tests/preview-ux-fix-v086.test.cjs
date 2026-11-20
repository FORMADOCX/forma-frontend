const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');

test('Quick Preview uses native modal right-side drawer and close/backdrop/keyboard behavior',()=>{
 const src=read('src/components/quick-preview.tsx'),css=read('src/app/globals.css');
 assert.match(src,/className="preview-dialog preview-drawer"/);
 assert.match(src,/\.showModal\(\)/);assert.match(src,/\.close\(\)/);
 assert.match(src,/onClose=\{onClose\}/);
 assert.match(src,/event.target===dialog.current/);
 assert.match(src,/trigger.current\?\.focus\(\)/);
 assert.match(css,/\.preview-drawer\[open\]\{transform:translateX\(0\)/);
 assert.match(css,/\.preview-drawer::backdrop/);
 assert.match(css,/inset:0 0 0 auto/);
});

test('mobile hides Quick Preview and suppresses API fetch, while card Detail remains linked',()=>{
 const src=read('src/components/quick-preview.tsx'),css=read('src/app/globals.css');
 const card=read('src/components/template-card.tsx');
 assert.match(src,/matchMedia\('\(max-width: 767px\)'\)\.matches\)return/);
 assert.ok(src.indexOf('matchMedia(\'(max-width: 767px)\').matches)return')<src.indexOf('await fetch('));
 assert.match(css,/@media\(max-width:767px\)\{\.template-card-hover-actions\{display:none!important\}/);
 assert.match(src,/window.addEventListener\('resize',onResize\)/);
 assert.match(card,/href=\{href\}/);
});

test('drawer preserves real Django previews, status states and real download paths',()=>{
 const src=read('src/components/quick-preview.tsx');
 assert.match(src,/getPreviewSource\(data.cover_preview_url,backendOrigin\)/);
 assert.match(src,/unoptimized=\{source.unoptimized\}/);
 assert.match(src,/getDownloadUrl\(file,data.slug,backendOrigin\)/);
 assert.match(src,/response.ok/);assert.match(src,/role="alert"/);
 assert.match(src,/new AbortController\(\)/);
 assert.match(src,/request.current\?\.abort\(\)/);
 assert.match(src,/DocumentLightbox/);
});

test('document detail displays uncropped full PNG proportional page and retains thumbnails/lightbox',()=>{
 const src=read('src/components/document-gallery.tsx'),css=read('src/app/globals.css');
 assert.match(src,/DocumentLightbox/);assert.match(src,/className="gallery-image"/);
 assert.match(src,/gallery-thumb/);assert.match(src,/getPreviewSource\(p.url,backendOrigin\)/);
 assert.match(css,/\.gallery-frame\{display:block;min-height:0;aspect-ratio:auto;overflow:visible/);
 assert.match(css,/\.gallery-frame \.gallery-image,\.gallery-frame \.preview-image-trigger \.gallery-image\{[^}]*height:auto;max-height:none;object-fit:contain/);
 assert.match(read('src/components/document-lightbox.tsx'),/setScale/);
});

test('hero search icon is a clickable centered submit control for EN/UK',()=>{
 const src=read('src/components/search-form.tsx'),css=read('src/app/globals.css');
 assert.match(src,/type="submit" className="search-magnifier"/);
 assert.match(src,/name="q"/);assert.match(src,/method="get" action=\{localizedPath\(locale,'\/search'\)\}/);
 assert.match(css,/\.home-hero \.search-form \.search-magnifier\{position:absolute;top:0;bottom:0;left:5px;transform:none/);
 assert.match(css,/\.home-hero \.search-form input\{padding-left:48px/);
});

test('FormaLoader is centered in visible content and localized with reduced-motion support',()=>{
 const src=read('src/components/loading-indicator.tsx'),css=read('src/app/globals.css');
 assert.match(src,/role="status"/);assert.match(src,/forma-loading-symbol/);
 assert.match(src,/Завантаження/);assert.match(src,/Loading/);
 assert.match(css,/\.page-content:has\(> \.forma-loading\)/);
 assert.match(css,/min-height:calc\(100dvh - 155px\)/);
 assert.match(css,/@media\(prefers-reduced-motion:reduce\)\{\.preview-drawer,\.forma-loading-symbol/);
});

test('no public user submissions and staging SEO controls remain',()=>{
 const shell=read('src/components/site-shell.tsx');
 assert.doesNotMatch(shell,/\/submit/);
 for(const f of ['src/app/(en)/submit/page.tsx','src/app/(uk)/uk/submit/page.tsx'])assert.match(read(f),/notFound\(\)/);
 assert.match(read('src/lib/seo.ts'),/indexingEnabled = false/);
});
