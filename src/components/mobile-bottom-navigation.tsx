'use client';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {localizedPath,type Locale} from '@/lib/i18n';

type NavKey='home'|'templates'|'search';
export function activeMobileSection(pathname:string):NavKey|null {
 const path=pathname.replace(/^\/uk(?=\/|$)/,'')||'/';
 if(path==='/')return 'home';
 if(path==='/search'||path.startsWith('/search/'))return 'search';
 if(path==='/templates'||path.startsWith('/templates/')||path==='/categories'||path.startsWith('/categories/'))return 'templates';
 return null;
}
const icons={
 home:<><path d="m3 10 9-7 9 7"/><path d="M5 9v12h14V9M9 21v-8h6v8"/></>,
 templates:<><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
 search:<><circle cx="10.8" cy="10.8" r="7"/><path d="m16 16 4.5 4.5"/></>
} as const;
export function MobileBottomNavigation({locale}:{locale:Locale}){
 const pathname=usePathname();
 const active=activeMobileSection(pathname);
 const links:[NavKey,string,string][]=[
  ['home',locale==='uk'?'Головна':'Home',localizedPath(locale)],
  ['templates',locale==='uk'?'Шаблони':'Templates',localizedPath(locale,'/templates')],
  ['search',locale==='uk'?'Пошук':'Search',localizedPath(locale,'/search')]
 ];
 return <nav className="mobile-bottom-navigation" aria-label={locale==='uk'?'Нижня навігація':'Bottom navigation'}>
  {links.map(([key,label,href])=><Link key={key} href={href} className={key===active?'is-active':undefined} aria-current={key===active?'page':undefined}>
   <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{icons[key]}</svg><span>{label}</span>
  </Link>)}
 </nav>;
}
