const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript')
const source=fs.readFileSync('src/lib/preview-image.ts','utf8');
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const mod={exports:{}};
new Function('module','exports','process',compiled)(mod,mod.exports,process);
const {getPreviewSource}=mod.exports;
const sample='http://127.0.0.1:8000/api/v1/templates/the-clean-invoice/files/2cd0c251-7be1-4e7a-9f28-b56cb5e0bbb8/previews/1/';
const prev={...process.env};
function configure(env,fn){Object.assign(process.env,env);try{fn()}finally{process.env= {...prev}}}
test('real Django loopback PNG URL is displayed without Next optimizer proxy',()=>configure({FORMA_API_URL:'http://127.0.0.1:8000',NODE_ENV:'development'},()=>{
 assert.deepEqual(getPreviewSource(sample),{src:sample,unoptimized:true});
}));
test('localhost and 127.0.0.1 are interchangeable on the configured local port',()=>configure({FORMA_API_URL:'http://localhost:8000',NODE_ENV:'development'},()=>{
 assert.equal(getPreviewSource(sample)?.unoptimized,true);
 assert.equal(getPreviewSource(sample.replace('127.0.0.1','localhost'))?.src.includes('localhost'),true);
}));
test('production HTTPS backend previews retain optimized images',()=>configure({FORMA_API_URL:'https://internal.example.org',NEXT_PUBLIC_API_URL:'https://api.example.org',NODE_ENV:'production'},()=>{
 const data=getPreviewSource('https://api.example.org/api/v1/templates/invoice/files/uuid/previews/2/');
 assert.equal(data?.unoptimized,false);
 assert.equal(data?.src,'https://api.example.org/api/v1/templates/invoice/files/uuid/previews/2/');
}));
test('untrusted host, non-preview paths, invalid protocols and absent preview are rejected',()=>configure({FORMA_API_URL:'https://internal.example.org',NEXT_PUBLIC_API_URL:'https://api.example.org',NODE_ENV:'production'},()=>{
 assert.equal(getPreviewSource(null),null);
 assert.equal(getPreviewSource('https://malicious.example/api/v1/templates/x/files/y/previews/1/'),null);
 assert.equal(getPreviewSource('https://api.example.org/admin/'),null);
 assert.equal(getPreviewSource('javascript:alert(1)'),null);
}));
test('real image is wired into card, dialog and detail with no fabricated fallback image',()=>{
 for(const file of ['src/components/template-card.tsx']){
  const code=fs.readFileSync(file,'utf8');
  assert.match(code,/<DocumentCover url=\{(?:template|data|item)\.cover_preview_url\}/);
 }
 const modal=fs.readFileSync('src/components/quick-preview.tsx','utf8');
 assert.match(modal,/getPreviewSource\(data.cover_preview_url,backendOrigin\)/);
 assert.match(modal,/unoptimized=\{source.unoptimized\}/);
 const detail=fs.readFileSync('src/components/catalog-data-pages.tsx','utf8');
 assert.match(detail,/<SelectedDocumentGallery item=\{item/);
 const component=fs.readFileSync('src/components/document-cover.tsx','utf8');
 assert.match(component,/<Image/);
 assert.match(component,/unoptimized(?:\s|\/>)/);
 assert.match(component,/onError=\{\(\)=>setFailedSource\(source.src\)\}/);
 const config=fs.readFileSync('next.config.ts','utf8');
 assert.match(config,/remotePatterns/);
 assert.doesNotMatch(config,/dangerouslyAllowLocalIP\s*:\s*true/);
 assert.doesNotMatch(config,/unoptimized\s*:\s*true/);
});

test('client modal accepts explicitly supplied public backend origin without server environment variable',()=>configure({FORMA_API_URL:'',NEXT_PUBLIC_API_URL:'',NODE_ENV:'development'},()=>{
 assert.deepEqual(getPreviewSource(sample,'http://localhost:8000'),{src:sample,unoptimized:true});
 assert.equal(getPreviewSource(sample,'http://evil.example:8000'),null);
}));
test('server passes configured backend origin to the client modal and document cover',()=>{
 const card=fs.readFileSync('src/components/template-card.tsx','utf8');
 const modal=fs.readFileSync('src/components/quick-preview.tsx','utf8');
 const cover=fs.readFileSync('src/components/document-cover.tsx','utf8');
 assert.match(card,/backendOrigin=\{getBrowserApiOrigin\(\)\}/);
 assert.match(modal,/getPreviewSource\(data.cover_preview_url,backendOrigin\)/);
 assert.match(cover,/getPreviewSource\(url,backendOrigin\)/);
});
