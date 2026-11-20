import type {Metadata} from 'next';
import {SiteShell} from '@/components/site-shell';
import {CmsPageView} from '@/components/cms-page';
import {getCmsPage} from '@/lib/api/cms';
import {entityMetadata,verifiedAlternates} from '@/lib/api/seo';
const reserved=new Set(['templates','categories','search','submit','api','robots.txt','sitemap.xml','_next']);
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;if(reserved.has(slug))return {robots:{index:false,follow:true}};
 try{const p=await getCmsPage(slug,'en');const metadata=entityMetadata('en',`/${slug}`,p.locale,p.seo,p.title,p.summary);
  let otherLanguage:string|undefined;
  try{otherLanguage=(await getCmsPage(slug,'uk' )).locale}catch{/* No verified translation */}
  const languages=verifiedAlternates(`/${slug}`,p.locale,otherLanguage);
  return languages?{...metadata,alternates:{...metadata.alternates,languages}}:metadata;
 }
 catch{return {robots:{index:false,follow:true}}}
}
export default async function Page({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params; if(reserved.has(slug)){const {notFound}=await import('next/navigation');notFound()}
 return <SiteShell locale="en"><CmsPageView locale="en" slug={slug}/></SiteShell>;
}
