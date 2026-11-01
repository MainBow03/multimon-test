import { collection, doc, onSnapshot, query, where, setDoc, updateDoc, runTransaction } from 'firebase/firestore';
import { db, appId } from './config.js';
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
 const ref=doc(root());await setDoc(ref,{hostId:host.uid,hostName:host.name,createdAt:Date.now(),status:'lobby',settings,bots:[],pairOrder:[],entrants:[],matches:[],activeBattle:null,placements:null});
 await setDoc(player(ref.id,host.uid),{uid:host.uid,name:host.name,teamIds:[],heldItems:{},ready:false,joinedAt:Date.now()});return ref.id;
}
export const joinEvent=(id,person)=>setDoc(player(id,person.uid),{...person,teamIds:[],heldItems:{},ready:false,joinedAt:Date.now()});
export const saveTeam=(id,uid,teamIds,heldItems)=>updateDoc(player(id,uid),{teamIds,heldItems,ready:true});
export const sendMoves=(id,b,uid,actions)=>setDoc(doc(commands(id),b.matchId+'-'+b.turn+'-'+uid),{uid,turnKey:b.matchId+':'+b.turn,actions,createdAt:Date.now()});
export const hostUpdate=(id,uid,patch)=>runTransaction(db,async tx=>{
 const ref=event(id),snap=await tx.get(ref);if(!snap.exists())throw Error('Evento scomparso');
 const previous=snap.data();if(previous.hostId!==uid)throw Error('Solo l’host può aggiornare il torneo');
 const update=patch(previous);if(update)tx.update(ref,update);return !!update;
});