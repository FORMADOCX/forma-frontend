import type {SortOrder} from './types';
export const allowedSorts:SortOrder[]=['newest','oldest','title','-title'];
export type RawQuery=Record<string,string|string[]|undefined>;
export type ParsedCatalogQuery={q:string;category:string;sort:SortOrder;page:number;page_size:number;format:string;rawFormat:string[];attributes:Record<string,string>;rawAttributes:Record<string,string[]>};
const first=(value:string|string[]|undefined)=>Array.isArray(value)?value[0]:value;
export function parseCatalogQuery(query:RawQuery):ParsedCatalogQuery {
 const q=(first(query.q)??'').trim().slice(0,120);
 const category=(first(query.category)??'').trim().slice(0,120);
 const requestedSort=first(query.sort);
 const sort=allowedSorts.includes(requestedSort as SortOrder)?requestedSort as SortOrder:'newest';
 const n=Number(first(query.page)??1);
 const page=Number.isSafeInteger(n)&&n>=1?Math.min(n,100000):1;
 const pageSizeValue=Number(first(query.page_size)??20);
 const page_size=Number.isSafeInteger(pageSizeValue)&&pageSizeValue>=1&&pageSizeValue<=100?pageSizeValue:20;
 const rawFormat=Array.isArray(query.format)?query.format:query.format?[query.format]:[];
 const format=first(query.format)??'';
 const attributes:Record<string,string>={};
 const rawAttributes:Record<string,string[]>={};
 for(const [key,value] of Object.entries(query)) if(key.startsWith('attr.')){
  const code=key.slice(5);
  const values=Array.isArray(value)?value:[value??''];
  rawAttributes[code]=values;
  if(values.length===1) attributes[code]=values[0];
 }
 return {q,category,sort,page,page_size,format,rawFormat,attributes,rawAttributes};
}
export function catalogHref(base:string,params:ParsedCatalogQuery,patch:Partial<ParsedCatalogQuery>={}):string {
 const merged={...params,...patch};const search=new URLSearchParams();
 if(merged.q)search.set('q',merged.q);
 if(merged.category)search.set('category',merged.category);
 const formats=patch.format!==undefined?(patch.format?[patch.format]:[]):merged.rawFormat;
 if(formats.length)for(const format of formats)search.append('format',format);
 else if(merged.format)search.set('format',merged.format);
 if(merged.sort!=='newest')search.set('sort',merged.sort);
 if(merged.page>1)search.set('page',String(merged.page));
 if(merged.page_size!==20)search.set('page_size',String(merged.page_size));
 const attrs=patch.attributes??merged.attributes;
 const raw=patch.attributes?{}:merged.rawAttributes;
 const keys=new Set([...Object.keys(raw),...Object.keys(attrs)]);
 for(const key of [...keys].sort()){
  if(Object.prototype.hasOwnProperty.call(raw,key)){
   for(const value of raw[key]??[])search.append(`attr.${key}`,value);
  }else if(attrs[key])search.set(`attr.${key}`,attrs[key]);
 }
 return `${base}${search.size?'?'+search.toString():''}`;
}
export function clearCatalogFilters(params:ParsedCatalogQuery):ParsedCatalogQuery {
 return {...params,page:1,format:'',rawFormat:[],attributes:{},rawAttributes:{}};
}
export function applyCatalogFilters(params:ParsedCatalogQuery,format:string,selections:Record<string,string[]>):ParsedCatalogQuery {
 const attributes:Record<string,string>={};
 for(const [key,values] of Object.entries(selections)) if(values.length)attributes[key]=[...new Set(values)].join(',');
 return {...params,page:1,format,rawFormat:format?[format]:[],attributes,rawAttributes:{}};
}
