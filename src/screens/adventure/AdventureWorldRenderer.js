// Renderer tridimensionale autonomo: mesh reali, prospettiva, depth test,
// luci, nebbia e camera inseguitrice. Nessuna libreria esterna/CDN.
import {ADVENTURE_ENTITIES,ADVENTURE_ZONES,ADVENTURE_CHAMPION,adventureRoadZ,adventureZoneIndex,adventureNextObjective} from '../../systems/adventureCampaign.js';

const palette={
 meadow:{ground:'#69bc82',leaf:'#69d999',leaf2:'#28a772',trunk:'#765643',rock:'#93adb5',road:'#ffe1a6'},
 autumn:{ground:'#d1a06d',leaf:'#ffd071',leaf2:'#dc7350',trunk:'#805442',rock:'#bd9a80',road:'#ffddaa'},
 water:{ground:'#65b9bb',leaf:'#50ddad',leaf2:'#2689bd',trunk:'#557184',rock:'#a4d4d5',road:'#e0ece0'},
 snow:{ground:'#c4e3ea',leaf:'#c4fbff',leaf2:'#7cb8e7',trunk:'#69859e',rock:'#edf9fd',road:'#fcf3e7'},
 magic:{ground:'#a18bd2',leaf:'#f0b8ff',leaf2:'#73dfed',trunk:'#6e508b',rock:'#d5b1ff',road:'#fce0fa'},
 volcanic:{ground:'#9e7985',leaf:'#ed9c99',leaf2:'#ed705a',trunk:'#5c4b5a',rock:'#6d5766',road:'#e0baa6'}
};
const rgb=value=>{
 const v=value.replace('#','');return [0,2,4].map(i=>parseInt(v.slice(i,i+2),16)/255);
};
const color=(hex,factor=1)=>rgb(hex).map(x=>Math.min(1,Math.max(0,x*factor)));
const rand=(seed)=>{let v=seed|0;return ()=>{v^=v<<13;v^=v>>>17;v^=v<<5;return (v>>>0)/4294967295;}};
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>{const d=Math.hypot(...a)||1;return a.map(x=>x/d)};
const minus=(a,b)=>a.map((x,i)=>x-b[i]);
const persp=(fovy,aspect,near,far)=>{
 const f=1/Math.tan(fovy/2),nf=1/(near-far);
 return [f/aspect,0,0,0,0,f,0,0,0,0,(far+near)*nf,-1,0,0,2*far*near*nf,0];
};
const look=(eye,target)=>{
 const f=norm(minus(target,eye)),s=norm(cross(f,[0,1,0])),u=cross(s,f);
 return [s[0],u[0],-f[0],0,s[1],u[1],-f[1],0,s[2],u[2],-f[2],0,
  -dot(s,eye),-dot(u,eye),dot(f,eye),1];
};
const mul=(a,b)=>{
 const out=new Array(16).fill(0);
 for(let c=0;c<4;c++)for(let r=0;r<4;r++)for(let k=0;k<4;k++)out[c*4+r]+=a[k*4+r]*b[c*4+k];
 return out;
};
class Mesh{
 constructor(){this.data=[]}
 triangle(a,b,c,shade){
  const face=norm(cross(minus(b,a),minus(c,a)));
  for(const p of [a,b,c])this.data.push(...p,...shade,...face);
 }
 quad(a,b,c,d,shade){this.triangle(a,b,c,shade);this.triangle(a,c,d,shade)}
 box(x,y,z,w,h,d,hex){
  const c=color(hex),light=color(hex,1.07),dark=color(hex,.78);
  const a=[x-w/2,y,z-d/2],b=[x+w/2,y,z-d/2],c1=[x+w/2,y,z+d/2],d1=[x-w/2,y,z+d/2],
    a1=[x-w/2,y+h,z-d/2],b1=[x+w/2,y+h,z-d/2],c2=[x+w/2,y+h,z+d/2],d2=[x-w/2,y+h,z+d/2];
  // Facce rivolte all'esterno: i tetti e le strade ricevono finalmente luce.
  this.quad(a,a1,b1,b,c);this.quad(c1,c2,d2,d1,c);
  this.quad(b,b1,c2,c1,dark);this.quad(d1,d2,a1,a,dark);
  this.quad(d2,c2,b1,a1,light);
 }
 prismRoof(x,y,z,w,h,d,hex){
  const a=[x-w/2,y,z-d/2],b=[x+w/2,y,z-d/2],c=[x+w/2,y,z+d/2],e=[x-w/2,y,z+d/2];
  const roof1=[x,y+h,z-d/2],roof2=[x,y+h,z+d/2];
  // Tetto a due falde: due rettangoli e due triangoli senza degenerazioni.
  this.quad(a,e,roof2,roof1,color(hex,1.06));
  this.quad(b,roof1,roof2,c,color(hex,.9));
  this.triangle(a,roof1,b,color(hex,.92));
  this.triangle(e,c,roof2,color(hex,.88));
 }
 cylinder(x,y,z,r,h,hex,n=8){
  const c=color(hex),top=color(hex,1.1);
  for(let i=0;i<n;i++){
   const a=i*2*Math.PI/n,b=(i+1)*2*Math.PI/n;
   const p=[x+Math.cos(a)*r,y,z+Math.sin(a)*r],
     q=[x+Math.cos(b)*r,y,z+Math.sin(b)*r],
     pt=[p[0],y+h,p[2]],qt=[q[0],y+h,q[2]];
   this.quad(p,q,qt,pt,c);this.triangle([x,y+h,z],pt,qt,top);
  }
 }
 cone(x,y,z,r,h,hex,n=8){
  for(let i=0;i<n;i++){
   const a=i*2*Math.PI/n,b=(i+1)*2*Math.PI/n;
   const k=.84+(i%4)*.07;
   this.triangle([x+Math.cos(a)*r,y,z+Math.sin(a)*r],
    [x+Math.cos(b)*r,y,z+Math.sin(b)*r],[x,y+h,z],color(hex,k));
  }
 }
 sphere(x,y,z,rx,ry,rz,hex,lats=5,lons=8){
  for(let j=0;j<lats;j++){
   const a=-Math.PI/2+j*Math.PI/lats,b=-Math.PI/2+(j+1)*Math.PI/lats;
   for(let k=0;k<lons;k++){
    const u=k*2*Math.PI/lons,v=(k+1)*2*Math.PI/lons;
    const p=(lat,lon)=>[x+Math.cos(lat)*Math.cos(lon)*rx,y+Math.sin(lat)*ry,z+Math.cos(lat)*Math.sin(lon)*rz];
    const A=p(a,u),B=p(a,v),C=p(b,v),D=p(b,u);
    this.quad(A,B,C,D,color(hex,.9+(j%3)*.07));
   }
  }
 }
 ring(x,y,z,r,thickness,hex,segments=18){
  const shade=color(hex);
  for(let i=0;i<segments;i++){
   const a=i*2*Math.PI/segments,b=(i+1)*2*Math.PI/segments;
   const pt=(radius,angle)=>[x+Math.cos(angle)*radius,y,z+Math.sin(angle)*radius];
   this.quad(pt(r,a),pt(r+thickness,a),pt(r+thickness,b),pt(r,b),shade);
  }
 }
 diamond(x,y,z,r,hex){
  for(let i=0;i<6;i++){
   const a=i*Math.PI/3,b=(i+1)*Math.PI/3;
   const v1=[x+Math.cos(a)*r,y,z+Math.sin(a)*r],v2=[x+Math.cos(b)*r,y,z+Math.sin(b)*r];
   this.triangle([x,y+r*1.8,z],v1,v2,color(hex,1.12));
   this.triangle([x,y-r*1.6,z],v2,v1,color(hex,.82));
  }
 }
}
// Fiori modellati in 3D (non sprite): petali poligonali e centro luminoso.
const addToonFlower=(m,x,z,petal='#ffb8cc',scale=1)=>{
 const y=.15+.35*scale;
 m.cylinder(x,.05,z,.035*scale,y, '#3b9b68',5);
 for(let n=0;n<5;n++){
  const angle=n*Math.PI*2/5;
  m.sphere(x+Math.cos(angle)*.23*scale,y+.12*scale,
    z+Math.sin(angle)*.23*scale,.2*scale,.14*scale,.16*scale,petal,3,5);
 }
 m.sphere(x,y+.15*scale,z,.17*scale,.17*scale,.17*scale,'#fff2a2',4,6);
};
const addTree=(m,x,z,pal,size=1,kind='meadow')=>{
 const h=(kind==='snow'?2.5:2.8)*size;
 m.cylinder(x,.05,z,.22*size,h*.62,pal.trunk,6);
 if(kind==='snow'){
  m.cone(x,1.2*size,z,1.12*size,2.8*size,pal.leaf2,8);
  m.cone(x,2.1*size,z,.86*size,2.1*size,pal.leaf,8);
 }else if(kind==='volcanic'){
  m.cone(x,.8*size,z,.96*size,3.2*size,pal.leaf2,7);
  m.cone(x,2.1*size,z,.55*size,1.6*size,pal.leaf,7);
 }else{
  m.sphere(x,h*.62+1.2*size,z,1.4*size,1.1*size,1.3*size,pal.leaf,5,8);
  m.sphere(x+.65*size,h*.62+.9*size,z+.3*size,1.08*size,.85*size,.9*size,pal.leaf2,5,7);
  // Ciuffo di luce volutamente piatto per una silhouette da cartone.
  m.sphere(x-.35*size,h*.62+1.82*size,z+.45*size,.5*size,.27*size,.4*size,
    kind==='magic'?'#f8ddff':'#b9f7cc',4,7);
 }
};
const addGym=(m,e)=>{
 const z=ADVENTURE_ZONES[e.zone],c=z.color;
 // Arco della Palestra e torre con bandiera.
 m.cylinder(e.x,0,e.z,4.65,.5,'#293449',10);
 m.cylinder(e.x,.5,e.z,4.05,4.3,'#42516b',10);
 m.cylinder(e.x,4.8,e.z,4.45,.55,c,10);
 m.cone(e.x,5.35,e.z,4.8,3.6,'#273452',10);
 for(let k=0;k<7;k++){
  const a=k*Math.PI*2/7;
  m.cylinder(e.x+Math.cos(a)*3.6,.6,e.z+Math.sin(a)*3.6,.28,4.2,'#e0e6ec',6);
 }
 m.box(e.x,1.25,e.z+4.08,2.35,3.2,.15,'#233046');
 m.cylinder(e.x,8.0,e.z,.1,2.1,'#f3eac8',6);
 m.diamond(e.x,10.7,e.z,.9,c);
 m.box(e.x,0,e.z-7,1.9,.07,12,z.biome==='snow'?'#c9dfea':'#dcc5a5');
 // Architettura e silhouette tematiche: le Palestre non cambiano soltanto colore.
 if(e.zone===0){
  for(let i=0;i<8;i++){const a=i*Math.PI/4,x=e.x+Math.cos(a)*4.8,z=e.z+Math.sin(a)*4.8;
   m.cylinder(x,.1,z,.11,3.6,'#398d6e',6);
   m.sphere(x,3.7,z,.72,.45,.7,'#72d3a8',5,7);
  }
  m.sphere(e.x,9.15,e.z,1.1,.8,1.1,'#a0edc3',6,9);
 }else if(e.zone===1){
  for(const side of [-1,1]){
   m.box(e.x+side*3.5,0,e.z-2,1.35,6.4,1.35,'#654a55');
   m.sphere(e.x+side*3.5,7,e.z-2,.8,1.2,.8,'#f4a460',6,8);
  }
  m.ring(e.x,1.3,e.z,3.6,.3,'#ffbf75');
 }else if(e.zone===2){
  m.cylinder(e.x,4.75,e.z,3.0,1.35,'#8ae5f4',12);
  for(const side of [-1,1])m.box(e.x+side*3.5,0,e.z,1,5.2,2.3,'#58bada');
  m.ring(e.x,1.2,e.z,4.35,.25,'#b1f5f7');
 }else if(e.zone===3){
  for(const side of [-1,1]){
   m.cone(e.x+side*3.3,3.0,e.z,1.8,5.7,'#b8effb',8);
   m.diamond(e.x+side*3.3,9.1,e.z,.45,'#ebffff');
  }
  m.cone(e.x,7.2,e.z,2.7,6.1,'#c6ecff',9);
 }else if(e.zone===4){
  m.ring(e.x,8.1,e.z,4.5,.38,'#e9b6fb',26);
  m.ring(e.x,8.4,e.z,3.3,.16,'#96e6ef',24);
  for(let i=0;i<6;i++){const a=i*Math.PI/3;
   m.diamond(e.x+Math.cos(a)*3.6,7.6,e.z+Math.sin(a)*3.6,.46,'#e5ccff');
  }
 }else{
  for(let i=0;i<7;i++){const a=i*Math.PI*2/7;
   m.cone(e.x+Math.cos(a)*5.1,0,e.z+Math.sin(a)*5.1,.8,4.5,'#5f515e',7);
  }
  m.ring(e.x,3.6,e.z,4.5,.34,'#ff9774');
  m.diamond(e.x,12.6,e.z,1.25,'#ffbc6e');
 }

};
const addHouse=(m,e,kind)=>{
 const house=kind==='inn';
 const col=house?'#f3e4cc':'#e8cbac',roof=house?'#3c839a':'#bd704e';
 m.box(e.x,0,e.z,3.6,3.0,3.5,col);
 m.prismRoof(e.x,3,e.z,4.4,1.65,4.1,roof);
 m.box(e.x,.2,e.z+1.78,1,1.8,.14,'#66534e');
 m.box(e.x-1.12,1.6,e.z+1.78,.68,.82,.2,'#7bc8e6');
 m.box(e.x+1.12,1.6,e.z+1.78,.68,.82,.2,'#7bc8e6');
 m.cylinder(e.x+2.35,0,e.z+1.8,.13,2.6,'#e6d3b9');
 m.diamond(e.x+2.35,3.1,e.z+1.8,.52,house?'#65d9ee':'#f5d568');
};
const addPerson=(m,x,z,hex,variant=0)=>{
 m.cylinder(x,0,z,.32,1.25,'#293b52',7);
 m.sphere(x,1.56,z,.43,.43,.43,variant===1?'#edcfac':'#f4d8be',5,8);
 m.cone(x,.9,z,.82,1.1,hex,8);
 m.box(x-.26,0,z,.34,.6,.4,'#253855');
 m.box(x+.26,0,z,.34,.6,.4,'#253855');
 m.sphere(x,2.13,z,.22,.17,.23,hex,4,6);
};
// Monumenti visibili da lontano: ogni regione ha una silhouette unica.
// La strada centrale rimane sgombra per non ostacolare la navigazione.
const biomeLandmarks=(m,zone,index)=>{
 const z=ADVENTURE_ZONES[index],c=z.color,x=z.center+4,d=-16.5;
 if(index===0){
  // Fontana di Piazza Alba, giardino fiorito e campanile.
  m.cylinder(x,0,d,3,.65,'#d2e5de',12);
  m.cylinder(x,.7,d,2.55,.4,'#7cc5cf',12);
  m.cylinder(x,1,d,.7,2.8,'#faf3d6',8);
  m.sphere(x,3.9,d,.86,.8,.86,'#bdf1d2',6,9);
  m.ring(x,.9,d,2.5,.25,'#e1f3e1');
  for(let i=0;i<12;i++){
   const a=i*Math.PI/6;
   m.sphere(x+Math.cos(a)*4,.3,d+Math.sin(a)*4,.35,.35,.35,['#fa91b6','#ffe7a2','#ffffff'][i%3],4,6);
  }
  m.cylinder(x-6,0,d-3,1.3,5.1,'#e7e2c9',8);
  m.cone(x-6,5.1,d-3,1.6,2.5,'#76a99d',8);
 }else if(index===1){
  // Forgia con canne fumarie e metallo incandescente.
  m.box(x,0,d,8,3.3,5.2,'#69515a');
  m.prismRoof(x,3.2,d,9,2.5,5.6,'#b84f39');
  for(let i=0;i<3;i++){
   m.cylinder(x-2.7+i*2.7,3,d-1,.6,4+i*.5,'#4f3c48',8);
   m.sphere(x-2.7+i*2.7,8+i*.5,d-1,1.3,.7,1.1,'#e7bba7',4,8);
  }
  m.cylinder(x,0,d+5.3,2,.4,'#262f3b',10);
  m.cylinder(x,.43,d+5.3,1.7,.15,'#d47746',10);
  m.diamond(x,1.7,d+5.3,.7,'#ffbe78');
 }else if(index===2){
  // Cascata in più salti, argini e ponticello in legno.
  for(let i=0;i<4;i++){
   m.box(x-4+i*2.3,0,d-4+i*.5,2.6,4.7+i*.6,2.8,'#738b96');
  }
  for(let i=0;i<3;i++){
   m.box(x-2.5+i*2,1.7,d-2.3,1.55,4.1,.22,'#69c6e8');
   m.box(x-2.5+i*2,.65,d+.1,2.1,.08,4.5,'#52aecf');
  }
  m.box(x,0,d+6,8,.22,2.4,'#d5bb93');
  for(const bx of [-3,-1,1,3]){
   m.cylinder(x+bx,0,d+7,.12,1.15,'#f1deb1',6);
  }
  m.box(x,1.1,d+7,8,.13,.15,'#f4e1b6');
 }else if(index===3){
  // Osservatorio dei sensori, cristalli e torri innevate.
  m.cylinder(x,0,d,3.8,3.4,'#819aa9',12);
  m.sphere(x,4.3,d,3.2,2.2,3.2,'#e8f5ff',7,12);
  m.cylinder(x,6,d,.18,2.9,'#fafcff',8);
  m.diamond(x,9,d,.85,'#9fe7ff');
  for(let i=0;i<9;i++){
   const a=i*2*Math.PI/9;
   m.cone(x+Math.cos(a)*6,0,d+Math.sin(a)*6,.6,1.4+i%3*1.2,'#d4f7ff',6);
  }
 }else if(index===4){
  // Anello astrale sospeso e padiglione della costellazione.
  m.cylinder(x,0,d,4,.75,'#42365f',12);
  m.ring(x,.9,d,3.1,.35,'#d3b1f3',24);
  m.ring(x,1.05,d,2,.2,'#78dce7',24);
  m.cylinder(x,.9,d,.2,6,'#e8c5fb',8);
  m.diamond(x,7.9,d,2.3,'#ebceff');
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4;
   const px=x+Math.cos(a)*5,pz=d+Math.sin(a)*5;
   m.cone(px,0,pz,.85,1.7+i%3,'#b8a1ed',6);
   m.diamond(px,2.6+i%3,pz,.5,i%2===0?'#8beaf6':'#f6b8ec');
  }
 }else{
  // Vulcano/forgia con colonne di basalto e un cratere arancione.
  for(let i=0;i<10;i++){
   const a=i*Math.PI/5,r=5+(i%2);
   m.cylinder(x+Math.cos(a)*r,0,d+Math.sin(a)*r,.8,3.5+(i%4)*1.6,'#514d60',7);
  }
  m.cylinder(x,.1,d,4.8,1.1,'#403848',12);
  m.cylinder(x,1.21,d,3.5,.3,'#dd673f',12);
  m.ring(x,1.5,d,3.1,.28,'#ffc27b',20);
  m.cone(x,1.2,d,2.5,3.1,'#8b414a',9);
  m.diamond(x,5.4,d,1.1,'#ffcb87');
 }
 // Sentiero decorativo verso il monumento, dalla strada principale.
 for(let j=0;j<8;j++){
  const depth=adventureRoadZ(x)-4.4-j*1.1;
  m.box(x,.07,depth,1.35,.1,.86,index===3?'#e4f6f7':'#c6b9a9');
 }
};
// Un segnale di navigazione fisico: faro colorato sopra il prossimo bersaglio.
const adventureObjectiveBeacon=(m,save)=>{
 const target=adventureNextObjective(save);
 if(!target||target.kind==='complete')return;
 const colorHex=target.kind==='gym'?'#ffd57f':target.kind==='champion'?'#f6cbff':
   target.kind==='rival'?'#ea9aff':'#8ffff0';
 m.cylinder(target.x,0,target.z,.06,7,'#daf5ea',5);
 m.diamond(target.x,7.9,target.z,.92,colorHex);
 m.ring(target.x,.18,target.z,1.45,.18,colorHex,14);
 m.ring(target.x,.2,target.z,2.15,.10,colorHex,18);
};
export function buildAdventureMesh(save){
 const m=new Mesh(),rng=rand(2241039);
 // Procedural world made of actual 3D faces. Long continuous area.
 for(let x=-8;x<230;x+=4)for(let z=-24;z<25;z+=4){
  const i=adventureZoneIndex(x),zone=ADVENTURE_ZONES[i],pal=palette[zone.biome];
  const shade=.93+rng()*.15;
  // La normale del terreno punta verso il cielo, anziché sottoterra.
  m.quad([x,0,z+4],[x+4,0,z+4],[x+4,0,z],[x,0,z],color(pal.ground,shade));
  if(rng()<.28&&Math.abs(z-adventureRoadZ(x+2))>6){
    const cx=x+1+rng()*2,cz=z+1+rng()*2;
    m.sphere(cx,.17,cz,.45+rng()*.45,.22,.4+rng()*.4,pal.leaf2,4,6);
  }
 }
 // Curving road, with bridge segments and raised paving.
 for(let x=-2;x<=217;x+=1.2){
  const pal=palette[ADVENTURE_ZONES[adventureZoneIndex(x)].biome];
  const z=adventureRoadZ(x);
  m.box(x,.035,z,1.45,.055,6.9,pal.road);
  // Cordonatura 3D, bordi scolpiti in rilievo e giunti ritmati.
  for(const side of [-1,1])
   m.box(x,.04,z+side*3.52,1.45,.14,.17,pal.rock);
  if(Math.floor(x*2)%7===0)
   m.box(x,.09,z,1.12,.05,.12,'#fffaf1');
 }
 // Silhouette di nuvole volumetriche distanti, diverse secondo il clima.
 for(let i=0;i<ADVENTURE_ZONES.length;i++){
   const cx=ADVENTURE_ZONES[i].center+2,kind=ADVENTURE_ZONES[i].biome;
   const cloud=kind==='volcanic'?'#d1a9a4':kind==='snow'?'#f8feff':'#f5fbff';
   for(const shift of [-12,12]){
     m.sphere(cx+shift,18+(i%3)*2,shift>0?-22:21,4.2,1.2,1.9,cloud,4,7);
     m.sphere(cx+shift+2,19.1+(i%3)*2,shift>0?-22:21,3.1,1.45,2.1,cloud,4,7);
   }
 }
 // Water channel / magma and grass decorations.
 for(let x=68;x<102;x+=3){
  m.box(x,.07,-18,3.1,.045,5,'#4aa9d6');
  m.box(x,.07,-17,3.1,.035,1,'#73d5ee');
 }
 for(let x=170;x<205;x+=4){
  m.box(x,.08,18,3.9,.09,5,'#dd694a');
  m.box(x,.13,18,2.3,.035,.6,'#ffb769');
 }
 // Bordi stradali e fiori minuti: più profondità al terreno, senza
 // bloccare i comandi né appesantire troppo la scena.
 for(let x=4;x<215;x+=2.3){
  const z=adventureRoadZ(x),zone=ADVENTURE_ZONES[adventureZoneIndex(x)];
  const pal=palette[zone.biome];
  if(Math.floor(x/2.3)%4===0){
   for(const side of [-1,1]){
    m.cylinder(x,.05,z+side*4.25,.08,.52,'#d7cfb3',6);
    m.sphere(x,.66,z+side*4.25,.22,.25,.22,zone.color,4,6);
   }
  }
  for(let j=0;j<3;j++){
    const seed=x*17+j*43,side=j%2===0?-1:1;
    const zz=z+side*(7.2+Math.abs(Math.sin(seed))*7);
    const xx=x+.7*Math.cos(seed*2);
    if(j===0&&Math.floor(x*10)%7===0)
      addToonFlower(m,xx,zz,
        ['#ffc3d5','#fce9a4','#d1fbff'][Math.floor(seed)%3],.85);
    else{
      m.cylinder(xx,.06,zz,.045,.25,pal.leaf2,5);
      m.sphere(xx,.36,zz,.19,.18,.19,
        ['#ffe5a9','#e5a4cf','#d2f5fa'][Math.floor(seed)%3],4,5);
    }
  }
 }
 for(let i=0;i<ADVENTURE_ZONES.length;i++){
  const z=ADVENTURE_ZONES[i],pal=palette[z.biome];
  biomeLandmarks(m,z,i);
  // Piani di profondità: collinette low-poly lontano dal percorso,
  // con colori diversi nei sei biomi.
  for(let hill=0;hill<5;hill++){
   const cx=z.range[0]+3+hill*7.0,depth=hill%2===0?-22:22;
   m.cone(cx,-.14,depth,2.0+hill%3,1.6+(hill%3)*.75,
     pal.rock,7);
   if(i===3)m.cone(cx,1.0,depth,1.0,1.4,'#f0feff',7);
   if(i===4)m.diamond(cx,2.8,depth,.45,z.color);
  }
  for(let t=0;t<95;t++){
   const x=z.range[0]+rng()*34,depth=-22+rng()*44;
   if(Math.abs(depth-adventureRoadZ(x))<5.8)continue;
   if(ADVENTURE_ENTITIES.some(e=>Math.hypot(e.x-x,e.z-depth)<4.7))continue;
   if(rng()<.82)addTree(m,x,depth,pal,.6+rng()*.7,z.biome);
   else m.sphere(x,.3,depth,.48+rng()*.8,.3+rng()*.55,.6,pal.rock,4,6);
  }
  // Signs, lampposts, banners on route transitions.
  const x=z.range[0]+.8;
  m.cylinder(x,0,adventureRoadZ(x)-4,.13,3,'#f3e9da',6);
  m.diamond(x,3.35,adventureRoadZ(x)-4,.65,z.color);
 }
 // Sei portali fisici: l'arco si illumina quando viene conquistato
 // l'Emblema della regione e il muro sigillato scompare.
 for(let i=0;i<ADVENTURE_ZONES.length;i++){
  const zone=ADVENTURE_ZONES[i],x=zone.range[1]-.6,z=adventureRoadZ(x);
  const open=(save?.badges||[]).includes(zone.id);
  for(const dz of [-4.85,4.85]){
   m.box(x,0,z+dz,1.3,5.5,1.3,'#d6e2ef');
   m.box(x,5.35,z+dz,1.8,.35,1.7,zone.color);
   m.diamond(x,6.25,z+dz,.47,zone.color);
  }
  m.box(x,5.55,z,1.15,.8,9.7,'#354962');
  m.box(x,6.4,z,1.15,.16,9.7,zone.color);
  if(!open){
    m.box(x,.05,z,.27,4.5,8.1,'#bc536a');
    m.diamond(x,3.2,z,1.3,'#ffca9d');
  }else m.diamond(x,3.25,z,.7,'#87f1c0');
 }
 for(const e of ADVENTURE_ENTITIES){
  if((['trainer','rival'].includes(e.kind)&&save?.defeated?.includes(e.id)))continue;
  if(e.kind==='secret'&&save?.secrets?.includes(e.id))continue;
  if(e.kind==='gym')addGym(m,e);
  else if(e.kind==='shop'||e.kind==='inn')addHouse(m,e,e.kind);
  else if(['trainer','npc','rival','quest'].includes(e.kind)){
   m.ring(e.x,.13,e.z,.67,.08,e.kind==='quest'?'#f7e49b':'#a1d6ee',12);
  }else if(e.kind==='wild'){
   const zone=ADVENTURE_ZONES[e.zone];
   m.ring(e.x,.1,e.z,1.05,.13,zone.color,12);
  }else if(e.kind==='secret'){
   m.cylinder(e.x,.03,e.z,.23,.35,'#3d6d79',7);
   m.diamond(e.x,.7,e.z,.45,ADVENTURE_ZONES[e.zone].color);
   m.ring(e.x,.12,e.z,.83,.08,'#fce8b8',14);
  }else if(e.kind==='chest'){
   if(save?.chests?.includes(e.id))continue;
   m.box(e.x,.07,e.z,1.1,.78,.8,'#b27744');
   m.box(e.x,.86,e.z,1.15,.24,.9,'#edc46f');
   m.box(e.x,.2,e.z+.42,.19,.85,.12,'#ffe3a0');
  }
 }
 // Lega: monolithic palace with glowing steps and six-color pillars.
 const c=ADVENTURE_CHAMPION;
 m.box(c.x,0,c.z,11,1,11,'#45546b');
 m.cylinder(c.x,1,c.z,5.2,8,'#dee5f1',12);
 m.cone(c.x,9,c.z,6.1,5.1,'#5b4d8d',12);
 for(let i=0;i<6;i++){
  const a=i*Math.PI/3,x=c.x+Math.cos(a)*7,z=c.z+Math.sin(a)*7;
  m.cylinder(x,0,z,.7,7,'#e1e7f2',9);
  m.diamond(x,8,z,1.3,ADVENTURE_ZONES[i].color);
 }
 m.cylinder(c.x,13,c.z,.22,3,'#f2e9b9');
 m.diamond(c.x,17,c.z,1.65,'#f7de88');
 addPerson(m,c.x,c.z+6,'#a477dd');
 adventureObjectiveBeacon(m,save);
 return new Float32Array(m.data);
}
// Toon shading eseguito sulla vera geometria 3D: tre bande di luce
// senza il gradiente piatto del precedente Lambert. Le facce mantengono
// i colori regionali; la luce calda e le ombre blu/viola danno forma ai volumi.
export const ADVENTURE_TOON_STYLE=Object.freeze({
 lightDirection:[-.45,.88,.32],bands:[.32,.57,.79],
 outlineThreshold:.17,outlineDarkness:.76
});
export const adventureToonLightBand=diffuse=>
 diffuse>=ADVENTURE_TOON_STYLE.bands[2]?1.2:
 diffuse>=ADVENTURE_TOON_STYLE.bands[1]?1.04:
 diffuse>=ADVENTURE_TOON_STYLE.bands[0]?.76:.57;
const vertexShader=`
attribute vec3 aPosition;
attribute vec3 aColor;
attribute vec3 aNormal;
uniform mat4 uProjectionView;
uniform mat4 uView;
uniform vec3 uCameraPosition;
varying vec3 vColor;
varying float vFog;
varying float vDiffuse;
varying float vRim;
void main(){
 vec4 p=uView*vec4(aPosition,1.0);
 gl_Position=uProjectionView*vec4(aPosition,1.0);
 vec3 normal=normalize(aNormal);
 vec3 sun=normalize(vec3(-0.45,0.88,0.32));
 vDiffuse=clamp(dot(normal,sun)*.5+.5,0.0,1.0);
 vec3 toEye=normalize(uCameraPosition-aPosition);
 vRim=pow(1.0-clamp(dot(normal,toEye),0.0,1.0),3.0);
 vColor=aColor;
 vFog=clamp(((-p.z)-38.0)/132.0,0.0,0.89);
}
`;
const fragmentShader=`
precision mediump float;
varying vec3 vColor;
varying float vFog;
varying float vDiffuse;
varying float vRim;
uniform vec3 uFogColor;
void main(){
 float band= vDiffuse>.79?1.20:(vDiffuse>.57?1.04:(vDiffuse>.32?.76:.57));
 // Silhouette cartoon: ombre fredde nette, riflessi caldi dipinti.
 vec3 shade=mix(vec3(.69,.75,1.02),vec3(1.06,1.015,.91),step(.57,vDiffuse));
 vec3 inked=vColor*shade*band;
 inked=mix(inked,vec3(.96,.93,.78),min(.14,vRim*.14));
 vec3 finalColor=mix(inked,uFogColor,vFog);
 gl_FragColor=vec4(clamp(finalColor,0.0,1.0),1.0);
}
`;
// Bordo d'inchiostro in post-process. Si disattiva automaticamente se
// la GPU non supporta i framebuffer: la campagna rimane giocabile.
const inkVertexShader=`
attribute vec2 aScreen;
varying vec2 vUv;
void main(){
 vUv=aScreen*.5+.5;
 gl_Position=vec4(aScreen,0.0,1.0);
}
`;
const inkFragmentShader=`
precision mediump float;
varying vec2 vUv;
uniform sampler2D uScene;
uniform vec2 uPixel;
void main(){
 vec3 base=texture2D(uScene,vUv).rgb;
 vec3 left=texture2D(uScene,vUv-vec2(uPixel.x,0.0)).rgb;
 vec3 right=texture2D(uScene,vUv+vec2(uPixel.x,0.0)).rgb;
 vec3 above=texture2D(uScene,vUv+vec2(0.0,uPixel.y)).rgb;
 vec3 below=texture2D(uScene,vUv-vec2(0.0,uPixel.y)).rgb;
 vec3 horizontal=abs(left-right);
 vec3 vertical=abs(above-below);
 float contrast=max(dot(horizontal,vec3(.299,.587,.114)),
                    dot(vertical,vec3(.299,.587,.114)));
 float chroma=max(length(horizontal),length(vertical))*.45;
 float edge=smoothstep(.17,.38,max(contrast,chroma));
 // Gamma delicata: colori saturi senza sovraesporre i volti e la neve.
 vec3 cartoon=pow(base,vec3(.94));
 cartoon=mix(cartoon,vec3(.055,.09,.17),edge*.76);
 gl_FragColor=vec4(cartoon,1.0);
}
`;
const makeShader=(gl,type,source)=>{
 const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
 if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader)||'Shader 3D non disponibile');
 return shader;
};
const makeProgram=(gl,vertex=vertexShader,fragment=fragmentShader)=>{
 const program=gl.createProgram();
 const vs=makeShader(gl,gl.VERTEX_SHADER,vertex);
 const fs=makeShader(gl,gl.FRAGMENT_SHADER,fragment);
 gl.attachShader(program,vs);gl.attachShader(program,fs);
 gl.linkProgram(program);
 gl.deleteShader(vs);gl.deleteShader(fs);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)||'Motore 3D non disponibile');
 return program;
};
const playerGeometry=(p,time,starter='sonic')=>{
 const m=new Mesh(),sway=Math.sin(time*9)*.13;
 const bob=Math.sin(time*9)*.045;
 // Shadow ground plane.
 m.sphere(p.x,.13,p.z,1.0,.08,.65,'#547367',4,8);
 // Boots, cloak, arms, head and scarf.
 m.box(p.x-.28,.05,p.z,.31,.75,.38,'#20344e');
 m.box(p.x+.28,.05,p.z,.31,.75,.38,'#20344e');
 m.cone(p.x,.62,p.z,.78,1.48,'#344d8f',8);
 m.box(p.x-.82,1.04+sway,p.z,.32,.92,.32,'#f4d4b5');
 m.box(p.x+.82,1.04-sway,p.z,.32,.92,.32,'#f4d4b5');
 m.sphere(p.x,2.25+bob,p.z,.48,.5,.48,'#ffd6b5',5,9);
 m.sphere(p.x,2.6+bob,p.z-.15,.5,.29,.52,'#3a334b',5,7);
 m.cone(p.x,2.62+bob,p.z-.05,.54,.71,'#536eb8',8);
 m.box(p.x,1.53+bob,p.z+.47,.8,.22,.23,'#ffd890');
 // Faccina e zaino a contrasto: il personaggio è riconoscibile da lontano.
 m.sphere(p.x-.2,2.3+bob,p.z+.42,.078,.09,.035,'#2b3549',4,6);
 m.sphere(p.x+.2,2.3+bob,p.z+.42,.078,.09,.035,'#2b3549',4,6);
 m.box(p.x,.88,p.z-.55,.68,1,.36,'#d7a46a');
 m.box(p.x,1.1,p.z-.77,.5,.23,.15,'#ffe7b0');
 // Volto e mantello chibi con due piccoli riflessi dipinti.
 m.sphere(p.x-.36,2.12+bob,p.z+.4,.105,.07,.05,'#ffabb2',4,6);
 m.sphere(p.x+.36,2.12+bob,p.z+.4,.105,.07,.05,'#ffabb2',4,6);
 m.diamond(p.x,1.2+bob,p.z+.63,.26,'#ffe4a1');
 m.cone(p.x-.3,.55,p.z-.24,.26,.53,'#567bd1',6);
 m.cone(p.x+.3,.55,p.z-.24,.26,.53,'#567bd1',6);
 // Ogni starter ha un compagno geometrico diverso, anziché il solito blob.
 const fx=p.x-2.1,fz=p.z-1.25;
 const y=.55+Math.sin(time*5.8)*.1;
 if(starter==='sonic'){
   m.sphere(fx,y+.12,fz,.7,.65,.7,'#3989da',6,10);
   for(let i=0;i<5;i++){
     const a=i*Math.PI*2/5;
     m.cone(fx+Math.cos(a)*.48,y+.2,fz+Math.sin(a)*.48,.39,.87,'#276bc4',6);
   }
   m.sphere(fx,y-.28,fz+.56,.43,.34,.26,'#e9ca9d',5,8);
   m.box(fx-.35,.1,fz+.25,.55,.22,.45,'#ed564e');
   m.box(fx+.35,.1,fz+.25,.55,.22,.45,'#ed564e');
 }else if(starter==='starbutterfly'){
   m.sphere(fx,y+.17,fz,.65,.68,.65,'#f4c5e4',6,10);
   m.cone(fx,y+.44,fz,.72,.77,'#edafef',9);
   m.sphere(fx,y-.17,fz+.53,.42,.34,.2,'#ffe5c8',5,8);
   m.diamond(fx,y+1.4,fz,.33,'#fdf0a7');
   m.sphere(fx-.48,y+.4,fz,.2,.22,.2,'#fcd8e8');
   m.sphere(fx+.48,y+.4,fz,.2,.22,.2,'#fcd8e8');
 }else{
   m.box(fx,y-.35,fz,1.55,1.2,1.26,'#e9c957');
   m.sphere(fx-.54,y+.63,fz,.27,.45,.26,'#edce66',5,7);
   m.sphere(fx+.54,y+.63,fz,.27,.45,.26,'#edce66',5,7);
   m.sphere(fx,y-.11,fz+.67,.42,.24,.20,'#f7da84',5,8);
 }
 m.sphere(fx-.24,y+.12,fz+.69,.095,.115,.06,'#1a2638',4,6);
 m.sphere(fx+.24,y+.12,fz+.69,.095,.115,.06,'#1a2638',4,6);
 // Piccoli bagliori orbitanti: effetto cartoon tridimensionale leggero.
 for(let i=0;i<3;i++){
  const phase=time*1.8+i*Math.PI*2/3;
  m.diamond(fx+Math.cos(phase)*1.05,y+1.15+Math.sin(phase*.7)*.2,
    fz+Math.sin(phase)*.95,.12,
    starter==='starbutterfly'?'#fff1b5':starter==='sonic'?'#a5efff':'#ffedc0');
 }
 return new Float32Array(m.data);
};
export function createAdventureWorldRenderer(canvas,save){
 const gl=canvas.getContext('webgl2',{antialias:true,alpha:false,powerPreference:'low-power'})||
  canvas.getContext('webgl',{antialias:true,alpha:false,powerPreference:'low-power'});
 if(!gl)return createAdventureFallbackRenderer(canvas,save);
 let program,worldBuffer,dynamicBuffer,worldLength,disposed=false;
 // Il pass di contorno è opzionale, per tablet/vecchie GPU. La scena 3D
 // toon resta funzionante anche se non si possono creare framebuffers.
 let ink=null,inkDisabled=false,inkWidth=0,inkHeight=0;
 try{
  program=makeProgram(gl);
  worldBuffer=gl.createBuffer();dynamicBuffer=gl.createBuffer();
  const mesh=buildAdventureMesh(save);worldLength=mesh.length/9;
  gl.bindBuffer(gl.ARRAY_BUFFER,worldBuffer);gl.bufferData(gl.ARRAY_BUFFER,mesh,gl.STATIC_DRAW);
  gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
  gl.disable(gl.CULL_FACE);
  gl.useProgram(program);
 }catch(error){console.error('Campagna 3D:',error);return createAdventureFallbackRenderer(canvas,save);}
 const loc={
  position:gl.getAttribLocation(program,'aPosition'),
  color:gl.getAttribLocation(program,'aColor'),
  normal:gl.getAttribLocation(program,'aNormal'),
  pv:gl.getUniformLocation(program,'uProjectionView'),
  view:gl.getUniformLocation(program,'uView'),
  eye:gl.getUniformLocation(program,'uCameraPosition'),
  fog:gl.getUniformLocation(program,'uFogColor')
 };
 const bind=buffer=>{
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  for(const [attr,offset] of [[loc.position,0],[loc.color,3],[loc.normal,6]]){
   if(attr<0)continue;
   gl.enableVertexAttribArray(attr);
   gl.vertexAttribPointer(attr,3,gl.FLOAT,false,36,offset*4);
  }
 };
 // Render to texture + 5-tap edge detection produce inked silhouettes.
 // Fragmente immediati (no CDN, no third-party shader library).
 try{
  const inkProgram=makeProgram(gl,inkVertexShader,inkFragmentShader);
  const inkBuffer=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,inkBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
  const texture=gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const depth=gl.createRenderbuffer();
  const framebuffer=gl.createFramebuffer();
  ink={program:inkProgram,buffer:inkBuffer,texture,depth,framebuffer,
   screen:gl.getAttribLocation(inkProgram,'aScreen'),
   scene:gl.getUniformLocation(inkProgram,'uScene'),
   pixel:gl.getUniformLocation(inkProgram,'uPixel')};
 }catch(error){
  console.warn('Campagna 3D: bordi cartoon non disponibili, uso toon shading senza postprocess.',error);
  inkDisabled=true;
 }
 const resizeInk=(w,h)=>{
  // Un limite di memoria evita crash di driver WebGL su schermi grandi.
  if(!ink||inkDisabled||w*h>3000000||
     w>gl.getParameter(gl.MAX_TEXTURE_SIZE)||h>gl.getParameter(gl.MAX_TEXTURE_SIZE))return false;
  if(inkWidth===w&&inkHeight===h)return true;
  try{
   gl.bindTexture(gl.TEXTURE_2D,ink.texture);
   gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
   gl.bindRenderbuffer(gl.RENDERBUFFER,ink.depth);
   gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT16,w,h);
   gl.bindFramebuffer(gl.FRAMEBUFFER,ink.framebuffer);
   gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,ink.texture,0);
   gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,ink.depth);
   const complete=gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE;
   gl.bindFramebuffer(gl.FRAMEBUFFER,null);
   if(!complete){inkDisabled=true;return false;}
   inkWidth=w;inkHeight=h;return true;
  }catch(error){
   gl.bindFramebuffer(gl.FRAMEBUFFER,null);
   console.warn('Campagna 3D: framebuffer cartoon non disponibile.',error);
   inkDisabled=true;return false;
  }
 };
 function render(p,t=0,starter='sonic'){
  if(disposed)return;
  const rect=canvas.getBoundingClientRect(),ratio=Math.min(
    window.matchMedia?.('(pointer: coarse)').matches?1.25:1.8,window.devicePixelRatio||1);
  const w=Math.max(2,Math.round(rect.width*ratio)),h=Math.max(2,Math.round(rect.height*ratio));
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
  const eye=[p.x-15,16,p.z+15],target=[p.x+7,1.5,p.z];
  const v=look(eye,target),proj=persp(1.02,w/h,.1,220);
  const paletteByZone={
    meadow:['#b9e8f0','#d6f7ec'],autumn:['#ffcfaa','#fff0d1'],
    water:['#a0e1f7','#c7f5f9'],snow:['#b9e1fc','#f4faff'],
    magic:['#d5b5fa','#eee0ff'],volcanic:['#eba39a','#ffd6b8']
  };
  const scene=ADVENTURE_ZONES[adventureZoneIndex(p.x)];
  const [sky,fog]=paletteByZone[scene.biome];
  const skyRgb=rgb(sky);
  const withInk=resizeInk(w,h);
  gl.bindFramebuffer(gl.FRAMEBUFFER,withInk?ink.framebuffer:null);
  gl.viewport(0,0,w,h);
  gl.enable(gl.DEPTH_TEST);
  gl.useProgram(program);
  gl.uniformMatrix4fv(loc.pv,false,new Float32Array(mul(proj,v)));
  gl.uniformMatrix4fv(loc.view,false,new Float32Array(v));
  gl.uniform3fv(loc.eye,new Float32Array(eye));
  gl.uniform3fv(loc.fog,new Float32Array(rgb(fog)));
  gl.clearColor(skyRgb[0],skyRgb[1],skyRgb[2],1);
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  bind(worldBuffer);gl.drawArrays(gl.TRIANGLES,0,worldLength);
  const dynamic=playerGeometry(p,t,starter);
  gl.bindBuffer(gl.ARRAY_BUFFER,dynamicBuffer);gl.bufferData(gl.ARRAY_BUFFER,dynamic,gl.DYNAMIC_DRAW);
  bind(dynamicBuffer);gl.drawArrays(gl.TRIANGLES,0,dynamic.length/9);
  if(withInk){
   gl.bindFramebuffer(gl.FRAMEBUFFER,null);
   gl.disable(gl.DEPTH_TEST);
   gl.useProgram(ink.program);
   gl.bindBuffer(gl.ARRAY_BUFFER,ink.buffer);
   gl.enableVertexAttribArray(ink.screen);
   gl.vertexAttribPointer(ink.screen,2,gl.FLOAT,false,0,0);
   gl.activeTexture(gl.TEXTURE0);
   gl.bindTexture(gl.TEXTURE_2D,ink.texture);
   gl.uniform1i(ink.scene,0);
   gl.uniform2f(ink.pixel,1/w,1/h);
   gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
   gl.disableVertexAttribArray(ink.screen);
   gl.enable(gl.DEPTH_TEST);
  }
 }
 return {render,dispose(){
  disposed=true;
  gl.deleteBuffer(worldBuffer);gl.deleteBuffer(dynamicBuffer);
  gl.deleteProgram(program);
  if(ink){
   gl.deleteBuffer(ink.buffer);gl.deleteTexture(ink.texture);
   gl.deleteRenderbuffer(ink.depth);gl.deleteFramebuffer(ink.framebuffer);
   gl.deleteProgram(ink.program);
  }
 }};
}
// Accessible 2D fallback for browsers/devices without WebGL. Movement, gyms,
// interactions and battles keep working; WebGL is the preferred 3D view.
function createAdventureFallbackRenderer(canvas,save){
 let context;try{context=canvas.getContext('2d');}catch{}
 return {render(p){
  if(!context)return;
  const w=canvas.clientWidth,h=canvas.clientHeight,r=Math.min(1.6,window.devicePixelRatio||1);
  canvas.width=Math.round(w*r);canvas.height=Math.round(h*r);
  context.setTransform(r,0,0,r,0,0);
  const z=ADVENTURE_ZONES[adventureZoneIndex(p.x)],pal=palette[z.biome];
  context.fillStyle=pal.ground;context.fillRect(0,0,w,h);
  // Isometric perspective: forward X gets smaller toward horizon.
  const point=(x,depth)=>{
   const dx=x-p.x,dz=depth-p.z;
   const scale=1/(1+Math.max(-10,dx)*.028);
   return [w*.5+dz*18*scale,h*.65-dx*12*scale,scale];
  };
  context.strokeStyle=pal.road;context.lineWidth=35;context.beginPath();
  for(let x=p.x-15;x<p.x+40;x+=1){
   const [sx,sy]=point(x,adventureRoadZ(x));
   if(x===p.x-15)context.moveTo(sx,sy);else context.lineTo(sx,sy);
  }
  context.stroke();
  for(const e of ADVENTURE_ENTITIES.filter(e=>Math.abs(e.x-p.x)<28).sort((a,b)=>b.x-a.x)){
   const [x,y,sc]=point(e.x,e.z);
   context.font=Math.max(12,28*sc)+'px sans-serif';context.textAlign='center';
   context.fillText({gym:'🏛️',trainer:'🧑',wild:'🐾',inn:'🏥',shop:'🏠',npc:'🧑‍🏫',chest:'🎁',champion:'🏆'}[e.kind],x,y);
  }
  context.textAlign='center';context.font='39px sans-serif';context.fillText('🧑‍🚀',w*.5,h*.7);
 },dispose(){}};
}
