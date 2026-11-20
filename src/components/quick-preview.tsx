'use client';
import {useRef,useState} from 'react';
import Link from 'next/link';
import {dictionary,localizedPath,type Locale} from '@/lib/i18n';
import type {TemplateQuickPreview} from '@/lib/api/types';
import {DocumentCover} from './document-cover';
import {getDownloadUrl} from '@/lib/download-url';
export function QuickPreview({slug,locale,backendOrigin}:{slug:string;locale:Locale;backendOrigin?:string}){
 const dialog=useRef<HTMLDialogElement>(null);const trigger=useRef<HTMLButtonElement>(null);
 const [data,setData]=useState<TemplateQuickPreview|null>(null);const [busy,setBusy]=useState(false);const [error,setError]=useState(false);
 const t=dictionary[locale];const close=()=>dialog.current?.close();
 async function open(){setData(null);setError(false);setBusy(true);dialog.current?.showModal();
  try{const response=await fetch(`/api/quick-preview?slug=${encodeURIComponent(slug)}&lang=${locale}`,{cache:'no-store'});
   if(!response.ok)throw new Error('Preview not available');setData(await response.json() as TemplateQuickPreview);
  }catch{setError(true)}finally{setBusy(false)}
 }
 return <><button ref={trigger} className="quick-preview-trigger" type="button" onClick={open}><span aria-hidden="true">◎</span> {t.preview}</button>
  <dialog ref={dialog} className="preview-dialog" aria-label={t.preview} onClose={()=>trigger.current?.focus()} onClick={event=>{if(event.target===dialog.current)close()}}>
   <div className="preview-content"><div className="preview-top"><h2>{data?.title??t.preview}</h2><button type="button" onClick={close} aria-label={t.close}>×</button></div>
    {busy&&<p role="status">{locale==='uk'?'Завантаження…':'Loading…'}</p>}{error&&<p role="alert">{locale==='uk'?'Попередній перегляд недоступний.':'Quick preview is unavailable.'}</p>}
    {data&&<><div className="dialog-cover"><DocumentCover url={data.cover_preview_url} locale={locale} backendOrigin={backendOrigin}/></div><p>{data.summary}</p>
     <p className="formats">{locale==='uk'?'Ліцензія':'License'}: {data.license_code}</p>
     <div className="quick-preview-actions"><Link href={localizedPath(locale,`/templates/${data.slug}`)} className="button-link">{t.fullDetails}</Link>
      {data.formats.map(file=>{const url=getDownloadUrl(file,data.slug,backendOrigin);return url?<a key={file.id} className="outline-link" href={url} rel="noopener noreferrer">{t.download} {file.format.toUpperCase()}</a>:null})}</div></>}
   </div>
  </dialog></>;
}
