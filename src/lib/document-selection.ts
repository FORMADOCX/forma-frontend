import type {DocumentFormat,DocumentVariant,TemplateDetail} from './api/types';

/** Only file records actually delivered by Django are offered; never infer a missing format. */
export type AvailableVariant={key:string;title:string;subtitle:string;files:DocumentFormat[];isDefault:boolean};
const invalidLabels=new Set(['','unknown','default','not-applicable','not_applicable','none','null']);
const safeText=(value:unknown):string=>typeof value==='string'&&!invalidLabels.has(value.trim().toLowerCase())?value.trim():'';
const readable=(value:string)=>value.replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
const validFile=(value:unknown):value is DocumentFormat=>{
 if(!value||typeof value!=='object')return false;
 const file=value as Partial<DocumentFormat>;
 return typeof file.id==='string'&&file.id.length>0&&typeof file.format==='string'&&file.format.length>0&&typeof file.filename==='string'&&file.filename.length>0&&typeof file.download_url==='string'&&file.download_url.length>0;
};
const orderedFiles=(files:unknown):DocumentFormat[]=>Array.isArray(files)?files.filter(validFile):[];
const formatPriority=(format:string)=>({docx:0,xlsx:1,odt:2,ods:3,pptx:4,pdf:5}[format.toLowerCase()]??10);
export function initialDocumentFile(files:DocumentFormat[],preferredFormat?:string):DocumentFormat|null{
 if(preferredFormat){const found=files.find(f=>f.format.toLowerCase()===preferredFormat.toLowerCase());if(found)return found}
 return files.reduce<DocumentFormat|null>((best,file)=>!best||formatPriority(file.format)<formatPriority(best.format)?file:best,null);
}
export function publicDocumentVariants(item:Pick<TemplateDetail,'variants'|'formats'>,locale:'en'|'uk'):AvailableVariant[]{
 const variants=Array.isArray(item.variants)?item.variants:[];
 const available:AvailableVariant[]=[];
 for(const [index,raw] of variants.entries()){
  if(!raw||typeof raw!=='object')continue;
  const variant=raw as Partial<DocumentVariant>;
  const files=orderedFiles(variant.files);
  if(!files.length)continue;
  const size=safeText(variant.page_size);
  const orientation=safeText(variant.orientation);
  const label=safeText(variant.label);
  const code=safeText(variant.code);
  const title=label||[size?readable(size):'',orientation?readable(orientation):''].filter(Boolean).join(' ')|| (code?readable(code):'') || (files.every(f=>f.format.toLowerCase()==='xlsx')?(locale==='uk'?'Електронна таблиця':'Spreadsheet'):(locale==='uk'?'Документ':'Document'));
  const subtitle=label?[size?readable(size):'',orientation?readable(orientation):''].filter(Boolean).join(' · '):'';
  available.push({key:`variant:${String(variant.id??variant.code??index)}:${index}`,title,subtitle,files,isDefault:variant.is_default===true});
 }
 if(available.length)return available;
 // Legacy detail contracts expose a flat formats array and no variants.
 const legacy=orderedFiles(item.formats);
 return legacy.length?[{key:'legacy',title:locale==='uk'?'Документ':'Document',subtitle:'',files:legacy,isDefault:true}]:[];
}
export function initialDocumentVariant(variants:AvailableVariant[]):AvailableVariant|null{
 return variants.find(v=>v.isDefault)||variants[0]||null;
}
export function resolveDocumentSelection(variants:AvailableVariant[],variantKey:string,fileId:string):{variant:AvailableVariant|null;file:DocumentFormat|null}{
 const variant=variants.find(v=>v.key===variantKey)||initialDocumentVariant(variants);
 if(!variant)return {variant:null,file:null};
 return {variant,file:variant.files.find(f=>f.id===fileId)||initialDocumentFile(variant.files)};
}
