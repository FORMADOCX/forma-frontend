const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ts=require('typescript');
const compile=(path,stubs={})=>{
 const code=ts.transpileModule(fs.readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
 const compiledModule={exports:{}};
 new Function('module','exports','require','process',code)(compiledModule,compiledModule.exports,(name)=>{
  if(name in stubs)return stubs[name];throw new Error(`Unexpected import: ${name}`);
 },process);
 return compiledModule.exports;
};
const {formatAttributeValue}=compile('src/lib/attribute-value.ts');
const urlModule=compile('src/lib/api/public-urls.ts');
const {publicDjangoUrl,getBrowserApiOrigin}=urlModule;
const {normalizeTemplateUrls}=compile('src/lib/api/normalize-document-urls.ts',{'./public-urls':urlModule});
const oldEnv={...process.env};
function env(overrides,fn){for(const [key,value] of Object.entries(overrides))if(value===undefined)delete process.env[key];else process.env[key]=value;try{return fn()}finally{process.env={...oldEnv}}}
const id='123e4567-e89b-12d3-a456-426614174000';
const prefix=`/api/v1/templates/invoice/files/${id}`;
const preview=`${prefix}/previews/1/`;
const download=`${prefix}/download/`;

test('attribute detail uses actual JSON single_select and multi_select values',()=>{
 assert.equal(formatAttributeValue({code:'size',label:'Page size',data_type:'single_select',value:'a4'},'en'),'a4');
 assert.equal(formatAttributeValue({code:'paper',label:'Paper',data_type:'multi_select',value:['a4','letter','a4']},'en'),'a4, letter');
 assert.equal(formatAttributeValue({code:'empty',label:'Empty',data_type:'multi_select',value:[]},'en'),null);
 assert.equal(formatAttributeValue({code:'bad',label:'Bad',data_type:'single_select',value:{unexpected:true}},'en'),null);
 assert.equal(formatAttributeValue({code:'bad',label:'Bad',data_type:'multi_select',value:[{label:'unexpected'}]},'en'),null);
 assert.equal(formatAttributeValue({code:'num',label:'Count',data_type:'number',value:0},'en'),'0');
 assert.equal(formatAttributeValue({code:'boo',label:'Available',data_type:'boolean',value:false},'uk'),'Ні');
});
test('internal private backend URL is never disclosed; verified paths remap to public HTTPS',()=>env({NODE_ENV:'production',FORMA_API_URL:'http://django:8000',NEXT_PUBLIC_API_URL:'https://api.forma.example'},()=>{
 assert.equal(getBrowserApiOrigin(),'https://api.forma.example');
 assert.equal(publicDjangoUrl(`http://django:8000${preview}`,'preview'),`https://api.forma.example${preview}`);
 assert.equal(publicDjangoUrl(download,'download',{slug:'invoice',fileId:id}),`https://api.forma.example${download}`);
 assert.equal(publicDjangoUrl(`http://django:8000${download}`,'download',{slug:'invoice',fileId:id}),`https://api.forma.example${download}`);
 assert.equal(publicDjangoUrl(`http://django:8000${download}`,'download',{slug:'other',fileId:id}),null);
}));
test('production with missing or private public origin disables browser resources',()=>{
 env({NODE_ENV:'production',FORMA_API_URL:'http://django:8000',NEXT_PUBLIC_API_URL:undefined},()=>{
  assert.equal(getBrowserApiOrigin(),undefined);
  assert.equal(publicDjangoUrl(`http://django:8000${preview}`,'preview'),null);
 });
 env({NODE_ENV:'production',FORMA_API_URL:'http://django:8000',NEXT_PUBLIC_API_URL:'http://localhost:8000'},()=>{
  assert.equal(getBrowserApiOrigin(),undefined);
 });
 env({NODE_ENV:'production',FORMA_API_URL:'http://django:8000',NEXT_PUBLIC_API_URL:'https://192.168.1.8'},()=>{
  assert.equal(getBrowserApiOrigin(),undefined);
 });
});
test('arbitrary hosts, private URLs, credentials, query, fragment, route injection and invalid pages rejected',()=>env({NODE_ENV:'production',FORMA_API_URL:'http://django:8000',NEXT_PUBLIC_API_URL:'https://api.forma.example'},()=>{
 for(const value of [
  `https://attacker.example${preview}`,`https://user:pass@api.forma.example${preview}`,
  `https://api.forma.example${preview}?token=abc`,`https://api.forma.example${preview}#frag`,
  `javascript:alert(1)`, '/admin/', '/api/v1/templates/invoice/files/x/previews/0/',
  `http://random-private:8000${preview}`, `//attacker.example${preview}`
 ])assert.equal(publicDjangoUrl(value,'preview'),null,value);
}));
test('normalized list, quick preview, detail preserve real metadata and sanitize all document endpoints',()=>env({NODE_ENV:'production',FORMA_API_URL:'http://django:8000',NEXT_PUBLIC_API_URL:'https://api.forma.example'},()=>{
 const input={slug:'invoice',title:'Invoice',summary:'Real',cover_preview_url:`http://django:8000${preview}`,
  formats:[{id,format:'docx',filename:'invoice.docx',byte_size:1200,download_url:`http://django:8000${download}`}],
  previews:[{file_id:id,page:1,width:900,height:1200,url:`http://django:8000${preview}`}],
  attributes:[{code:'color',label:'Color',data_type:'multi_select',value:['green','blue']}],seo:null};
 const result=normalizeTemplateUrls(input);
 assert.equal(result.title,'Invoice');assert.deepEqual(result.attributes,input.attributes);
 assert.equal(result.cover_preview_url,`https://api.forma.example${preview}`);
 assert.equal(result.formats[0].download_url,`https://api.forma.example${download}`);
 assert.equal(result.previews[0].url,`https://api.forma.example${preview}`);
 assert.equal(input.cover_preview_url,`http://django:8000${preview}`);
 const tampered=normalizeTemplateUrls({...input,cover_preview_url:`https://evil.example${preview}`,formats:[{...input.formats[0],download_url:`https://evil.example${download}`}]});
 assert.equal(tampered.cover_preview_url,null);assert.equal(tampered.formats[0].download_url,null);
}));
test('dev localhost alias permitted, no production loopback in HTML',()=>env({NODE_ENV:'development',FORMA_API_URL:'http://127.0.0.1:8000',NEXT_PUBLIC_API_URL:'http://localhost:8000'},()=>{
 assert.equal(publicDjangoUrl(`http://127.0.0.1:8000${preview}`,'preview'),`http://localhost:8000${preview}`);
}));
test('all browser consumers use public origin rather than server-only origin',()=>{
 for(const file of ['src/components/template-card.tsx','src/components/catalog-data-pages.tsx']){
  const source=fs.readFileSync(file,'utf8');assert.match(source,/getBrowserApiOrigin/);assert.doesNotMatch(source,/process\.env\.FORMA_API_URL/);
 }
 assert.match(fs.readFileSync('src/lib/api/client.ts','utf8'),/normalizeTemplateUrls/);
 assert.match(fs.readFileSync('src/components/catalog-data-pages.tsx','utf8'),/formatAttributeValue\(a,locale\)/);
 assert.match(fs.readFileSync('src/lib/api/query.ts','utf8'),/\.join\(','\)/);
});
test('CMS footer still verifies detail-only flag, with bounded concurrency and cache',()=>{
 const shell=fs.readFileSync('src/components/site-shell.tsx','utf8');
 const nav=fs.readFileSync('src/lib/api/cms-navigation.ts','utf8');
 const cms=fs.readFileSync('src/lib/api/cms.ts','utf8');
 assert.match(shell,/pages=\{footerLinks\}/);assert.match(nav,/show_in_footer/);assert.match(nav,/Promise\.allSettled/);
 assert.match(nav,/offset\+=6/);assert.match(cms,/revalidate:60/);
 assert.doesNotMatch(cms,/summary\(v:unknown\)[\s\S]{0,150}show_in_footer/);
});
test('no regression to Next.js 15 dynamic routes, feature-flag indexing or PostCSS override',()=>{
 const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
 assert.equal(pkg.overrides.next.postcss,'8.5.23');
 assert.equal(pkg.version,'0.9.0');
 assert.match(fs.readFileSync('src/app/(en)/categories/[slug]/page.tsx','utf8'),/searchParams/);
 assert.match(fs.readFileSync('src/app/(uk)/uk/categories/[slug]/page.tsx','utf8'),/searchParams/);
 assert.match(fs.readFileSync('src/lib/seo.ts','utf8'),/indexingEnabled = false/);
});
test('document variants remap only trusted selected file download routes and reject malicious file origins',()=>env({NODE_ENV:'production',FORMA_API_URL:'http://django:8000',NEXT_PUBLIC_API_URL:'https://api.forma.example'},()=>{
 const good={id,format:'docx',filename:'invoice-a4.docx',byte_size:2048,download_url:`http://django:8000${download}`};
 const wrong={...good,id:'bad-id',download_url:`https://external.example${download}`};
 const result=normalizeTemplateUrls({slug:'invoice',title:'Invoice',formats:[],variants:[{id:'variant-a4',code:'a4',page_size:'a4',files:[good,wrong]}]});
 assert.equal(result.variants[0].files[0].download_url,`https://api.forma.example${download}`);
 assert.equal(result.variants[0].files[1].download_url,null);
 assert.deepEqual(normalizeTemplateUrls({slug:'invoice',variants:[null,{id:'empty',code:'x',files:[null]}]}).variants,[{id:'empty',code:'x',files:[]}]);
}));
