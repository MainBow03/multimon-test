import React,{useEffect,useRef,useState} from 'react';
import {EmailAuthProvider,linkWithCredential,onAuthStateChanged,sendPasswordResetEmail,
 signInAnonymously,signInWithCustomToken,signInWithEmailAndPassword,signOut} from 'firebase/auth';
import {auth,ensurePersistentAuth} from '../firebase/config.js';
import {downloadCloudSave,uploadCloudSave} from '../firebase/cloudSaves.js';
import {ACTIVE_ACCOUNT_KEY,GUEST_BACKUP_KEY,LOCAL_ACCOUNT_BACKUP_PREFIX,
 collectProgress,clearProgress,progressFingerprint,readLocalBackup,
 restoreProgress,saveLocalBackup,createRecoverySnapshot,listRecoveryBackups} from '../systems/progressStorage.js';

const HASH_KEY='multimon_cloud_last_fingerprint_';
const field='w-full bg-slate-950 border border-slate-600 rounded-xl px-3 py-3 text-white focus:outline-none focus:border-cyan-400';
const primary='px-4 py-3 rounded-xl font-black text-white bg-gradient-to-r from-cyan-600 to-violet-600 hover:brightness-110 disabled:opacity-40';
const secondary='px-4 py-3 rounded-xl font-bold bg-slate-800 text-white border border-slate-600 hover:bg-slate-700';
function explain(error) {
 switch(error?.code) {
 case 'auth/email-already-in-use':return 'Questa email è già registrata: scegli Accedi.';
 case 'auth/invalid-email':return 'Email non valida.';
 case 'auth/weak-password':return 'Usa almeno 6 caratteri per la password.';
 case 'auth/invalid-credential':case 'auth/wrong-password':case 'auth/user-not-found':return 'Email o password non corretti.';
 case 'auth/operation-not-allowed':return 'Abilita Email/Password su Firebase Authentication.';
 case 'auth/too-many-requests':return 'Troppi tentativi. Riprova più tardi.';
 case 'permission-denied':return 'Mancano le regole Firestore private per i salvataggi (vedi FIREBASE_ACCOUNT_RULES.md).';
 default:return error?.message||'Problema di connessione all’account.';
 }
}
export function AccountGate({children}) {
 const [session,setSession]=useState({type:'loading',uid:''});
 const [open,setOpen]=useState(false),[mode,setMode]=useState('login');
 const [controlsExpanded,setControlsExpanded]=useState(false);
 const [email,setEmail]=useState(''),[password,setPassword]=useState('');
 const [error,setError]=useState(''),[notice,setNotice]=useState(''),[cloudStatus,setCloudStatus]=useState('');
 const [storageWarning,setStorageWarning]=useState('');
 const [backupPanel,setBackupPanel]=useState(false),[backupList,setBackupList]=useState([]);
 const [restoreRevision,setRestoreRevision]=useState(0);
 const busy=useRef(false),lastUploaded=useRef(''),inFlight=useRef(null),remotePending=useRef(null);
 const fail=e=>{setError(explain(e));setCloudStatus('errore');};
 const emailUser=u=>!!u?.email&&!u?.isAnonymous;
 const backupBeforeSwitch=uid=>{
  const old=localStorage.getItem(ACTIVE_ACCOUNT_KEY);
  // Prima di applicare qualsiasi salvataggio remoto preserva lo stato
  // attuale: potrebbe contenere ore di gioco non ancora sincronizzate.
  createRecoverySnapshot(collectProgress(),'prima-di-cambiare-account');
  if(old&&old!==uid)saveLocalBackup(LOCAL_ACCOUNT_BACKUP_PREFIX+old);
  else if(!old)saveLocalBackup(GUEST_BACKUP_KEY);
 };
 function activate(uid,entries) {
  restoreProgress(entries);
  // Riavvio o refresh NON devono far perdere la stanza online:
  // l'accesso cloud conserva la sessione solo quando corrisponde
  // alla stessa identità Firebase, mai se si cambia account.
  try{
    const stored=JSON.parse(localStorage.getItem('multiverse_rpg_session')||'null');
    const priorUid=localStorage.getItem(ACTIVE_ACCOUNT_KEY);
    if(stored?.appMode==='online_room' &&
       (stored.playerUid===uid || (!stored.playerUid && priorUid===uid))) {
      // Sessione valida: App confermerà il posto sul documento Firestore.
    }else{
      localStorage.removeItem('multiverse_rpg_session');
    }
  }catch{localStorage.removeItem('multiverse_rpg_session');}
  localStorage.setItem(ACTIVE_ACCOUNT_KEY,uid);
  const hash=progressFingerprint(collectProgress());
  localStorage.setItem(HASH_KEY+uid,hash);lastUploaded.current=hash;
  remotePending.current=null;setCloudStatus('sincronizzato');setError('');
  setRestoreRevision(x=>x+1);
  setSession({type:'account',uid});
 }
 async function loadAccount(u) {
  setSession({type:'loading',uid:''});
  const remote=await downloadCloudSave(u.uid);
  if(!remote){setSession({type:'empty',uid:u.uid});return;}
  if(auth.currentUser?.uid!==u.uid)return;
  const active=localStorage.getItem(ACTIVE_ACCOUNT_KEY);
  const local=collectProgress();
  const localHash=progressFingerprint(local),remoteHash=progressFingerprint(remote);
  const meaningful=Object.keys(local).some(k=>!['multiverse_rpg_saved_name','multiverse_rpg_saved_avatar'].includes(k));
  // MAI sostituire silenziosamente dati locali divergenti, anche
  // quando l'hash dell'ultima sincronizzazione non è più aggiornato.
  if(localHash!==remoteHash&&(active===u.uid||(!active&&meaningful))){
   remotePending.current=remote;setSession({type:'conflict',uid:u.uid});return;
  }
  backupBeforeSwitch(u.uid);activate(u.uid,remote);
 }
 function enterGuest(u) {
  const old=localStorage.getItem(ACTIVE_ACCOUNT_KEY);
  if(old){
   // Una sessione Firebase persa non è un logout richiesto dall'utente!
   // Non caricare il vecchio ospite, non cancellare dati account e stanza.
   setSession({type:'reauth',uid:old});return;
  }
  setSession({type:'guest',uid:u?.uid||''});
 }
 useEffect(()=>{
  let disposed=false,off=()=>{};
  (async()=>{
    try{
      await ensurePersistentAuth();
    }catch(error){
      if(!disposed)setStorageWarning('Il browser sta bloccando il salvataggio dell’accesso. Consenti i dati del sito ed evita la navigazione in incognito; altrimenti potrebbe richiedere di accedere di nuovo.');
    }
    if(disposed)return;
    off=onAuthStateChanged(auth,async user=>{
      if(disposed||busy.current)return;
      try {
        if(!user){
          // Se esiste un account precedente NON avviare un nuovo ospite.
          // La copia locale rimane visibile e recuperabile dopo il login.
          const known=localStorage.getItem(ACTIVE_ACCOUNT_KEY);
          if(known){setMode('login');setSession({type:'reauth',uid:known});return;}
          busy.current=true;
          try {
            if(typeof __initial_auth_token!=='undefined'&&__initial_auth_token)
              await signInWithCustomToken(auth,__initial_auth_token);
            else await signInAnonymously(auth);
          }finally{busy.current=false;}
          if(!disposed)enterGuest(auth.currentUser);
        }else if(!emailUser(user)){
          const known=localStorage.getItem(ACTIVE_ACCOUNT_KEY);
          if(known){setMode('login');setSession({type:'reauth',uid:known});}
          else enterGuest(user);
        }else await loadAccount(user);
      }catch(error){
        if(!disposed){fail(error);setSession({type:'error',uid:user?.uid||''});}
      }
    },error=>{
      if(!disposed){fail(error);setSession({type:'error',uid:auth.currentUser?.uid||''});}
    });
  })();
  return()=>{disposed=true;off();};
 },[]);
 async function saveNow(force=false) {
  if(session.type!=='account'||busy.current)return;
  if(inFlight.current)await inFlight.current;
  const entries=collectProgress(),hash=progressFingerprint(entries);
  if(!force&&hash===lastUploaded.current)return;
  const uid=session.uid,job=uploadCloudSave(uid,entries);
  inFlight.current=job;setCloudStatus('salvataggio…');
  try {
   await job;lastUploaded.current=hash;localStorage.setItem(HASH_KEY+uid,hash);
   setCloudStatus('sincronizzato');setError('');
  } catch(e){fail(e);throw e;}
  finally{if(inFlight.current===job)inFlight.current=null;}
 }
 useEffect(()=>{
  if(session.type!=='account')return;
  const tick=()=>{saveNow().catch(()=>{});};
  // Due secondi limitano i progressi non sincronizzati in caso di chiusura.
  // Non parte alcuna scrittura se l'impronta dei dati è invariata.
  const timer=setInterval(tick,2000);
  const hide=()=>{if(document.visibilityState==='hidden')tick();};
  const leave=()=>tick();
  const backOnline=()=>tick();
  document.addEventListener('visibilitychange',hide);
  window.addEventListener('pagehide',leave);
  window.addEventListener('online',backOnline);
  return()=>{
    clearInterval(timer);
    document.removeEventListener('visibilitychange',hide);
    window.removeEventListener('pagehide',leave);
    window.removeEventListener('online',backOnline);
  };
 },[session.type,session.uid]);
 async function loginOrRegister(event) {
  event.preventDefault();if(busy.current)return;
  busy.current=true;setSession({type:'loading',uid:''});setError('');setNotice('');
  try {
   if(mode==='signup'){
    if(!auth.currentUser?.isAnonymous)throw Error('Per creare un nuovo account esci da quello attuale.');
    const local=collectProgress();saveLocalBackup(GUEST_BACKUP_KEY);
    const credential=EmailAuthProvider.credential(email.trim(),password);
    const linked=await linkWithCredential(auth.currentUser,credential);
    await linked.user.getIdToken(true);
    await uploadCloudSave(linked.user.uid,local);
    activate(linked.user.uid,local);
    setNotice('Registrazione riuscita. I progressi ospite sono sul cloud.');
   }else{
    saveLocalBackup(GUEST_BACKUP_KEY);
    const result=await signInWithEmailAndPassword(auth,email.trim(),password);
    await loadAccount(result.user);
   }
   setOpen(false);setPassword('');
  }catch(e){
   fail(e);
   if(emailUser(auth.currentUser))setSession({type:'empty',uid:auth.currentUser.uid});
   else enterGuest(auth.currentUser);
  }finally{busy.current=false;}
 }
 async function resetPassword(){
  if(!email.trim()){setError('Inserisci prima la tua email.');return;}
  try{await sendPasswordResetEmail(auth,email.trim());
   setNotice('Se la mail esiste, riceverai il link di recupero password.');setError('');
  }catch(e){fail(e);}
 }
 async function chooseEmpty(importLocal){
  if(busy.current)return;busy.current=true;setError('');
  try{
   if(!importLocal){
    backupBeforeSwitch(session.uid);clearProgress();
    localStorage.removeItem('multiverse_rpg_session');
   }
   const entries=collectProgress();
   await uploadCloudSave(session.uid,entries);activate(session.uid,entries);
  }catch(e){fail(e);}finally{busy.current=false;}
 }
 async function chooseConflict(useLocal){
  if(busy.current)return;busy.current=true;setError('');
  try{
   saveLocalBackup(LOCAL_ACCOUNT_BACKUP_PREFIX+session.uid);
   if(useLocal){
    const entries=collectProgress();await uploadCloudSave(session.uid,entries);
    activate(session.uid,entries);
   }else activate(session.uid,remotePending.current);
  }catch(e){fail(e);}finally{busy.current=false;}
 }
 async function logout(){
  if(busy.current)return;busy.current=true;setError('');
  const previousUid=session.uid;
  try{
   if(session.type==='account'){
    if(inFlight.current)await inFlight.current;
    await uploadCloudSave(previousUid,collectProgress());
    saveLocalBackup(LOCAL_ACCOUNT_BACKUP_PREFIX+previousUid);
   }
   // Smonta App prima di sostituire i progressi del browser.
   setSession({type:'loading',uid:''});
   restoreProgress(readLocalBackup(GUEST_BACKUP_KEY)||{});
   localStorage.removeItem(ACTIVE_ACCOUNT_KEY);
   localStorage.removeItem('multiverse_rpg_session');
   await signOut(auth);await signInAnonymously(auth);
   lastUploaded.current='';setCloudStatus('');enterGuest(auth.currentUser);
  }catch(e){fail(e);setSession({type:emailUser(auth.currentUser)?'account':'guest',uid:auth.currentUser?.uid||previousUid});}
  finally{busy.current=false;}
 }
 const locked=['loading','empty','conflict','error'].includes(session.type);
 return <>
  {!locked&&<React.Fragment key={session.type+':'+session.uid}>{children}</React.Fragment>}
  {/* Pulsante cloud compatto in basso: non copre "Torna al Menu" nelle stanze. */}
  {!locked&&<div className="fixed bottom-3 left-3 sm:bottom-4 sm:left-4 z-[250] flex flex-col items-start gap-2 max-w-[calc(100vw-1.5rem)]">
    {controlsExpanded&&<div id="multimon-account-controls" className="mb-1 max-w-[min(22rem,calc(100vw-1.5rem))] rounded-2xl border border-cyan-400/50 bg-slate-950/95 p-3 shadow-2xl backdrop-blur-xl text-xs text-white">
      {session.type==='account'&&<div className="flex flex-col gap-3">
        <div className="flex justify-between items-center gap-3">
          <span className="font-black text-emerald-300 truncate" title={auth.currentUser?.email||''}>☁ {auth.currentUser?.email}</span>
          <button aria-label="Chiudi controlli account" className="rounded-lg border border-slate-600 px-2 py-1" onClick={()=>setControlsExpanded(false)}>✕</button>
        </div>
        <span className="text-slate-300" aria-live="polite">{cloudStatus||'Salvataggio cloud'}</span>
        <div className="flex gap-4 items-center">
          <button className="text-cyan-300 underline font-bold" onClick={()=>saveNow(true).catch(()=>{})}>Salva ora</button>
          <button className="text-rose-300 underline font-bold" onClick={logout}>Esci dall’account</button>
        </div>
      </div>}
      {session.type==='guest'&&<div className="flex flex-col gap-3">
        <span className="text-slate-300">Salva i progressi su tutti i tuoi dispositivi.</span>
        <button className={primary} onClick={()=>{setControlsExpanded(false);setOpen(true);setMode('login');}}>Accedi / Registrati</button>
      </div>}
    </div>}
    <button
      type="button"
      aria-expanded={controlsExpanded}
      aria-controls="multimon-account-controls"
      aria-label={controlsExpanded?'Nascondi i controlli account':'Apri account e salvataggi cloud'}
      title={session.type==='account'?'Account · '+(cloudStatus||'cloud'):'Accedi o registrati'}
      className="rounded-full bg-slate-950/95 border border-cyan-400/60 w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:scale-105 transition-transform"
      onClick={()=>setControlsExpanded(x=>!x)}>
      <span className="text-xl" aria-hidden="true">☁</span>
      {session.type==='account'&&<span className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-950 bg-emerald-400"/>}
    </button>
  </div>}
  {session.type==='account'&&error&&<div role="alert" className="fixed bottom-16 left-3 z-[260] max-w-sm rounded-xl border border-red-500 bg-red-950 p-3 text-xs text-white">{error}</div>}
  {(open||locked)&&<div className="fixed inset-0 z-[300] overflow-y-auto flex items-center justify-center bg-slate-950/95 p-4 text-white">
   <div className="w-full max-w-md space-y-4 rounded-3xl border border-cyan-500/40 bg-slate-900 p-6 shadow-2xl">
    <h2 className="text-2xl font-black text-cyan-300">☁ Account Multimon</h2>
    {session.type==='loading'&&<p>Connessione e recupero dei progressi…</p>}
    {session.type==='error'&&<div className="space-y-2">
     <p>Non riesco a leggere i salvataggi online. Non ho cancellato quelli locali.</p>
     <button className={secondary+' w-full'} onClick={()=>loadAccount(auth.currentUser).catch(fail)}>Riprova</button>
     <button className={secondary+' w-full'} onClick={logout}>Torna come ospite</button>
    </div>}
    {session.type==='empty'&&<div className="space-y-2">
     <p>L’account non ha un salvataggio cloud. Scegli tu come iniziare.</p>
     <button className={primary+' w-full'} onClick={()=>chooseEmpty(true)}>Importa i progressi di questo browser</button>
     <button className={secondary+' w-full'} onClick={()=>chooseEmpty(false)}>Inizia da zero</button>
     <button className={secondary+' w-full'} onClick={logout}>Torna come ospite</button>
    </div>}
    {session.type==='conflict'&&<div className="space-y-2">
     <p>Esistono progressi locali non ancora sincronizzati. Quale versione vuoi tenere?</p>
     <button className={primary+' w-full'} onClick={()=>chooseConflict(true)}>Conserva i progressi locali</button>
     <button className={secondary+' w-full'} onClick={()=>chooseConflict(false)}>Scarica dal cloud</button>
     <p className="text-xs text-slate-400">Conservo una copia locale prima di cambiare.</p>
    </div>}
    {session.type==='guest'&&<>
     <div className="grid grid-cols-2 gap-2">
      <button className={mode==='login'?primary:secondary} onClick={()=>{setMode('login');setError('');}}>Accedi</button>
      <button className={mode==='signup'?primary:secondary} onClick={()=>{setMode('signup');setError('');}}>Registrati</button>
     </div>
     <p className="text-sm text-slate-400">{mode==='signup'?'Il salvataggio ospite sarà importato nel nuovo account.':'Recupera i progressi dal cloud; conservo una copia del salvataggio ospite.'}</p>
     <form className="space-y-3" onSubmit={loginOrRegister}>
      <label className="block text-xs font-bold">Email
       <input type="email" required autoComplete="email" className={field+' mt-1'} value={email} onChange={e=>setEmail(e.target.value)}/>
      </label>
      <label className="block text-xs font-bold">Password
       <input type="password" minLength={6} required autoComplete={mode==='signup'?'new-password':'current-password'} className={field+' mt-1'} value={password} onChange={e=>setPassword(e.target.value)}/>
      </label>
      <button type="submit" className={primary+' w-full'}>{mode==='signup'?'Crea account e salva progressi':'Accedi al mio account'}</button>
     </form>
     {mode==='login'&&<button className="text-xs text-cyan-300 underline" onClick={resetPassword}>Password dimenticata?</button>}
     <button className={secondary+' w-full'} onClick={()=>{setOpen(false);setPassword('');setError('');}}>Continua come ospite</button>
    </>}
    {error&&<p role="alert" className="text-sm text-rose-300">{error}</p>}
    {notice&&<p className="text-sm text-emerald-300">{notice}</p>}
    <p className="text-xs text-slate-400">La password viene gestita da Firebase Authentication e non viene inclusa nei salvataggi.</p>
   </div>
  </div>}
 </>;
}