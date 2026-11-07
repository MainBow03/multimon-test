import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ULTIMON_REWARDS,ultimonRewardForPlace,claimUltimonPrize}
  from '../src/systems/ultimonRewards.js';
import {updateLocalStatsImpl} from '../src/systems/profileSystem.js';
import {createUltimonShowcase,ultimonLeaderboard} from '../src/systems/ultimonSystem.js';

const expect={
  4:[150,75,40,25],
  5:[175,80,60,40,25],
  6:[200,90,80,75,60,40],
  7:[215,100,95,80,70,60,40],
  8:[250,140,110,100,85,80,70,55]
};
test('Ultimon: premi esatti per tutti i piazzamenti da 4 a 8 partecipanti',()=>{
  for(const [n,amounts] of Object.entries(expect)){
    assert.deepEqual(ULTIMON_REWARDS[n],amounts);
    for(let place=1;place<=Number(n);place++)
      assert.equal(ultimonRewardForPlace(Number(n),place),amounts[place-1],
        n+' giocatori, posto '+place);
  }
  assert.equal(ultimonRewardForPlace(3,1),0);
  assert.equal(ultimonRewardForPlace(9,1),0);
  assert.equal(ultimonRewardForPlace(4,0),0);
  assert.equal(ultimonRewardForPlace(8,9),0);
  assert.equal(ultimonRewardForPlace(6,2.5),0);
});

test('Le monete sono aggiunte una sola volta per partita e giocatore',()=>{
 const profile={coins:200,ultimonClaimedPrizes:[]};
 const claim={runId:'ultimon-test-abcd1234',role:'p1',participants:8,placement:1};
 const first=claimUltimonPrize(profile,claim);
 assert.equal(first.ok,true);
 assert.equal(first.coins,250);
 assert.equal(first.profile.coins,450);
 assert.equal(profile.coins,200,'La funzione non muta il profilo originale');
 const repeated=claimUltimonPrize(first.profile,claim);
 assert.equal(repeated.ok,false);
 assert.equal(repeated.coins,0);
 assert.equal(repeated.profile.coins,450);
 const next=claimUltimonPrize(first.profile,{...claim,runId:'ultimon-test-abcd1235',placement:8});
 assert.equal(next.profile.coins,505);
 assert.equal(next.profile.ultimonClaimedPrizes.length,2);
 assert.equal(claimUltimonPrize(profile,{...claim,placement:9}).ok,false);
 assert.equal(claimUltimonPrize(profile,{...claim,runId:''}).ok,false);
 assert.equal(claimUltimonPrize(profile,{...claim,role:'spectator'}).ok,false);
});

test('Il profilo salva saldo e ricevuta in una singola operazione e non duplica dopo reload',()=>{
 const original=globalThis.localStorage;
 const store=new Map();
 globalThis.localStorage={
  getItem:key=>store.get(key)||null,
  setItem:(key,value)=>store.set(key,String(value))
 };
 try{
  const key='multiverse_rpg_global_profile';
  const initial={coins:20,matches:0,wins:0,playtime:0,chars:{},moves:{},
    inventory:{},unlockedChars:[]};
  store.set(key,JSON.stringify(initial));
  const data={getPlayerData:()=>JSON.parse(store.get(key))};
  const command={ultimonPrize:{runId:'ultimon-abcdef12-ghijklm',role:'p3',participants:6,placement:3}};
  const first=updateLocalStatsImpl(data,command);
  assert.equal(first.ok,true);
  assert.equal(first.coins,80);
  assert.equal(JSON.parse(store.get(key)).coins,100);
  const duplicate=updateLocalStatsImpl(data,command);
  assert.equal(duplicate.ok,false);
  assert.equal(JSON.parse(store.get(key)).coins,100);
  const another=updateLocalStatsImpl(data,{ultimonPrize:{...command.ultimonPrize,
    runId:'ultimon-abcdef12-other12',placement:6}});
  assert.equal(another.ok,true);
  assert.equal(JSON.parse(store.get(key)).coins,140);
 }finally{
  if(original===undefined)delete globalThis.localStorage;
  else globalThis.localStorage=original;
 }
});

test('Le classifica e la schermata finale mostrano lo stesso premio, senza bonus aggiuntivi',()=>{
  const initial={gameMode:'ultimon',status:'drafting',
    settings:{maxPlayers:4,teamSize:1},
    players:{p1:'A',p2:'B',p3:'C',p4:'D'},
    isBot:{p1:false,p2:true,p3:true,p4:true},
    draft:Object.fromEntries(['p1','p2','p3','p4'].map(p=>[p,[{
      id:'hero',name:'Eroe',hp:100,maxHp:100,atk:80,def:70,spd:60,
      types:['Fuoco'],moves:[{name:'Lanciafiamme',power:60,type:'Fuoco'}]
    }]]))
  };
  const patch=createUltimonShowcase(initial);
  const room={...initial,...patch,status:'ultimon_final'};
  room.ultimon.champion='p2';
  room.ultimon.eliminated=['p1','p3','p4'];
  const rank=ultimonLeaderboard(room);
  assert.equal(rank.length,4);
  assert.equal(rank[0].role,'p2');
  assert.deepEqual(rank.map((_,i)=>ultimonRewardForPlace(rank.length,i+1)),expect[4]);
  assert.match(patch.ultimon.runId,/^ultimon-[a-z0-9-]{8,90}$/);
  const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
  const view=readFileSync(new URL('../src/screens/battle/UltimonView.jsx',import.meta.url),'utf8');
  assert.match(app,/status!=='ultimon_final'/);
  assert.match(app,/gameState\.isBot\?\.\[role\]/);
  assert.match(app,/gameState\.playerUids\?\.\[role\]!==user\.uid/);
  assert.match(app,/ultimonPrize:\{/);
  assert.match(view,/ultimonRewardForPlace\(standings\.length,i\+1\)/);
  assert.match(view,/prizes\[i\]/);
});
