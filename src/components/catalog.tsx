import Link from 'next/link';
import {getCategories,getTemplates,getFilters,ApiError} from '@/lib/api/client';
import {catalogHref,parseCatalogQuery,type RawQuery} from '@/lib/api/query';
import {localizedPath,dictionary,type Locale} from '@/lib/i18n';
import {TemplateCard} from './template-card';
import {PageIntro} from './site-shell';
import {CatalogFilters} from './catalog-filters';
import {CatalogPagination} from './catalog-pagination';
import {CatalogToolbar} from './catalog-toolbar';
import {CatalogActiveFilters} from './catalog-active-filters';
import {Breadcrumbs} from './breadcrumbs';
import {searchBreadcrumbs} from '@/lib/breadcrumbs';

export async function Catalog({locale,query={},search=false,fixedCategory,embedded=false}:{locale:Locale;query?:RawQuery;search?:boolean;fixedCategory?:string;embedded?:boolean}){
 const t=dictionary[locale];const params=parseCatalogQuery(query);
 if(fixedCategory)params.category=fixedCategory;
 const base=localizedPath(locale,fixedCategory?`/categories/${fixedCategory}`:search?'/search':'/templates');
 const [itemsResult,categoriesResult,filtersResult]=await Promise.allSettled([
  getTemplates({...params,format:params.rawFormat.length>1?params.rawFormat:params.format,lang:locale,page_size:params.page_size}),
  fixedCategory?Promise.resolve(null):getCategories(locale),
  getFilters(locale,params.category||undefined,params.format||undefined)
 ]);
 const items=itemsResult.status==='fulfilled'?itemsResult.value:null;
 const categories=categoriesResult.status==='fulfilled'?categoriesResult.value?.results??[]:[];
 const filters=filtersResult.status==='fulfilled'?filtersResult.value.filters:[];
 const failure=itemsResult.status==='rejected'?itemsResult.reason as unknown:null;
 const filtersFailed=filtersResult.status==='rejected';
 const heading=fixedCategory?(locale==='uk'?'Шаблони категорії':'Category templates'):search?t.searchTitle:t.catalogTitle;
 return <div className={`container page-content${fixedCategory?' category-catalog':''}`}>
  {search&&!embedded&&<Breadcrumbs locale={locale} items={searchBreadcrumbs(locale,params.q)}/>}
  {!embedded&&<PageIntro title={heading} description={!fixedCategory&&!search?t.catalogDescription:undefined}/>}
  {search&&<form className="catalog-search-form" method="get" action={base} role="search">
   <label htmlFor="catalog-query">{t.search}</label>
   <div className="catalog-search-row"><input id="catalog-query" type="search" name="q" maxLength={120} defaultValue={params.q} placeholder={t.searchPlaceholder}/><button type="submit">{t.search}</button></div>
   {params.category&&<input type="hidden" name="category" value={params.category}/>}
   {params.sort!=='newest'&&<input type="hidden" name="sort" value={params.sort}/>}
   {params.format&&<input type="hidden" name="format" value={params.format}/>}
   {Object.entries(params.attributes).map(([key,value])=><input key={key} type="hidden" name={`attr.${key}`} value={value}/>)}
  </form>}
  <CatalogToolbar locale={locale} params={params} base={base} categories={categories} fixedCategory={fixedCategory}/>
  <div className="catalog-layout">
   <div>{filtersFailed&&<p role="alert" className="filter-warning">{locale==='uk'?'Фільтри зараз недоступні.':'Filters are temporarily unavailable.'}</p>}
    {!filtersFailed&&<CatalogFilters key={catalogHref(base,params)} filters={filters} params={params} base={base} locale={locale}/>}</div>
   <div className="catalog-results">
    <CatalogActiveFilters params={params} filters={filters} base={base} locale={locale}/>
    {failure?<div role="alert" className="empty-state"><p>{failure instanceof ApiError&&failure.status===429?(locale==='uk'?'Забагато запитів. Спробуйте пізніше.':'Too many requests. Please try again later.'):failure instanceof ApiError&&failure.status===400?(locale==='uk'?'Некоректні параметри фільтрації. Очистіть фільтри та спробуйте знову.':'Invalid filter parameters. Clear filters and try again.'):failure instanceof ApiError&&failure.status===404?(locale==='uk'?'Сторінку результатів не знайдено.':'Results page not found.'):locale==='uk'?'Не вдалося завантажити каталог.':'Could not load the catalog.'}</p>{<Link href={catalogHref(base,{...params,page:1,format:'',rawFormat:[],attributes:{},rawAttributes:{}})}>{locale==='uk'?'Очистити фільтри':'Clear filters'}</Link>}</div>:
    !items?.results.length?<><p className="result-count">{locale==='uk'?'Знайдено':'Results'}: {items?.count??0}</p><div role="status" className="empty-state"><p>{locale==='uk'?'За цими умовами немає шаблонів.':'No published templates match these filters.'}</p><Link href={catalogHref(base,{...params,page:1,format:'',rawFormat:[],attributes:{},rawAttributes:{}})}>{locale==='uk'?'Очистити фільтри':'Clear filters'}</Link></div></>:
    <><p className="result-count">{locale==='uk'?'Знайдено':'Results'}: {items.count}</p><div className="template-grid">{items.results.map(item=><TemplateCard key={item.id} template={item} locale={locale}/>)}</div>
    <CatalogPagination base={base} params={params} count={items.count} locale={locale}/></>}
   </div>
  </div>
 </div>;
}
