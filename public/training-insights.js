import {weekFor} from './workout-model.js';
import {defaultPlan} from './data.js';
export function dayDate(week,day){const d=new Date(week+'T12:00:00');d.setDate(d.getDate()+Number(day));return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export function priorRound(state,week,day,id,index){const p=new Date(week+'T12:00:00');p.setDate(p.getDate()-7);const key=dayDate(p.toISOString().slice(0,10),0);const set=state.logs[`${key}/${day}/${id}`]?.sets?.[index];return set?.done&&set.weight!==''&&set.reps!==''?set:null}
export function compareRound(current,previous){
 if(!previous)return 'لا توجد جولة مكتملة للمقارنة في الأسبوع السابق';
 const last=`الأسبوع السابق: ${previous.weight} كغم × ${previous.reps}`;
 if(!current?.done)return last;
 const w=+current.weight-+previous.weight,r=+current.reps-+previous.reps;
 if(w>0)return `${last} · الوزن +${Number(w.toFixed(2))} كغم${r<0?'، والتكرارات أقل':''}`;
 if(w<0)return `${last} · الوزن أقل بـ ${Number((-w).toFixed(2))} كغم${r>0?'، والتكرارات أعلى':''}`;
 return `${last} · ${r>0?'التكرارات +'+r:r<0?'التكرارات أقل بـ '+(-r):'نفس الأداء المسجّل'}`;
}
export function monthlyReport(state,month,today,id){
 const [year,m]=month.split('-').map(Number),days=new Date(year,m,0).getDate();let planned=0,completed=0,sets=0;const points=new Map();
 for(let n=1;n<=days;n++){const date=`${month}-${String(n).padStart(2,'0')}`;if(date>today)continue;const d=new Date(date+'T12:00:00'),week=weekFor(d),day=(d.getDay()+1)%7,plan=state.weeks[week]||state.plan||defaultPlan;if(plan[day]?.items.length){planned++;if(state.sessions[`${week}/${day}`]?.completed)completed++}}
 for(const [key,log]of Object.entries(state.logs||{})){const parts=key.split('/'),date=dayDate(log.week||parts[0],log.day??parts[1]),exerciseId=log.exerciseId||parts.at(-1);if(!date.startsWith(month)||date>today)continue;for(const set of Object.values(log.sets||{})){if(!set.done)continue;sets++;if(exerciseId===id&&set.weight!==''&&Number.isFinite(+set.weight))points.set(date,Math.max(points.get(date)??0,+set.weight))}}
 return {planned,completed,sets,adherence:planned?Math.round(completed/planned*100):0,points:[...points].sort(([a],[b])=>a.localeCompare(b)).map(([date,weight])=>({date,weight}))};
}
// Alternatives preserve the movement pattern where an equivalent exists; accessories are labelled separately.
export const alternatives={
 bench:[['incline-bench','ضغط بزاوية مختلفة؛ عدّل الوزن حسب الحركة']],
 'incline-bench':[['bench','ضغط أفقي؛ تختلف زاوية التركيز']],
 'pec-deck':[['bench','ضغط مركّب بدلاً من عزل الصدر؛ استخدم وصفته المعروضة']],
 row:[['kneeling-row','تجديف أحادي بالكابل؛ أدِّ الجانبين']],
 'kneeling-row':[['row','تجديف جالس بقبضة محايدة']],
 curl:[['barbell-curl','ثني المرفق بالبار'],['concentration','ثني مركّز؛ أدِّ الجانبين']],
 'barbell-curl':[['curl','ثني المرفق بالدمبل'],['concentration','ثني مركّز؛ أدِّ الجانبين']],
 concentration:[['curl','ثني المرفق بالدمبل']],
 triceps:[['kickback','مد المرفق بالدمبل'],['rope-overhead','مد المرفق فوق الرأس؛ زاوية مختلفة']],
 kickback:[['triceps','مد المرفق بالكابل']],
 'rope-overhead':[['triceps','دفع كابل؛ زاوية مختلفة']],
 shrug:[['smith-shrug','رفع الكتفين بالسميث']],
 'smith-shrug':[['shrug','رفع الكتفين بالدمبل']],
 'bar-rear':[['incline-reverse','فتح للكتف الخلفي بالدمبل؛ زاوية مختلفة']],
 'incline-reverse':[['reverse-cable','فتح خلفي بالكابل']],
 'reverse-cable':[['incline-reverse','فتح خلفي بالدمبل'],['band-pull','فتح بحبل مقاومة']],
 'band-pull':[['reverse-cable','فتح خلفي بالكابل']],
 'incline-t':[['incline-reverse','فتح خلفي بزاوية قريبة']],
 'incline-y':[['band-pull','بديل مساعد للكتف الخلفي؛ ليس نفس الحركة']],
 'bar-reverse':[['incline-reverse','فتح للكتف الخلفي بالدمبل؛ زاوية مختلفة']],
 squat:[['extension','عزل للفخذ الأمامي فقط؛ لا يعوض السكوات بالكامل']],
 extension:[['squat','حركة مركّبة؛ استخدم وصفة السكوات ولا تنقل وزن الجهاز']]
};
