const CACHE='omar-fit-private-cache-v4';
const roots=['weeks','logs','sessions','archives','settings'];
export function flattenState(state){
 const records=[{collection:'profile',key:'value',value:{name:state.name}},{collection:'template',key:'value',value:{plan:state.plan,planRevision:state.planRevision}}];
 for(const root of roots)for(const [key,value] of Object.entries(state[root]||{}))if(value!==null&&value!==undefined)records.push({collection:root,key,value});
 return records;
}
export function inflateState(records){
 const state={weeks:{},logs:{},sessions:{},archives:{},settings:{}};
 for(const r of records){if(['__proto__','constructor','prototype'].includes(r.key))continue;if(r.collection==='profile')state.name=r.value.name;else if(r.collection==='template'){state.plan=r.value.plan;state.planRevision=r.value.planRevision}else if(roots.includes(r.collection))state[r.collection][r.key]=r.value}
 return state;
}
export class PrivateStore {
 constructor({onStatus,onRemote}){this.onStatus=onStatus;this.onRemote=onRemote;this.pending=[];this.baseline=new Map();this.inflight=new Set();this.ready=false;this.preview=false;this.userId=null;this.running=false;this.timer=null;window.addEventListener('online',()=>this.flush());window.addEventListener('pagehide',()=>this.flush(true));}
 status(mode,text){this.onStatus?.({mode,text})}
 read(key,fallback){try{return JSON.parse(localStorage.getItem(key))||fallback}catch{return fallback}}
 cache(state){if(!this.userId&&!this.preview)return;try{localStorage.setItem(this.cacheKey,JSON.stringify({state,pending:this.pending,userId:this.userId}));}catch{this.status('error','تعذّر حفظ النسخة الاحتياطية على الجهاز. صدّر سجلك.')}}
 async boot(makeInitial){
  this.status('loading','جاري فتح سجلك الخاص…');
  try{
   const records=[];let cursor=0,user;
   do{const r=await fetch('/api/records'+(cursor?'?cursor='+cursor:''),{cache:'no-store',credentials:'same-origin'});if(!r.ok)throw new Error(r.status===401?'auth':'network');const d=await r.json();user=d.user;records.push(...d.records);cursor=d.nextCursor}while(cursor!==null);
   this.userId=user.id;this.cacheKey=CACHE+':'+user.id;const cached=this.read(this.cacheKey,{});this.pending=Array.isArray(cached.pending)?cached.pending:[];
   const map=new Map(records.map(r=>[r.collection+'/'+r.key,r]));for(const op of this.pending)map.set(op.collection+'/'+op.key,op);
   const legacyOwner=localStorage.getItem('omar-fit-legacy-import-owner');
   const legacy=!legacyOwner||legacyOwner===user.id?this.read('omar-fit-v1',null):null;
   let state=records.length||this.pending.length?inflateState([...map.values()]):makeInitial(legacy);
   this.baseline=new Map(records.map(r=>[r.collection+'/'+r.key,JSON.stringify(r.value)]));this.ready=true;this.status('saving','قيد حفظ سجلك الخاص…');this.onRemote?.(state);this.save(state);
   localStorage.setItem('omar-fit-legacy-import-owner',user.id);
   if(!this.pending.length)this.status('saved','تم الحفظ في حسابك');
   return state;
  }catch(error){
   if(document.querySelector('meta[name="storage-mode"]')?.content==='preview'){
    this.preview=true;this.cacheKey=CACHE+':preview';const cached=this.read(this.cacheKey,{});const state=cached.state||makeInitial(this.read('omar-fit-v1',null));this.ready=true;this.onRemote?.(state);this.status('preview','معاينة محلية — الحفظ على هذا الجهاز فقط');this.save(state);return state;
   }
   this.status('error',error.message==='auth'?'سجّل الدخول بحسابك لفتح بياناتك الخاصة.':'تعذّر الاتصال بسجلك. أعد المحاولة؛ بياناتك المحفوظة باقية.');throw error;
  }
 }
 save(state){
  if(!this.ready)return;
  if(this.preview){this.cache(state);return}
  for(const r of flattenState(state)){
   const key=r.collection+'/'+r.key,value=JSON.stringify(r.value);if(this.baseline.get(key)===value)continue;
   this.pending=this.pending.filter(op=>op.collection+'/'+op.key!==key||this.inflight.has(op.id));
   this.pending.push({...r,id:crypto.randomUUID()});this.baseline.set(key,value);
  }
  this.currentState=state;this.cache(state);if(this.pending.length){this.status('saving','قيد الحفظ…');clearTimeout(this.timer);this.timer=setTimeout(()=>this.flush(),700)}
 }
 async flush(keepalive=false){
  if(this.preview||!this.ready||this.running||!this.pending.length)return;
  this.running=true;clearTimeout(this.timer);this.timer=null;let savedOk=false;const batch=[];let bytes=0;for(const op of this.pending){const len=JSON.stringify(op).length;if(batch.length&&(batch.length>=20||bytes+len>45000))break;batch.push(op);bytes+=len}
  this.inflight=new Set(batch.map(op=>op.id));this.status('saving','قيد الحفظ في حسابك…');
  try{
   const r=await fetch('/api/records',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({operations:batch}),keepalive:keepalive&&bytes<45000});if(!r.ok)throw new Error('save_failed');const d=await r.json();savedOk=true;const saved=new Set(d.saved);this.pending=this.pending.filter(op=>!saved.has(op.id));this.cache(this.currentState);
   this.status(this.pending.length?'saving':'saved',this.pending.length?'استكمال الحفظ…':'تم الحفظ في حسابك');
  }catch{this.status('queued','محفوظ على جهازك وبانتظار الاتصال. أعد المحاولة.');clearTimeout(this.timer);this.timer=setTimeout(()=>this.flush(),15000)}
  finally{this.running=false;this.inflight.clear()}
  if(this.pending.length&&savedOk){clearTimeout(this.timer);this.timer=setTimeout(()=>this.flush(),100)}
 }
}
