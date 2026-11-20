import Link from 'next/link';
import {getCategories,getTemplates,getFilters,ApiError} from '@/lib/api/client';
import {catalogHref,parseCatalogQuery,type RawQuery} from '@/lib/api/query';
import {localizedPath,dictionary,type Locale} from '@/lib/i18n';
import {TemplateCard} from './template-card';
import {PageIntro} from './site-shell';
import {CatalogFilters} from './catalog-filters';

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
  {!embedded&&<PageIntro title={heading} description={!fixedCategory&&!search?t.catalogDescription:undefined}/>}
  <form className="catalog-controls" method="get" action={base} role="search">
   <label>{t.search}<input type="search" name="q" maxLength={120} defaultValue={params.q} placeholder={t.searchPlaceholder}/></label>
   {!fixedCategory&&<label>{t.categories}<select name="category" defaultValue={params.category}><option value="">{locale==='uk'?'Усі категорії':'All categories'}</option>{categories.map(c=><option key={c.id} value={c.slug}>{c.name}</option>)}</select></label>}
   <label>{locale==='uk'?'Сортування':'Sort by'}<select name="sort" defaultValue={params.sort}><option value="newest">{locale==='uk'?'Спочатку нові':'Newest'}</option><option value="oldest">{locale==='uk'?'Спочатку старі':'Oldest'}</option><option value="title">Title A–Z</option><option value="-title">Title Z–A</option></select></label>
   {params.page_size!==20&&<input type="hidden" name="page_size" value={params.page_size}/>}
   {params.rawFormat.map((value,index)=><input key={index} type="hidden" name="format" value={value}/>)}
   {Object.entries(params.rawAttributes).flatMap(([key,values])=>values.map((value,index)=><input key={`${key}-${index}`} type="hidden" name={`attr.${key}`} value={value}/>))}
   <button type="submit">{locale==='uk'?'Застосувати':'Apply'}</button>
  </form>
  <div className="catalog-layout">
   <div>{filtersFailed&&<p role="alert" className="filter-warning">{locale==='uk'?'Фільтри зараз недоступні.':'Filters are temporarily unavailable.'}</p>}
    {!filtersFailed&&<CatalogFilters key={catalogHref(base,params)} filters={filters} params={params} base={base} locale={locale}/>}</div>
   <div className="catalog-results">
    {failure?<div role="alert" className="empty-state"><p>{failure instanceof ApiError&&failure.status===429?(locale==='uk'?'Забагато запитів. Спробуйте пізніше.':'Too many requests. Please try again later.'):failure instanceof ApiError&&failure.status===400?(locale==='uk'?'Некоректні параметри фільтрації. Очистіть фільтри та спробуйте знову.':'Invalid filter parameters. Clear filters and try again.'):failure instanceof ApiError&&failure.status===404?(locale==='uk'?'Сторінку результатів не знайдено.':'Results page not found.'):locale==='uk'?'Не вдалося завантажити каталог.':'Could not load the catalog.'}</p>{<Link href={catalogHref(base,{...params,page:1,format:'',rawFormat:[],attributes:{},rawAttributes:{}})}>{locale==='uk'?'Очистити фільтри':'Clear filters'}</Link>}</div>:
    !items?.results.length?<div role="status" className="empty-state"><p>{locale==='uk'?'За цими умовами немає шаблонів.':'No published templates match these filters.'}</p><Link href={catalogHref(base,{...params,page:1,format:'',rawFormat:[],attributes:{},rawAttributes:{}})}>{locale==='uk'?'Очистити фільтри':'Clear filters'}</Link></div>:
    <><p className="result-count">{locale==='uk'?'Знайдено':'Results'}: {items.count}</p><div className="template-grid">{items.results.map(item=><TemplateCard key={item.id} template={item} locale={locale}/>)}</div>
    <nav className="pagination" aria-label="Pagination">{items.previous&&<Link href={catalogHref(base,params,{page:params.page-1})}>{locale==='uk'?'Попередня':'Previous'}</Link>}<span>{locale==='uk'?'Сторінка':'Page'} {params.page}</span>{items.next&&<Link href={catalogHref(base,params,{page:params.page+1})}>{locale==='uk'?'Наступна':'Next'}</Link>}</nav></>}
   </div>
  </div>
 </div>;
}
