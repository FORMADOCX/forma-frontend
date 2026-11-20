import type {CategorySummary} from './api/types';
import type {Locale} from './i18n';
import {dictionary} from './i18n';

export interface BreadcrumbItem {name:string;path:string}

/** The public Template DTO has no primary marker. Never use the server array order as priority. */
export function selectBreadcrumbCategory(categories:readonly CategorySummary[] | null | undefined):CategorySummary | null {
 const candidates=(categories??[]).filter(c=>typeof c?.slug==='string'&&c.slug.length>0&&typeof c.name==='string'&&c.name.trim().length>0);
 if(!candidates.length)return null;
 return [...candidates].sort((a,b)=>a.slug<b.slug?-1:a.slug>b.slug?1:a.name.localeCompare(b.name,'en'))[0];
}

export function templateBreadcrumbs(locale:Locale,title:string,slug:string,category:CategorySummary|null):BreadcrumbItem[]{
 return [
  {name:locale==='uk'?'Головна':'Home',path:'/'},
  category?{name:category.name,path:`/categories/${category.slug}`}:{name:dictionary[locale].templates,path:'/templates'},
  {name:title,path:`/templates/${slug}`}
 ];
}

/** Category pages deliberately show only Home / current category, regardless of depth. */
export function categoryBreadcrumbs(locale:Locale,category:CategorySummary):BreadcrumbItem[]{
 return [
  {name:locale==='uk'?'Головна':'Home',path:'/'},
  {name:category.name,path:`/categories/${category.slug}`}
 ];
}

/** Search breadcrumbs use the normalized search query, never other filters or invented labels. */
export function searchBreadcrumbs(locale:Locale,query:string):BreadcrumbItem[]{
 const q=query.trim();
 return [
  {name:locale==='uk'?'Головна':'Home',path:'/'},
  {name:q||dictionary[locale].searchTitle,path:q?`/search?q=${encodeURIComponent(q)}`:'/search'}
 ];
}
