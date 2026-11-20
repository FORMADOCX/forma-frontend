import type {Metadata} from 'next';
import {SiteShell} from '@/components/site-shell';
import {CmsPageView} from '@/components/cms-page';
import {getCmsPage} from '@/lib/api/cms';
import {entityMetadata,verifiedAlternates} from '@/lib/api/seo';
export async function generateMetadata():Promise<Metadata>{
 try{
  const p=await getCmsPage('about','en');const metadata=entityMetadata('en','/about',p.locale,p.seo,p.title,p.summary);
  let otherLanguage:string|undefined;
  try{otherLanguage=(await getCmsPage('about','uk' )).locale}catch{/* No verified translation */}
  const languages=verifiedAlternates('/about',p.locale,otherLanguage);
  return languages?{...metadata,alternates:{...metadata.alternates,languages}}:metadata;
 }
 catch{return {robots:{index:false,follow:true}}}
}
export default function Page(){return <SiteShell locale="en"><CmsPageView locale="en" slug="about"/></SiteShell>}
