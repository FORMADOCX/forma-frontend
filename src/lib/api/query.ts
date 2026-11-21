import type {SortOrder} from './types';

export const allowedSorts:SortOrder[]=['newest','oldest','title','-title'];
export type RawQuery=Record<string,string|string[]|undefined>;
export type ParsedCatalogQuery={q:string;category:string;sort:SortOrder;page:number;page_size:number;format:string;rawFormat:string[];attributes:Record<string,string>;rawAttributes:Record<string,string[]>};
const first=(value:string|string[]|undefined)=>Array.isArray(value)?value[0]:value;

/** Django expects exactly one attr.<code> parameter, with OR values separated by commas. */
export function attributeValues(values:readonly string[]):string[]{
 return [...new Set(values.flatMap(value=>value.split(',')).map(value=>value.trim()).filter(Boolean))].slice(0,8);
}
export function normalizedAttributes(attributes:Record<string,string>={},raw:Record<string,string[]>={}):Record<string,string>{
 const normalized:Record<string,string>={};
 for(const key of [...new Set([...Object.keys(attributes),...Object.keys(raw)])].sort().slice(0,8)){
  if(!key||!/^[-a-zA-Z0-9_]+$/.test(key))continue;
  const values=attributeValues([...(raw[key]??[]),...(attributes[key]?[attributes[key]]:[])]);
  if(values.length)normalized[key]=values.join(',');
 }
 return normalized;
}
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
 const rawAttributes:Record<string,string[]>={};
 for(const [key,value] of Object.entries(query)) if(key.startsWith('attr.')){
  rawAttributes[key.slice(5)]=Array.isArray(value)?value:[value??''];
 }
 const attributes=normalizedAttributes({},rawAttributes);
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
 const attrs=patch.attributes!==undefined?normalizedAttributes(patch.attributes):normalizedAttributes(merged.attributes,merged.rawAttributes);
 for(const [key,value] of Object.entries(attrs))search.set(`attr.${key}`,value);
 return `${base}${search.size?'?'+search.toString():''}`;
}
export function clearCatalogFilters(params:ParsedCatalogQuery):ParsedCatalogQuery {
 return {...params,page:1,format:'',rawFormat:[],attributes:{},rawAttributes:{}};
}
export function applyCatalogFilters(params:ParsedCatalogQuery,format:string,selections:Record<string,string[]>):ParsedCatalogQuery {
 const attributes=normalizedAttributes(Object.fromEntries(Object.entries(selections).map(([key,values])=>[key,attributeValues(values).join(',')])));
 return {...params,page:1,format,rawFormat:format?[format]:[],attributes,rawAttributes:{}};
}
/** Remove exactly one selected facet value, leaving other OR choices intact. */
export function removeCatalogFilter(params:ParsedCatalogQuery,key:string,value:string):ParsedCatalogQuery {
 if(key==='format')return {...params,page:1,format:'',rawFormat:[]};
 const attributes=normalizedAttributes(params.attributes,params.rawAttributes);
 const remaining=attributeValues((attributes[key]??'').split(',')).filter(item=>item!==value);
 if(remaining.length)attributes[key]=remaining.join(',');else delete attributes[key];
 return {...params,page:1,attributes,rawAttributes:{}};
}
