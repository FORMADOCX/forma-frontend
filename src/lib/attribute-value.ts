import type {Attribute} from './api/types';
import type {Language} from './api/types';
/** Display only validated scalar/option codes. Backend does not supply option labels in Detail. */
export function formatAttributeValue(attribute:Attribute, locale:Language):string|null {
 const value=attribute.value;
 if(value===null||value===undefined)return null;
 if(attribute.data_type==='boolean')return typeof value==='boolean'?(value?(locale==='uk'?'Так':'Yes'):(locale==='uk'?'Ні':'No')):null;
 if(attribute.data_type==='multi_select'){
  if(!Array.isArray(value))return null;
  const options=value.filter((v):v is string=>typeof v==='string'&&v.trim().length>0).map(v=>v.trim());
  return options.length?[...new Set(options)].join(', '):null;
 }
 if(Array.isArray(value)||typeof value==='object')return null;
 if(typeof value==='boolean')return null;
 const text=String(value).trim();
 return text.length?text:null;
}
