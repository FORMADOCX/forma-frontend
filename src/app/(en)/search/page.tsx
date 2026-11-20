import type {Metadata} from 'next';
import {SiteShell} from '@/components/site-shell';
import {Catalog} from '@/components/catalog';
export const metadata:Metadata={title:'Search | FORMA',robots:{index:false,follow:true}};
export default async function Page({searchParams}:{searchParams:Promise<import('@/lib/api/query').RawQuery>}){const query=await searchParams;return <SiteShell locale="en"><Catalog locale="en" query={query} search={true}/></SiteShell>}
