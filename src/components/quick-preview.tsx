'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {createPortal} from 'react-dom';
import Image from 'next/image';
import {dictionary,localizedPath,type Locale} from '@/lib/i18n';
import type {TemplateQuickPreview} from '@/lib/api/types';
import {getDownloadUrl} from '@/lib/download-url';
import {getPreviewSource} from '@/lib/preview-image';
import {DocumentLightbox} from './document-lightbox';
import {LoadingIndicator} from './loading-indicator';

export function QuickPreview({slug,locale,backendOrigin}:{slug:string;locale:Locale;backendOrigin?:string}){
 const dialog=useRef<HTMLDialogElement>(null);
 const trigger=useRef<HTMLButtonElement>(null);
 const request=useRef<AbortController|null>(null);
 const previousBodyOverflow=useRef<string|null>(null);
 const [data,setData]=useState<TemplateQuickPreview|null>(null);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState(false);
 const [portalRoot,setPortalRoot]=useState<HTMLElement|null>(null);
 useEffect(()=>{setPortalRoot(document.body)},[]);
 useEffect(()=>{const onResize=()=>{if(window.matchMedia('(max-width: 767px)').matches)dialog.current?.close()};window.addEventListener('resize',onResize);return ()=>{window.removeEventListener('resize',onResize);request.current?.abort();if(previousBodyOverflow.current!==null)document.body.style.overflow=previousBodyOverflow.current}},[]);
 const t=dictionary[locale];
 const close=()=>dialog.current?.close();
 const onClose=()=>{request.current?.abort();request.current=null;setBusy(false);if(previousBodyOverflow.current!==null){document.body.style.overflow=previousBodyOverflow.current;previousBodyOverflow.current=null}if(!window.matchMedia('(max-width: 767px)').matches)trigger.current?.focus()};
 async function open(){
  // CSS removes the trigger on mobile, but this guard also prevents an API request
  // should a click be dispatched programmatically or the viewport resize.
  if(window.matchMedia('(max-width: 767px)').matches)return;
  if(dialog.current?.open)return;
  const controller=new AbortController();request.current=controller;
  setData(null);setError(false);setBusy(true);
  dialog.current?.showModal();
  previousBodyOverflow.current=document.body.style.overflow;document.body.style.overflow='hidden';
  try{
   const response=await fetch(`/api/quick-preview?slug=${encodeURIComponent(slug)}&lang=${locale}`,{cache:'no-store',signal:controller.signal});
   if(!response.ok)throw new Error('Preview not available');
   const result=await response.json() as TemplateQuickPreview;
   if(!controller.signal.aborted)setData(result);
  }catch{if(!controller.signal.aborted)setError(true)}
  finally{if(!controller.signal.aborted)setBusy(false)}
 }
 return <>
  <button ref={trigger} className="quick-preview-trigger" type="button" onClick={open}><span aria-hidden="true">◎</span> {t.preview}</button>
  {portalRoot&&createPortal(<dialog ref={dialog} className="preview-dialog preview-drawer" aria-label={locale==='uk'?'Швидкий перегляд шаблону':'Template quick preview'} onClose={onClose} onClick={event=>{if(event.target===dialog.current)close()}}>
   <div className="preview-content preview-drawer-content">
    <div className="preview-top preview-drawer-header"><h2>{data?.title??t.preview}</h2><button type="button" className="preview-drawer-close" onClick={close} autoFocus aria-label={t.close}>×</button></div>
    <div className="preview-drawer-body">
     {busy&&<LoadingIndicator locale={locale} compact/>}
     {error&&<p role="alert">{locale==='uk'?'Попередній перегляд недоступний.':'Quick preview is unavailable.'}</p>}
     {data&&<>
      {(()=>{const source=getPreviewSource(data.cover_preview_url,backendOrigin);return source?
       <div className="dialog-cover drawer-document"><DocumentLightbox locale={locale} pages={[{src:source.src,unoptimized:source.unoptimized,width:640,height:860,label:data.title}]}>
        <Image src={source.src} unoptimized={source.unoptimized} alt={locale==='uk'?`Прев’ю: ${data.title}`:`Preview: ${data.title}`} width={640} height={860} sizes="(max-width: 1024px) 90vw, 48vw" className="drawer-document-image"/>
        <span className="preview-expand-caption">{locale==='uk'?'Збільшити прев’ю ↗':'View larger ↗'}</span>
       </DocumentLightbox></div>:
       <p className="preview-note">{locale==='uk'?'Прев’ю документа недоступне.':'Document preview unavailable.'}</p>})()}
      {data.summary?.trim()&&<p className="preview-drawer-summary">{data.summary}</p>}
      {data.license_code&&<p className="formats">{locale==='uk'?'Ліцензія':'License'}: {data.license_code}</p>}
      <div className="quick-preview-actions"><Link href={localizedPath(locale,`/templates/${data.slug}`)} className="button-link">{t.fullDetails}</Link>
       {data.formats.map(file=>{const url=getDownloadUrl(file,data.slug,backendOrigin);return url?<a key={file.id} className="outline-link" href={url} rel="noopener noreferrer">{t.download} {file.format.toUpperCase()}</a>:null})}
      </div>
     </>}
    </div>
   </div>
  </dialog>,portalRoot)}
 </>;
}
