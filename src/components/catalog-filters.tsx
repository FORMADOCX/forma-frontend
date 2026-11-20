'use client';
import {useEffect,useRef,useState,type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import type {CatalogFilter} from '@/lib/api/types';
import {applyCatalogFilters,catalogHref,clearCatalogFilters,type ParsedCatalogQuery} from '@/lib/api/query';
import type {Locale} from '@/lib/i18n';

export function CatalogFilters({filters,params,base,locale}:{filters:CatalogFilter[];params:ParsedCatalogQuery;base:string;locale:Locale}){
 const router=useRouter();
 const dialog=useRef<HTMLDialogElement>(null);
 const trigger=useRef<HTMLButtonElement>(null);
 const [format,setFormat]=useState(params.format);
 const [selection,setSelection]=useState<Record<string,string[]>>({});
 const [opened,setOpened]=useState(false);
 useEffect(()=>{
  setFormat(params.format);
  const values:Record<string,string[]>={};
  for(const group of filters) values[group.key]=(params.attributes[group.key]??'').split(',').filter(Boolean);
  setSelection(values);
 },[params.format,params.attributes,filters]);
 function close(){dialog.current?.close();setOpened(false);trigger.current?.focus();}
 function change(key:string,value:string,multi:boolean){setSelection(previous=>{
  const current=previous[key]??[];
  const next=multi?(current.includes(value)?current.filter(v=>v!==value):[...current,value]):[value];
  return {...previous,[key]:next};
 });}
 function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();router.push(catalogHref(base,applyCatalogFilters(params,format,selection)));close();}
 function clear(){router.push(catalogHref(base,clearCatalogFilters(params)));close();}
 const controls=(id:string)=><>
  <fieldset className="filter-group"><legend>{locale==='uk'?'Формат':'Format'}</legend>
   <select aria-label={locale==='uk'?'Формат':'Format'} value={format} onChange={event=>setFormat(event.target.value)}>
    <option value="">{locale==='uk'?'Усі формати':'All formats'}</option>
    {['docx','xlsx','pdf'].map(value=><option key={value} value={value}>{value.toUpperCase()}</option>)}
   </select>
  </fieldset>
  {[...filters].sort((a,b)=>a.order-b.order).map(group=><fieldset key={group.key} className="filter-group"><legend>{group.label}</legend>
   {group.options.map(option=>{
    const type=group.type==='multi_select'?'checkbox':'radio';
    const checked=(selection[group.key]??[]).includes(option.value);
    return <label key={option.value} className="filter-option"><input type={type} name={`${id}-${group.key}`} checked={checked} onChange={()=>change(group.key,option.value,type==='checkbox')}/><span>{option.label}</span><span className="filter-count">{option.count}</span></label>;
   })}
   {group.type!=='multi_select'&&(selection[group.key]??[]).length>0&&<button className="filter-reset-one" type="button" onClick={()=>setSelection(old=>({...old,[group.key]:[]}))}>{locale==='uk'?'Скинути вибір':'Reset selection'}</button>}
  </fieldset>)}
  <div className="filter-actions"><button className="filter-apply" type="submit">{locale==='uk'?'Застосувати':'Apply filters'}</button><button type="button" onClick={clear}>{locale==='uk'?'Очистити фільтри':'Clear filters'}</button></div>
 </>;
 return <>
  <form className="filter-sidebar" onSubmit={submit} aria-label={locale==='uk'?'Фільтри каталогу':'Catalog filters'}><h2>{locale==='uk'?'Фільтри':'Filters'}</h2>{controls('desktop')}</form>
  <button ref={trigger} className="filter-mobile-trigger" type="button" aria-haspopup="dialog" aria-expanded={opened} onClick={()=>{dialog.current?.showModal();setOpened(true);}}>{locale==='uk'?'Відкрити фільтри':'Open filters'}</button>
  <dialog ref={dialog} className="filter-mobile-dialog" aria-label={locale==='uk'?'Фільтри каталогу':'Catalog filters'} onClose={()=>{setOpened(false);trigger.current?.focus();}}>
   <div className="filter-dialog-header"><h2>{locale==='uk'?'Фільтри':'Filters'}</h2><button type="button" onClick={close} aria-label={locale==='uk'?'Закрити фільтри':'Close filters'}>×</button></div>
   <form onSubmit={submit}>{controls('mobile')}</form>
  </dialog>
 </>;
}
