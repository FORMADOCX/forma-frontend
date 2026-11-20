import Link from 'next/link';
import {JsonLd,breadcrumbData} from '@/lib/json-ld';
import {localizedPath,type Locale} from '@/lib/i18n';
import type {BreadcrumbItem} from '@/lib/breadcrumbs';

/** Visible breadcrumb trail and BreadcrumbList JSON-LD share the exact same array. */
export function Breadcrumbs({locale,items,variant='category'}:{locale:Locale;items:readonly BreadcrumbItem[];variant?:'category'|'detail'}){
 const structured=breadcrumbData(locale,[...items]);
 return <>{structured&&<JsonLd data={structured}/>}
  <nav aria-label="Breadcrumb" className={`forma-breadcrumb ${variant==='detail'?'detail-breadcrumb':'category-breadcrumb'}`}>
   <ol>{items.map((item,i)=><li key={`${item.path}-${i}`}>
    {i>0&&<svg className="breadcrumb-chevron" aria-hidden="true" viewBox="0 0 16 16" fill="none"><path d="m6 4 4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    {i===items.length-1?<span aria-current="page" title={item.name}>{item.name}</span>:<Link href={localizedPath(locale,item.path)} title={item.name}>{item.name}</Link>}
   </li>)}</ol>
  </nav></>;
}
