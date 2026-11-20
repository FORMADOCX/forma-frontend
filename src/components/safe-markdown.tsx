import type {ReactNode} from 'react';

/** Deliberately small Markdown subset. All text is escaped by React; raw HTML is never interpreted. */
const LINK=/\[([^\]\n{1,160})\]\(([^\s)]+)\)/g;
function href(value:string):string|null{
 try{
  if(value.startsWith('/')&&!value.startsWith('//')&&!value.includes('\\'))return value;
  const u=new URL(value);return ['https:','http:','mailto:'].includes(u.protocol)?u.href:null;
 }catch{return null}
}
export function inlineMarkdown(input:string):ReactNode[]{
 const result:ReactNode[]=[];let index=0;let key=0;
 for(const match of input.matchAll(LINK)){
  const pos=match.index??0;
  if(pos>index)result.push(...emphasis(input.slice(index,pos),key++));
  const target=href(match[2]);
  result.push(target?<a key={`link-${key++}`} href={target} rel={target.startsWith('http')?'noopener noreferrer':undefined}>{match[1]}</a>:match[1]);
  index=pos+match[0].length;
 }
 if(index<input.length)result.push(...emphasis(input.slice(index),key++));
 return result;
}
function emphasis(s:string,base:number):ReactNode[]{
 const parts:ReactNode[]=[];const re=/(\*\*([^*\n]+)\*\*|\*([^*\n]+)\*|`([^`\n]+)`)/g;let i=0;let j=0;
 for(const m of s.matchAll(re)){const at=m.index??0;if(at>i)parts.push(s.slice(i,at));parts.push(m[2]?<strong key={`${base}-${j++}`}>{m[2]}</strong>:m[3]?<em key={`${base}-${j++}`}>{m[3]}</em>:<code key={`${base}-${j++}`}>{m[4]}</code>);i=at+m[0].length;}
 if(i<s.length)parts.push(s.slice(i));return parts;
}
export function SafeMarkdown({content}:{content:string}){
 const lines=content.replace(/\r\n?/g,'\n').split('\n');const blocks:ReactNode[]=[];let i=0;
 while(i<lines.length){const line=lines[i];if(!line.trim()){i++;continue}
  const h=/^(#{1,4})\s+(.+)$/.exec(line);
  if(h){const c=inlineMarkdown(h[2]);const level=h[1].length;blocks.push(level===1?<h2 key={i}>{c}</h2>:level===2?<h3 key={i}>{c}</h3>:<h4 key={i}>{c}</h4>);i++;continue}
  const u=/^\s*[-*+]\s+(.+)/.exec(line),o=/^\s*\d+\.\s+(.+)/.exec(line);
  if(u||o){const ordered=!!o;const items:ReactNode[]=[];const start=i;
   while(i<lines.length){const m=(ordered?/^\s*\d+\.\s+(.+)/:/^\s*[-*+]\s+(.+)/).exec(lines[i]);if(!m)break;items.push(<li key={i}>{inlineMarkdown(m[1])}</li>);i++}
   blocks.push(ordered?<ol key={start}>{items}</ol>:<ul key={start}>{items}</ul>);continue}
  const paragraphs=[line.trim()];const start=i;i++;
  while(i<lines.length&&lines[i].trim()&&!/^(#{1,4}\s|\s*[-*+]\s|\s*\d+\.\s)/.test(lines[i]))paragraphs.push(lines[i++].trim());
  blocks.push(<p key={start}>{inlineMarkdown(paragraphs.join(' '))}</p>);
 }
 return <div className="cms-markdown">{blocks}</div>;
}
