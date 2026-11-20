import type { NextConfig } from 'next';

// Keep production image optimization restricted to the explicitly configured Django host.
// Do not enable dangerouslyAllowLocalIP or allow arbitrary remote hosts.
const backend = process.env.NEXT_PUBLIC_API_URL ?? (process.env.NODE_ENV !== 'production' ? process.env.FORMA_API_URL : undefined);
const imageOrigins = new Set<string>();
if (backend) {
  try {
    const candidate = new URL(backend);
    const privateHost = /^(?:10|127|0)\.|^192\.168\.|^172\.(?:1[6-9]|2\d|3[01])\.|\.internal$|\.local$/.test(candidate.hostname) || ['localhost','[::1]'].includes(candidate.hostname);
    if (process.env.NODE_ENV === 'production' && (candidate.protocol !== 'https:' || privateHost)) throw new Error('Public backend must be a public HTTPS origin');
    imageOrigins.add(candidate.origin);
  }
  catch { throw new Error('Invalid FORMA_API_URL (expected an absolute URL)'); }
}
if (process.env.NODE_ENV !== 'production') {
  imageOrigins.add('http://127.0.0.1:8000');
  imageOrigins.add('http://localhost:8000');
}
const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = [...imageOrigins].map(origin => {
  const url = new URL(origin);
  return { protocol: url.protocol.slice(0,-1) as 'http'|'https', hostname:url.hostname, port:url.port, pathname:'/api/v1/templates/**' };
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {remotePatterns},
};
export default nextConfig;
