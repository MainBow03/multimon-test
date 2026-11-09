// Segnaposto locale e leggero: le immagini da host esterni possono scomparire.
// La fallback non dipende dalla rete, non esegue script e non maschera
// informazioni di gameplay: nome e altre statistiche restano nel testo UI.
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
<defs><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#0a2642"/><stop offset=".55" stop-color="#22265c"/><stop offset="1" stop-color="#592a70"/></linearGradient></defs>
<rect width="256" height="256" rx="34" fill="url(#bg)"/>
<circle cx="128" cy="103" r="60" stroke="#8be9ff" stroke-width="6" fill="none" opacity=".78"/>
<path d="M94 111l21 21 45-51" fill="none" stroke="#f8d177" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M53 163h150" stroke="#a78bfa" stroke-width="3" opacity=".75"/>
<text x="128" y="202" text-anchor="middle" font-family="Arial,sans-serif" font-size="21" font-weight="bold" fill="#e4faff">MULTIMON</text>
<text x="128" y="226" text-anchor="middle" font-family="Arial,sans-serif" font-size="11" fill="#c5d5f4">PNG NON DISPONIBILE</text>
</svg>`;
export const MULTIMON_IMAGE_FALLBACK='data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(svg);
export function onMultimonImageError(event){
 const image=event?.currentTarget||event?.target;
 if(!image||typeof image.getAttribute!=='function')return false;
 if(image.getAttribute('src')===MULTIMON_IMAGE_FALLBACK)return false;
 // Disabilita il callback prima di sostituire la sorgente: nessun loop.
 image.onerror=null;
 image.src=MULTIMON_IMAGE_FALLBACK;
 return true;
}
