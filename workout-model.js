import {defaultPlan,exercises} from './data.js?v=20261031-orange-02';
export const schemaVersion=4;
const clone=x=>structuredClone(x);
export const weekFor=(date=new Date())=>{const parts=date.toLocaleDateString('en-CA',{timeZone:'Asia/Baghdad'}).split('-').map(Number),d=new Date(parts[0],parts[1]-1,parts[2],12);d.setDate(d.getDate()-(d.getDay()+1)%7);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
export function createInitialState(legacy=null){
 const state={name:legacy?.name||'عمر النجار',plan:clone(defaultPlan),planRevision:'weekly-private-v4',weeks:{},logs:{},sessions:{},archives:{},settings:{schemaVersion}};
 if(!legacy)return state;
 state.archives['legacy-before-private-v4']=clone(legacy);
 for(const [key,log] of Object.entries(legacy.logs||{})){
  const parts=key.split('/');let week,day,id;if(parts.length===4)[week,,day,id]=parts;else if(parts.length===3)[week,day,id]=parts;else continue;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(week)||!exercises.some(e=>e.id===id)||Number(day)<0||Number(day)>6)continue;
  const sets=log.sets?clone(log.sets):{};if(!log.sets)(log.done||[]).forEach((done,i)=>sets[i]={weight:String(log.weight??''),reps:'',done:!!done,updatedAt:week+'T12:00:00.000Z'});
  state.logs[`${week}/${day}/${id}`]={...log,week,day:Number(day),exerciseId:id,sets,updatedAt:log.updatedAt||week+'T12:00:00.000Z'};
  if(week<weekFor()&&!state.weeks[week])state.weeks[week]=clone(legacy.plan||defaultPlan);
 }
 for(const [key,value]of Object.entries(legacy.sessions||{})){const parts=key.split('/');const week=parts[0],day=parts.at(-1);if(/^\d{4}-\d{2}-\d{2}$/.test(week)&&/^[0-6]$/.test(day))state.sessions[week+'/'+day]={...value,completed:value.completed!==false};}
 return state;
}
export function normalizeState(input){
 if(input?.settings?.schemaVersion!==schemaVersion)return createInitialState(input);
 const state={...input};state.name=typeof state.name==='string'?state.name.slice(0,40):'عمر النجار';state.plan=validPlan(state.plan)?state.plan:clone(defaultPlan);
 for(const key of ['weeks','logs','sessions','archives','settings'])if(!state[key]||typeof state[key]!=='object'||Array.isArray(state[key]))state[key]={};
 for(const [key,plan]of Object.entries(state.weeks))if(!validPlan(plan)){state.archives['invalid-plan-'+key]=plan;state.weeks[key]=clone(defaultPlan)}
 state.settings.schemaVersion=schemaVersion;return state;
}
export function validPlan(plan){return Array.isArray(plan)&&plan.length===7&&plan.every(d=>d&&typeof d.title==='string'&&Array.isArray(d.items)&&d.items.length<=60&&d.items.every(r=>exercises.some(e=>e.id===r.id)&&Number.isInteger(r.sets)&&r.sets>=1&&r.sets<=6&&typeof r.reps==='string'&&r.reps.length<=16))}
export function ensureWeek(state,week){if(!state.weeks[week]){const prior=Object.keys(state.weeks).filter(k=>k<week).sort().at(-1);state.weeks[week]=clone(prior?state.weeks[prior]:state.plan)}return state.weeks[week]}
export function latestWeight(state,id,beforeWeek){
 const candidates=[];for(const [key,l]of Object.entries(state.logs||{})){const week=l.week||key.split('/')[0],exerciseId=l.exerciseId||key.split('/').at(-1);if(exerciseId!==id||week>=beforeWeek)continue;for(const set of Object.values(l.sets||{}))if(set.weight!==''&&set.weight!==undefined&&set.weight!==null&&Number.isFinite(+set.weight))candidates.push({weight:String(set.weight),week,updatedAt:set.updatedAt||l.updatedAt||week})}
 return candidates.sort((a,b)=>b.week.localeCompare(a.week)||b.updatedAt.localeCompare(a.updatedAt))[0]||null;
}
export function mergeBackup(current,incoming){
 const next=clone(current),copy=normalizeState(incoming);for(const root of ['weeks','logs','sessions','archives'])for(const [key,value]of Object.entries(copy[root]||{})){if(!next[root][key]||(root==='logs'&&(value.updatedAt||'')>(next[root][key].updatedAt||'')))next[root][key]=clone(value)}
 for(const [key,value]of Object.entries(copy.settings||{}))if(key.startsWith('note-')&&next.settings[key]===undefined)next.settings[key]=clone(value);
 next.archives['import-'+Date.now()]=copy;return next;
}
