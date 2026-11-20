/** Separate server-to-server Django origin from the URL exposed to browsers. */
const LOCAL_HOSTS=new Set(['localhost','127.0.0.1']);
function origin(value:string|undefined,production:boolean):URL|null {
 if(!value)return null;
 try{
  const u=new URL(value);
  if(u.username||u.password||u.search||u.hash||u.pathname!=='/'&&u.pathname!==''||!['http:','https:'].includes(u.protocol))return null;
  if(production && (u.protocol!=='https:' || LOCAL_HOSTS.has(u.hostname) || isPrivateHost(u.hostname)))return null;
  return u;
 }catch{return null;}
}
function isPrivateHost(host:string):boolean {
 return /^(?:10|127|0)\./.test(host) || /^192\.168\./.test(host) || /^172\.(?:1[6-9]|2\d|3[01])\./.test(host) || host==='[::1]' || host.endsWith('.local') || host.endsWith('.internal');
}
/** This function never returns a private server origin in production. */
export function getBrowserApiOrigin():string|undefined {
 const production=process.env.NODE_ENV==='production';
 const publicUrl=origin(process.env.NEXT_PUBLIC_API_URL,production);
 if(publicUrl)return publicUrl.origin;
 if(!production)return origin(process.env.FORMA_API_URL,false)?.origin;
 return undefined;
}
function localAlias(a:URL,b:URL,production:boolean):boolean {
 return !production&&LOCAL_HOSTS.has(a.hostname)&&LOCAL_HOSTS.has(b.hostname)&&a.port===b.port&&a.protocol===b.protocol;
}
/** Validate actual Django routes, then remap trusted internal-generated absolute URLs to public HTTPS. */
export function publicDjangoUrl(
 value:string|null|undefined,
 kind:'preview'|'download',
 expected?:{slug:string;fileId:string},
 config:{internal?:string;public?:string;production?:boolean}={}
):string|null {
 if(!value)return null;
 const production=config.production??process.env.NODE_ENV==='production';
 const publicRoot=origin(config.public??getBrowserApiOrigin(),production);
 if(!publicRoot)return null;
 const internalRoot=origin(config.internal??process.env.FORMA_API_URL,false);
 try{
  const candidate=new URL(value,publicRoot);
  if(!['http:','https:'].includes(candidate.protocol)||candidate.username||candidate.password||candidate.search||candidate.hash)return null;
  // Only trusted public or configured internal Django origins may issue DTO URLs.
  if(candidate.origin!==publicRoot.origin && !localAlias(candidate,publicRoot,production) &&
    !(internalRoot&&(candidate.origin===internalRoot.origin||localAlias(candidate,internalRoot,production))))return null;
  const path=candidate.pathname;
  const preview=/^\/api\/v1\/templates\/([a-z0-9_-]+)\/files\/([a-zA-Z0-9-]+)\/previews\/([1-9]\d*)\/$/;
  const download=/^\/api\/v1\/templates\/([a-z0-9_-]+)\/files\/([a-zA-Z0-9-]+)\/download\/$/;
  const match=kind==='preview'?preview.exec(path):download.exec(path);
  if(!match)return null;
  if(expected&&(match[1]!==expected.slug||match[2]!==expected.fileId))return null;
  return new URL(path,publicRoot).href;
 }catch{return null;}
}
