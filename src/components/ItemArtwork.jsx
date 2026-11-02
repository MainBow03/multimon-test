import React from 'react';
import { ITEMS_DB } from '../data/items.js';
// Illustrazione SVG originale, niente emoji per gli strumenti equipaggiabili.
export function ItemArtwork({id,size=54,className=''}) {
 const gem=ITEMS_DB[id]?.gemType;
 if(gem){
  const color=ITEMS_DB[id].gemColor;
  const key='gem-'+id;
  return <svg role="img" aria-label={ITEMS_DB[id].name+' per '+gem} className={className} viewBox="0 0 100 100" width={size} height={size} xmlns="http://www.w3.org/2000/svg">
   <defs><linearGradient id={key} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffffff"/><stop offset=".3" stopColor={color}/><stop offset="1" stopColor="#101125"/></linearGradient></defs>
   <path d="M23 22 L77 22 L96 43 L50 94 L4 43 Z" fill={`url(#${key})`} stroke="#fff" strokeWidth="3"/>
   <path d="M23 22 L40 43 L50 94 L60 43 L77 22 M4 43 L96 43 M40 43 L60 43" fill="none" stroke="white" strokeOpacity=".65" strokeWidth="2"/>
   <circle cx="36" cy="30" r="5" fill="white" opacity=".8"/>
  </svg>;
 }
 if(id==='mantello_invisibilita')return <svg role="img" aria-label="Mantello dell’Invisibilità" viewBox="0 0 100 100" width={size} height={size} className={className}><path d="M31 14 Q50 2 69 14 L83 80 Q67 70 52 86 Q34 71 15 82 Z" fill="#172554" fillOpacity=".6" stroke="#67e8f9" strokeWidth="3"/><path d="M31 14 L48 35 L69 14 M48 35 L52 86" fill="none" stroke="#a5f3fc" strokeWidth="3" strokeOpacity=".8"/><circle cx="49" cy="34" r="7" fill="#e0f2fe" opacity=".65"/></svg>;
 if(id==='avanzi')return <svg role="img" aria-label="Avanzi" viewBox="0 0 100 100" width={size} height={size} className={className}><ellipse cx="50" cy="70" rx="38" ry="17" fill="#475569" stroke="#f8fafc" strokeWidth="3"/><path d="M16 60 Q50 40 84 60 L77 70 Q50 87 23 70Z" fill="#7c2d12" stroke="#f59e0b" strokeWidth="3"/><path d="M29 49 Q44 28 50 50 Q61 25 73 48" fill="none" stroke="#fcd34d" strokeWidth="9" strokeLinecap="round"/><path d="M33 15 Q25 27 34 36 M52 12 Q44 27 52 36" stroke="#e2e8f0" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".6"/></svg>;

 if(id==='iperband')return <svg role="img" aria-label="Iperband, bracciale viola" viewBox="0 0 100 100" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg">
 <defs><linearGradient id="hb-metal" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#d4d4e8"/><stop offset=".48" stopColor="#595975"/><stop offset="1" stopColor="#17172c"/></linearGradient><linearGradient id="hb-glow" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f5d0fe"/><stop offset=".5" stopColor="#d946ef"/><stop offset="1" stopColor="#6d28d9"/></linearGradient></defs>
 <path d="M28 17 Q50 7 72 17 L83 31 L81 72 L70 85 Q50 96 30 85 L19 72 L17 31 Z" fill="url(#hb-metal)" stroke="#e8e5ff" strokeWidth="3"/>
 <path d="M27 28 Q50 15 73 28 L74 70 Q50 86 26 70 Z" fill="#130e27" stroke="#8b78c9" strokeWidth="3"/>
 <path d="M50 28 L69 45 L64 65 L50 75 L36 65 L31 45 Z" fill="url(#hb-glow)" stroke="#fae8ff" strokeWidth="3"/>
 <path d="M50 35 L61 46 L56 58 L49 66 L42 57 L39 46 Z" fill="#f5d0fe" opacity=".87"/>
 <path d="M21 39 L30 35 M19 59 L30 64 M79 39 L70 35 M81 59 L70 64" stroke="#f4e2ff" strokeWidth="4" strokeLinecap="round"/><circle cx="50" cy="49" r="4" fill="#fff"/></svg>;
 return <span className={className} role="img" aria-label="Oggetto" style={{fontSize:size*.7}}>✦</span>;
}