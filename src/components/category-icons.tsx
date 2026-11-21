import type {ReactNode} from 'react';
/** Closed Lucide icon registry. No dynamic imports or raw CMS-provided SVG. */
const paths:Record<string,ReactNode>={
 'briefcase-business':<><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M7 7V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2M2 12h20M10 12v2h4v-2"/></>,
 'file-text':<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8"/></>,
 'receipt-text':<><path d="M4 2v20l4-2 4 2 4-2 4 2V2l-4 2-4-2-4 2zM8 10h8M8 14h6"/></>,
 'wallet':<><rect x="2" y="5" width="20" height="16" rx="2"/><path d="M2 9h20M17 14h2M6 5V3h13"/></>,
 'calendar-days':<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/></>,
 'user-round':<><circle cx="12" cy="8" r="4"/><path d="M20 21a8 8 0 0 0-16 0"/></>,
 'folders':<><path d="M2 8V5a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v2M4 21h16a2 2 0 0 0 2-2l-2-9H6l-2 9a2 2 0 0 1-2 2z"/></>,
 'clipboard-list':<><rect x="5" y="4" width="14" height="18" rx="2"/><path d="M9 4a3 3 0 0 1 6 0M9 12h.01M12 12h4M9 16h.01M12 16h4"/></>,
 'chart-no-axes-column':<><path d="M5 20v-5M10 20V9M15 20V4M20 20v-8"/></>,
 'calculator':<><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 11h.01M12 11h.01M16 11h.01M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01"/></>,
 'file-spreadsheet':<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8M12 13v8"/></>,
 'book-open':<><path d="M12 7a9 9 0 0 0-9-3v15a9 9 0 0 1 9 3 9 9 0 0 1 9-3V4a9 9 0 0 0-9 3zM12 7v15"/></>,
 'graduation-cap':<><path d="m2 10 10-5 10 5-10 5zM6 12v5c4 3 8 3 12 0v-5M22 10v7"/></>,
 'house':<><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM9 21v-8h6v8"/></>,
 'scale':<><path d="M12 3v18M5 7h14M3 19h18M5 7l-3 7h6zM19 7l-3 7h6z"/></>,
 'notebook-pen':<><rect x="4" y="2" width="15" height="20" rx="2"/><path d="M8 2v20M12 7h4M12 11h2M15 18l6-6"/></>
};
export const categoryIconNames=Object.keys(paths);
export function CategoryIcon({name}:{name:string|null|undefined}){
 if(!name || !Object.prototype.hasOwnProperty.call(paths,name))return null;
 return <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" className="home-category-icon">{paths[name]}</svg>;
}
