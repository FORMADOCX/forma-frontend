import type {ReactNode} from 'react';

/** Approved Django CMS icon keys. Unknown keys intentionally render nothing. */
const symbols:Record<string,ReactNode> = {
 'briefcase-business': <><rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2"/></>,
 'file-text': <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8"/></>,
 'receipt-text': <><path d="M4 3v18l3-2 3 2 2-2 3 2 3-2 2 2V3l-3 2-3-2-2 2-3-2-3 2Z"/><path d="M8 10h8M8 14h6"/></>,
 wallet: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M15 15h6M3 5V4a2 2 0 0 1 2-2h13"/></>,
 'calendar-days': <><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M8 2v4M16 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></>,
 'user-round': <><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></>,
 folders: <><path d="M20 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v2"/><path d="M4 10h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2"/></>,
 'clipboard-list': <><rect x="5" y="4" width="14" height="18" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 12h.01M12 12h4M9 17h.01M12 17h4"/></>,
 'chart-no-axes-column': <><rect x="4" y="13" width="4" height="8" rx="1"/><rect x="10" y="8" width="4" height="13" rx="1"/><rect x="16" y="3" width="4" height="18" rx="1"/></>,
 calculator: <><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01"/></>,
 'file-spreadsheet': <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8M8 17h8M12 13v8"/></>,
 'book-open': <><path d="M12 7v14M3 18V4a2 2 0 0 1 2-2h3a4 4 0 0 1 4 4 4 4 0 0 1 4-4h3a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2h-3a4 4 0 0 0-4 4 4 4 0 0 0-4-4H5a2 2 0 0 0-2 2Z"/></>,
 'graduation-cap': <><path d="m2 10 10-5 10 5-10 5-10-5ZM6 12v5c4 3 8 3 12 0v-5M22 10v7"/></>,
 house: <><path d="m3 10 9-8 9 8v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M9 22v-8h6v8"/></>,
 scale: <><path d="M12 3v18M5 21h14M3 7h18M6 7l-4 7h8l-4-7ZM18 7l-4 7h8l-4-7Z"/></>,
 'notebook-pen': <><path d="M8 3h9a2 2 0 0 1 2 2v6M8 3v18h6M5 3v18M3 7h4M3 12h4M3 17h4"/><path d="m14 19 6-6 2 2-6 6-3 1 1-3Z"/></>,
};

export function hasCategoryIcon(name?:string|null):boolean {return Boolean(name && Object.prototype.hasOwnProperty.call(symbols,name));}

export function CategoryIcon({name}:{name?:string|null}) {
 const symbol = name ? symbols[name] : undefined;
 if (!symbol) return null;
 return <svg className="home-category-icon" aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{symbol}</svg>;
}
