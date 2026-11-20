import type {Locale} from '@/lib/i18n';
export function LoadingIndicator({locale,compact=false}:{locale:Locale;compact?:boolean}){
 return <div className={`forma-loading${compact?' forma-loading-compact':''}`} role="status" aria-live="polite" aria-label={locale==='uk'?'Завантаження':'Loading'}>
  <span className="forma-spinner" aria-hidden="true"/><span className="forma-loading-label">{locale==='uk'?'Завантаження…':'Loading…'}</span>
 </div>;
}
