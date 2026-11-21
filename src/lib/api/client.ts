import 'server-only';
import type {Category, CatalogQuery, Language, Page, TemplateDetail, TemplateList, TemplateQuickPreview,FiltersResponse} from './types';
import {normalizeTemplateUrls} from './normalize-document-urls';
import {normalizedAttributes} from './query';

export class ApiError extends Error {
 constructor(public readonly status:number, message:string){super(message);this.name='ApiError';}
}
const root=process.env.FORMA_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
export const isApiConfigured=Boolean(root);
function endpoint(path:string, query:Record<string,string|number|undefined|string[]> = {}):string {
 if(!root) throw new ApiError(503,'Backend API is not configured');
 const url=new URL(`/api/v1/${path}`, `${root.replace(/\/$/,'')}/`);
 for(const [key,value] of Object.entries(query)) if(value!==undefined && value!=='') {
  if(Array.isArray(value)) value.forEach(v=>url.searchParams.append(key,v));
  else url.searchParams.set(key,String(value));
 }
 return url.href;
}
async function read<T>(path:string,query:Record<string,string|number|undefined|string[]>={}):Promise<T>{
 let response:Response;
 try {response=await fetch(endpoint(path,query), {headers:{Accept:'application/json'},next:{revalidate:60}});}
 catch {throw new ApiError(503,'Catalog API unreachable');}
 if(!response.ok) throw new ApiError(response.status,`Catalog API returned HTTP ${response.status}`);
 try {return await response.json() as T;} catch {throw new ApiError(502,'Catalog API returned invalid JSON');}
}
const slugSegment=(slug:string)=>encodeURIComponent(slug);
export const getCategories=(lang:Language,page=1,page_size=100)=>read<Page<Category>>('categories/',{lang,page,page_size});
/** Fetch every CMS-enabled homepage category in backend order, without trusting pagination URLs. */
export async function getHomepageCategories(lang:Language):Promise<Category[]> {
 const results:Category[]=[];
 const seenIds=new Set<string>();
 const visited=new Set<number>();
 let page=1;
 while (!visited.has(page)) {
  visited.add(page);
  const batch=await read<Page<Category>>('categories/',{lang,homepage:'true',page,page_size:100});
  for (const category of batch.results) {
   if (category.show_on_homepage===true && !seenIds.has(category.id)) {
    seenIds.add(category.id);results.push(category);
   }
  }
  if (!batch.next) break;
  let next:URL;
  try {next=new URL(batch.next,endpoint('categories/'));}
  catch {throw new ApiError(502,'Invalid homepage categories pagination');}
  const expected=new URL(endpoint('categories/'));
  const nextPage=Number(next.searchParams.get('page'));
  if(next.origin!==expected.origin || next.pathname!==expected.pathname || next.searchParams.get('homepage')!=='true' || next.searchParams.get('lang')!==lang || !Number.isSafeInteger(nextPage) || nextPage<=page) throw new ApiError(502,'Invalid homepage categories pagination');
  page=nextPage;
 }
 return results;
}
export const getCategory=(slug:string,lang:Language)=>read<Category>(`categories/${slugSegment(slug)}/`,{lang});
export const getTemplates = async (query: CatalogQuery): Promise<Page<TemplateList>> => { const result = await read<Page<TemplateList>>('templates/', {
 lang:query.lang,page:query.page,page_size:query.page_size,category:query.category,q:query.q,sort:query.sort,format:query.format,
 ...Object.fromEntries(Object.entries(normalizedAttributes(query.attributes,query.rawAttributes)).map(([key,value])=>[`attr.${key}`,value]))
});return {...result,results:result.results.map(normalizeTemplateUrls)};};
export const getFilters=(lang:Language,category?:string,format?:string)=>read<FiltersResponse>('filters/',{lang,category,format});
export const getTemplate=async(slug:string,lang:Language)=>normalizeTemplateUrls(await read<TemplateDetail>(`templates/${slugSegment(slug)}/`,{lang}));
export const getQuickPreview=async(slug:string,lang:Language)=>normalizeTemplateUrls(await read<TemplateQuickPreview>(`templates/${slugSegment(slug)}/quick-preview/`,{lang}));
