import type {Metadata} from 'next';
import {localizedPath,type Locale} from '@/lib/i18n';
import {siteUrl} from '@/lib/seo';
import type {Seo} from './types';
/** Dynamic pages must not claim reciprocal hreflang: the API only proves the requested locale response. */
export function entityMetadata(locale:Locale,path:string,actualLanguage:string,seo:Seo|null|undefined,heading:string,summary:string):Metadata {
 const title=seo?.title?.trim()||heading;
 const isFallback=locale!==actualLanguage && (actualLanguage==='en'||actualLanguage==='uk');
 const description=seo?.description?.trim()||summary;
 const url=siteUrl?`${siteUrl}${localizedPath(locale,path)}`:undefined;
 // CMS canonical is accepted only when it matches the resolved public URL.
 // A foreign or mismatched canonical could deindex the correct localized route.
 const canonical=isFallback&&siteUrl?`${siteUrl}${localizedPath(actualLanguage as Locale,path)}`:(url && seo?.canonical?.trim()===url?seo.canonical.trim():url);
 const image=(()=>{if(!seo?.og_image||!siteUrl)return undefined;try{const parsed=new URL(seo.og_image,siteUrl);return parsed.protocol==='https:'&&parsed.origin===siteUrl?parsed.href:undefined}catch{return undefined}})();
 return {title,description,robots:{index:false,follow:true},
  ...(url?{alternates:{canonical},openGraph:{title:seo?.og_title?.trim()||title,description:seo?.og_description?.trim()||description,...(image?{images:[image]}:{}),url}}:{}),
};
}

/** Only produce reciprocal hreflang when both requests returned real published translations. */
export function verifiedAlternates(path:string,enLanguage:string|undefined,ukLanguage:string|undefined){
 if(!siteUrl||enLanguage!=='en'||ukLanguage!=='uk')return undefined;
 return {en:`${siteUrl}${localizedPath('en',path)}`,uk:`${siteUrl}${localizedPath('uk',path)}`};
}
