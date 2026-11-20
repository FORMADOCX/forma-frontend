import 'server-only';
import {getCmsPage,getCmsPages,type CmsPage} from './cms';
import type {Locale} from '@/lib/i18n';

export interface CmsNavigationLink {slug:string;title:string}
export interface CmsNavigation {headerLinks:CmsNavigationLink[];footerLinks:CmsNavigationLink[]}

/** A single detail request per published, locale-matching list item supplies both visibility flags.
 * Page List is ordered by the backend; use that order unless detail supplies a valid sort_order.
 * Both public menus intentionally omit unavailable, unpublished and fallback-language details.
 */
export async function getCmsNavigation(locale:Locale):Promise<CmsNavigation>{
 const entries:{page:CmsPage;position:number}[]=[];
 const visited=new Set<string>();
 try{
  for(let pageNumber=1;pageNumber<=20;pageNumber++){
   const listing=await getCmsPages(locale,pageNumber);
   const candidates=listing.results.filter(item=>item.locale===locale&&item.slug!=='submit'&&!visited.has(item.slug));
   for(const item of candidates)visited.add(item.slug);
   for(let offset=0;offset<candidates.length;offset+=6){
    const results=await Promise.allSettled(candidates.slice(offset,offset+6).map(item=>getCmsPage(item.slug,locale)));
    for(let index=0;index<results.length;index++){
     const result=results[index];
     if(result.status!=='fulfilled'||result.value.locale!==locale||result.value.slug!==candidates[offset+index].slug)continue;
     entries.push({page:result.value,position:entries.length});
    }
   }
   if(!listing.next)break;
  }
 }catch{/* Navigation remains usable when the CMS list is temporarily unavailable. */}
 entries.sort((a,b)=>{
  const aOrder=a.page.sort_order??a.position;
  const bOrder=b.page.sort_order??b.position;
  return aOrder-bOrder||a.position-b.position;
 });
 const headerLinks:CmsNavigationLink[]=[];
 const footerLinks:CmsNavigationLink[]=[];
 for(const {page} of entries){
  const link={slug:page.slug,title:page.title};
  if(page.show_in_navigation)headerLinks.push(link);
  if(page.show_in_footer)footerLinks.push(link);
 }
 return {headerLinks,footerLinks};
}
