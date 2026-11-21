import {Catalog} from './catalog';
import type {RawQuery} from '@/lib/api/query';
import Link from 'next/link';
import {notFound} from 'next/navigation';
import {getCategories,getCategory,getTemplate,getTemplates,ApiError} from '@/lib/api/client';
import {localizedPath,dictionary,type Locale} from '@/lib/i18n';
import {PageIntro} from './site-shell';
import type {Category,TemplateDetail} from '@/lib/api/types';
import {Breadcrumbs} from './breadcrumbs';
import {categoryBreadcrumbs,selectBreadcrumbCategory,templateBreadcrumbs} from '@/lib/breadcrumbs';
import {TemplateDocumentSelection,SelectedDocumentGallery,DocumentDownloadSelector} from './template-document-selection';
import {publicDocumentVariants} from '@/lib/document-selection';
import {TemplateCard} from './template-card';
import {formatAttributeValue} from '@/lib/attribute-value';
import {getBrowserApiOrigin} from '@/lib/api/public-urls';
const fallback=(locale:Locale,actual:string)=>actual!==locale?<p className="translation-notice">{locale==='uk'?'Український переклад недоступний. Показано текст іншою мовою.':'Requested translation unavailable; showing fallback text.'}</p>:null;
export async function CategoryListPage({locale}:{locale:Locale}){
 const t=dictionary[locale];const categories:Category[]=[];let error=false;let page=1;
 try{while(page<=100){const response=await getCategories(locale,page,100);categories.push(...response.results);if(!response.next)break;if(page===100)throw new Error('Category list exceeds supported pages');page++}}catch{error=true}
 return <div className="container page-content"><PageIntro title={t.categoriesTitle} description={t.categoriesDescription}/>{error?<p role="alert">{locale==='uk'?'Категорії недоступні.':'Categories unavailable.'}</p>:!categories.length?<p className="empty-state">{locale==='uk'?'Опублікованих категорій немає.':'No published categories yet.'}</p>:<ul className="category-list">{categories.map(c=><li key={c.id}><Link href={localizedPath(locale,`/categories/${c.slug}`)}><span className="category-symbol" aria-hidden="true">▤</span><strong>{c.name}</strong><span aria-hidden="true">→</span></Link>{c.description&&<p>{c.description}</p>}{fallback(locale,c.language)}</li>)}</ul>}</div>;
}
export async function CategoryDetailPage({locale,slug,query={}}:{locale:Locale;slug:string;query?:RawQuery}){
 let category:Category;try{category=await getCategory(slug,locale)}catch(e){if(e instanceof ApiError&&e.status===404)notFound();return <div className="container page-content"><p role="alert">{locale==='uk'?'Категорія недоступна.':'Category unavailable.'}</p></div>}
 const items=categoryBreadcrumbs(locale,category);
 return <div className="container page-content"><Breadcrumbs locale={locale} items={items}/><PageIntro title={category.name} description={category.description}/>{fallback(locale,category.language)}<Catalog locale={locale} query={query} fixedCategory={slug} embedded/></div>;
}
export async function TemplateDetailPage({locale,slug}:{locale:Locale;slug:string}){
 let item:TemplateDetail;
 try{item=await getTemplate(slug,locale)}catch(e){if(e instanceof ApiError&&e.status===404)notFound();const throttled=e instanceof ApiError&&e.status===429;return <div className="container page-content"><p role="alert">{throttled?(locale==='uk'?'Забагато запитів. Спробуйте пізніше.':'Too many requests. Please try again later.'):(locale==='uk'?'Деталі шаблону недоступні.':'Template details unavailable.')}</p></div>}
 const backendOrigin=getBrowserApiOrigin();
 const chosenCategory=selectBreadcrumbCategory(item.categories);
 const items=templateBreadcrumbs(locale,item.title,item.slug,chosenCategory);
 let related:Awaited<ReturnType<typeof getTemplates>>['results']=[];
 if(chosenCategory){try{const response=await getTemplates({lang:locale,category:chosenCategory.slug,page_size:5});related=response.results.filter(candidate=>candidate.slug!==item.slug).slice(0,4);}catch{/* Related content is optional. */}}
 const availableVariants=publicDocumentVariants(item,locale);
 const availableFiles=availableVariants.flatMap(variant=>variant.files);
 return <article className="container page-content detail"><Breadcrumbs locale={locale} items={items} variant="detail"/>
  <TemplateDocumentSelection key={item.slug} item={item} locale={locale} backendOrigin={backendOrigin}><div className="detail-body"><div className="detail-gallery-column"><SelectedDocumentGallery item={item} locale={locale} backendOrigin={backendOrigin}/></div>
   <div className="detail-summary"><div className="detail-kicker">{item.categories.map(c=>c.name).join(' / ')}</div><h1>{item.title}</h1><p className="lead">{item.summary}</p>{fallback(locale,item.language)}
    {!!item.categories.length&&<div className="detail-tags" aria-label={locale==='uk'?'Категорії':'Categories'}>{item.categories.map(c=><Link key={c.slug} href={localizedPath(locale,`/categories/${c.slug}`)}>{c.name}</Link>)}</div>}
    {availableFiles.length>0&&<div className="mobile-detail-formats" aria-label={locale==='uk'?'Доступні формати':'Available formats'}>{[...new Set(availableFiles.map(file=>file.format.toUpperCase()))].map(format=><span key={format}>{format}</span>)}</div>}
    <DocumentDownloadSelector item={item} locale={locale} backendOrigin={backendOrigin}/>
    <dl className="detail-specs"><div><dt>{locale==='uk'?'Формати':'Formats'}</dt><dd>{availableFiles.length?[...new Set(availableFiles.map(f=>f.format.toUpperCase()))].join(', '):'—'}</dd></div><div><dt>{locale==='uk'?'Файли':'Files'}</dt><dd>{availableFiles.length}</dd></div><div><dt>{locale==='uk'?'Ліцензія':'License'}</dt><dd>{item.license_code}</dd></div>{item.attributes.map(a=>{const value=formatAttributeValue(a,locale);return value?<div key={a.code}><dt>{a.label}</dt><dd>{value}</dd></div>:null})}</dl>
   </div></div></TemplateDocumentSelection>
  <nav className="detail-section-nav" aria-label={locale==='uk'?'Розділи документа':'Document sections'}><a href="#document-description">{locale==='uk'?'Опис':'Description'}</a><a href="#document-files">{locale==='uk'?'Файли':'What’s included'}</a><a href="#document-compatibility">{locale==='uk'?'Формати та сумісність':'Format & compatibility'}</a></nav>
  <div className="detail-content"><section id="document-description" className="detail-section"><h2>{locale==='uk'?'Опис':'Description'}</h2>{item.description?.trim()?<p className="document-description">{item.description}</p>:<p className="preview-note">{locale==='uk'?'Опис відсутній.':'No description provided.'}</p>}{item.usage_instructions?.trim()&&<><h3>{locale==='uk'?'Як використовувати':'How to use'}</h3><p className="document-description">{item.usage_instructions}</p></>}</section>
   <section id="document-files" className="detail-section"><h2>{locale==='uk'?'Доступні файли':'Included files'}</h2>{!availableFiles.length?<p className="preview-note">{locale==='uk'?'Доступних файлів немає.':'No files available.'}</p>:<ul className="download-list">{availableFiles.map(file=><li key={file.id}><div><strong>{file.filename}</strong><span>{file.format.toUpperCase()}</span></div></li>)}</ul>}</section>
   <section id="document-compatibility" className="detail-section"><h2>{locale==='uk'?'Формати та сумісність':'Format & compatibility'}</h2><p>{locale==='uk'?'Завантажте доступний файл у зазначеному форматі та редагуйте його у сумісній програмі.':'Download an available document file in its listed format and edit it using compatible software.'}</p></section>
  </div>
  {related.length>0&&<section className="related-section section-border"><div className="section-heading"><h2>{locale==='uk'?'Схожі шаблони':'Related Templates'}</h2></div><div className="template-grid">{related.map(template=><TemplateCard key={template.id} template={template} locale={locale}/>)}</div></section>}
 </article>;
}
