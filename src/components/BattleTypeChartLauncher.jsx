import React,{useEffect,useState} from 'react';
import {TYPES} from '../data/types.js';
import {TYPE_CHART,TYPE_STYLES} from '../systems/typeSystem.js';
import {renderTypeChartView} from '../screens/hub/TypeChartView.jsx';

const BackArrow=({size=18})=><span style={{fontSize:size}} aria-hidden="true">←</span>;

/** Reuses exactly the same table and effectiveness rules as the main-menu chart. */
export function BattleTypeChartLauncher(){
 const [open,setOpen]=useState(false);
 useEffect(()=>{
  if(!open)return;
  const esc=e=>{if(e.key==='Escape')setOpen(false)};
  window.addEventListener('keydown',esc);
  return()=>window.removeEventListener('keydown',esc);
 },[open]);
 return <>
  <button type="button" onClick={()=>setOpen(true)}
   aria-label="Apri la tabella completa dei tipi durante la battaglia"
   className="absolute top-[13.8rem] left-4 z-[65] rounded-xl border border-cyan-400/70 bg-slate-950/90 px-3 py-2 text-xs font-black uppercase tracking-wide text-cyan-200 shadow-lg hover:bg-cyan-950">
   🧬 Chart tipi
  </button>
  {open&&<div role="dialog" aria-modal="true" aria-label="Chart completa dei 23 tipi"
     className="fixed inset-0 z-[260] overflow-auto bg-slate-950"
     onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}>
    {renderTypeChartView({ArrowLeft:BackArrow,TYPES,TYPE_CHART,TYPE_STYLES,
      appMode:'type_chart',setAppMode:()=>setOpen(false)})}
   </div>}
 </>;
}
