// Regalo retroattivo: cinque chiavi per chi ha già disputato una partita.
// Il marcatore è conservato nel profilo (e quindi nel salvataggio cloud):
// aprire il gioco, cambiare pagina o sincronizzare non duplica il regalo.
export const MULTIMON_WELCOME_KEYS=5;
export const MULTIMON_KEYS_GIFT_MARKER='multimonWelcomeKeysV1';

export function multimonKeyBalance(profile){
 const n=Number(profile?.multimonKeys);
 return Number.isFinite(n)&&n>0?Math.floor(n):0;
}
export function hasPlayedMultimon(profile){
 if(!profile)return false;
 // I salvataggi più vecchi possono non avere un contatore partite ma
 // conservare vittorie/uso dei personaggi: contano come prova storica.
 const positive=n=>Number.isFinite(Number(n))&&Number(n)>0;
 return positive(profile.matches)||positive(profile.wins)||
   Object.values(profile.chars||{}).some(positive)||
   positive(profile.maxSurvivalRound);
}
export function grantMultimonWelcomeKeys(profile){
 if(!profile||profile[MULTIMON_KEYS_GIFT_MARKER]===true||!hasPlayedMultimon(profile))
  return {profile,changed:false,granted:0};
 const balance=multimonKeyBalance(profile);
 return {changed:true,granted:MULTIMON_WELCOME_KEYS,
  profile:{...profile,
   [MULTIMON_KEYS_GIFT_MARKER]:true,
   multimonKeys:balance+MULTIMON_WELCOME_KEYS}};
}

export function redeemMultimonKey(profile,characterId,characters){
 const list=Array.isArray(characters)?characters:[];
 const character=list.find(c=>c.id===characterId);
 // Gli stessi personaggi acquistabili con monete sono disponibili
 // con una chiave. Fusioni, evocate e sblocchi esclusivi non sono venduti.
 if(!character||!Number.isFinite(Number(character.price))||Number(character.price)<=0||
    character.isSummonOnly||character.isSecretUnlock)
  return {ok:false,reason:'Questo Multimon non è acquistabile nel negozio.'};
 if((profile?.unlockedChars||[]).includes(characterId))
  return {ok:false,reason:'Possiedi già questo Multimon.'};
 const balance=multimonKeyBalance(profile);
 if(balance<1)return {ok:false,reason:'Non hai Chiavi Multimon disponibili.'};
 return {ok:true,character,
  profile:{...profile,
   multimonKeys:balance-1,
   unlockedChars:[...(profile?.unlockedChars||[]),characterId]}};
}
