import type { Metadata } from 'next';
import { localizedPath, type Locale } from './i18n';

function parseOrigin(value: string | undefined): string | null {
 if (!value) return null;
 try {const url=new URL(value); return url.protocol==='https:' && !url.username && !url.password && url.pathname==='/' && !url.search && !url.hash ? url.origin : null;}
 catch {return null;}
}
export const siteUrl = parseOrigin(process.env.NEXT_PUBLIC_SITE_URL);
/** SEO rollout is blocked until a verified sitemap, production hostname, editorial QA and translations exist. */
export const indexingEnabled = false;

export function pageMetadata(locale: Locale, title: string, description: string, path = '/', _noindex = false): Metadata {
 void _noindex; // Keep the existing call signature; indexing remains disabled.
 const url=localizedPath(locale,path);
 return {title,description,robots:{index:false,follow:true},
  ...(siteUrl?{alternates:{canonical:`${siteUrl}${url}`,languages:{en:`${siteUrl}${localizedPath('en',path)}`,uk:`${siteUrl}${localizedPath('uk',path)}`}},
   openGraph:{title,description,url:`${siteUrl}${url}`,siteName:'FORMA',type:'website' as const,locale:locale==='uk'?'uk_UA':'en_US'}}:{})};
}
