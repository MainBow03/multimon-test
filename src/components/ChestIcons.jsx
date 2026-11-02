import React from 'react';
// Piccole icone SVG originali senza dipendenze esterne, usabili anche su GitHub Pages.
function Glyph({name,size=24,...props}){
 const shared={width:size,height:size,viewBox:'0 0 24 24',fill:'none',stroke:'currentColor',strokeWidth:1.9,strokeLinecap:'round',strokeLinejoin:'round',...props};
 switch(name){
 case 'ArrowLeft':return <svg {...shared}><path d="m12 19-7-7 7-7"/><path d="M5 12h15"/></svg>;
 case 'ChevronRight':return <svg {...shared}><path d="m9 18 6-6-6-6"/></svg>;
 case 'X':return <svg {...shared}><path d="M5 5 19 19M19 5 5 19"/></svg>;
 case 'Coins':return <svg {...shared}><ellipse cx="9" cy="7" rx="6" ry="3"/><path d="M3 7v9c0 2 3 3 6 3s6-1 6-3V7M3 11c0 2 3 3 6 3s6-1 6-3M15 10c3 0 6 1 6 3v5c0 2-3 3-6 3-2 0-3-.5-4-1"/></svg>;
 case 'Dumbbell':return <svg {...shared}><path d="m6 17 11-11M2 14l8 8M14 2l8 8M4 12l8 8M12 4l8 8"/></svg>;
 case 'HeartPulse':return <svg {...shared}><path d="M20 5c-2-2-5-2-8 1-3-3-6-3-8-1-3 3-2 7 1 10l7 7 7-7c3-3 4-7 1-10Z"/><path d="M2 12h6l2-3 3 6 2-3h7"/></svg>;
 case 'Shield':return <svg {...shared}><path d="m12 2 9 4v6c0 5-3 8-9 10-6-2-9-5-9-10V6z"/><path d="m8 12 3 3 5-6"/></svg>;
 case 'Star':return <svg {...shared}><path d="m12 2 3.3 6.8 7.5 1.1-5.4 5.3 1.3 7.4L12 19l-6.7 3.6 1.3-7.4L1.2 10l7.5-1.2z"/></svg>;
 case 'Gift':return <svg {...shared}><rect x="3" y="10" width="18" height="12" rx="2"/><path d="M2 6h20v4H2zM12 6v16M12 6C9 2 4 2 4 5c0 2 4 2 8 1m0 0c3-4 8-4 8-1 0 2-4 2-8 1"/></svg>;
 case 'PackageOpen':return <svg {...shared}><path d="m3 8 9 4 9-4M12 12v10M3 8l9-5 9 5v10l-9 5-9-5zM3 8l-2-5 9-2 2 2M21 8l2-5-9-2-2 2"/></svg>;
 case 'FlaskConical':return <svg {...shared}><path d="M9 2h6M10 2v7L3 20a1 1 0 0 0 1 2h16a1 1 0 0 0 1-2L14 9V2M7 16h10"/></svg>;
 case 'CheckCircle':return <svg {...shared}><circle cx="12" cy="12" r="10"/><path d="m7 12 3 3 7-7"/></svg>;
 default:return <svg {...shared}><circle cx="12" cy="12" r="9"/></svg>;
 }
}
export const ArrowLeft=p=><Glyph name="ArrowLeft" {...p}/>;
export const ChevronRight=p=><Glyph name="ChevronRight" {...p}/>;
export const X=p=><Glyph name="X" {...p}/>;
export const Coins=p=><Glyph name="Coins" {...p}/>;
export const Dumbbell=p=><Glyph name="Dumbbell" {...p}/>;
export const HeartPulse=p=><Glyph name="HeartPulse" {...p}/>;
export const Shield=p=><Glyph name="Shield" {...p}/>;
export const Star=p=><Glyph name="Star" {...p}/>;
export const Gift=p=><Glyph name="Gift" {...p}/>;
export const PackageOpen=p=><Glyph name="PackageOpen" {...p}/>;
export const FlaskConical=p=><Glyph name="FlaskConical" {...p}/>;
export const CheckCircle=p=><Glyph name="CheckCircle" {...p}/>;
