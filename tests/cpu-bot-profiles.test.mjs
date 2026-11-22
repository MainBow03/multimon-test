import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initialGameState} from '../src/systems/gameState.js';
import {handleAddBotImpl,handleVsCpuStartImpl} from '../src/systems/multiplayerSystem.js';
import {
 CPU_BOT_PROFILES,cpuBotDisplayName,cpuBotAvatarUrl,cpuBotByName,selectCpuBotProfile
} from '../src/data/cpuBotProfiles.js';

test('Solo i dieci bot cartoon approvati: 4 maschi, 4 femmine e 2 non-binary',()=>{
 const profiles=CPU_BOT_PROFILES;
 assert.equal(profiles.length,10);
 assert.deepEqual(profiles.map(x=>x.id),
  ['nilo','brio','elio','rook','luma','mirea','dalia','vela','sol','kiri']);
 assert.equal(profiles.filter(x=>x.gender==='male').length,4);
 assert.equal(profiles.filter(x=>x.gender==='female').length,4);
 assert.equal(profiles.filter(x=>x.gender==='nonbinary').length,2);
 assert.equal(new Set(profiles.map(x=>x.name)).size,10);
});
test('Dieci avatar WEBP locali reali, non link DiceBear o emoji',()=>{
 for(const profile of CPU_BOT_PROFILES){
  const bytes=readFileSync(new URL('../public/cpu-bots/'+profile.id+'.webp',import.meta.url));
  assert.ok(bytes.length>5000,'Ritratto mancante o vuoto: '+profile.name);
  assert.equal(bytes.toString('ascii',0,4),'RIFF');
  assert.equal(bytes.toString('ascii',8,12),'WEBP');
  assert.ok(cpuBotAvatarUrl(profile).endsWith('/cpu-bots/'+profile.id+'.webp'));
  assert.equal(cpuBotByName(cpuBotDisplayName(profile)),profile);
 }
});
test('Aggiungendo otto bot nella stessa lobby assegna nomi e ritratti diversi',()=>{
 const room=initialGameState();
 room.players.p1='Allenatore umano';
 for(let i=2;i<=8;i++){
  const side='p'+i;
  const previous=new Set(Object.values(room.players).filter(Boolean));
  let patch;
  handleAddBotImpl({gameState:room,updateState:value=>{patch=value;}},side);
  assert.ok(patch);
  const name=patch['players.'+side];
  assert.match(name,/^CPU (Nilo|Brio|Elio|Rook|Luma|Mirea|Dalia|Vela|Sol|Kiri)$/);
  assert.ok(!previous.has(name),'Nessun CPU deve ripetersi');
  assert.ok(patch['playerAvatars.'+side].endsWith('/cpu-bots/'+name.slice(4).toLowerCase()+'.webp'));
  assert.equal(patch['isBot.'+side],true);
  for(const [key,value] of Object.entries(patch)){
   const [prop,slot]=key.split('.');
   room[prop][slot]=value;
  }
 }
 assert.equal(new Set(Object.values(room.players).filter(Boolean)).size,8);
});
test('Avvio singolo VS CPU usa un nome e il ritratto della stessa serie',()=>{
 let game=null,role=null,mode=null;
 handleVsCpuStartImpl({
  initialGameState,playerName:'Tester',playerTitle:'',playerAvatarUrl:'',
  getPlayerData:()=>({inventory:{},unlockedChars:[],strengthUpgrades:{}}),
  setGameState:s=>game=s,setPlayerRole:r=>role=r,setAppMode:m=>mode=m
 });
 assert.ok(game);
 assert.ok(cpuBotByName(game.players.p2));
 assert.equal(game.playerAvatars.p2,cpuBotAvatarUrl(cpuBotByName(game.players.p2)));
 assert.equal(game.isBot.p2,true);
 assert.equal(role,'p1');assert.equal(mode,'local_room');
});
test('La selezione salta i nomi già usati e resta nei dieci profili',()=>{
 const used={players:{p1:'CPU Nilo',p2:'CPU Brio'}};
 for(const random of [0,.1,.4,.9,1]){
  const profile=selectCpuBotProfile(used,()=>random);
  assert.ok(profile.id!=='nilo'&&profile.id!=='brio');
 }
});
