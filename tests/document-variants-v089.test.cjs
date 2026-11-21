const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
function moduleFrom(path){
 const source=fs.readFileSync(path,'utf8');
 const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const compiledModule={exports:{}};
 new Function('module','exports',js)(compiledModule,compiledModule.exports);
 return compiledModule.exports;
}
const {publicDocumentVariants,initialDocumentVariant,initialDocumentFile,resolveDocumentSelection}=moduleFrom('src/lib/document-selection.ts');
const format=(id,format)=>({id,format,filename:`${id}.${format}`,byte_size:41984,download_url:`https://api.example.org/api/v1/templates/proposal/files/${id}/download/`});
const variant=(id,size,orientation,files,extra={})=>({id,code:id,page_size:size,orientation,files,...extra});
const model=(variants=[],formats=[])=>({variants,formats});
test('single DOCX needs only one file and no invented alternatives',()=>{
 const items=publicDocumentVariants(model([variant('default','unknown','not-applicable',[format('f1','docx')])]),'en');
 assert.equal(items.length,1);assert.equal(items[0].files.length,1);assert.equal(initialDocumentFile(items[0].files).id,'f1');
 assert.equal(items[0].title,'Document');
});
test('single PDF is selected without an invented editable format',()=>{
 const items=publicDocumentVariants(model([variant('a','A4','portrait',[format('pdf1','pdf')])]),'en');
 assert.equal(initialDocumentFile(items[0].files).format,'pdf');
});
test('A4 DOCX and PDF are genuine options, editable file is initially preferred',()=>{
 const items=publicDocumentVariants(model([variant('a','a4','portrait',[format('p','pdf'),format('d','docx')])]),'en');
 assert.equal(items[0].title,'A4 Portrait');assert.deepEqual(items[0].files.map(f=>f.format),['pdf','docx']);
 assert.equal(initialDocumentFile(items[0].files).id,'d');
});
test('A4 and US Letter preserve selected format when changing variant',()=>{
 const items=publicDocumentVariants(model([variant('a','a4','portrait',[format('a-d','docx'),format('a-p','pdf')]),variant('l','us-letter','portrait',[format('l-d','docx'),format('l-p','pdf')])]),'en');
 const next=initialDocumentFile(items[1].files,'pdf');
 assert.equal(next.id,'l-p');
 assert.equal(resolveDocumentSelection(items,items[1].key,next.id).file.id,'l-p');
});
test('XLSX only has a friendly label instead of unknown',()=>{
 const items=publicDocumentVariants(model([variant('default','unknown','not-applicable',[format('sheet','xlsx')])]),'en');
 assert.equal(items[0].title,'Spreadsheet');assert.equal(items[0].files[0].format,'xlsx');
 assert.equal(publicDocumentVariants(model([variant('default','unknown','not-applicable',[format('sheet','xlsx')])]),'uk')[0].title,'Електронна таблиця');
});
test('XLSX and PDF prefer editable spreadsheet; PDF remains selectable',()=>{
 const items=publicDocumentVariants(model([variant('s','unknown','not-applicable',[format('p','pdf'),format('x','xlsx')])]),'en');
 assert.equal(initialDocumentFile(items[0].files).id,'x');assert.equal(initialDocumentFile(items[0].files,'pdf').id,'p');
});
test('same page size with different orientation remains two selectable variants',()=>{
 const items=publicDocumentVariants(model([variant('portrait','a4','portrait',[format('p','docx')]),variant('landscape','a4','landscape',[format('l','docx')])]),'en');
 assert.deepEqual(items.map(x=>x.title),['A4 Portrait','A4 Landscape']);assert.notEqual(items[0].key,items[1].key);
});
test('unavailable PDF does not become a phantom format; variant switching resolves a real file',()=>{
 const items=publicDocumentVariants(model([variant('a','a4','portrait',[format('d','docx'),format('p','pdf')]),variant('l','letter','portrait',[format('l-d','docx')])]),'en');
 assert.equal(initialDocumentFile(items[1].files,'pdf').id,'l-d');
 assert.equal(resolveDocumentSelection(items,items[1].key,'p').file.id,'l-d');
});
test('backend designated default wins, otherwise stable API order is used',()=>{
 const items=publicDocumentVariants(model([variant('a','a4','portrait',[format('a','docx')]),variant('b','letter','portrait',[format('b','docx')],{is_default:true})]),'en');
 assert.equal(initialDocumentVariant(items).key,items[1].key);
 assert.equal(initialDocumentVariant(items.map(v=>({...v,isDefault:false}))).key,items[0].key);
});
test('legacy formats remain available without inventing variants',()=>{
 const items=publicDocumentVariants({formats:[format('one','docx'),format('two','pdf')]},'en');
 assert.equal(items.length,1);assert.equal(items[0].key,'legacy');assert.equal(items[0].files.length,2);
});
test('empty, malformed and non-downloadable variants cannot yield a button',()=>{
 assert.deepEqual(publicDocumentVariants(model([{id:'bad',files:[{id:'f',format:'pdf',filename:'f.pdf',download_url:null}]}]),'en'),[]);
 assert.deepEqual(publicDocumentVariants({variants:[],formats:[]},'en'),[]);
});
test('file IDs and download URL come from backend records, not guessed filenames',()=>{
 const items=publicDocumentVariants(model([variant('a','a4','portrait',[format('real-id','docx')])]),'en');
 assert.equal(resolveDocumentSelection(items,items[0].key,'real-id').file.download_url,'https://api.example.org/api/v1/templates/proposal/files/real-id/download/');
});
test('one shared selector and gallery receive the same selection; no redundant download links',()=>{
 const page=fs.readFileSync('src/components/catalog-data-pages.tsx','utf8');
 const selector=fs.readFileSync('src/components/template-document-selection.tsx','utf8');
 assert.match(page,/<TemplateDocumentSelection key=\{item.slug\}/);
 assert.match(page,/<SelectedDocumentGallery item=\{item\}/);
 assert.match(page,/<DocumentDownloadSelector item=\{item\}/);
 assert.match(selector,/item\.previews\?\?\[\]\)\.filter\(p=>p.file_id===file.id\)/);
 assert.match(selector,/getDownloadUrl\(file,item.slug,backendOrigin\)/);
 assert.equal((selector.match(/className="button-link detail-primary-download/g)||[]).length,1);
 assert.doesNotMatch(page,/<QuickPreview/);
});
test('radio accessibility, variant selection feedback, mobile CSS, EN/UK, noindex preserved',()=>{
 const jsx=fs.readFileSync('src/components/template-document-selection.tsx','utf8');
 const css=fs.readFileSync('src/app/globals.css','utf8');
 assert.match(jsx,/type="radio"/);assert.match(jsx,/checked=\{variant\?\.key===option.key\}/);
 assert.match(jsx,/aria-live="polite"/);assert.match(jsx,/Завантажити шаблон/);assert.match(jsx,/Editable spreadsheet/);
 assert.match(css,/\.variant-options\{display:grid/);assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(fs.readFileSync('src/lib/seo.ts','utf8'),/indexingEnabled = false/);
});
test('variants and flat formats both have trusted server-side URL normalization',()=>{
 const normalization=fs.readFileSync('src/lib/api/normalize-document-urls.ts','utf8');
 assert.match(normalization,/variants/);assert.match(normalization,/publicDjangoUrl\(file.download_url,'download'/);
 assert.match(normalization,/fileId:String\(file.id\)/);
});
test('selected format changes gallery data by exact backend file_id',()=>{
 const selector=fs.readFileSync('src/components/template-document-selection.tsx','utf8');
 assert.match(selector,/filter\(p=>p.file_id===file.id\)/);
 assert.match(selector,/key=\{file\?\.id\?\?'empty'\}/);
 assert.doesNotMatch(selector,/R2|r2\.cloudflarestorage/);
});
