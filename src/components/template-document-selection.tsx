'use client';
import {createContext,useContext,useMemo,useState,type ReactNode} from 'react';
import type {DocumentFormat,DocumentPreview,TemplateDetail} from '@/lib/api/types';
import type {Locale} from '@/lib/i18n';
import {publicDocumentVariants,initialDocumentFile,initialDocumentVariant,resolveDocumentSelection} from '@/lib/document-selection';
import {getDownloadUrl} from '@/lib/download-url';
import {displayFileSize} from '@/lib/document-gallery';
import {DocumentGallery} from './document-gallery';

type State={variantKey:string;fileId:string;setVariant:(key:string)=>void;setFile:(id:string)=>void};
const SelectionContext=createContext<State|null>(null);
function useSelection(){const context=useContext(SelectionContext);if(!context)throw new Error('Document selection context missing');return context}
export function TemplateDocumentSelection({item,locale,backendOrigin,children}:{item:TemplateDetail;locale:Locale;backendOrigin?:string;children:ReactNode}){
 const variants=useMemo(()=>publicDocumentVariants(item,locale),[item,locale]);
 const initial=initialDocumentVariant(variants);
 const [selection,setSelection]=useState(()=>({variantKey:initial?.key??'',fileId:initialDocumentFile(initial?.files??[])?.id??''}));
 const setVariant=(key:string)=>setSelection(previous=>{
  const variant=variants.find(v=>v.key===key);if(!variant)return previous;
  const old=resolveDocumentSelection(variants,previous.variantKey,previous.fileId).file;
  const file=initialDocumentFile(variant.files,old?.format);
  return {variantKey:key,fileId:file?.id??''};
 });
 const setFile=(id:string)=>setSelection(previous=>({...previous,fileId:id}));
 return <SelectionContext.Provider value={{...selection,setVariant,setFile}}>{children}</SelectionContext.Provider>;
}
export function SelectedDocumentGallery({item,locale,backendOrigin}:{item:TemplateDetail;locale:Locale;backendOrigin?:string}){
 const selection=useSelection();const variants=publicDocumentVariants(item,locale);
 const {file}=resolveDocumentSelection(variants,selection.variantKey,selection.fileId);
 // Previews have authoritative file_id associations. Never display a different file's pages as the selected file.
 const previews:DocumentPreview[]=file?(item.previews??[]).filter(p=>p.file_id===file.id):[];
 // Preserve only genuinely template-level pages; never show another file's pages.
 const legacy=!item.variants?.length;
 const templatePages=legacy?(item.previews??[]).filter(p=>!p.file_id):[];
 const galleryPreviews=previews.length?previews:templatePages;
 const files:DocumentFormat[]=file?[file]:[];
 return <DocumentGallery key={file?.id??'empty'} previews={galleryPreviews} formats={files} locale={locale} backendOrigin={backendOrigin}/>;
}
export function DocumentDownloadSelector({item,locale,backendOrigin}:{item:TemplateDetail;locale:Locale;backendOrigin?:string}){
 const selection=useSelection();const variants=publicDocumentVariants(item,locale);
 const {variant,file}=resolveDocumentSelection(variants,selection.variantKey,selection.fileId);
 const url=file?getDownloadUrl(file,item.slug,backendOrigin):null;
 const uk=locale==='uk';
 return <section className="variant-download" aria-label={uk?'Завантажити шаблон':'Download this template'}>
  <h2>{uk?'Завантажити шаблон':'Download this template'}</h2>
  {variants.length>1&&<fieldset className="variant-fieldset"><legend>{uk?'Варіант документа':'Document size / variant'}</legend><div className="variant-options">{variants.map(option=><label key={option.key} className="variant-tile"><input type="radio" name="document-variant" value={option.key} checked={variant?.key===option.key} onChange={()=>selection.setVariant(option.key)}/><span><strong>{option.title}</strong>{option.subtitle&&<small>{option.subtitle}</small>}</span><span className="variant-check" aria-hidden="true">✓</span></label>)}</div></fieldset>}
  {variant&&variant.files.length>1&&<fieldset className="variant-fieldset"><legend>{uk?'Формат файлу':'File format'}</legend><div className="variant-options">{variant.files.map(option=><label key={option.id} className="variant-tile"><input type="radio" name="document-file" value={option.id} checked={file?.id===option.id} onChange={()=>selection.setFile(option.id)}/><span><strong>{option.format.toUpperCase()}</strong><small>{variant.files.filter(other=>other.format.toLowerCase()===option.format.toLowerCase()).length>1?option.filename:formatDescription(option.format,locale)}</small></span><span className="variant-check" aria-hidden="true">✓</span></label>)}</div></fieldset>}
  {file&&<div className="variant-selected" aria-live="polite"><span>{uk?'Вибраний файл':'Selected file'}</span><strong>{file.filename}</strong><small>{[variant?.title,file.format.toUpperCase(),typeof file.byte_size==='number'&&Number.isFinite(file.byte_size)&&file.byte_size>=0?displayFileSize(file.byte_size):''].filter(Boolean).join(' · ')}</small></div>}
  {url?<a className="button-link detail-primary-download variant-download-button" href={url} rel="noopener noreferrer">{uk?'Завантажити':'Download'} {file?.format.toUpperCase()}</a>:<p className="preview-note" role="status">{uk?'Файл недоступний':'File unavailable'}</p>}
 </section>;
}
function formatDescription(format:string,locale:Locale):string{
 const uk=locale==='uk';
 switch(format.toLowerCase()){
  case 'docx':return uk?'Редагований документ Word':'Editable Word document';
  case 'xlsx':return uk?'Редагована електронна таблиця':'Editable spreadsheet';
  case 'pdf':return uk?'Документ PDF':'PDF document';
  default:return format.toUpperCase();
 }
}
