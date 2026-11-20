'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import Image from 'next/image';
import type {Locale} from '@/lib/i18n';
export type LightboxPage={src:string;unoptimized:boolean;width:number;height:number;label:string};
export function DocumentLightbox({pages,index=0,locale,children}:{pages:LightboxPage[];index?:number;locale:Locale;children?:ReactNode}){
 const dialog=useRef<HTMLDialogElement>(null);const trigger=useRef<HTMLButtonElement>(null);
 const [selected,setSelected]=useState(index);const [scale,setScale]=useState(1);
 const open=()=>{setSelected(index);setScale(1);dialog.current?.showModal();};
 const close=()=>dialog.current?.close();
 useEffect(()=>{const node=dialog.current;if(!node)return;const onKey=(event:KeyboardEvent)=>{
  if(event.key==='ArrowRight'){event.preventDefault();event.stopPropagation();setSelected(i=>Math.min(pages.length-1,i+1));setScale(1)}
  if(event.key==='ArrowLeft'){event.preventDefault();event.stopPropagation();setSelected(i=>Math.max(0,i-1));setScale(1)}
 };node.addEventListener('keydown',onKey);return ()=>node.removeEventListener('keydown',onKey)},[pages.length]);
 const page=pages[selected];
 if(!pages.length)return null;
 return <><button ref={trigger} type="button" className={children?"preview-image-trigger":"expand-preview"} onClick={open} aria-label={locale==='uk'?'Збільшити прев’ю':'View larger'}>{children??<>{locale==='uk'?'Збільшити прев’ю':'View larger'} <span aria-hidden="true">↗</span></>}</button>
  <dialog ref={dialog} className="document-lightbox" aria-label={locale==='uk'?'Збільшений перегляд документа':'Expanded document preview'} onClose={()=>{trigger.current?.focus();setScale(1)}} onClick={event=>{if(event.target===dialog.current)close()}}>
   <div className="lightbox-shell">
    <div className="lightbox-toolbar"><span aria-live="polite">{locale==='uk'?'Сторінка':'Page'} {selected+1} / {pages.length}</span>
     <div className="lightbox-tools"><button type="button" onClick={()=>setScale(v=>Math.max(1,Math.round((v-.25)*100)/100))} disabled={scale<=1} aria-label={locale==='uk'?'Зменшити':'Zoom out'}>−</button><span>{Math.round(scale*100)}%</span><button type="button" onClick={()=>setScale(v=>Math.min(3,Math.round((v+.25)*100)/100))} disabled={scale>=3} aria-label={locale==='uk'?'Збільшити':'Zoom in'}>+</button><button type="button" onClick={close} aria-label={locale==='uk'?'Закрити':'Close'}>×</button></div></div>
    <div className="lightbox-scroll">{page&&<div className="lightbox-page" style={{width:`${scale*100}%`}}><Image src={page.src} unoptimized={page.unoptimized} alt={page.label} width={page.width||640} height={page.height||860} sizes="100vw"/></div>}</div>
    {pages.length>1&&<div className="lightbox-pages"><button type="button" onClick={()=>{setSelected(v=>Math.max(0,v-1));setScale(1)}} disabled={selected===0}>{locale==='uk'?'← Попередня':'← Previous'}</button><button type="button" onClick={()=>{setSelected(v=>Math.min(pages.length-1,v+1));setScale(1)}} disabled={selected===pages.length-1}>{locale==='uk'?'Наступна →':'Next →'}</button></div>}
   </div>
  </dialog></>;
}
