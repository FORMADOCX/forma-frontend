import {localizedPath,dictionary,type Locale} from '@/lib/i18n';
export function SearchForm({locale,prominent=false,compact=false,defaultValue=''}:{locale:Locale;prominent?:boolean;compact?:boolean;defaultValue?:string}){
 const t=dictionary[locale];
 return <form method="get" action={localizedPath(locale,'/search')} role="search" className={`search-form${prominent?' search-form-prominent':''}${compact?' search-form-compact':''}`}>
  <label htmlFor={`search-${compact?'header':prominent?'hero':'page'}-${locale}`} className="sr-only">{t.searchPlaceholder}</label>
  <span aria-hidden="true" className="search-magnifier"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="10.8" cy="10.8" r="6.5"/><path d="m16 16 4.2 4.2"/></svg></span>
  <input id={`search-${compact?'header':prominent?'hero':'page'}-${locale}`} type="search" name="q" maxLength={120} defaultValue={defaultValue} placeholder={prominent?(locale==='uk'?'Пошук шаблонів (наприклад, рахунок, звіт, пропозиція)':'Search templates (e.g., invoice, report, proposal)'):(locale==='uk'?'Пошук шаблонів…':'Search templates…')}/>
  <button type="submit">{t.search}</button>
 </form>;
}
