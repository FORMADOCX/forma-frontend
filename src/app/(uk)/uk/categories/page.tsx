import {SiteShell} from '@/components/site-shell';
import {CategoryListPage} from '@/components/catalog-data-pages';
import {pageMetadata} from '@/lib/seo';
export const metadata=pageMetadata('uk','Категорії','Категорії документів','/categories');
export default function Page(){return <SiteShell locale="uk"><CategoryListPage locale="uk"/></SiteShell>}
