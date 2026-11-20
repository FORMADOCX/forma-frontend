import 'server-only';
import {ApiError} from './client';
import type {Language,Page,Seo} from './types';

/** Public Page List DTO: navigation flags are NOT exposed here. */
export interface CmsPageSummary {
 slug:string;
 locale:Language;
 title:string;
 summary:string;
 available_translations:Language[];
}
/** Public Page Detail DTO: navigation flags are available only on detail. */
export interface CmsPage extends CmsPageSummary {
 body:string;
 seo:Seo|null;
 show_in_navigation:boolean;
 show_in_footer:boolean;
 /** Optional ordering metadata when provided by the detail API. */
 sort_order?:number;
}
const base=process.env.FORMA_API_URL ?? process.env.NEXT_PUBLIC_API_URL;
const slugPattern=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function url(path:string,lang:Language,page?:number){
 if(!base)throw new ApiError(503,'CMS API not configured');
 const u=new URL(`/api/v1/pages/${path}`,base.replace(/\/$/,'')+'/');
 u.searchParams.set('lang',lang);
 if(page!==undefined)u.searchParams.set('page',String(page));
 return u.toString();
}
async function request(path:string,lang:Language,page?:number):Promise<unknown>{
 let response:Response;
 try{response=await fetch(url(path,lang,page),{headers:{Accept:'application/json'},next:{revalidate:60}})}
 catch{throw new ApiError(503,'CMS API unreachable')}
 if(!response.ok)throw new ApiError(response.status,`CMS API returned ${response.status}`);
 try{return await response.json() as unknown}catch{throw new ApiError(502,'Invalid CMS JSON')}
}
function obj(v:unknown):v is Record<string,unknown>{return v!==null&&typeof v==='object'&&!Array.isArray(v)}
function locale(v:unknown):v is Language{return v==='en'||v==='uk'}
function translations(v:unknown):Language[]|null{
 if(!Array.isArray(v)||!v.every(locale))return null;
 return [...new Set(v)];
}
function summary(v:unknown):CmsPageSummary|null{
 if(!obj(v)||typeof v.slug!=='string'||!slugPattern.test(v.slug)||typeof v.title!=='string'||typeof v.summary!=='string'||!locale(v.locale))return null;
 const available=translations(v.available_translations);
 if(!available)return null;
 // A public endpoint exposes only published resources. If a status field is supplied,
 // never accept unpublished content; a direct detail 404 is not transformed into 502.
 if(v.status!==undefined&&v.status!=='published')return null;
 if(v.is_published!==undefined&&v.is_published!==true)return null;
 return {slug:v.slug,title:v.title,summary:v.summary,locale:v.locale,available_translations:available};
}
export async function getCmsPages(lang:Language,page=1):Promise<Page<CmsPageSummary>>{
 const data=await request('',lang,page);
 if(!obj(data)||!Array.isArray(data.results)||typeof data.count!=='number')throw new ApiError(502,'Invalid CMS page list');
 const parsed=data.results.map(summary);
 if(parsed.some(v=>v===null))throw new ApiError(502,'Invalid CMS page list item');
 return {count:data.count,next:typeof data.next==='string'?data.next:null,previous:typeof data.previous==='string'?data.previous:null,results:parsed as CmsPageSummary[]};
}
export async function getCmsPage(slug:string,lang:Language):Promise<CmsPage>{
 if(!slugPattern.test(slug))throw new ApiError(404,'Invalid page slug');
 const data=await request(`${encodeURIComponent(slug)}/`,lang);
 if(obj(data)&&((data.status!==undefined&&data.status!=='published')||(data.is_published!==undefined&&data.is_published!==true)))throw new ApiError(404,'CMS page is not published');
 const page=summary(data);
 if(!page||!obj(data)||typeof data.body!=='string'||typeof data.show_in_navigation!=='boolean'||typeof data.show_in_footer!=='boolean')throw new ApiError(502,'Invalid CMS page detail');
 const seo:Seo|null=obj(data.seo)?{
  title:typeof data.seo.title==='string'?data.seo.title:undefined,
  description:typeof data.seo.description==='string'?data.seo.description:undefined,
  canonical:typeof data.seo.canonical==='string'?data.seo.canonical:undefined,
  og_title:typeof data.seo.og_title==='string'?data.seo.og_title:undefined,
  og_description:typeof data.seo.og_description==='string'?data.seo.og_description:undefined,
  og_image:typeof data.seo.og_image==='string'?data.seo.og_image:undefined,
 }:null;
 return {...page,body:data.body,show_in_navigation:data.show_in_navigation,show_in_footer:data.show_in_footer,
  ...(typeof data.sort_order==='number'&&Number.isSafeInteger(data.sort_order)?{sort_order:data.sort_order}:{}),seo};
}
