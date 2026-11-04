import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTERS } from '../src/data/characters.js';
import { MOVES_DB } from '../src/data/moves.js';
import { CHAR_PRICES } from '../src/data/prices.js';
import { TYPES } from '../src/data/types.js';

const ids=['fragolina','altramadre','blaze','shadow','sonic','tails'];
const images={
  fragolina:'https://i.pinimg.com/736x/c0/a8/d4/c0a8d4f623bf2e8a9f2ae1bba908576d.jpg',
  altramadre:'https://i.pinimg.com/736x/30/b4/5f/30b45f1fb792ca8e949838e29126e81c.jpg',
  blaze:'https://i.pinimg.com/736x/2c/c1/e0/2cc1e0b9912fd15aa14bd46925cfc2f2.jpg',
  shadow:'https://i.pinimg.com/736x/3c/76/ff/3c76fff9ff85b800716e8c88e9f9f1ab.jpg',
  sonic:'https://i.pinimg.com/1200x/60/f7/41/60f7417f934e111a7032f741407d4182.jpg',
  tails:'https://i.pinimg.com/736x/09/69/91/096991190742105592803317c9802366.jpg'
};

test('Sei nuovi personaggi presenti una sola volta, giocabili e con le immagini richieste',()=>{
  for(const id of ids){
    const matching=CHARACTERS.filter(c=>c.id===id);
    assert.equal(matching.length,1,id+' non deve essere duplicato');
    const c=matching[0];
    assert.equal(c.img,images[id]);
    assert.ok(!c.isSummonOnly && !c.isCampaignMonster && !c.isSecretUnlock);
    assert.equal(c.hp,c.maxHp);
    assert.ok(c.maxHp>0&&c.atk>0&&c.def>0&&c.spd>0);
    assert.equal(c.types.length,2);
    for(const type of c.types)assert.ok(TYPES.includes(type),type+' non riconosciuto');
  }
});

test('Quattro mosse diverse per campione, tutte nel database e con tipi validi',()=>{
  const names=new Set();
  for(const id of ids){
    const c=CHARACTERS.find(ch=>ch.id===id);
    assert.equal(c.moves.length,4,id);
    assert.equal(new Set(c.moves.map(m=>m?.name)).size,4,id);
    for(const move of c.moves){
      assert.ok(move?.name, id+': mossa mancante');
      assert.equal(MOVES_DB[move.name],move,
        id+': la mossa '+move.name+' non è registrata nel MOVES_DB');
      assert.ok(TYPES.includes(move.type),move.name+' ha un tipo non supportato');
      assert.ok(move.power>=0 && move.power<=150);
      assert.ok(move.accuracy===undefined||move.accuracy>0&&move.accuracy<=1);
      names.add(move.name);
    }
  }
  assert.equal(names.size,24,'Le nuove mosse non devono duplicarsi');
});

test('Prezzi coerenti e aggiunti al negozio',()=>{
  assert.deepEqual(ids.map(id=>CHAR_PRICES[id]),[150,200,250,250,200,200]);
  for(const id of ids){
    const c=CHARACTERS.find(c=>c.id===id);
    assert.equal(c.price,CHAR_PRICES[id]);
  }
});

test('Le sei passive hanno un tipo implementato e parametri utilizzabili',()=>{
  const byId=Object.fromEntries(CHARACTERS.filter(c=>ids.includes(c.id)).map(c=>[c.id,c]));
  assert.equal(byId.fragolina.passive.type,'on_turn_end');
  assert.equal(byId.fragolina.passive.healLowestAllyPercent,.05);
  assert.equal(byId.altramadre.passive.type,'on_enter');
  assert.equal(byId.altramadre.passive.enemyStatDebuff.spd,.85);
  assert.equal(byId.blaze.passive.type,'on_hp_threshold');
  assert.equal(byId.blaze.passive.maxUses,1);
  assert.equal(byId.shadow.passive.type,'first_strike_bonus');
  assert.equal(byId.shadow.passive.damageBonus,1.2);
  assert.equal(byId.sonic.passive.type,'on_enter');
  assert.equal(byId.sonic.passive.selfStatBuff.spd,1.15);
  assert.equal(byId.tails.passive.type,'on_enter');
  assert.equal(byId.tails.passive.teamStatBuff.def,1.15);
});

test('Le mosse curative e potenzianti non diventano a utilizzo illimitato',()=>{
  for(const name of ['Frullato Rinvigorente','Aura Ardente','Chaos Control','Velocità della Luce','Kit di Riparazione']){
    const move=MOVES_DB[name];
    assert.ok(move.strictUses && move.maxUses>=2 && move.maxUses<=4,name);
  }
});
