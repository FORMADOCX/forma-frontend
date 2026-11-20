import type { Metadata } from 'next';
import { SiteShell } from '@/components/site-shell';
import { HomePage } from '@/components/pages';
import { dictionary } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
export const metadata: Metadata = pageMetadata('en', dictionary.en.homeTitle, dictionary.en.homeText, '/');
export default function Page() {return <SiteShell locale="en"><HomePage locale="en"/></SiteShell>}
