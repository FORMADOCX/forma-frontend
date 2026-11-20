import Link from 'next/link';
import {catalogHref,type ParsedCatalogQuery} from '@/lib/api/query';
import type {Locale} from '@/lib/i18n';
export function paginationPages(current:number,total:number):(number|'ellipsis')[]{
 if(!Number.isSafeInteger(total)||total<2)return [];
 const pages=new Set([1,total]);
 for(let n=Math.max(1,current-1);n<=Math.min(total,current+1);n++)pages.add(n);
 const sorted=[...pages].sort((a,b)=>a-b);const result:(number|'ellipsis')[]=[];
 for(const page of sorted){if(typeof result[result.length-1]==='number'&&page-(result[result.length-1] as number)>1){
  if(page-(result[result.length-1] as number)===2)result.push(page-1);else result.push('ellipsis');
 }result.push(page);}return result;
}
export function CatalogPagination({base,params,count,locale}:{base:string;params:ParsedCatalogQuery;count:number;locale:Locale}){
 const total=Math.ceil(count/params.page_size);const current=params.page;
 if(total<2||current>total||current<1)return null;
 const pageHref=(page:number)=>catalogHref(base,params,{page});
 return <nav className="pagination" aria-label={locale==='uk'?'Сторінки каталогу':'Catalog pages'}>
  {current>1?<Link className="pagination-edge" href={pageHref(current-1)} aria-label={locale==='uk'?'Попередня сторінка':'Previous page'}>{locale==='uk'?'← Назад':'← Previous'}</Link>:<span className="pagination-edge pagination-disabled" aria-disabled="true">{locale==='uk'?'← Назад':'← Previous'}</span>}
  {paginationPages(current,total).map((page,index)=>page==='ellipsis'?<span key={`gap-${index}`} className="pagination-ellipsis" aria-hidden="true">…</span>:<Link key={page} href={pageHref(page)} aria-current={page===current?'page':undefined} className="pagination-number">{page}</Link>)}
  {current<total?<Link className="pagination-edge" href={pageHref(current+1)} aria-label={locale==='uk'?'Наступна сторінка':'Next page'}>{locale==='uk'?'Далі →':'Next →'}</Link>:<span className="pagination-edge pagination-disabled" aria-disabled="true">{locale==='uk'?'Далі →':'Next →'}</span>}
 </nav>;
}
