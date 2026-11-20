import type {Metadata} from 'next';
import {SiteShell} from '@/components/site-shell';
import {CmsPageView} from '@/components/cms-page';
import {getCmsPage} from '@/lib/api/cms';
import {entityMetadata,verifiedAlternates} from '@/lib/api/seo';
export async function generateMetadata():Promise<Metadata>{
 try{
  const p=await getCmsPage('about','uk');const metadata=entityMetadata('uk','/about',p.locale,p.seo,p.title,p.summary);
  let otherLanguage:string|undefined;
  try{otherLanguage=(await getCmsPage('about','en' )).locale}catch{/* No verified translation */}
  const languages=verifiedAlternates('/about',otherLanguage,p.locale);
  return languages?{...metadata,alternates:{...metadata.alternates,languages}}:metadata;
 }
 catch{return {robots:{index:false,follow:true}}}
}
export default function Page(){return <SiteShell locale="uk"><CmsPageView locale="uk" slug="about"/></SiteShell>}
