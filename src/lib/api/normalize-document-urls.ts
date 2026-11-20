import {publicDjangoUrl} from './public-urls';
import type {TemplateList,DocumentFormat,DocumentPreview} from './types';
export function normalizeTemplateUrls<T extends TemplateList>(item:T):T {
 const cover=publicDjangoUrl(item.cover_preview_url,'preview');
 const result={...item,cover_preview_url:cover} as T;
 if('formats' in result && Array.isArray(result.formats)){
  Object.assign(result,{formats:(result.formats as DocumentFormat[]).map(file=>({...file,download_url:publicDjangoUrl(file.download_url,'download',{slug:item.slug,fileId:file.id})}))});
 }
 if('previews' in result && Array.isArray(result.previews)){
  Object.assign(result,{previews:(result.previews as DocumentPreview[]).map(preview=>({...preview,url:publicDjangoUrl(preview.url,'preview',{slug:item.slug,fileId:preview.file_id})??''}))});
 }
 return result;
}
