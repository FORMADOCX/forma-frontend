import type {Locale} from '@/lib/i18n';
/** Shared geometric FORMA document indicator; never overlays the whole site. */
export function LoadingIndicator({locale,compact=false}:{locale:Locale;compact?:boolean}){
 return <div className={`forma-loading${compact?' forma-loading-compact':''}`} role="status" aria-live="polite" aria-label={locale==='uk'?'Завантаження':'Loading'}>
  <span className="forma-loading-symbol" aria-hidden="true"><svg viewBox="0 0 40 48" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 3h18l8 8v34H7z"/><path d="M25 3v9h8M14 19h13M14 26h10M14 33h7"/></svg></span>
  <span className="forma-loading-label">{locale==='uk'?'Завантаження…':'Loading…'}</span>
 </div>;
}
