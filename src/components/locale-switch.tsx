'use client';
import Link from 'next/link';
import {usePathname, useSearchParams} from 'next/navigation';
import {localizedPath, type Locale} from '@/lib/i18n';

/** Only navigates mirrored frontend routes. Backend content might still use translation fallback. */
export function localeDestination(pathname:string, search:string, locale:Locale):string {
 const base=pathname === '/uk' ? '/' : pathname.startsWith('/uk/') ? pathname.slice(3) : pathname;
 // Both locale route trees mirror these routes; do not synthesize URLs for unknown paths.
 const supported=/^\/(?:$|about\/?$|privacy\/?$|terms\/?$$|search\/?$|templates(?:\/[^/]+)?\/?$|categories(?:\/[^/]+)?\/?$)/.test(base);
 const target=supported?localizedPath(locale,base):localizedPath(locale);
 return `${target}${supported&&search ? `?${search}` : ''}`;
}
export function LocaleSwitch({locale}:{locale:Locale}) {
 const pathname=usePathname();const search=useSearchParams();
 const query=search.toString();
 return <nav className="locale-switch" aria-label={locale==='uk'?'Мова':'Language'}>
  <Link href={localeDestination(pathname,query,'en')} lang="en" hrefLang="en" aria-current={locale==='en'?'page':undefined}>EN</Link>
  <span aria-hidden="true">/</span>
  <Link href={localeDestination(pathname,query,'uk')} lang="uk" hrefLang="uk" aria-current={locale==='uk'?'page':undefined}>UK</Link>
 </nav>;
}
