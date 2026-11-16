// Renderer tridimensionale autonomo: mesh reali, prospettiva, depth test,
// luci, nebbia e camera inseguitrice. Nessuna libreria esterna/CDN.
import {ADVENTURE_ENTITIES,ADVENTURE_ZONES,adventureRoadZ,adventureZoneIndex} from '../../systems/adventureCampaign.js';

const palette={
 meadow:{ground:'#498e67',leaf:'#52b984',leaf2:'#2e966b',trunk:'#715845',rock:'#8ca4a1',road:'#ead5a1'},
 autumn:{ground:'#aa7d52',leaf:'#f7ae57',leaf2:'#c9644a',trunk:'#775041',rock:'#9b7c6c',road:'#e8c79e'},
 water:{ground:'#548da0',leaf:'#4bba9f',leaf2:'#277f9b',trunk:'#5e6d73',rock:'#94b9c7',road:'#c9dad2'},
 snow:{ground:'#aecbdc',leaf:'#a9e9eb',leaf2:'#6fa5c1',trunk:'#697f96',rock:'#d6e8ec',road:'#e6edef'},
 magic:{ground:'#7f6baa',leaf:'#ce9ff1',leaf2:'#5fb8d5',trunk:'#675581',rock:'#ac9be0',road:'#e3c9f7'},
 volcanic:{ground:'#78636b',leaf:'#a66376',leaf2:'#d86a62',trunk:'#534451',rock:'#514957',road:'#ac9a92'}
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
  this.quad(a,b,b1,a1,c);this.quad(c1,d1,d2,c2,c);
  this.quad(b,c1,c2,b1,dark);this.quad(d1,a,a1,d2,dark);
  this.quad(a1,b1,c2,d2,light);
 }
 prismRoof(x,y,z,w,h,d,hex){
  const a=[x-w/2,y,z-d/2],b=[x+w/2,y,z-d/2],c=[x+w/2,y,z+d/2],e=[x-w/2,y,z+d/2];
  const roof1=[x,y+h,z-d/2],roof2=[x,y+h,z+d/2];
  this.quad(a,b,roof1,roof1,color(hex,.9));
  this.quad(e,roof2,roof1,a,color(hex,1.06));
  this.quad(b,c,roof2,roof1,color(hex,.85));
  this.triangle(a,roof1,e,color(hex,.98));
  this.triangle(c,roof2,b,color(hex,.98));
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
 diamond(x,y,z,r,hex){
  for(let i=0;i<6;i++){
   const a=i*Math.PI/3,b=(i+1)*Math.PI/3;
   const v1=[x+Math.cos(a)*r,y,z+Math.sin(a)*r],v2=[x+Math.cos(b)*r,y,z+Math.sin(b)*r];
   this.triangle([x,y+r*1.8,z],v1,v2,color(hex,1.12));
   this.triangle([x,y-r*1.6,z],v2,v1,color(hex,.82));
  }
 }
}
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
  m.sphere(x,h*size*.62+1.2*size,z,1.4*size,1.1*size,1.3*size,pal.leaf,5,8);
  m.sphere(x+.65*size,h*size*.62+.9*size,z+.3*size,1.08*size,.85*size,.9*size,pal.leaf2,5,7);
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
export function buildAdventureMesh(save){
 const m=new Mesh(),rng=rand(2241039);
 // Procedural world made of actual 3D faces. Long continuous area.
 for(let x=-8;x<230;x+=4)for(let z=-24;z<25;z+=4){
  const i=adventureZoneIndex(x),zone=ADVENTURE_ZONES[i],pal=palette[zone.biome];
  const shade=.93+rng()*.15;
  m.quad([x,0,z],[x+4,0,z],[x+4,0,z+4],[x,0,z+4],color(pal.ground,shade));
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
  if(Math.floor(x*2)%7===0)m.box(x,.09,z,1.12,.05,.12,'#fbf1d7');
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
 for(let i=0;i<ADVENTURE_ZONES.length;i++){
  const z=ADVENTURE_ZONES[i],pal=palette[z.biome];
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
 for(const e of ADVENTURE_ENTITIES){
  if(e.kind==='gym')addGym(m,e);
  else if(e.kind==='shop'||e.kind==='inn')addHouse(m,e,e.kind);
  else if(e.kind==='trainer'||e.kind==='npc')addPerson(m,e.x,e.z,e.kind==='npc'?'#7f8fef':'#dd8c5d',e.zone%2);
  else if(e.kind==='wild'){
   const p=ADVENTURE_ZONES[e.zone],c=p.color;
   m.sphere(e.x,.75,e.z,.72,.68,.72,c,5,7);
   m.cone(e.x-.4,1.1,e.z,.32,.66,c,5);
   m.cone(e.x+.4,1.1,e.z,.32,.66,c,5);
   m.sphere(e.x-.22,.86,e.z+.55,.085,.09,.065,'#222438',4,6);
   m.sphere(e.x+.22,.86,e.z+.55,.085,.09,.065,'#222438',4,6);
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
 return new Float32Array(m.data);
}
const vertexShader=`
attribute vec3 aPosition;
attribute vec3 aColor;
attribute vec3 aNormal;
uniform mat4 uProjectionView;
uniform mat4 uView;
varying vec3 vColor;
varying float vFog;
void main(){
 vec4 p=uView*vec4(aPosition,1.0);
 gl_Position=uProjectionView*vec4(aPosition,1.0);
 float light=clamp(dot(normalize(aNormal),normalize(vec3(-0.45,0.92,0.36)))*0.34+0.74,0.42,1.2);
 vColor=aColor*light;
 vFog=clamp(((-p.z)-31.0)/123.0,0.0,0.95);
}
`;
const fragmentShader=`
precision mediump float;
varying vec3 vColor;
varying float vFog;
void main(){
 vec3 color=mix(vColor,vec3(0.69,0.82,0.89),vFog);
 gl_FragColor=vec4(color,1.0);
}
`;
const makeShader=(gl,type,source)=>{
 const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
 if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader)||'Shader 3D non disponibile');
 return shader;
};
const makeProgram=(gl)=>{
 const program=gl.createProgram();
 gl.attachShader(program,makeShader(gl,gl.VERTEX_SHADER,vertexShader));
 gl.attachShader(program,makeShader(gl,gl.FRAGMENT_SHADER,fragmentShader));
 gl.linkProgram(program);
 if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program)||'Motore 3D non disponibile');
 return program;
};
const playerGeometry=(p,time,starterColor='#ffd890')=>{
 const m=new Mesh(),sway=Math.sin(time*9)*.13;
 // Shadow ground plane.
 m.sphere(p.x,.13,p.z,1.0,.08,.65,'#547367',4,8);
 // Boots, cloak, arms, head and scarf.
 m.box(p.x-.28,.05,p.z,.31,.75,.38,'#20344e');
 m.box(p.x+.28,.05,p.z,.31,.75,.38,'#20344e');
 m.cone(p.x,.62,p.z,.78,1.48,'#344d8f',8);
 m.box(p.x-.82,1.04+sway,p.z,.32,.92,.32,'#f4d4b5');
 m.box(p.x+.82,1.04-sway,p.z,.32,.92,.32,'#f4d4b5');
 m.sphere(p.x,2.25,p.z,.48,.5,.48,'#ffd6b5',5,9);
 m.sphere(p.x,2.6,p.z-.15,.5,.29,.52,'#3a334b',5,7);
 m.cone(p.x,2.62,p.z-.05,.54,.71,'#536eb8',8);
 m.box(p.x,1.53,p.z+.47,.8,.22,.23,'#ffd890');
 // Starter companion follows behind the player.
 const fx=p.x-2.1,fz=p.z-1.25;
 m.sphere(fx,.6+Math.sin(time*6)*.12,fz,.72,.58,.72,starterColor,6,9);
 m.cone(fx-.42,1.08,fz,.27,.6,starterColor,5);
 m.cone(fx+.42,1.08,fz,.27,.6,starterColor,5);
 m.sphere(fx-.22,.68,fz+.62,.09,.1,.06,'#1a2638',4,6);
 m.sphere(fx+.22,.68,fz+.62,.09,.1,.06,'#1a2638',4,6);
 return new Float32Array(m.data);
};
export function createAdventureWorldRenderer(canvas,save){
 const gl=canvas.getContext('webgl2',{antialias:true,alpha:false,powerPreference:'low-power'})||
  canvas.getContext('webgl',{antialias:true,alpha:false,powerPreference:'low-power'});
 if(!gl)return createAdventureFallbackRenderer(canvas,save);
 let program,worldBuffer,dynamicBuffer,worldLength,disposed=false;
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
  view:gl.getUniformLocation(program,'uView')
 };
 const bind=buffer=>{
  gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
  for(const [attr,offset] of [[loc.position,0],[loc.color,3],[loc.normal,6]]){
   if(attr<0)continue;
   gl.enableVertexAttribArray(attr);
   gl.vertexAttribPointer(attr,3,gl.FLOAT,false,36,offset*4);
  }
 };
 function render(p,t=0,starter='sonic'){
  if(disposed)return;
  const rect=canvas.getBoundingClientRect(),ratio=Math.min(1.6,window.devicePixelRatio||1);
  const w=Math.max(2,Math.round(rect.width*ratio)),h=Math.max(2,Math.round(rect.height*ratio));
  if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
  const eye=[p.x-15,16,p.z+15],target=[p.x+7,1.5,p.z];
  const v=look(eye,target),proj=persp(1.02,w/h,.1,220);
  gl.useProgram(program);
  gl.uniformMatrix4fv(loc.pv,false,new Float32Array(mul(proj,v)));
  gl.uniformMatrix4fv(loc.view,false,new Float32Array(v));
  gl.clearColor(.69,.82,.89,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  bind(worldBuffer);gl.drawArrays(gl.TRIANGLES,0,worldLength);
  const companionColor=starter==='jake'?'#efd46e':starter==='starbutterfly'?'#e8a9ee':'#84caff';
  const dynamic=playerGeometry(p,t,companionColor);
  gl.bindBuffer(gl.ARRAY_BUFFER,dynamicBuffer);gl.bufferData(gl.ARRAY_BUFFER,dynamic,gl.DYNAMIC_DRAW);
  bind(dynamicBuffer);gl.drawArrays(gl.TRIANGLES,0,dynamic.length/9);
 }
 return {render,dispose(){
  disposed=true;gl.deleteBuffer(worldBuffer);gl.deleteBuffer(dynamicBuffer);
  gl.deleteProgram(program);
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
