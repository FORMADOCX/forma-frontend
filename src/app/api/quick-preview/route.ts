import {NextRequest,NextResponse} from 'next/server';
import {ApiError,getQuickPreview} from '@/lib/api/client';
export async function GET(request:NextRequest){
 const slug=request.nextUrl.searchParams.get('slug')??'';
 const lang=request.nextUrl.searchParams.get('lang')??'en';
 if(!/^[a-z0-9][a-z0-9_-]{0,119}$/.test(slug)|| !['en','uk'].includes(lang))return NextResponse.json({error:'Invalid request'}, {status:400});
 try{const data=await getQuickPreview(slug,lang as 'en'|'uk');return NextResponse.json(data,{headers:{'Cache-Control':'private, no-store'}})}
 catch(e){const status=e instanceof ApiError&&e.status===404?404:503;return NextResponse.json({error:'Preview unavailable'},{status})}
}
