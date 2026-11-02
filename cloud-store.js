import {normalizeState} from './workout-model.js?v=20261031-orange-02';
// GitHub Pages has no authenticated backend. Keep storage local and clearly labelled.
export class PrivateStore {
 constructor({onStatus,onRemote}){Object.assign(this,{onStatus,onRemote});this.ready=false;this.currentState=null;this.key='omar-fit-github-v4:'+new URL('.',document.baseURI).pathname;try{this.storage=window.localStorage}catch{this.storage=null}}
 read(key){try{const raw=this.storage?.getItem(key);return raw?JSON.parse(raw):null}catch{return null}}
 async boot(makeInitial){if(!this.storage)throw Error('storage');this.onStatus({mode:'loading',text:'جاري فتح سجلك على هذا الجهاز…'});const cached=this.read(this.key),legacy=this.read('omar-fit-v1');const state=normalizeState(cached?.state||(legacy?makeInitial(legacy):makeInitial()));this.ready=true;this.currentState=state;this.onRemote(state);this.save(state);return state}
 save(state){if(!this.ready)return;this.currentState=state;try{this.storage.setItem(this.key,JSON.stringify({state,savedAt:new Date().toISOString()}));this.onStatus({mode:'saved',text:'محفوظ على هذا الجهاز فقط'})}catch{this.onStatus({mode:'error',text:'لم يكتمل الحفظ على الجهاز — صدّر نسخة احتياطية الآن'})}}
 async flush(){if(this.currentState)this.save(this.currentState)}
}
