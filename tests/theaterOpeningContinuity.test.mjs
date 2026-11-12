import test from 'node:test';
import assert from 'node:assert/strict';
import {THEATER_CAMPAIGN} from '../src/data/theaterCampaign.js';

const missions=THEATER_CAMPAIGN.sectors.flatMap(s=>s.missions);
const lines=i=>missions[i].dialogue.map(d=>d.s+': '+d.t).join('\n');
const epilogue=i=>missions[i].postDialogue.map(d=>d.s+': '+d.t).join('\n');

test('Il Regista prepara una rappresentazione, non inghiotte casualmente Mewni',()=>{
 assert.match(THEATER_CAMPAIGN.intro.p1,/biglietto dorato/i);
 assert.match(THEATER_CAMPAIGN.intro.p1,/quartiere di Mewni/i);
 assert.match(lines(0),/biglietto dorato/i);
 assert.match(lines(0),/ho scelto la principessa/i);
 assert.match(lines(0),/quartiere del castello/i);
 assert.match(epilogue(5),/Non ha inghiottito l’universo di Star/i);
});

test('Coraline e Sam sono scelte e raggiungono il teatro per motivi spiegati',()=>{
 assert.match(lines(0),/un invito identico/i);
 assert.match(lines(0),/una porticina/i);
 assert.match(lines(0),/Coraline Jones, la testimone/i);
 assert.match(epilogue(1),/lista del cast/i);
 assert.match(lines(2),/trasmettitore rubato/i);
 assert.match(lines(2),/terza attrice/i);
 assert.match(epilogue(2),/trasmettitore era un’esca/i);
});

test('Mistero e scoperta del teatro avanzano coerentemente nei primi due atti',()=>{
 assert.equal(missions.length,36);
 assert.match(lines(4),/Scena quinta/i);
 assert.match(lines(5),/Deposito Scenografie/i);
 assert.match(epilogue(5),/Teatro Zero/i);
 assert.match(lines(11),/dossier del cast/i);
 assert.match(epilogue(11),/sei atti/i);
});
