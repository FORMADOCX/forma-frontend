import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getCmsPage} from '@/lib/api/cms';
import {ApiError} from '@/lib/api/client';
import {localizedPath,type Locale} from '@/lib/i18n';
import {SafeMarkdown} from './safe-markdown';
import {PageIntro} from './site-shell';
export async function CmsPageView({locale,slug}:{locale:Locale;slug:string}){
 let page;
 try{page=await getCmsPage(slug,locale)}catch(error){
  if(error instanceof ApiError&&error.status===404)notFound();
  return <div className="container page-content"><p role="alert">{locale==='uk'?'Сторінка наразі недоступна.':'This page is temporarily unavailable.'}</p></div>;
 }
 return <article className="container page-content prose"><nav aria-label="Breadcrumb"><Link href={localizedPath(locale)}>{locale==='uk'?'Головна':'Home'}</Link> / <span aria-current="page">{page.title}</span></nav><PageIntro title={page.title} description={page.summary}/>{page.locale!==locale&&<p className="translation-notice">{locale==='uk'?'Показано англомовну версію.':'Showing fallback language content.'}</p>}<SafeMarkdown content={page.body}/></article>;
}
