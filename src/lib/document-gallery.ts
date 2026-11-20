import type {DocumentFormat,DocumentPreview} from './api/types';

export interface PreviewGroup {fileId:string;format:DocumentFormat|null;pages:DocumentPreview[]}
/** Preserve backend file ordering; sort pages numerically within each file. */
export function groupDocumentPreviews(previews:DocumentPreview[], formats:DocumentFormat[]):PreviewGroup[] {
  const groups=new Map<string,PreviewGroup>();
  for (const format of formats) groups.set(format.id,{fileId:format.id,format,pages:[]});
  for(const preview of previews){
    let group=groups.get(preview.file_id);
    if(!group){group={fileId:preview.file_id,format:null,pages:[]};groups.set(preview.file_id,group)}
    group.pages.push(preview);
  }
  return [...groups.values()].map(group=>({...group,pages:[...group.pages].sort((a,b)=>a.page-b.page)})).filter(group=>group.pages.length>0);
}
export function displayFileSize(bytes:number):string {
  if(!Number.isFinite(bytes)||bytes<0)return '—';
  if(bytes<1024)return `${Math.round(bytes)} B`;
  const units=['KB','MB','GB','TB'];let value=bytes;let index=-1;
  do{value/=1024;index++}while(value>=1024&&index<units.length-1);
  return `${value.toFixed(value<10?1:0)} ${units[index]}`;
}
