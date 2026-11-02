import React from 'react';

// Tredici illustrazioni vettoriali originali, disegnate come oggetti veri:
// SVG senza font, emoji o immagini esterne; restano nitide anche a 24px.
// Il prefisso useId evita collisioni tra gradienti quando più Multimon
// mostrano lo stesso strumento nella stessa schermata.
export const ADVANCED_HELD_ART_IDS=Object.freeze([
  'fascia_eroe','scudo_antielemento','ciondolo_antiveleno',
  'clessidra_rapidita','lente_fortuna','risonatore_elementale',
  'nastro_solidarieta','stivali_slancio','bussola_predatore',
  'specchio_maledizioni','sigillo_liberta','piuma_rinascita',
  'campanella_soccorso'
]);
const themes={
 fascia_eroe:['#f59e69','#6b1939','#ffdf9c'],
 scudo_antielemento:['#69dcff','#173f81','#e5f8ff'],
 ciondolo_antiveleno:['#8de971','#17533a','#d9f99d'],
 clessidra_rapidita:['#f8cb65','#1c6590','#b8f3fc'],
 lente_fortuna:['#c6a4fc','#55338c','#f5d0fe'],
 risonatore_elementale:['#66e6ee','#5c3c9c','#ffd3ec'],
 nastro_solidarieta:['#f8a1d8','#a43670','#fff1f6'],
 stivali_slancio:['#ffba73','#8b3a22','#fde68a'],
 bussola_predatore:['#efc580','#7a4727','#fff0c5'],
 specchio_maledizioni:['#bb90ff','#342158','#e9d5ff'],
 sigillo_liberta:['#8dd6e4','#275b81','#ecfeff'],
 piuma_rinascita:['#ffc36b','#9d4d6f','#fef3c7'],
 campanella_soccorso:['#ffe287','#926c35','#fff7d6']
};
export function AdvancedItemArtwork({id,size=54,className='',name=''}) {
 const uid=React.useId().replace(/:/g,'');
 const colors=themes[id];
 if(!colors)return null;
 const [accent,dark,shine]=colors;
 const metal='url(#'+uid+'-metal)';
 const crystal='url(#'+uid+'-crystal)';
 const halo='url(#'+uid+'-halo)';
 const white='#ffffff';
 const outline='#13182d';
 let art=null;
 switch(id){
 case 'fascia_eroe':
  art=<>
   <path d="M27 14 Q50 10 73 14 L65 39 L75 79 L50 71 L25 80 L35 38Z" fill={metal} stroke={shine} strokeWidth="3.5"/>
   <path d="M35 20 Q50 16 65 20 L58 42 L66 66 L50 60 L34 67 L42 42Z" fill="#a51e43" stroke="#ffad93" strokeWidth="2"/>
   <path d="M39 37 L50 25 L61 37 L56 51 L44 51Z" fill={crystal} stroke="#fff4d6" strokeWidth="2.5"/>
   <path d="M33 15 L24 9 M67 15 L76 9 M45 62 L41 85 M55 61 L61 83" stroke="#ffdf9c" strokeWidth="4" strokeLinecap="round"/>
  </>;break;
 case 'scudo_antielemento':
  art=<>
   <path d="M50 8 L84 20 L82 51 Q78 72 50 91 Q22 72 18 51 L16 20Z" fill={metal} stroke="#d6f8ff" strokeWidth="3.5"/>
   <path d="M50 17 L75 26 L73 51 Q68 67 50 80 Q32 67 27 51 L25 26Z" fill="#12345f" stroke="#5fd3f8" strokeWidth="2"/>
   <path d="M50 23 L60 43 L50 60 L40 43Z" fill={crystal} stroke="#e0faff" strokeWidth="2"/>
   <path d="M33 55 L43 65 M67 55 L57 65 M30 34 L40 40 M70 34 L60 40" stroke="#a5f3fc" strokeWidth="3" strokeLinecap="round"/>
   <circle cx="50" cy="43" r="4" fill="#ffffff"/>
  </>;break;
 case 'ciondolo_antiveleno':
  art=<>
   <path d="M32 12 Q50 30 68 12 M32 12 Q34 4 40 10 M68 12 Q65 4 60 10" fill="none" stroke="#d9f99d" strokeWidth="4" strokeLinecap="round"/>
   <path d="M50 28 C66 28 76 41 76 56 C76 75 63 87 50 90 C37 87 24 75 24 56 C24 41 34 28 50 28Z" fill={metal} stroke="#dbf7b1" strokeWidth="4"/>
   <path d="M50 37 L66 55 L50 78 L34 55Z" fill={crystal} stroke="#f7fee7" strokeWidth="2.5"/>
   <path d="M50 44 V67 M39 56 H61" stroke="#155e48" strokeWidth="4" strokeLinecap="round"/>
   <circle cx="50" cy="17" r="6" fill="#e5ffbf" stroke="#1d6843" strokeWidth="2"/>
  </>;break;
 case 'clessidra_rapidita':
  art=<>
   <path d="M25 13 H75 M25 88 H75" stroke="#fef3c7" strokeWidth="7" strokeLinecap="round"/>
   <path d="M30 16 Q30 36 50 50 Q70 65 70 85 M70 16 Q70 36 50 50 Q30 65 30 85" stroke={shine} strokeWidth="4" fill="none"/>
   <path d="M31 19 H69 Q70 36 50 49 Q30 36 31 19Z" fill="#71d6f2" fillOpacity=".55"/>
   <path d="M34 84 H66 L50 57Z" fill={crystal} stroke="#fef3c7" strokeWidth="1"/>
   <path d="M25 13 L20 6 M75 13 L80 6 M22 88 L16 94 M78 88 L84 94" stroke="#f8d47a" strokeWidth="3"/>
   <circle cx="50" cy="51" r="3" fill="#fff7e5"/>
  </>;break;
 case 'lente_fortuna':
  art=<>
   <circle cx="41" cy="40" r="28" fill={metal} stroke="#f4d8ff" strokeWidth="5"/>
   <circle cx="41" cy="40" r="20" fill={crystal} stroke="#f4dcff" strokeWidth="2"/>
   <path d="M60 61 L83 84" stroke="#8e6abf" strokeWidth="15" strokeLinecap="round"/>
   <path d="M62 63 L82 83" stroke="#efd6ff" strokeWidth="5" strokeLinecap="round"/>
   <path d="M41 26 L44 36 L55 40 L44 44 L41 55 L37 44 L27 40 L37 36Z" fill="#fff" stroke="#d9b5ff" strokeWidth="1.5"/>
   <circle cx="30" cy="30" r="4" fill="#fff" fillOpacity=".8"/>
  </>;break;
 case 'risonatore_elementale':
  art=<>
   <path d="M24 24 L76 24 L84 70 L16 70Z" fill={metal} stroke="#c4faff" strokeWidth="3"/>
   <circle cx="50" cy="48" r="23" fill="#17254c" stroke="#a5f3fc" strokeWidth="4"/>
   <circle cx="50" cy="48" r="13" fill={crystal} stroke="#fff" strokeWidth="2"/>
   <path d="M13 42 Q8 50 13 58 M87 42 Q92 50 87 58 M18 30 Q5 50 18 70 M82 30 Q95 50 82 70" stroke="#67e8f9" fill="none" strokeWidth="3" strokeLinecap="round"/>
   <path d="M50 35 L60 48 L50 61 L40 48Z" fill="#fbcbf6" stroke="#fff" strokeWidth="2"/>
  </>;break;
 case 'nastro_solidarieta':
  art=<>
   <path d="M50 39 C27 10 15 21 21 42 Q28 59 50 45 C72 59 80 42 79 30 Q76 13 50 39Z" fill={metal} stroke="#ffe5f3" strokeWidth="3.5"/>
   <path d="M43 46 L29 86 L47 74 L51 90 L57 47 M56 46 L72 85 L54 73" fill={crystal} stroke="#ffe4f3" strokeWidth="3"/>
   <path d="M27 34 Q34 27 45 38 M73 34 Q65 26 56 38" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round"/>
   <circle cx="50" cy="43" r="10" fill="#c83184" stroke="#fff1f6" strokeWidth="3"/>
   <path d="M50 38 V48 M45 43 H55" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
  </>;break;
 case 'stivali_slancio':
  art=<>
   <path d="M20 15 H47 L49 49 Q57 56 79 57 Q89 60 88 76 L84 84 H15 Q10 79 13 71 L24 60Z" fill={metal} stroke="#ffe1af" strokeWidth="3.5"/>
   <path d="M19 67 Q32 62 40 69 L80 69" stroke="#dca16b" strokeWidth="3" fill="none"/>
   <path d="M20 78 H83" stroke="#fff0d7" strokeWidth="4" strokeLinecap="round"/>
   <path d="M26 22 H42 M26 31 H42 M27 40 H42" stroke="#ffe2b5" strokeWidth="4" strokeLinecap="round"/>
   <path d="M56 25 L67 35 L59 35 L70 48" stroke="#fef08a" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </>;break;
 case 'bussola_predatore':
  art=<>
   <circle cx="50" cy="49" r="37" fill={metal} stroke="#ffebbb" strokeWidth="4"/>
   <circle cx="50" cy="49" r="28" fill="#24415a" stroke="#ffdc89" strokeWidth="3"/>
   <path d="M50 13 V24 M50 75 V86 M14 49 H25 M75 49 H86" stroke="#fff1c7" strokeWidth="3.5" strokeLinecap="round"/>
   <path d="M34 65 L44 44 L67 30 L56 55Z" fill={crystal} stroke="#fff5d6" strokeWidth="2"/>
   <path d="M44 44 L56 55 L67 30Z" fill="#e67f55"/>
   <circle cx="50" cy="49" r="4" fill="#fff"/>
  </>;break;
 case 'specchio_maledizioni':
  art=<>
   <path d="M35 12 L65 12 Q80 19 80 34 V59 Q79 75 62 79 H38 Q21 75 20 59 V34 Q20 19 35 12Z" fill={metal} stroke="#ddc6ff" strokeWidth="4"/>
   <path d="M35 20 H65 Q72 25 72 35 V58 Q70 69 62 71 H38 Q30 69 28 58 V35 Q28 25 35 20Z" fill={crystal} stroke="#e9d5ff" strokeWidth="2"/>
   <path d="M37 29 Q43 35 40 43 Q35 49 42 55 M55 31 L47 48 L56 57" fill="none" stroke="#faf5ff" strokeWidth="3.5" strokeLinecap="round"/>
   <path d="M44 78 V87 H32 M56 78 V87 H68" stroke="#e9d5ff" strokeWidth="4" fill="none" strokeLinecap="round"/>
   <circle cx="61" cy="38" r="5" fill="#fff" fillOpacity=".8"/>
  </>;break;
 case 'sigillo_liberta':
  art=<>
   <path d="M34 41 V29 Q34 12 49 12 Q64 12 65 29" fill="none" stroke={shine} strokeWidth="8" strokeLinecap="round"/>
   <rect x="22" y="38" width="55" height="43" rx="9" fill={metal} stroke="#dcfaff" strokeWidth="3.5"/>
   <circle cx="49" cy="56" r="8" fill="#083e63" stroke="#bffaff" strokeWidth="3"/>
   <path d="M49 61 V70" stroke="#e0feff" strokeWidth="4" strokeLinecap="round"/>
   <path d="M60 20 L84 9 M71 21 L89 27 M67 29 L83 41" fill="none" stroke="#81ebf9" strokeWidth="3" strokeLinecap="round"/>
   <path d="M73 12 L83 8 L81 18" fill="none" stroke="#fff" strokeWidth="2.5"/>
  </>;break;
 case 'piuma_rinascita':
  art=<>
   <path d="M22 83 Q24 40 65 13 Q82 23 75 50 Q70 72 22 83Z" fill={metal} stroke="#ffebd0" strokeWidth="3.5"/>
   <path d="M25 82 L67 22" stroke="#fff8e5" strokeWidth="4" strokeLinecap="round"/>
   <path d="M36 66 L26 55 M47 52 L36 36 M60 37 L56 25 M42 61 L61 67 M53 46 L73 50" stroke="#ffe9a9" fill="none" strokeWidth="3" strokeLinecap="round"/>
   <path d="M23 83 L15 94" stroke="#f5c17d" strokeWidth="4" strokeLinecap="round"/>
   <circle cx="74" cy="22" r="4" fill="#fff"/>
  </>;break;
 case 'campanella_soccorso':
  art=<>
   <path d="M38 18 Q38 9 50 9 Q62 9 62 18" stroke="#fff7db" strokeWidth="5" fill="none"/>
   <path d="M50 19 Q27 19 26 51 L22 69 H78 L74 51 Q73 19 50 19Z" fill={metal} stroke="#fff4ce" strokeWidth="4"/>
   <path d="M30 61 H70" stroke="#ffefb4" strokeWidth="4" strokeLinecap="round"/>
   <path d="M44 76 Q46 89 50 89 Q54 89 56 76" fill="#c58d30" stroke="#ffe9a6" strokeWidth="3.5"/>
   <path d="M37 37 Q50 28 63 37" stroke="#fff8dd" strokeWidth="4" fill="none" strokeLinecap="round"/>
   <path d="M50 42 V56 M43 49 H57" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"/>
  </>;break;
 default:return null;
 }
 return <svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label={name||id}
     width={size} height={size} viewBox="0 0 100 100" className={className}>
   <defs>
    <radialGradient id={uid+'-halo'}><stop stopColor={accent} stopOpacity=".42"/><stop offset="1" stopColor={dark} stopOpacity="0"/></radialGradient>
    <linearGradient id={uid+'-metal'} x1="0" y1="0" x2="1" y2="1">
      <stop stopColor={shine}/><stop offset=".35" stopColor={accent}/><stop offset="1" stopColor={dark}/>
    </linearGradient>
    <linearGradient id={uid+'-crystal'} x1="0" y1="0" x2="1" y2="1">
      <stop stopColor="#ffffff"/><stop offset=".33" stopColor={shine}/><stop offset=".75" stopColor={accent}/><stop offset="1" stopColor={dark}/>
    </linearGradient>
   </defs>
   <circle cx="50" cy="49" r="47" fill={halo}/>
   <g strokeLinejoin="round" strokeLinecap="round">{art}</g>
 </svg>;
}
