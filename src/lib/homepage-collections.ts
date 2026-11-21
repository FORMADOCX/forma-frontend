import type {TemplateList} from './api/types';
/** Until an explicit backend featured flag is available, use newest published catalog order. */
export function homepageCollections(templates:TemplateList[], size=4){
 const seen=new Set<string>();
 const unique=templates.filter(item=>{
  if(!item?.id || !item?.slug || seen.has(item.id))return false;
  seen.add(item.id);return true;
 });
 const featured=unique.slice(0,size);
 const recent=unique.slice(size,size*2);
 return {featured,recent:recent.length===size?recent:[]};
}
