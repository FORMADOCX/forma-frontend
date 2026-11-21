import Image from 'next/image';
import Link from 'next/link';
import {dictionary,localizedPath,type Locale} from '@/lib/i18n';
import {PageIntro,SearchSection} from './site-shell';
import {TemplateCard} from './template-card';
import {getTemplates,getCategories,getHomepageCategories} from '@/lib/api/client';
import {CategoryIcon,hasCategoryIcon} from './category-icon';
import {JsonLd} from '@/lib/json-ld';
import {siteUrl} from '@/lib/seo';
export async function HomePage({locale}:{locale:Locale}){
 const [templates,categories,homepageCategories]=await Promise.allSettled([getTemplates({lang:locale,page_size:8}),getCategories(locale,1,8),getHomepageCategories(locale)]);
 const actualTemplates=templates.status==='fulfilled'?templates.value.results:[];
 const actualCategories=categories.status==='fulfilled'?categories.value.results:[];
 const featuredCategories=homepageCategories.status==='fulfilled'?homepageCategories.value:[];
 const t=dictionary[locale];
 return <div className="container homepage">{siteUrl&&<JsonLd data={{'@context':'https://schema.org','@type':'WebSite',name:'FORMA',url:siteUrl}}/>}
  <section className="home-hero"><div className="hero-copy">
   <h1>{locale==='uk'?'Редаговані шаблони документів для професійної роботи':'Editable Document Templates for Professional Work'}</h1>
   <p className="lead">{locale==='uk'?'Добірна бібліотека якісних документів для бізнесу, фрилансу та щоденних завдань. Редагуйте під власні потреби.':'A curated library of clean, well-structured templates for business, freelance, and everyday work. Fully editable and easy to customize.'}</p>
   <SearchSection locale={locale}/>
   {actualCategories.length>0&&<nav className="hero-categories" aria-label={locale==='uk'?'Популярні категорії':'Browse categories'}><span>{locale==='uk'?'Переглянути:':'Browse by:'}</span>{actualCategories.slice(0,5).map(c=><Link key={c.id} href={localizedPath(locale,`/categories/${c.slug}`)}>{c.name}</Link>)}</nav>}
  </div><div className="hero-art" aria-hidden="true"><Image src="/images/forma-hero.webp" alt="" fill priority sizes="(max-width: 768px) 100vw, 52vw" className="hero-art-image"/></div></section>
  {featuredCategories.length>0&&<section className="section section-border home-categories" aria-labelledby="home-category-heading">
   <div className="home-categories-heading">
    <div className="home-categories-heading-main">
     <div className="home-categories-eyebrow"><span>{locale==='uk'?'ШАБЛОНИ ЗА КАТЕГОРІЯМИ':'TEMPLATES BY CATEGORY'}</span></div>
     <h2 id="home-category-heading">{locale==='uk'?'Переглянути за категоріями':'Explore by category'}</h2>
    </div>
    <p>{locale==='uk'?'Знайдіть основу для свого наступного документа.':'Find the right starting point for your next document.'}</p>
    <Link className="home-categories-all" href={localizedPath(locale,'/categories')}>{t.allCategories}<span aria-hidden="true">→</span></Link>
   </div>
   <div className="home-category-grid">{featuredCategories.slice(0,6).map((c,index)=><Link className={`home-category-card home-category-card--tone-${index%6}`} key={c.id} href={localizedPath(locale,`/categories/${c.slug}`)}>
    {hasCategoryIcon(c.icon)&&<span className="home-category-art" aria-hidden="true"><CategoryIcon name={c.icon}/></span>}
    <span className="home-category-copy"><span className="home-category-title">{c.name}</span>{c.description?.trim()&&<span className="home-category-description">{c.description}</span>}</span>
    <span aria-hidden="true" className="card-arrow">→</span>
   </Link>)}</div>
  </section>}
  {actualTemplates.length>0&&<section className="section section-border home-featured"><div className="section-intro"><h2>{locale==='uk'?'Рекомендовані шаблони':'Featured Templates'}</h2><p>{locale==='uk'?'Добірка опублікованих редагованих документів.':'A selection of editable documents from our library.'}</p><Link className="outline-link" href={localizedPath(locale,'/templates')}>{locale==='uk'?'Усі шаблони':'View All Templates'} <span aria-hidden="true">→</span></Link></div>
   {actualTemplates.length?<div className="template-grid">{actualTemplates.slice(0,5).map(item=><TemplateCard key={item.id} template={item} locale={locale} featured/>)}</div>:<p className="empty-state">{templates.status==='rejected'?(locale==='uk'?'Каталог тимчасово недоступний.':'Catalog temporarily unavailable.'):(locale==='uk'?'Шаблонів ще немає.':'No published templates yet.')}</p>}</section>}
  <section className="section section-border home-how" aria-labelledby="home-how-heading">
   <div className="home-how-panel">
    <div className="home-how-editorial">
     <span className="home-how-eyebrow">{t.howEyebrow}</span>
     <h2 id="home-how-heading">{t.howTitle}</h2>
     <p>{t.howText}</p>
     <Link className="home-how-link" href={localizedPath(locale,'/templates')}>{t.howExplore}<span aria-hidden="true">↗</span></Link>
    </div>
    <ol className="home-how-sequence">
     <li><span className="home-how-number" aria-hidden="true">01</span><div><h3>{t.howFind}</h3><p>{t.howFindText}</p></div></li>
     <li><span className="home-how-number" aria-hidden="true">02</span><div><h3>{t.howPreview}</h3><p>{t.howPreviewText}</p></div></li>
     <li><span className="home-how-number" aria-hidden="true">03</span><div><h3>{t.howDownload}</h3><p>{t.howDownloadText}</p></div></li>
    </ol>
   </div>
  </section>
  {templates.status==='rejected'&&<p role="alert" className="home-content-error">{locale==='uk'?'Рекомендовані шаблони тимчасово недоступні.':'Featured templates are temporarily unavailable.'}</p>}
  {categories.status==='rejected'&&<p role="alert" className="home-content-error">{locale==='uk'?'Категорії тимчасово недоступні.':'Categories are temporarily unavailable.'}</p>}
 </div>;
}
export function StaticPage({locale,kind}:{locale:Locale;kind:'about'|'privacy'|'terms'}){const t=dictionary[locale];const names={about:t.about,privacy:t.privacy,terms:t.terms};return <div className="container page-content prose"><PageIntro title={names[kind]}/><div className="empty-state"><p>{locale==='en'?'Editorial content will be published when connected to CMS.':'Редакційний вміст буде опубліковано через CMS.'}</p></div></div>}
