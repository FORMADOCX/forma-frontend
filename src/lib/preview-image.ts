/** Image origins must be configured, never accepted from arbitrary third-party URLs. */
const isLocalHost = (host: string) => host === '127.0.0.1' || host === 'localhost';

export interface PreviewSource { src: string; unoptimized: boolean }

export function getPreviewSource(value: string | null | undefined, suppliedBackendOrigin?: string): PreviewSource | null {
  const backendOrigin = suppliedBackendOrigin ?? process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV !== 'production' ? process.env.FORMA_API_URL : undefined);
  if (!value || !backendOrigin) return null;
  try {
    const origin = new URL(backendOrigin);
    const url = new URL(value, origin);
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) return null;
    if(process.env.NODE_ENV==='production' && (origin.protocol!=='https:' || url.protocol!=='https:'))return null;
    // Only URLs from the trusted backend origin; during local development localhost and
    // 127.0.0.1 may be used interchangeably for the same Django port.
    const sameOrigin = url.origin === origin.origin;
    const localAlias = process.env.NODE_ENV !== 'production'
      && isLocalHost(url.hostname) && isLocalHost(origin.hostname)
      && url.port === origin.port && url.protocol === origin.protocol;
    if (!sameOrigin && !localAlias) return null;
    if (!url.pathname.startsWith('/api/v1/templates/') || !/\/previews\/\d+\/$/.test(url.pathname)) return null;
    // Next's default server-side optimizer rejects loopback/private IP ranges.
    // Bypass optimization for this particular local development image only.
    return {src: url.href, unoptimized: isLocalHost(url.hostname) && process.env.NODE_ENV !== 'production'};
  } catch {return null;}
}
