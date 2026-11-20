import {siteUrl} from './seo';
import {localizedPath,type Locale} from './i18n';
export function JsonLd({data}:{data:Record<string,unknown>}){
 return <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(data).replace(/</g,'\\u003c')}}/>;
}
export function breadcrumbData(locale:Locale,parts:{name:string;path:string}[]){
 if(!siteUrl)return null;
 return {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:parts.map((p,i)=>({'@type':'ListItem',position:i+1,name:p.name,item:siteUrl+localizedPath(locale,p.path)}))};
}
