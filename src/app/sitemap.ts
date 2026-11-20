import type {MetadataRoute} from 'next';
import {indexingEnabled,siteUrl} from '@/lib/seo';
import {getCmsPages} from '@/lib/api/cms';
import {getCategories,getTemplates} from '@/lib/api/client';
import type {Language} from '@/lib/api/types';
import {localizedPath} from '@/lib/i18n';
// Fail closed: activation requires verified v0.7.1 API pagination/publication semantics.
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 if(!indexingEnabled||!siteUrl)return [];
 const entries:MetadataRoute.Sitemap=[];
 for(const lang of ['en','uk'] as Language[]){
  // Do not infer locales from fallback responses.
  for(let page=1;page<=100;page++){
   const r=await getCmsPages(lang,page);
   for(const p of r.results)if(p.locale===lang&&p.slug!=='submit')entries.push({url:siteUrl+localizedPath(lang,`/${p.slug}`)});
   if(!r.next)break;
  }
  for(let page=1;page<=100;page++){
   const r=await getCategories(lang,page,100);
   for(const c of r.results)if(c.language===lang)entries.push({url:siteUrl+localizedPath(lang,`/categories/${c.slug}`)});
   if(!r.next)break;
  }
  for(let page=1;page<=100;page++){
   const r=await getTemplates({lang,page,page_size:100});
   for(const t of r.results)if(t.language===lang)entries.push({url:siteUrl+localizedPath(lang,`/templates/${t.slug}`)});
   if(!r.next)break;
  }
 }
 return entries;
}
