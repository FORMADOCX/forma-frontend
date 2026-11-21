'use client';
import {useEffect,useState} from 'react';
import Image from 'next/image';
import {getPreviewSource} from '@/lib/preview-image';
import type {Locale} from '@/lib/i18n';

export function DocumentCover({url,locale,priority=false,backendOrigin}:{url?:string|null;locale:Locale;priority?:boolean;backendOrigin?:string}){
 const source=getPreviewSource(url,backendOrigin);
 const [failedSource,setFailedSource]=useState<string|null>(null);
 useEffect(()=>{setFailedSource(null)},[source?.src]);
 if(!source||failedSource===source.src)return <div className="template-card-media template-card-text"><span>{locale==='uk'?'Прев’ю документа недоступне':'Document preview unavailable'}</span></div>;
 return <div className="template-card-media"><Image src={source.src} alt={locale==='uk'?'Прев’ю документа':'Document preview'} width={640} height={860} sizes="(max-width: 520px) 100vw, (max-width: 850px) 50vw, 25vw" priority={priority} unoptimized className="document-cover-image" onError={()=>setFailedSource(source.src)}/></div>;
}
