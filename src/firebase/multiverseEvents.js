import { collection, doc, onSnapshot, query, where, setDoc, updateDoc, runTransaction, serverTimestamp, getDocs, getDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db, appId } from './config.js';
import { isLiveEvent } from '../systems/multiverseEventEngine.js';
const root=()=>collection(db,'artifacts',appId,'public','data','multiverse_events');
const event=id=>doc(root(),id);
const players=id=>collection(event(id),'players');
const player=(id,uid)=>doc(players(id),uid);
const commands=id=>collection(event(id),'commands');
export const watchEvents=(ok,fail)=>onSnapshot(root(),s=>ok(s.docs.map(d=>({...d.data(),id:d.id}))),fail);
export const watchEvent=(id,ok,fail)=>onSnapshot(event(id),s=>ok(s.exists()?{...s.data(),id:s.id}:null),fail);
export const watchPlayers=(id,ok,fail)=>onSnapshot(players(id),s=>ok(s.docs.map(d=>({...d.data(),id:d.id}))),fail);
export const watchCommands=(id,key,ok,fail)=>onSnapshot(query(commands(id),where('turnKey','==',key)),s=>ok(Object.fromEntries(s.docs.map(d=>[d.data().uid,d.data().actions]))),fail);
export async function createEvent(host,settings){
 const ref=doc(root());await setDoc(ref,{hostId:host.uid,hostName:host.name,createdAt:Date.now(),updatedAt:Date.now(),hostHeartbeatAt:serverTimestamp(),status:'lobby',settings,bots:[],pairOrder:[],entrants:[],matches:[],activeBattle:null,placements:null});
 await setDoc(player(ref.id,host.uid),{uid:host.uid,name:host.name,title:host.title||'',mastery:host.mastery||{},strengthUpgrades:host.strengthUpgrades||{},teamIds:[],heldItems:{},ready:false,joinedAt:Date.now()});return ref.id;
}
export const joinEvent=(id,person)=>setDoc(player(id,person.uid),{...person,teamIds:[],heldItems:{},ready:false,joinedAt:Date.now()});
export const saveTeam=(id,uid,teamIds,heldItems)=>updateDoc(player(id,uid),{teamIds,heldItems,ready:true});
export const sendMoves=(id,b,uid,actions)=>setDoc(doc(commands(id),b.matchId+'-'+b.turn+'-'+uid),{uid,turnKey:b.matchId+':'+b.turn,actions,createdAt:Date.now()});
export const hostUpdate=(id,uid,patch)=>runTransaction(db,async tx=>{
 const ref=event(id),snap=await tx.get(ref);if(!snap.exists())throw Error('Evento scomparso');
 const previous=snap.data();if(previous.hostId!==uid)throw Error('Solo l’host può aggiornare il torneo');
 const update=patch(previous);if(update)tx.update(ref,{...update,updatedAt:Date.now(),hostHeartbeatAt:serverTimestamp()});return !!update;
});
// Rinnovo della presenza host: non è un limite di durata del torneo.
// L'host continua a mantenere in vita il torneo anche durante una finale lunga.
export async function heartbeatEvent(id,uid){
 const ref=event(id),snap=await getDoc(ref);
 if(!snap.exists())return false;
 if(snap.data().hostId!==uid||!['lobby','running'].includes(snap.data().status))return false;
 await updateDoc(ref,{updatedAt:Date.now(),hostHeartbeatAt:serverTimestamp()});
 return true;
}

// Pulizia di tutti i documenti del torneo. Firestore non elimina
// automaticamente le sottocollezioni quando si elimina il documento padre.
export async function purgeEvent(id){
 const ref=event(id);
 const [ps,cs]=await Promise.all([getDocs(players(id)),getDocs(commands(id))]);
 const docs=[...ps.docs,...cs.docs];
 // Le regole Firestore eseguono get() per ogni eliminazione: batch piccoli evitano i limiti di accesso.
 for(let i=0;i<docs.length;i+=10){
  const batch=writeBatch(db);
  for(const docSnap of docs.slice(i,i+10))batch.delete(docSnap.ref);
  await batch.commit();
 }
 await deleteDoc(ref);
}

// Chiude immediatamente il torneo dall'interfaccia e poi rimuove i documenti.
export async function cancelAndPurgeEvent(id,uid){
 await hostUpdate(id,uid,old=>old.status==='lobby'||old.status==='running'?{status:'cancelled'}:null);
 await purgeEvent(id);
}

// Chiunque abbia accesso può proporre la pulizia di un evento inattivo;
// sono le regole Firestore a verificare i 5 minuti con l'orologio server.
export async function purgeStaleEvent(snapshot,now=Date.now()){
 if(!snapshot||isLiveEvent(snapshot,now)||['lobby','running'].includes(snapshot.status)&&
   (now-(snapshot.updatedAt||snapshot.createdAt))<5*60*1000)return false;
 await purgeEvent(snapshot.id);
 return true;
}
