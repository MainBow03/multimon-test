import {supportTeamPlayers} from './supportTargeting.js';

// Il Concerto Universale cura una sola volta per mossa (anche se AoE).
// Nessuna rianimazione, nessuna cura alle riserve o agli avversari.
// In multipla e in Roguelike co-op supporta tutti i giocatori alleati.
export function healHyperMikuConcertAllies(attacker,move,owner,teams,field,state,events,
  activePlayers=Object.keys(teams||{})){
  if(attacker?.id!=='miku'||!attacker.isHyper||attacker.hp<=0||
     move?.name!=='Concerto Universale'||move.concertTeamHeal<=0)return 0;
  const allyPlayers=supportTeamPlayers({...state,teams},owner,activePlayers);
  let total=0;
  for(const player of allyPlayers){
    for(const idx of (field?.[player]||[])){
      const char=teams?.[player]?.[idx];
      if(!char||char.hp<=0||char.hp>=char.maxHp)continue;
      const amount=Math.min(char.maxHp-char.hp,
        Math.max(1,Math.floor(char.maxHp*move.concertTeamHeal)));
      char.hp+=amount;
      total+=amount;
      events.push({type:'damage',targetPlayer:player,targetIdx:idx,newHp:char.hp,
        text:'🎶 '+attacker.name+' usa '+move.name+': '+char.name+
          ' recupera '+amount+' PS!'});
    }
  }
  return total;
}
