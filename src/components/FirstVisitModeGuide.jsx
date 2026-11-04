import React,{useState} from 'react';
import {CHARACTERS} from '../data/characters.js';

// Una guida unica e breve per ogni pulsante principale, con un volto diverso.
// Le immagini provengono dallo stesso roster usato in battaglia.
export const MODE_GUIDES=Object.freeze({
 online_players:{character:'cyborg',title:'Giocatori online',lines:[
  'Qui puoi vedere chi sta giocando a Multimon in questo momento e, quando possibile, osservare una partita.',
  'L’elenco mostra solo i giocatori disponibili online: una stanza privata non diventa automaticamente una partita pubblica.']},
 create_room:{character:'laxus',title:'Crea una stanza online',lines:[
  'Crei una stanza e ne diventi l’host. Scegli le impostazioni, condividi il codice con gli amici e aspettali nella lobby.',
  'Quando siete pronti, scegliete i Multimon e giocate i turni sincronizzati sul server.']},
 join_room:{character:'kitty',title:'Entra in una stanza',lines:[
  'Hai un codice? Inseriscilo nel campo del menu e potrai raggiungere la stanza dei tuoi amici.',
  'Se una partita è già in corso, puoi rientrare nel tuo posto usando lo stesso account con cui eri entrato.']},
 campaign:{character:'topolino',title:'Modalità Campagne',lines:[
  'Esplora le storie del Multiverso, affronta missioni in ordine e scopri nuovi alleati e boss.',
  'Ogni missione completata dà un Baule Campagna. I progressi vengono salvati automaticamente.']},
 vs_cpu:{character:'goku',title:'Gioca contro la CPU',lines:[
  'Ehi! Vuoi allenarti? Sfida una squadra comandata dall’intelligenza artificiale: sceglierà mosse, bersagli e sostituzioni.',
  'Prova tipi, strategie e strumenti diversi. Vinci la lotta per ottenere ricompense e Padronanza!']},
 rogue_solo:{character:'finn',title:'Roguelike in solitaria',lines:[
  'Parti con tre Multimon scelti tra sei proposte. Scala 50 piani, recluta nuovi compagni e gestisci le risorse.',
  'Ogni cinque piani ottieni una Cassa Potenza. Al piano 50: premio finale di Punti Forza e cinque Bauli normali.']},
 rogue_coop:{character:'natsu',title:'Roguelike Co-op',lines:[
  'Forma una squadra online di due o tre amici! Ognuno controlla il proprio Multimon contro lo stesso nemico.',
  'Le monete della spedizione sono condivise; Casse Potenza ogni cinque piani, monete personali e premi del piano 50 spettano a ciascun giocatore.']},
 survival:{character:'marceline',title:'Sopravvivenza infinita',lines:[
  'Qui gli avversari arrivano a ondate. L’obiettivo è resistere più a lungo possibile senza perdere la squadra.',
  'La difficoltà aumenta: scegli quando curarti e punta a migliorare il tuo record personale.']},
 local:{character:'doraemon',title:'Partita sullo stesso PC',lines:[
  'Perfetto per giocare insieme davanti allo stesso schermo: si crea la partita senza dover usare due dispositivi.',
  'Ogni giocatore sceglie il proprio team e decide le mosse a turno.']},
 catalog:{character:'bloom',title:'Catalogo dei Multimon',lines:[
  'Qui trovi tutte le schede dei personaggi: tipi, statistiche, mosse e abilità.',
  'Usalo per progettare una squadra e confrontare i campioni prima di acquistarli.']},
 type_chart:{character:'sage',title:'Tabella dei tipi',lines:[
  'Ogni tipo ha vantaggi e svantaggi: prima di un duello controlla la tabella per evitare mosse poco efficaci.',
  'La chart è disponibile anche durante le battaglie, senza perdere il turno.']},
 chests:{character:'bowser',title:'Bauli normali',lines:[
  'BWAHAHA! Qui apri i Bauli Campagna: ogni baule contiene due premi casuali fra monete, cure, Punti Forza, strumenti e Multimon.',
  'Li ottieni anche completando tutti i 50 piani di una Roguelike, in solo o in Co-op.']},
 power_chests:{character:'neon',title:'Casse Potenza',lines:[
  'Queste casse non danno oggetti: ciascuna contiene da 2 a 8 Punti Forza.',
  'Le conquisti ogni cinque piani di Roguelike, anche in Co-op. Spendi i punti nel Laboratorio.']},
 strength_lab:{character:'cyborg',title:'Laboratorio di Potenziamento',lines:[
  'Usa i Punti Forza per aumentare permanentemente Attacco, Difesa o Velocità dei Multimon posseduti.',
  'Il laboratorio offre anche una guida pratica e un primo potenziamento gratuito.']},
 shop:{character:'plankton',title:'Negozio di Multimon',lines:[
  'Finalmente un posto per i miei affari! Qui spendi le monete del profilo per sbloccare nuovi Multimon o comprare oggetti.',
  'I personaggi acquistati restano disponibili nelle tue prossime squadre. Controlla sempre cosa possiedi già!']},
 stats:{character:'stewie',title:'Statistiche personali',lines:[
  'Dati, finalmente! Qui trovi vittorie, partite, personaggi più usati e altri risultati della tua carriera.',
  'Il profilo conserva anche la progressione generale e i titoli di Padronanza conquistati.']}
});
export function FirstVisitModeGuide({guideKey,onCancel,onContinue}){
 const [step,setStep]=useState(0);
 const guide=MODE_GUIDES[guideKey];
 if(!guide)return null;
 const char=CHARACTERS.find(c=>c.id===guide.character);
 const last=step>=guide.lines.length-1;
 return <div className="fixed inset-0 z-[460] flex items-center justify-center bg-slate-950/95 p-4 text-white backdrop-blur-md">
  <section role="dialog" aria-modal="true" aria-label={'Guida: '+guide.title}
   className="w-full max-w-2xl overflow-hidden rounded-3xl border-2 border-cyan-500/40 bg-gradient-to-br from-slate-900 via-[#13223c] to-indigo-950 shadow-[0_0_70px_rgba(79,70,229,.25)]">
   <div className="flex items-center justify-between gap-3 border-b border-slate-600/50 p-5">
    <div><p className="text-xs font-black uppercase tracking-widest text-cyan-300">La prima volta in questa modalità</p>
     <h2 className="mt-1 text-xl sm:text-2xl font-black">{guide.title}</h2></div>
    <span className="text-xs font-bold text-slate-300">{step+1}/{guide.lines.length}</span>
   </div>
   <div className="grid gap-4 p-5 sm:grid-cols-[155px_1fr] sm:p-7">
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-slate-950/50 p-3 border border-cyan-500/25">
     {char?.img?<img src={char.img} alt={char.name} className="h-36 w-36 object-contain drop-shadow-[0_0_18px_rgba(34,211,238,.25)]"/>:
      <span className="p-10 text-5xl">✨</span>}
     <span className="text-center text-xs font-black text-cyan-200">{char?.name||'Guida Multimon'}</span>
    </div>
    <div className="flex flex-col justify-between gap-5">
     <p className="rounded-xl border border-slate-600/70 bg-slate-950/60 p-5 text-base leading-relaxed text-slate-100">“{guide.lines[step]}”</p>
     <div className="flex flex-wrap justify-end gap-2">
      <button type="button" onClick={onCancel} className="rounded-xl border border-slate-600 px-4 py-3 font-bold text-slate-300 hover:bg-slate-800">Non ora</button>
      {step>0&&<button type="button" onClick={()=>setStep(v=>v-1)} className="rounded-xl border border-slate-600 px-4 py-3 font-bold">Indietro</button>}
      <button type="button" onClick={()=>last?onContinue():setStep(v=>v+1)}
       className="rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 px-6 py-3 font-black hover:brightness-110">
       {last?'Ho capito, apri!':'Continua'}</button>
     </div>
    </div>
   </div>
   <div className="flex gap-1 px-5 pb-5">{guide.lines.map((_,i)=><div key={i} className={'h-1.5 flex-1 rounded-full '+(i<=step?'bg-cyan-400':'bg-slate-700')}/>)}</div>
  </section>
 </div>;
}
