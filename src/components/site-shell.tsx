import Link from 'next/link';
import {Suspense} from 'react';
import {LocaleSwitch} from './locale-switch';
import {localizedPath,dictionary,type Locale} from '@/lib/i18n';
import {getCmsNavigation,type CmsNavigationLink} from '@/lib/api/cms-navigation';
import {SearchForm} from './search-form';

export function Header({locale,headerLinks=[]}:{locale:Locale;headerLinks?:CmsNavigationLink[]}){
 const t=dictionary[locale];
 return <header className="site-header"><div className="container header-inner">
  <Link href={localizedPath(locale)} className="wordmark" aria-label="FORMA home">FORMA</Link>
  <nav className="main-nav" aria-label={locale==='uk'?'Основна навігація':'Main navigation'}>
   <Link href={localizedPath(locale,'/templates')}>{locale==='uk'?'Шаблони':'Templates'}</Link>
   <Link href={localizedPath(locale,'/categories')}>{t.categories}</Link>
   {headerLinks.map(page=><Link key={page.slug} href={localizedPath(locale,`/${page.slug}`)}>{page.title}</Link>)}
  </nav>
  <div className="header-actions"><div className="header-search"><SearchForm locale={locale} compact/></div>
   <Suspense fallback={<span className="locale-switch" aria-hidden="true">EN / UK</span>}><LocaleSwitch locale={locale}/></Suspense>
  </div>
  <details className="mobile-navigation"><summary aria-label={locale==='uk'?'Відкрити меню':'Open menu'}>{locale==='uk'?'Меню':'Menu'} <span aria-hidden="true">☰</span></summary>
   <nav aria-label={locale==='uk'?'Мобільна навігація':'Mobile navigation'}><Link href={localizedPath(locale,'/templates')}>{t.templates}</Link><Link href={localizedPath(locale,'/categories')}>{t.categories}</Link>{headerLinks.map(page=><Link key={page.slug} href={localizedPath(locale,`/${page.slug}`)}>{page.title}</Link>)}<Link href={localizedPath(locale,'/search')}>{t.search}</Link></nav>
  </details>
 </div></header>
}
export function Footer({locale,pages=[]}:{locale:Locale;pages?:{slug:string;title:string}[]}){
 return <footer className="site-footer"><div className="container footer-inner"><div><Link href={localizedPath(locale)} className="wordmark wordmark-small">FORMA</Link><p>{dictionary[locale].footer}</p></div><nav aria-label="Footer navigation"><Link href={localizedPath(locale,'/templates')}>{dictionary[locale].templates}</Link><Link href={localizedPath(locale,'/categories')}>{dictionary[locale].categories}</Link>{pages.map(page=><Link key={page.slug} href={localizedPath(locale,`/${page.slug}`)}>{page.title}</Link>)}</nav><small>© {new Date().getFullYear()} FORMA</small></div></footer>;
}
export async function SiteShell({locale,children}:{locale:Locale;children:React.ReactNode}){
 const {headerLinks,footerLinks}=await getCmsNavigation(locale);
 return <><a href="#content" className="skip-link">{locale==='uk'?'До вмісту':'Skip to content'}</a><Header locale={locale} headerLinks={headerLinks}/><main id="content">{children}</main><Footer locale={locale} pages={footerLinks}/></>;
}
export function PageIntro({eyebrow,title,description}:{eyebrow?:string;title:string;description?:string}){
 return <div className="page-intro">{eyebrow&&<p className="eyebrow">{eyebrow}</p>}<h1>{title}</h1>{description&&<p className="lead">{description}</p>}</div>;
}
export function SearchSection({locale}:{locale:Locale}){return <SearchForm locale={locale} prominent/>}
