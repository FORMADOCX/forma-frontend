import type {Metadata} from 'next';
import type {RawQuery} from '@/lib/api/query';
import {SiteShell} from '@/components/site-shell';
import {CategoryDetailPage} from '@/components/catalog-data-pages';
import {getCategory} from '@/lib/api/client';
import {entityMetadata,verifiedAlternates} from '@/lib/api/seo';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
 const {slug}=await params;
 try{
  const data=await getCategory(slug,'en');
  const metadata=entityMetadata('en',`/categories/${slug}`,data.language,data.seo,data.name,data.description);
  let otherLanguage:string|undefined;
  try{const counterpart=await getCategory(slug,'uk');otherLanguage=counterpart.language;}catch{/* Do not claim a non-existent translation. */}
  const languages=verifiedAlternates(`/categories/${slug}`,data.language,otherLanguage);
  return languages?{...metadata,alternates:{...metadata.alternates,languages}}:metadata;
 }
 catch{return {robots:{index:false,follow:true}};}
}
export default async function Page({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<RawQuery>}){const [{slug},query]=await Promise.all([params,searchParams]);return <SiteShell locale="en"><CategoryDetailPage locale="en" slug={slug} query={query}/></SiteShell>}
