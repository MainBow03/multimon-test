import React from 'react';
// Illustrazione SVG originale, niente emoji per gli strumenti equipaggiabili.
export function ItemArtwork({id,size=54,className=''}) {
 if(id==='iperband')return <svg role="img" aria-label="Iperband, bracciale viola" viewBox="0 0 100 100" width={size} height={size} className={className} xmlns="http://www.w3.org/2000/svg">
 <defs><linearGradient id="hb-metal" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#d4d4e8"/><stop offset=".48" stopColor="#595975"/><stop offset="1" stopColor="#17172c"/></linearGradient><linearGradient id="hb-glow" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f5d0fe"/><stop offset=".5" stopColor="#d946ef"/><stop offset="1" stopColor="#6d28d9"/></linearGradient></defs>
 <path d="M28 17 Q50 7 72 17 L83 31 L81 72 L70 85 Q50 96 30 85 L19 72 L17 31 Z" fill="url(#hb-metal)" stroke="#e8e5ff" strokeWidth="3"/>
 <path d="M27 28 Q50 15 73 28 L74 70 Q50 86 26 70 Z" fill="#130e27" stroke="#8b78c9" strokeWidth="3"/>
 <path d="M50 28 L69 45 L64 65 L50 75 L36 65 L31 45 Z" fill="url(#hb-glow)" stroke="#fae8ff" strokeWidth="3"/>
 <path d="M50 35 L61 46 L56 58 L49 66 L42 57 L39 46 Z" fill="#f5d0fe" opacity=".87"/>
 <path d="M21 39 L30 35 M19 59 L30 64 M79 39 L70 35 M81 59 L70 64" stroke="#f4e2ff" strokeWidth="4" strokeLinecap="round"/><circle cx="50" cy="49" r="4" fill="#fff"/></svg>;
 return <span className={className} role="img" aria-label="Oggetto" style={{fontSize:size*.7}}>✦</span>;
}