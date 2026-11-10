// Le tre anime soggiogate da Echomax combattono nella missione 36,
// utilizzando le mosse originali di Goku, Naruto e Luffy.
// Non sono evocazioni temporanee della passiva Legione dei Caduti.
export const ECHO_FINAL_SOUL_VERSION=1;
export const ECHO_FINAL_SOUL_IDS=Object.freeze(['goku','naruto','luffy']);
export const ECHO_FINAL_ENEMY_IDS=Object.freeze(['echomax',...ECHO_FINAL_SOUL_IDS]);
const BALANCE=Object.freeze({
 goku:{hp:340,atk:148,def:105,spd:121},
 naruto:{hp:365,atk:139,def:110,spd:126},
 luffy:{hp:395,atk:141,def:116,spd:110}
});
const DISPLAY=Object.freeze({
 goku:'Anima di Goku',naruto:'Anima di Naruto',luffy:'Anima di Luffy'
});
const GLOW='sepia(.48) hue-rotate(240deg) saturate(2.2) drop-shadow(0 0 22px #b56eff)';
export const ECHO_SOUL_DIALOGUE_PORTRAITS=Object.freeze({
 'Anima di Goku':'goku','Anima di Naruto':'naruto','Anima di Luffy':'luffy'
});
export const echoSoulPortraitId=label=>ECHO_SOUL_DIALOGUE_PORTRAITS[label]||null;
export function isEchoFinalSoulId(id){return ECHO_FINAL_SOUL_IDS.includes(id);}
export function createEchoFinalSoul(base){
 if(!base||!isEchoFinalSoulId(base.id))throw new Error('Anima di Echomax sconosciuta.');
 const stats=BALANCE[base.id];
 return {...base,name:DISPLAY[base.id],hp:stats.hp,maxHp:stats.hp,
  atk:stats.atk,baseAtk:stats.atk,def:stats.def,baseDef:stats.def,
  spd:stats.spd,baseSpd:stats.spd,imageFilter:GLOW,
  // Marcatura persistita nei checkpoint; gli aiutanti morti non rinascono.
  isEchoSoulGuardian:true,isSummonOnly:false,isEchoCopy:false,
  soulMasterId:'echomax',echoSoulPermanentDefeat:true};
}
// Il boss è l'obiettivo del raid; aiutanti e copie non prolungano la battaglia
// dopo il KO di Echomax, e la loro sconfitta non fa terminare il raid.
export function echoFinalBossAlive(enemies=[]){
 return enemies.some(e=>e?.id==='echomax'&&Number(e.hp)>0);
}
export function echoFinalVictory({isEchoFinalBattle=false,heroes=[],enemies=[]}={}){
 if(!isEchoFinalBattle)return null;
 const heroesAlive=heroes.some(c=>c&&c.hp>0&&!c.isSummonOnly);
 const bossAlive=echoFinalBossAlive(enemies);
 if(!heroesAlive&&!bossAlive)return 'draw';
 if(!heroesAlive)return 'boss';
 if(!bossAlive)return 'heroes';
 return null;
}
