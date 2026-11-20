import Image from 'next/image';
import Link from 'next/link';
import {dictionary,localizedPath,type Locale} from '@/lib/i18n';
import {PageIntro,SearchSection} from './site-shell';
import {TemplateCard} from './template-card';
import {getTemplates,getCategories} from '@/lib/api/client';
import {JsonLd} from '@/lib/json-ld';
import {siteUrl} from '@/lib/seo';
export async function HomePage({locale}:{locale:Locale}){
 const [templates,categories]=await Promise.allSettled([getTemplates({lang:locale,page_size:8}),getCategories(locale,1,8)]);
 const actualTemplates=templates.status==='fulfilled'?templates.value.results:[];
 const actualCategories=categories.status==='fulfilled'?categories.value.results:[];
 return <div className="container homepage">{siteUrl&&<JsonLd data={{'@context':'https://schema.org','@type':'WebSite',name:'FORMA',url:siteUrl}}/>}
  <section className="home-hero"><div className="hero-copy">
   <h1>{locale==='uk'?'Редаговані шаблони документів для професійної роботи':'Editable Document Templates for Professional Work'}</h1>
   <p className="lead">{locale==='uk'?'Добірна бібліотека якісних документів для бізнесу, фрилансу та щоденних завдань. Редагуйте під власні потреби.':'A curated library of clean, well-structured templates for business, freelance, and everyday work. Fully editable and easy to customize.'}</p>
   <SearchSection locale={locale}/>
   {actualCategories.length>0&&<nav className="hero-categories" aria-label={locale==='uk'?'Популярні категорії':'Browse categories'}><span>{locale==='uk'?'Переглянути:':'Browse by:'}</span>{actualCategories.slice(0,5).map(c=><Link key={c.id} href={localizedPath(locale,`/categories/${c.slug}`)}>{c.name}</Link>)}</nav>}
  </div><div className="hero-art" aria-hidden="true"><Image src="/images/forma-hero.webp" alt="" fill priority sizes="(max-width: 768px) 100vw, 52vw" className="hero-art-image"/></div></section>
  <section className="section section-border home-categories"><div className="section-intro"><h2>{locale==='uk'?'Популярні категорії':'Featured Categories'}</h2><p>{locale==='uk'?'Добірки документів для роботи й бізнесу.':'Explore template collections for common business and work needs.'}</p></div>
   {actualCategories.length?<div className="home-category-grid">{actualCategories.slice(0,5).map(c=><Link className="home-category-card" key={c.id} href={localizedPath(locale,`/categories/${c.slug}`)}><span className="home-category-title" title={c.name}>{c.name}</span><span aria-hidden="true" className="card-arrow">→</span></Link>)}</div>:<p className="empty-state">{locale==='uk'?'Категорії ще не опубліковано.':'No categories published yet.'}</p>}</section>
  <section className="section section-border home-featured"><div className="section-intro"><h2>{locale==='uk'?'Рекомендовані шаблони':'Featured Templates'}</h2><p>{locale==='uk'?'Добірка опублікованих редагованих документів.':'A selection of editable documents from our library.'}</p><Link className="outline-link" href={localizedPath(locale,'/templates')}>{locale==='uk'?'Усі шаблони':'View All Templates'} <span aria-hidden="true">→</span></Link></div>
   {actualTemplates.length?<div className="template-grid">{actualTemplates.slice(0,5).map(item=><TemplateCard key={item.id} template={item} locale={locale} featured/>)}</div>:<p className="empty-state">{templates.status==='rejected'?(locale==='uk'?'Каталог тимчасово недоступний.':'Catalog temporarily unavailable.'):(locale==='uk'?'Шаблонів ще немає.':'No published templates yet.')}</p>}</section>
 </div>;
}
export function StaticPage({locale,kind}:{locale:Locale;kind:'about'|'privacy'|'terms'}){const t=dictionary[locale];const names={about:t.about,privacy:t.privacy,terms:t.terms};return <div className="container page-content prose"><PageIntro title={names[kind]}/><div className="empty-state"><p>{locale==='en'?'Editorial content will be published when connected to CMS.':'Редакційний вміст буде опубліковано через CMS.'}</p></div></div>}
