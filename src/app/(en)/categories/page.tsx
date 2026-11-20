import {SiteShell} from '@/components/site-shell';
import {CategoryListPage} from '@/components/catalog-data-pages';
import {pageMetadata} from '@/lib/seo';
export const metadata=pageMetadata('en','Categories','Document categories','/categories');
export default function Page(){return <SiteShell locale="en"><CategoryListPage locale="en"/></SiteShell>}
