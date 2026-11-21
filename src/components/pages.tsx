import Link from 'next/link';
import {dictionary,localizedPath,type Locale} from '@/lib/i18n';
import {PageIntro,SearchSection} from './site-shell';
import {TemplateCard} from './template-card';
import {getTemplates,getHomepageCategories} from '@/lib/api/client';
import {CategoryIcon} from './category-icons';
import {homepageCollections} from '@/lib/homepage-collections';
import {JsonLd} from '@/lib/json-ld';
import {siteUrl} from '@/lib/seo';

const content={
 en:{heading:'Documents for better work.',description:'Thoughtfully designed, editable templates for business, creative work and everyday needs.',explore:'Explore by category',categoryDescription:'Find the right starting point for your next document.',allCategories:'All categories',allTemplates:'Explore all templates',featured:'Featured templates',featuredDescription:'Thoughtfully designed documents from the library.',recent:'Recently added',recentDescription:'Explore more of the latest documents.',viewAll:'View all templates',how:'Find. Preview. Download.',howDescription:'Everything you need to find a useful document and start working.',steps:[['Find','Search the library or explore templates by category.'],['Preview','Review the document before downloading.'],['Download','Choose an available format and get your file.']],categoriesError:'Categories are temporarily unavailable.',templatesError:'Template collections are temporarily unavailable.'},
 uk:{heading:'Документи для ефективнішої роботи.',description:'Продумані редаговані шаблони для бізнесу, творчих проєктів і повсякденних завдань.',explore:'Переглянути за категоріями',categoryDescription:'Знайдіть відповідний документ для свого завдання.',allCategories:'Усі категорії',allTemplates:'Переглянути всі шаблони',featured:'Рекомендовані шаблони',featuredDescription:'Ретельно створені документи з нашої бібліотеки.',recent:'Нещодавно додані',recentDescription:'Більше нових документів у бібліотеці.',viewAll:'Усі шаблони',how:'Знайдіть. Перегляньте. Завантажте.',howDescription:'Усе необхідне, щоб знайти потрібний документ і почати роботу.',steps:[['Знайдіть','Шукайте в бібліотеці або переглядайте шаблони за категоріями.'],['Перегляньте','Ознайомтеся з документом перед завантаженням.'],['Завантажте','Оберіть доступний формат і завантажте файл.']],categoriesError:'Категорії тимчасово недоступні.',templatesError:'Добірки шаблонів тимчасово недоступні.'}
} as const;

export async function HomePage({locale}:{locale:Locale}){
 const t=content[locale];
 const [categoryResult,templateResult]=await Promise.allSettled([
  getHomepageCategories(locale),
  getTemplates({lang:locale,page:1,page_size:8,sort:'newest'})
 ]);
 if(categoryResult.status==='rejected')console.error('[FORMA homepage] categories request failed',categoryResult.reason instanceof Error?categoryResult.reason.name:'Unknown error');
 if(templateResult.status==='rejected')console.error('[FORMA homepage] templates request failed',templateResult.reason instanceof Error?templateResult.reason.name:'Unknown error');
 const categories=categoryResult.status==='fulfilled'?categoryResult.value:[];
 const templates=templateResult.status==='fulfilled'?templateResult.value.results:[];
 const {featured,recent}=homepageCollections(templates);
 return <div className="container homepage">{siteUrl&&<JsonLd data={{'@context':'https://schema.org','@type':'WebSite',name:'FORMA',url:siteUrl}}/>}
  <section className="home-hero"><div className="hero-copy"><h1>{t.heading}</h1><p className="lead">{t.description}</p><SearchSection locale={locale}/>
   <nav className="home-hero-links" aria-label={locale==='uk'?'Перегляд бібліотеки':'Explore the library'}><Link href={localizedPath(locale,'/categories')}>{t.allCategories}</Link><Link href={localizedPath(locale,'/templates')}>{t.allTemplates}</Link></nav>
  </div></section>
  {categories.length>0&&<section className="section section-border home-categories" aria-labelledby="home-categories-heading"><div className="section-intro"><h2 id="home-categories-heading">{t.explore}</h2><p>{t.categoryDescription}</p><Link className="home-section-link" href={localizedPath(locale,'/categories')}>{t.allCategories} <span aria-hidden="true">→</span></Link></div>
   <div className="home-category-grid">{categories.map(category=><Link key={category.id} className="home-category-card" href={localizedPath(locale,`/categories/${category.slug}`)}><CategoryIcon name={category.icon}/><span className="home-category-title">{category.name}</span><span className="card-arrow" aria-hidden="true">→</span></Link>)}</div></section>}
  {featured.length>0&&<section className="section section-border home-featured" aria-labelledby="home-featured-heading"><div className="section-intro"><h2 id="home-featured-heading">{t.featured}</h2><p>{t.featuredDescription}</p><Link className="home-section-link" href={localizedPath(locale,'/templates')}>{t.allTemplates} <span aria-hidden="true">→</span></Link></div>
   <div className="template-grid">{featured.map(template=><TemplateCard key={template.id} template={template} locale={locale} featured/>)}</div></section>}
  {recent.length>0&&<section className="section section-border home-recent" aria-labelledby="home-recent-heading"><div className="section-intro"><h2 id="home-recent-heading">{t.recent}</h2><p>{t.recentDescription}</p><Link className="home-section-link" href={localizedPath(locale,'/templates')}>{t.viewAll} <span aria-hidden="true">→</span></Link></div>
   <div className="template-grid">{recent.map(template=><TemplateCard key={template.id} template={template} locale={locale} featured/>)}</div></section>}
  <section className="section section-border home-how" aria-labelledby="home-how-heading"><div className="section-intro"><h2 id="home-how-heading">{t.how}</h2><p>{t.howDescription}</p></div>
   <ol className="home-how-steps">{t.steps.map(([heading,description],index)=><li key={heading}><span className="home-how-number" aria-hidden="true">{String(index+1).padStart(2,'0')}</span><div><h3>{heading}</h3><p>{description}</p></div></li>)}</ol></section>
  {categoryResult.status==='rejected'&&<p role="status" className="home-content-error">{t.categoriesError}</p>}
  {templateResult.status==='rejected'&&<p role="status" className="home-content-error">{t.templatesError}</p>}
 </div>;
}
export function StaticPage({locale,kind}:{locale:Locale;kind:'about'|'privacy'|'terms'}){const t=dictionary[locale];const names={about:t.about,privacy:t.privacy,terms:t.terms};return <div className="container page-content prose"><PageIntro title={names[kind]}/><div className="empty-state"><p>{locale==='en'?'Editorial content will be published when connected to CMS.':'Редакційний вміст буде опубліковано через CMS.'}</p></div></div>}
