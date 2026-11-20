'use client';

import {useEffect,useId,useRef,useState,type KeyboardEvent} from 'react';

export type FormaSelectOption = {value:string;label:string};

type Props = {
 options:FormaSelectOption[];
 value?:string;
 defaultValue?:string;
 onChange?:(value:string)=>void;
 name?:string;
 label:string;
 disabled?:boolean;
 className?:string;
};

/** Accessible single-value dropdown. The hidden input preserves native GET form submission. */
export function FormaSelect({options,value,defaultValue='',onChange,name,label,disabled=false,className=''}:Props){
 const controlled=value!==undefined;
 const [localValue,setLocalValue]=useState(defaultValue);
 const [open,setOpen]=useState(false);
 const [active,setActive]=useState(0);
 const root=useRef<HTMLDivElement>(null);
 const trigger=useRef<HTMLButtonElement>(null);
 const itemRefs=useRef<(HTMLButtonElement|null)[]>([]);
 const listId=useId();
 const selected=controlled?value:localValue;
 const selectedIndex=options.findIndex(option=>option.value===selected);
 const selectedOption=selectedIndex>=0?options[selectedIndex]:undefined;

 useEffect(()=>{
  if(!open)return;
  const dismiss=(event:PointerEvent)=>{
   if(event.target instanceof Node&&!root.current?.contains(event.target))setOpen(false);
  };
  const focusOutside=(event:FocusEvent)=>{
   if(event.target instanceof Node&&!root.current?.contains(event.target))setOpen(false);
  };
  document.addEventListener('pointerdown',dismiss);
  document.addEventListener('focusin',focusOutside);
  return ()=>{document.removeEventListener('pointerdown',dismiss);document.removeEventListener('focusin',focusOutside);};
 },[open]);

 useEffect(()=>{if(open)itemRefs.current[active]?.focus();},[open,active]);

 function choose(index:number){
  const option=options[index];
  if(!option)return;
  if(!controlled)setLocalValue(option.value);
  onChange?.(option.value);
  setOpen(false);
  trigger.current?.focus();
 }
 function show(index:number){if(!disabled&&options.length){setActive(Math.max(0,Math.min(index,options.length-1)));setOpen(true);}}
 function onTriggerKeyDown(event:KeyboardEvent<HTMLButtonElement>){
  if(['ArrowDown','ArrowUp','Home','End'].includes(event.key)){
   event.preventDefault();
   show(event.key==='End'?options.length-1:event.key==='Home'?0:event.key==='ArrowUp'?(selectedIndex<0?options.length-1:selectedIndex):Math.max(selectedIndex,0));
  }
 }
 function onOptionKeyDown(event:KeyboardEvent<HTMLButtonElement>,index:number){
  if(event.key==='Escape'){event.preventDefault();setOpen(false);trigger.current?.focus();}
  else if(event.key==='Tab'){setOpen(false);}
  else if(event.key==='ArrowDown'||event.key==='ArrowUp'||event.key==='Home'||event.key==='End'){
   event.preventDefault();
   setActive(event.key==='Home'?0:event.key==='End'?options.length-1:event.key==='ArrowDown'?(index+1)%options.length:(index+options.length-1)%options.length);
  }
  else if(event.key==='Enter'||event.key===' '){event.preventDefault();choose(index);}
 }
 return <div ref={root} className={`forma-select ${open?'forma-select-open':''} ${className}`.trim()}>
  {name&&<input type="hidden" name={name} value={selected}/>}
  <button ref={trigger} type="button" className="forma-select-trigger" disabled={disabled} aria-label={label} aria-haspopup="listbox" aria-expanded={open} aria-controls={open?listId:undefined} onClick={()=>open?setOpen(false):show(selectedIndex>=0?selectedIndex:0)} onKeyDown={onTriggerKeyDown}>
   <span className="forma-select-value" title={selectedOption?.label??label}>{selectedOption?.label??label}</span>
   <svg className="forma-select-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>
  </button>
  {open&&<div id={listId} role="listbox" aria-label={label} className="forma-select-menu">
   {options.map((option,index)=><button ref={node=>{itemRefs.current[index]=node;}} role="option" aria-selected={option.value===selected} tabIndex={index===active?0:-1} type="button" key={`${option.value}-${index}`} className={`forma-select-option${option.value===selected?' is-selected':''}`} onMouseEnter={()=>setActive(index)} onKeyDown={event=>onOptionKeyDown(event,index)} onClick={()=>choose(index)}>
    <span className="forma-select-option-label">{option.label}</span>{option.value===selected&&<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 12 4 4 10-10"/></svg>}
   </button>)}
  </div>}
 </div>;
}
