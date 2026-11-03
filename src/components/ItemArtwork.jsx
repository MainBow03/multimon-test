import React from 'react';
import { ITEMS_DB } from '../data/items.js';
import { AdvancedItemArtwork, ADVANCED_HELD_ART_IDS } from './AdvancedItemArtwork.jsx';
// Illustrazione SVG originale, niente emoji per gli strumenti equipaggiabili.
export function ItemArtwork({id,size=54,className=''}) {
 if(ADVANCED_HELD_ART_IDS.includes(id))
   return <AdvancedItemArtwork id={id} size={size} className={className} name={ITEMS_DB[id]?.name}/>;
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
 if(id==='polvere_brillante')return <svg role="img" aria-label="Polvere Brillante" viewBox="0 0 100 100" width={size} height={size} className={className}>
   <defs><linearGradient id="glitter-vial" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fde68a"/><stop offset="1" stopColor="#a855f7"/></linearGradient></defs>
   <path d="M42 13 H59 V32 L72 47 L79 80 Q80 89 65 91 H34 Q20 89 21 80 L29 48 L42 32Z" fill="#1e1b4b" stroke="#e9d5ff" strokeWidth="4"/>
   <path d="M26 65 L73 65 L75 82 Q72 87 65 87 H34 Q26 87 25 82Z" fill="url(#glitter-vial)" opacity=".95"/>
   <rect x="39" y="7" width="24" height="11" rx="3" fill="#a16207" stroke="#fef3c7" strokeWidth="3"/>
   <path d="M50 40 L55 53 L68 57 L55 61 L50 74 L45 61 L32 57 L45 53Z" fill="#fef9c3" stroke="#fff" strokeWidth="2"/>
   <circle cx="29" cy="26" r="4" fill="#fde68a"/><circle cx="75" cy="35" r="3" fill="#d8b4fe"/>
   <path d="M76 10 V27 M67 19 H85" stroke="#fde68a" strokeWidth="4" strokeLinecap="round"/>
  </svg>;
 if(id==='barile_pimpante')return <svg role="img" aria-label="Barile Pimpante" viewBox="0 0 100 100" width={size} height={size} className={className}>
   <defs><linearGradient id="barrel-wood" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#7c2d12"/><stop offset=".5" stopColor="#d97706"/><stop offset="1" stopColor="#92400e"/></linearGradient></defs>
   <path d="M24 21 Q50 13 76 21 L83 77 Q52 89 17 77Z" fill="url(#barrel-wood)" stroke="#fde68a" strokeWidth="3"/>
   <path d="M28 24 Q50 12 72 24 L76 73 Q50 85 24 73Z" fill="none" stroke="#451a03" strokeWidth="2"/>
   <path d="M18 35 Q50 43 82 35 M17 65 Q50 74 83 65" fill="none" stroke="#cbd5e1" strokeWidth="8"/>
   <path d="M24 17 Q48 -2 76 17 L73 28 Q68 39 57 36 Q48 50 39 35 Q29 39 24 29Z" fill="#84cc16" stroke="#d9f99d" strokeWidth="3"/>
   <path d="M36 25 Q33 43 37 53 M64 27 Q69 44 64 54 M51 30 Q54 51 50 65" stroke="#bef264" strokeWidth="5" strokeLinecap="round" fill="none"/>
   <circle cx="47" cy="14" r="5" fill="#f7fee7"/><circle cx="59" cy="17" r="3" fill="#f7fee7"/>
   <path d="M79 12 L86 18 L79 24 L72 18Z" fill="#e9d5ff" stroke="#fff" strokeWidth="2"/>
  </svg>;
 if(id==='mantello_invisibilita')return <svg role="img" aria-label="Mantello dell’Invisibilità" viewBox="0 0 100 100" width={size} height={size} className={className}><path d="M31 14 Q50 2 69 14 L83 80 Q67 70 52 86 Q34 71 15 82 Z" fill="#172554" fillOpacity=".6" stroke="#67e8f9" strokeWidth="3"/><path d="M31 14 L48 35 L69 14 M48 35 L52 86" fill="none" stroke="#a5f3fc" strokeWidth="3" strokeOpacity=".8"/><circle cx="49" cy="34" r="7" fill="#e0f2fe" opacity=".65"/></svg>;
 if(id==='avanzi')return <svg role="img" aria-label="Avanzi" viewBox="0 0 100 100" width={size} height={size} className={className}><ellipse cx="50" cy="70" rx="38" ry="17" fill="#475569" stroke="#f8fafc" strokeWidth="3"/><path d="M16 60 Q50 40 84 60 L77 70 Q50 87 23 70Z" fill="#7c2d12" stroke="#f59e0b" strokeWidth="3"/><path d="M29 49 Q44 28 50 50 Q61 25 73 48" fill="none" stroke="#fcd34d" strokeWidth="9" strokeLinecap="round"/><path d="M33 15 Q25 27 34 36 M52 12 Q44 27 52 36" stroke="#e2e8f0" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".6"/></svg>;

 if(id==='germoglio_curativo')return <svg role="img" aria-label="Germoglio Curativo" viewBox="0 0 100 100" width={size} height={size} className={className}>
  <defs><linearGradient id="sprout-leaf" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#d9f99d"/><stop offset="1" stopColor="#15803d"/></linearGradient></defs>
  <path d="M22 76 Q50 91 78 76 L70 94 H31Z" fill="#a16207" stroke="#facc15" strokeWidth="3"/>
  <path d="M50 82 Q49 50 54 28" stroke="#4ade80" fill="none" strokeWidth="6" strokeLinecap="round"/>
  <path d="M50 56 Q15 57 14 20 Q51 22 50 56 M53 39 Q61 8 86 13 Q86 48 53 39Z" fill="url(#sprout-leaf)" stroke="#bbf7d0" strokeWidth="3"/>
  <path d="M50 56 L24 31 M53 39 L73 22" stroke="#dcfce7" strokeOpacity=".65" strokeWidth="2"/>
  <circle cx="65" cy="64" r="5" fill="#fef08a" opacity=".85"/>
 </svg>;
 if(id==='spray_neutralizzante')return <svg role="img" aria-label="Spray Neutralizzante" viewBox="0 0 100 100" width={size} height={size} className={className}>
  <path d="M33 30 H67 L72 88 H28Z" fill="#164e63" stroke="#a5f3fc" strokeWidth="4"/>
  <path d="M39 15 H61 V30 H39Z" fill="#64748b" stroke="#e0f2fe" strokeWidth="3"/>
  <path d="M45 9 H77 V15 H45Z" fill="#d1d5db" stroke="#f8fafc" strokeWidth="2"/>
  <path d="M76 18 L88 12 M78 27 L91 26 M74 36 L90 43" stroke="#67e8f9" strokeWidth="4" strokeLinecap="round"/>
  <circle cx="50" cy="62" r="15" fill="#06b6d4" stroke="#e0f2fe" strokeWidth="3"/>
  <path d="M43 62 L49 69 L60 54" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round"/>
 </svg>;
 if(id==='freccia_cupido')return <svg role="img" aria-label="Freccia di Cupido" viewBox="0 0 100 100" width={size} height={size} className={className}>
  <path d="M50 91 C31 70 11 57 13 35 C16 12 43 12 50 30 C60 10 86 14 88 35 C91 57 68 74 50 91Z" fill="#db2777" stroke="#fbcfe8" strokeWidth="4"/>
  <path d="M10 78 L84 12" stroke="#fef3c7" strokeWidth="5" strokeLinecap="round"/>
  <path d="M73 11 L89 8 L86 26Z" fill="#facc15" stroke="#fff7ed" strokeWidth="2"/>
  <path d="M12 70 L5 60 M12 70 L23 83" stroke="#fef3c7" strokeWidth="4" strokeLinecap="round"/>
 </svg>;
 if(id==='scudo_antimagia')return <svg role="img" aria-label="Scudo Anti-Magia" viewBox="0 0 100 100" width={size} height={size} className={className}>
  <defs><linearGradient id="anti-magic-shield" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#818cf8"/><stop offset="1" stopColor="#312e81"/></linearGradient></defs>
  <path d="M50 7 L86 21 L83 59 Q77 80 50 95 Q23 80 17 59 L14 21Z" fill="url(#anti-magic-shield)" stroke="#c7d2fe" strokeWidth="4"/>
  <circle cx="50" cy="48" r="19" fill="#1e1b4b" stroke="#e9d5ff" strokeWidth="3"/>
  <path d="M32 64 L68 31" stroke="#f5d0fe" strokeWidth="6" strokeLinecap="round"/>
  <path d="M45 26 L50 18 L55 26 M36 48 H26 M74 48 H64 M45 72 L50 79 L55 72" stroke="#a5f3fc" strokeWidth="3" fill="none"/>
 </svg>;
 if(id==='iperband')return <svg role="img" aria-label="Iperband, bracciale viola" viewBox="0 0 100 100" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg">
 <defs><linearGradient id="hb-metal" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#d4d4e8"/><stop offset=".48" stopColor="#595975"/><stop offset="1" stopColor="#17172c"/></linearGradient><linearGradient id="hb-glow" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f5d0fe"/><stop offset=".5" stopColor="#d946ef"/><stop offset="1" stopColor="#6d28d9"/></linearGradient></defs>
 <path d="M28 17 Q50 7 72 17 L83 31 L81 72 L70 85 Q50 96 30 85 L19 72 L17 31 Z" fill="url(#hb-metal)" stroke="#e8e5ff" strokeWidth="3"/>
 <path d="M27 28 Q50 15 73 28 L74 70 Q50 86 26 70 Z" fill="#130e27" stroke="#8b78c9" strokeWidth="3"/>
 <path d="M50 28 L69 45 L64 65 L50 75 L36 65 L31 45 Z" fill="url(#hb-glow)" stroke="#fae8ff" strokeWidth="3"/>
 <path d="M50 35 L61 46 L56 58 L49 66 L42 57 L39 46 Z" fill="#f5d0fe" opacity=".87"/>
 <path d="M21 39 L30 35 M19 59 L30 64 M79 39 L70 35 M81 59 L70 64" stroke="#f4e2ff" strokeWidth="4" strokeLinecap="round"/><circle cx="50" cy="49" r="4" fill="#fff"/></svg>;
 return <span className={className} role="img" aria-label="Oggetto" style={{fontSize:size*.7}}>✦</span>;
}