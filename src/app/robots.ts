import type {MetadataRoute} from 'next';
// Indexing deliberately disabled until content, sitemap and reciprocal hreflang are audited.
export default function robots():MetadataRoute.Robots {return {rules:[{userAgent:'*',disallow:'/'}]};}
