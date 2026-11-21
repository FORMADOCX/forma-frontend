import Link from 'next/link';
import type {CatalogFilter} from '@/lib/api/types';
import {catalogHref,clearCatalogFilters,normalizedAttributes,removeCatalogFilter,type ParsedCatalogQuery} from '@/lib/api/query';
import type {Locale} from '@/lib/i18n';

export function CatalogActiveFilters({params,filters,base,locale}:{params:ParsedCatalogQuery;filters:CatalogFilter[];base:string;locale:Locale}){
 const labels=new Map(filters.map(group=>[group.key,new Map(group.options.map(option=>[option.value,option.label]))]));
 const attributes=normalizedAttributes(params.attributes,params.rawAttributes);
 const chips=[...(params.format?[{key:'format',value:params.format,label:params.format.toUpperCase()}]:[]),...Object.entries(attributes).flatMap(([key,csv])=>csv.split(',').map(value=>({key,value,label:labels.get(key)?.get(value)??value})))];
 if(!chips.length)return null;
 return <nav className="catalog-active-filters" aria-label={locale==='uk'?'Активні фільтри':'Active filters'}>
  {chips.map(chip=><Link key={`${chip.key}:${chip.value}`} className="catalog-filter-chip" href={catalogHref(base,removeCatalogFilter(params,chip.key,chip.value))} aria-label={`${locale==='uk'?'Прибрати фільтр':'Remove filter'}: ${chip.label}`}><span>{chip.label}</span><span aria-hidden="true">×</span></Link>)}
  <Link className="catalog-clear-all" href={catalogHref(base,clearCatalogFilters(params))}>{locale==='uk'?'Очистити все':'Clear all'}</Link>
 </nav>;
}
