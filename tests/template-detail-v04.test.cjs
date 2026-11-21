const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript')
function load(file){const source=fs.readFileSync(file,'utf8');const output=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const mod={exports:{}};new Function('module','exports','process',output)(mod,mod.exports,process);return mod.exports}
const {groupDocumentPreviews,displayFileSize}=load('src/lib/document-gallery.ts');
const {getDownloadUrl}=load('src/lib/download-url.ts');
const fmt=(id,url=null)=>({id,format:'docx',filename:`${id}.docx`,byte_size:4096,download_url:url});
const pg=(file_id,page)=>({file_id,page,width:820,height:1160,url:`http://localhost:8000/api/v1/templates/sample/files/${file_id}/previews/${page}/`});
test('groups all actual pages by file ID in format order and page order',()=>{
 const g=groupDocumentPreviews([pg('b',3),pg('a',2),pg('b',1),pg('a',1)],[fmt('a'),fmt('b'),fmt('c')]);
 assert.deepEqual(g.map(x=>[x.fileId,x.pages.map(p=>p.page)]),[['a',[1,2]],['b',[1,3]]]);
 assert.equal(g[0].pages[0].url,pg('a',1).url);
});
test('unknown file IDs retain real previews, no fabricated pages',()=>{
 const g=groupDocumentPreviews([pg('orphan',5)],[]);
 assert.equal(g.length,1);assert.equal(g[0].format,null);assert.deepEqual(g[0].pages.map(p=>p.page),[5]);
 assert.deepEqual(groupDocumentPreviews([],[]),[]);
});
test('size formatting covers bytes, MB and invalid values',()=>{
 assert.equal(displayFileSize(42),'42 B');assert.equal(displayFileSize(1048576),'1.0 MB');assert.equal(displayFileSize(-1),'—');
});
test('download link requires non-null backend URL and exact trusted route',()=>{
 const url='http://127.0.0.1:8000/api/v1/templates/sample/files/abc/download/';
 assert.equal(getDownloadUrl(fmt('abc',url),'sample','http://localhost:8000'),url);
 assert.equal(getDownloadUrl(fmt('abc'),'sample','http://localhost:8000'),null);
 assert.equal(getDownloadUrl(fmt('abc',url),'other','http://localhost:8000'),null);
 assert.equal(getDownloadUrl(fmt('abc',url+'?redirect=1'),'sample','http://localhost:8000'),null);
 assert.equal(getDownloadUrl(fmt('abc','http://attacker.invalid/api/v1/templates/sample/files/abc/download/'),'sample','http://localhost:8000'),null);
 assert.equal(getDownloadUrl(fmt('abc',url),'sample',undefined),null);
});
test('production rejects local alias and accepts exact HTTPS backend',()=>{
 const old=process.env.NODE_ENV;process.env.NODE_ENV='production';
 try{const u='https://api.example.org/api/v1/templates/s/files/id/download/';assert.equal(getDownloadUrl(fmt('id',u),'s','https://api.example.org'),u);assert.equal(getDownloadUrl(fmt('id',u.replace('api.','other.')),'s','https://api.example.org'),null)}finally{process.env.NODE_ENV=old}
});
test('detail uses actual DTO previews/downloads and compact Quick Preview preserved',()=>{
 const detail=fs.readFileSync('src/components/catalog-data-pages.tsx','utf8');const quick=fs.readFileSync('src/components/quick-preview.tsx','utf8');const gallery=fs.readFileSync('src/components/document-gallery.tsx','utf8');
 assert.match(detail,/item\.usage_instructions/);assert.match(detail,/<DocumentDownloadSelector item=\{item\}/);
 assert.match(gallery,/getPreviewSource\(page\.url,backendOrigin\)/);assert.match(gallery,/ArrowRight/);assert.match(gallery,/aria-live="polite"/);
 assert.doesNotMatch(quick,/<DocumentGallery/);assert.doesNotMatch(quick,/usage_instructions/);
});
