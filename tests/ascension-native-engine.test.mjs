import test from 'node:test';
import assert from 'node:assert/strict';
import {CHARACTERS} from '../src/data/characters.js';
import {ascensionNativeFighter,ascensionNativeTurn,ascensionNativeMoveAction}
 from '../src/systems/ascensionNativeBattle.js';
const fighter=(id,level=5)=>{
 const c=CHARACTERS.find(c=>c.id===id);
 const hp=Math.round((c.maxHp||c.hp)*(.7+.04*(level-1)));
 return ascensionNativeFighter({id,level,hp},CHARACTERS);
};
test('Il Colosseo chiama davvero calculateTurnImpl: crea gli stessi eventi e le stesse conseguenze',()=>{
 const a=fighter('lucy'),b=fighter('sonic');
 const i=a.moves.findIndex(m=>m.power>0);
 const j=b.moves.findIndex(m=>m.power>0);
 const result=ascensionNativeTurn({characters:CHARACTERS,teamOne:[a],teamTwo:[b],
  fieldOne:[0],fieldTwo:[0],actionsOne:{0:ascensionNativeMoveAction(i)},
  actionsTwo:{0:ascensionNativeMoveAction(j,'p1',0)}});
 assert.ok(Array.isArray(result.events)&&result.events.length,'Il motore nativo produce eventi');
 assert.ok(result.log.some(x=>x.includes('usa')),'Il motore nativo mostra le mosse');
 assert.ok(result.teams.p1[0].hp<=a.hp && result.teams.p2[0].hp<=b.hp);
 assert.ok(result.startTeams?.p1?.[0]);
});
test('Il Colosseo conserva i PP, gli status e le statistiche tra turni',()=>{
 const a=fighter('sovranoaurelion'),b=fighter('sonic');
 a.statuses=[{type:'Scottato',turns:3}];a.atk=Math.round(a.atk*1.3);
 a.moves[2].remainingUses=2;
 const keep=ascensionNativeFighter({id:a.id,level:a.level,hp:a.hp,battleState:a},CHARACTERS);
 assert.equal(keep.moves[2].remainingUses,2);
 assert.equal(keep.atk,a.atk);
 assert.equal(keep.statuses[0].type,'Scottato');
});
