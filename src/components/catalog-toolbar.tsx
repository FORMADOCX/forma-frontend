'use client';
import {useRouter} from 'next/navigation';
import {useTransition} from 'react';
import type {Category,SortOrder} from '@/lib/api/types';
import {catalogHref,allowedSorts,type ParsedCatalogQuery} from '@/lib/api/query';
import type {Locale} from '@/lib/i18n';
import {FormaSelect} from './forma-select';

/** Only routing changes here; Django remains the source of truth for ordering. */
export function CatalogToolbar({params,base,locale,categories,fixedCategory}:{params:ParsedCatalogQuery;base:string;locale:Locale;categories:Category[];fixedCategory?:string}){
 const router=useRouter();const [pending,startTransition]=useTransition();
 const go=(patch:Partial<ParsedCatalogQuery>)=>{
  const next=catalogHref(base,params,{...patch,page:1});
  if(next!==catalogHref(base,params))startTransition(()=>router.push(next));
 };
 return <div className="catalog-toolbar" aria-busy={pending}>
  {!fixedCategory&&<div className="catalog-control"><span>{locale==='uk'?'Категорія':'Category'}</span><FormaSelect label={locale==='uk'?'Категорія':'Category'} value={params.category} onChange={category=>go({category})} options={[{value:'',label:locale==='uk'?'Усі категорії':'All categories'},...categories.map(c=>({value:c.slug,label:c.name}))]}/></div>}
  <div className="catalog-control catalog-sort"><span>{locale==='uk'?'Сортування':'Sort by'}</span><FormaSelect label={locale==='uk'?'Сортування':'Sort by'} value={params.sort} onChange={value=>{if(allowedSorts.includes(value as SortOrder))go({sort:value as SortOrder});}} options={[{value:'newest',label:locale==='uk'?'Спочатку нові':'Newest'},{value:'oldest',label:locale==='uk'?'Спочатку старі':'Oldest'},{value:'title',label:'Title A–Z'},{value:'-title',label:'Title Z–A'}]}/></div>
 </div>;
}
