import Link from 'next/link';
import type {TemplateList} from '@/lib/api/types';
import {type Locale,localizedPath} from '@/lib/i18n';
import {QuickPreview} from './quick-preview';
import {DocumentCover} from './document-cover';
import {getBrowserApiOrigin} from '@/lib/api/public-urls';
export function TemplateCard({template,locale,featured=false}:{template:TemplateList;locale:Locale;featured?:boolean}){
 const href=localizedPath(locale,`/templates/${template.slug}`);
 return <article className={`template-card${featured?' template-card-featured':''}`}>
  <Link className="template-card-cover" href={href} aria-label={`${locale==='uk'?'Переглянути':'View'} ${template.title}`}><DocumentCover url={template.cover_preview_url} locale={locale} backendOrigin={getBrowserApiOrigin()}/></Link>
  <div className="template-card-details"><Link className="template-card-title" href={href}>{featured?<h3>{template.title}</h3>:<h2>{template.title}</h2>}</Link>
   {template.summary?.trim()&&<p>{template.summary}</p>}
   {!featured&&template.categories.length>0&&<div className="template-card-meta"><span>{template.categories.map(c=>c.name).join(' · ')}</span></div>}
  </div>
  <div className="template-card-hover-actions"><QuickPreview slug={template.slug} locale={locale} backendOrigin={getBrowserApiOrigin()}/></div>
 </article>;
}
