'use client';
import {useState} from 'react';
import Image from 'next/image';
import type {DocumentFormat,DocumentPreview} from '@/lib/api/types';
import type {Locale} from '@/lib/i18n';
import {getPreviewSource} from '@/lib/preview-image';
import {groupDocumentPreviews} from '@/lib/document-gallery';
import {DocumentLightbox} from './document-lightbox';
export function DocumentGallery({previews,formats,locale,backendOrigin}:{previews:DocumentPreview[];formats:DocumentFormat[];locale:Locale;backendOrigin?:string}){
 const groups=groupDocumentPreviews(previews,formats);
 const [fileIndex,setFileIndex]=useState(0);
 const [pageIndex,setPageIndex]=useState(0);
 const group=groups[Math.min(fileIndex,Math.max(0,groups.length-1))];
 const activePageIndex=Math.min(pageIndex,Math.max(0,(group?.pages.length??1)-1));
 const page=group?.pages[activePageIndex];const trusted=page?getPreviewSource(page.url,backendOrigin):null;
 const selectFile=(index:number)=>{setFileIndex(index);setPageIndex(0)};
 const move=(direction:number)=>setPageIndex(index=>Math.max(0,Math.min((group?.pages.length??1)-1,index+direction)));
 if(!groups.length)return <section className="document-gallery gallery-empty" aria-label={locale==='uk'?'Галерея документа':'Document gallery'}><p className="preview-note">{locale==='uk'?'Сторінки документа ще недоступні.':'Document pages are not available yet.'}</p></section>;
 return <section className="document-gallery" aria-label={locale==='uk'?'Галерея документа':'Document gallery'}>
  {groups.length>1&&<div className="gallery-files" role="group" aria-label={locale==='uk'?'Оберіть файл':'Select document file'}>{groups.map((g,index)=><button key={g.fileId} type="button" aria-pressed={index===fileIndex} onClick={()=>selectFile(index)}>{g.format?.filename||`${locale==='uk'?'Файл':'File'} ${index+1}`}</button>)}</div>}
  <div className="gallery-frame" onKeyDown={event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();move(event.key==='ArrowRight'?1:-1)}else if(event.key==='Home'){event.preventDefault();setPageIndex(0)}else if(event.key==='End'){event.preventDefault();setPageIndex(group.pages.length-1)}}} tabIndex={0} aria-label={locale==='uk'?'Сторінки документа: стрілки, Home, End':'Document pages: arrow keys, Home, End'}>
   {trusted&&page?<DocumentLightbox locale={locale} index={activePageIndex} pages={group.pages.flatMap(p=>{const source=getPreviewSource(p.url,backendOrigin);return source?[{src:source.src,unoptimized:source.unoptimized,width:p.width,height:p.height,label:`${group.format?.filename||'Document'} — ${locale==='uk'?'сторінка':'page'} ${p.page}`}]:[]})}><Image key={trusted.src} src={trusted.src} unoptimized={trusted.unoptimized} alt={`${group.format?.filename||'Document'} — ${locale==='uk'?'сторінка':'page'} ${page.page}`} width={page.width>0?page.width:640} height={page.height>0?page.height:860} sizes="(max-width: 850px) 100vw, 54vw" className="gallery-image"/></DocumentLightbox>:<p className="preview-note">{locale==='uk'?'Прев’ю недоступне.':'Preview unavailable.'}</p>}
  </div>

  <div className="gallery-nav"><button className="gallery-arrow" type="button" aria-label={locale==='uk'?'Попередня сторінка':'Previous page'} onClick={()=>move(-1)} disabled={activePageIndex===0}>‹</button>
   <div className="gallery-pages" role="group" aria-label={locale==='uk'?'Перейти до сторінки':'Go to page'}>{group.pages.map((p,index)=>{const source=getPreviewSource(p.url,backendOrigin);return <button className="gallery-thumb" key={`${p.file_id}:${p.page}`} type="button" aria-current={index===activePageIndex?'page':undefined} aria-label={`${locale==='uk'?'Сторінка':'Page'} ${p.page}`} onClick={()=>setPageIndex(index)}>{source?<Image src={source.src} unoptimized={source.unoptimized} alt="" width={90} height={115} sizes="90px"/>:<span>{p.page}</span>}</button>})}</div>
   <button className="gallery-arrow" type="button" aria-label={locale==='uk'?'Наступна сторінка':'Next page'} onClick={()=>move(1)} disabled={activePageIndex===group.pages.length-1}>›</button>
  </div><div className="gallery-controls"><span aria-live="polite">{locale==='uk'?'Сторінка':'Page'} {page?.page??'—'} · {activePageIndex+1} / {group.pages.length}</span></div>
 </section>;
}
