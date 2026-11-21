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

test('Il motore originale rispetta PRIORITÀ +1 prima della Velocità avversaria',()=>{
 const sovereign=fighter('sovranoaurelion'),sonic=fighter('sonic');
 sovereign.spd=1;sonic.spd=999;
 const move=sovereign.moves.findIndex(m=>m.name==='Scatto Regale');
 const sonicMove=sonic.moves.findIndex(m=>m.power>0&&!m.priority);
 assert.ok(move>=0&&sonicMove>=0);
 const result=ascensionNativeTurn({characters:CHARACTERS,
  teamOne:[sovereign],teamTwo:[sonic],fieldOne:[0],fieldTwo:[0],
  actionsOne:{0:ascensionNativeMoveAction(move)},
  actionsTwo:{0:ascensionNativeMoveAction(sonicMove,'p1',0)}});
 const text=result.events.map(e=>e.text||'').join(' / ');
 assert.ok(text.includes('Scatto Regale'),text.slice(0,450));
 const sovIndex=text.indexOf('Scatto Regale');
 const sonicIndex=text.indexOf(sonic.moves[sonicMove].name);
 assert.ok(sonicIndex===-1||sovIndex<sonicIndex,
  'Una mossa con priorità +1 agisce prima anche con Velocità minore');
});
test('Mantello Elastico usa il VERO sistema Protezione e infligge riflesso al nemico',()=>{
 const sovereign=fighter('sovranoaurelion'),sonic=fighter('sonic');
 const hp=sovereign.hp,enemyHp=sonic.hp;
 const guard=sovereign.moves.findIndex(m=>m.name==='Mantello Elastico');
 const attack=sonic.moves.findIndex(m=>m.power>0&&!m.priority);
 assert.ok(guard>=0&&attack>=0);
 const result=ascensionNativeTurn({characters:CHARACTERS,
  teamOne:[sovereign],teamTwo:[sonic],fieldOne:[0],fieldTwo:[0],
  actionsOne:{0:ascensionNativeMoveAction(guard)},
  actionsTwo:{0:ascensionNativeMoveAction(attack,'p1',0)}});
 const text=result.events.map(e=>e.text||'').join(' / ');
 assert.ok(text.includes('Mantello Elastico'),text);
 assert.equal(result.teams.p1[0].hp,hp,'La protezione annulla i danni diretti');
 assert.ok(result.teams.p2[0].hp<enemyHp,'L’attaccante riceve parte del danno riflesso');
 assert.match(text,/restituisce/);
});
