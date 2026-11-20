import type {DocumentFormat} from './api/types';
/** Trust only an exact backend download route for the requested slug and file ID. */
export function getDownloadUrl(format: DocumentFormat, slug: string, backendOrigin?: string): string | null {
  if (!format.download_url || !backendOrigin) return null;
  try {
    const origin = new URL(backendOrigin);
    const url = new URL(format.download_url, origin);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) return null;
    if(process.env.NODE_ENV==='production' && (origin.protocol!=='https:' || url.protocol!=='https:'))return null;
    const aliases = ['127.0.0.1', 'localhost'];
    const alias = process.env.NODE_ENV !== 'production' && aliases.includes(url.hostname) && aliases.includes(origin.hostname)
      && url.port === origin.port && url.protocol === origin.protocol;
    if (url.origin !== origin.origin && !alias) return null;
    if (url.pathname !== `/api/v1/templates/${encodeURIComponent(slug)}/files/${encodeURIComponent(format.id)}/download/`) return null;
    return url.href;
  } catch { return null; }
}
