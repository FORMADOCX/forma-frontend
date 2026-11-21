'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import type {CatalogFilter} from '@/lib/api/types';
import {applyCatalogFilters,catalogHref,clearCatalogFilters,normalizedAttributes,type ParsedCatalogQuery} from '@/lib/api/query';
import type {Locale} from '@/lib/i18n';
import {FormaSelect} from './forma-select';

export function CatalogFilters({filters,params,base,locale}:{filters:CatalogFilter[];params:ParsedCatalogQuery;base:string;locale:Locale}){
 const router=useRouter();
 const dialog=useRef<HTMLDialogElement>(null);
 const trigger=useRef<HTMLButtonElement>(null);
 const current=normalizedAttributes(params.attributes,params.rawAttributes);
 const selectedFromParams=()=>Object.fromEntries(Object.entries(current).map(([key,value])=>[key,value.split(',').filter(Boolean)]));
 const [format,setFormat]=useState(params.format);
 const [selection,setSelection]=useState<Record<string,string[]>>(selectedFromParams);
 const [opened,setOpened]=useState(false);
 const activeCount=(params.format?1:0)+Object.values(current).reduce((count,value)=>count+value.split(',').length,0);
 useEffect(()=>{
  setFormat(params.format);setSelection(selectedFromParams());
 // The catalog owns these props; its key remounts the sheet when URL changes.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[params.format,params.attributes,params.rawAttributes]);
 useEffect(()=>{
  if(!opened)return;
  const prior=document.body.style.overflow;document.body.style.overflow='hidden';
  return ()=>{document.body.style.overflow=prior;};
 },[opened]);
 function close(){dialog.current?.close();setOpened(false);trigger.current?.focus();}
 function navigate(nextFormat:string,next:Record<string,string[]>){
  const href=catalogHref(base,applyCatalogFilters(params,nextFormat,next));
  if(href!==catalogHref(base,params))router.push(href);
 }
 function change(key:string,value:string,multi:boolean,mobile:boolean){
  const previous=mobile?selection:selectedFromParams();
  const selected=previous[key]??[];
  const values=multi?(selected.includes(value)?selected.filter(item=>item!==value):[...selected,value]):(selected.includes(value)?[]:[value]);
  const next={...previous,[key]:values};
  if(mobile)setSelection(next);else navigate(params.format,next);
 }
 function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();navigate(format,selection);close();}
 function clear(mobile:boolean){
  if(mobile){setFormat('');setSelection({});}
  else {router.push(catalogHref(base,clearCatalogFilters(params)));}
 }
 const controls=(id:string,mobile:boolean)=><>
  <fieldset className="filter-group"><legend>{locale==='uk'?'Формат':'Format'}</legend>
   <FormaSelect label={locale==='uk'?'Формат':'Format'} value={mobile?format:params.format} onChange={value=>mobile?setFormat(value):navigate(value,selectedFromParams())} options={[{value:'',label:locale==='uk'?'Усі формати':'All formats'},...['docx','xlsx','pdf'].map(value=>({value,label:value.toUpperCase()}))]}/>
  </fieldset>
  {[...filters].sort((a,b)=>a.order-b.order).filter(group=>group.options.length>0).map(group=><fieldset key={group.key} className="filter-group"><legend>{group.label}</legend>
   {group.options.map(option=>{
    const type=group.type==='multi_select'?'checkbox':'radio';
    const checked=(mobile?selection:selectedFromParams())[group.key]?.includes(option.value)??false;
    return <label key={option.value} className="filter-option"><input type={type} name={`${id}-${group.key}`} checked={checked} onChange={()=>change(group.key,option.value,type==='checkbox',mobile)}/><span className="filter-option-label">{option.label}</span>{Number.isFinite(option.count)&&<span className="filter-count" title={locale==='uk'?'Кількість у базовій вибірці':'Count in base result set'}>{option.count}</span>}</label>;
   })}
   {group.type!=='multi_select'&&((mobile?selection:selectedFromParams())[group.key]??[]).length>0&&<button className="filter-reset-one" type="button" onClick={()=>{
    if(mobile)setSelection(old=>({...old,[group.key]:[]}));
    else navigate(params.format,{...selectedFromParams(),[group.key]:[]});
   }}>{locale==='uk'?'Скинути вибір':'Reset selection'}</button>}
  </fieldset>)}
  {mobile&&<div className="filter-actions"><button className="filter-apply" type="submit">{locale==='uk'?'Показати результати':'Show results'}</button><button type="button" onClick={()=>clear(true)}>{locale==='uk'?'Очистити все':'Clear all'}</button></div>}
 </>;
 return <>
  <div className="filter-sidebar" aria-label={locale==='uk'?'Фільтри каталогу':'Catalog filters'}>
   <div className="filter-sidebar-heading"><h2>{locale==='uk'?'Фільтри':'Filters'}</h2><button type="button" onClick={()=>clear(false)} disabled={activeCount===0}>{locale==='uk'?'Очистити все':'Clear all'}</button></div>
   {controls('desktop',false)}
  </div>
  <button ref={trigger} className="filter-mobile-trigger" type="button" aria-haspopup="dialog" aria-expanded={opened} onClick={()=>{dialog.current?.showModal();setOpened(true);}}>{locale==='uk'?'Фільтри':'Filters'}{activeCount>0?` (${activeCount})`:''}</button>
  <dialog ref={dialog} className="filter-mobile-dialog" aria-modal="true" aria-label={locale==='uk'?'Фільтри каталогу':'Catalog filters'} onClose={()=>{setOpened(false);trigger.current?.focus();}}>
   <div className="filter-dialog-header"><h2>{locale==='uk'?'Фільтри':'Filters'}</h2><button type="button" onClick={close} aria-label={locale==='uk'?'Закрити фільтри':'Close filters'}>×</button></div>
   <form onSubmit={submit}>{controls('mobile',true)}</form>
  </dialog>
 </>;
}
