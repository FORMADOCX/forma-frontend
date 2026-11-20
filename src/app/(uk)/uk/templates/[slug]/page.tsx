import type {Metadata} from 'next';
import {SiteShell} from '@/components/site-shell';
import {TemplateDetailPage} from '@/components/catalog-data-pages';
import {getTemplate} from '@/lib/api/client';
import {entityMetadata,verifiedAlternates} from '@/lib/api/seo';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;
 try{
  const data=await getTemplate(slug,'uk');
  const metadata=entityMetadata('uk',`/templates/${slug}`,data.language,data.seo,data.title,data.summary);
  let otherLanguage:string|undefined;
  try{const counterpart=await getTemplate(slug,'en');otherLanguage=counterpart.language;}catch{/* Do not claim a non-existent translation. */}
  const languages=verifiedAlternates(`/templates/${slug}`,otherLanguage,data.language);
  return languages?{...metadata,alternates:{...metadata.alternates,languages}}:metadata;
 }
 catch{return {robots:{index:false,follow:true}};}
}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;return <SiteShell locale="uk"><TemplateDetailPage locale="uk" slug={slug}/></SiteShell>}
