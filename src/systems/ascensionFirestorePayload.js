/**
 * Firestore rejects undefined at ANY depth (even if most of the room is
 * valid). Native combat teams inherit optional JS properties from the
 * original character/move catalog, e.g. zodiacSpiritId: undefined.
 *
 * This boundary returns a fresh JSON-compatible value for tx.update().
 * Object keys with undefined are omitted; undefined array slots become null.
 * It does not alter the in-memory battle or remove valid 0/false/null data.
 */
export function ascensionFirestorePayload(ascension){
 if(!ascension||typeof ascension!=='object')throw new TypeError('Ascesa non valida.');
 const active=new WeakSet();
 const copy=(value,path)=>{
  if(value==null||typeof value==='string'||typeof value==='boolean')return value;
  if(typeof value==='number'){
   if(!Number.isFinite(value))throw new TypeError('Numero non valido in '+path);
   return value;
  }
  if(value===undefined||typeof value==='function')return undefined;
  if(typeof value!=='object')throw new TypeError('Tipo non serializzabile in '+path);
  if(active.has(value))throw new TypeError('Riferimento circolare in '+path);
  active.add(value);
  let result;
  if(Array.isArray(value)){
   result=value.map((v,i)=>{
    const cleaned=copy(v,path+'['+i+']');
    return cleaned===undefined?null:cleaned;
   });
  }else if(value instanceof Date){
   result=value.toISOString();
  }else{
   result={};
   for(const [key,entry] of Object.entries(value)){
    const cleaned=copy(entry,path+'.'+key);
    if(cleaned!==undefined)result[key]=cleaned;
   }
  }
  active.delete(value);
  return result;
 };
 return copy(ascension,'ascension');
}
