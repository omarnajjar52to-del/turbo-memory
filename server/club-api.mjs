import {normalizeUsername,validUsername,validPassword,passwordRecord,verifyPassword,currentAccount,publicAccount,newSession,revokeSessions,tooMany,countAttempt,sessionCookie,sha} from './auth.mjs';
import {exercises,defaultPlan} from '../public/data.js';
import {foundationPlan,professionalPlan} from '../public/programs.js';
const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers});
class HttpError extends Error{constructor(status,message){super(message);this.status=status}}
const fail=(status,message)=>{throw new HttpError(status,message)};
const str=(v,max=100)=>typeof v==='string'?v.trim().slice(0,max):'';
const dateOK=v=>/^\d{4}-\d{2}-\d{2}$/.test(v||'')&&!Number.isNaN(Date.parse(v))&&new Date(v+'T12:00:00Z').toISOString().slice(0,10)===v;
const money=v=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=1000000000;
const camel=row=>row&&Object.fromEntries(Object.entries(row).map(([k,v])=>[k.replace(/_([a-z])/g,(_,c)=>c.toUpperCase()),v]));
const id=()=>crypto.randomUUID(),stamp=()=>new Date().toISOString();
export const today=()=>new Date().toLocaleDateString('en-CA',{timeZone:'Asia/Baghdad'});
const hash=async value=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(b=>b.toString(16).padStart(2,'0')).join('');
const makeToken=()=>[...crypto.getRandomValues(new Uint8Array(32))].map(b=>b.toString(16).padStart(2,'0')).join('');
const decodeName=request=>{const raw=request.headers.get('oai-authenticated-user-full-name')||'';try{return request.headers.get('oai-authenticated-user-full-name-encoding')==='percent-encoded-utf-8'?decodeURIComponent(raw):raw}catch{return ''}};
export function validProgram(program){return Array.isArray(program)&&program.length===7&&program.every(d=>d&&typeof d.title==='string'&&d.title.length<=60&&typeof d.desc==='string'&&d.desc.length<=250&&Array.isArray(d.items)&&d.items.length<=15&&new Set(d.items.map(r=>r.id)).size===d.items.length&&d.items.every(r=>exercises.some(e=>e.id===r.id)&&Number.isInteger(r.sets)&&r.sets>=1&&r.sets<=6&&(r.rest===undefined||(Number.isInteger(r.rest)&&r.rest>=30&&r.rest<=300))&&typeof r.reps==='string'&&r.reps.length<=16&&/^\d{1,3}(?:[–\-]\d{1,3})?$/.test(r.reps)))}
export async function handleClubRequest(request,db){
 if(!db)return json({error:'قاعدة البيانات غير متاحة مؤقتاً'},503);
 const url=new URL(request.url),route=url.pathname.replace(/^\/api\//,'');
 const one=(sql,...args)=>db.prepare(sql).bind(...args).first();const all=async(sql,...args)=>(await db.prepare(sql).bind(...args).all()).results||[];const q=(sql,...args)=>db.prepare(sql).bind(...args);
 try{
 let body={};if(request.method==='POST'){if(request.headers.get('origin')!==url.origin)fail(403,'مصدر الطلب غير مسموح');if(!request.headers.get('content-type')?.includes('application/json'))fail(415,'صيغة الطلب غير صحيحة');const raw=await request.text();if(raw.length>250000)fail(413,'الطلب كبير جداً');try{body=JSON.parse(raw)}catch{fail(400,'صيغة الطلب غير صحيحة')}}else if(request.method!=='GET')fail(405,'طريقة غير مسموحة');
 if(request.method==='POST'&&['login','register'].includes(route)){
  const username=normalizeUsername(body.username),password=body.password;if(!validUsername(username)||!validPassword(password))fail(400,'اسم الدخول من ٣ إلى ٤٠ حرفاً، وكلمة المرور من ١٠ إلى ١٢٨ حرفاً');
  const limit=await tooMany(request,db,route==='register'?'':username,route);if(limit.blocked)fail(429,'محاولات كثيرة. انتظر قليلاً ثم أعد المحاولة');await countAttempt(db,limit);
  if(route==='register'){
   const name=str(body.name,60);if(name.length<2)fail(400,'أدخل اسمك');if(await one('SELECT id FROM accounts WHERE username=?',username))fail(409,'اسم الدخول مستخدم بالفعل');const accountId=id(),record=await passwordRecord(password);await q('INSERT INTO accounts(id,username,name,password_hash,password_salt,must_change_password,created_at) VALUES(?,?,?,?,?,0,?)',accountId,username,name,record.hash,record.salt,stamp()).run();const cookie=await newSession(accountId,request,db);return new Response(JSON.stringify({user:{id:accountId,name,username,mustChangePassword:false}}),{status:201,headers:{...headers,'Set-Cookie':cookie}})
  }
  const account=await one('SELECT * FROM accounts WHERE username=?',username);if(!account){await passwordRecord(password,'0'.repeat(64));fail(401,'اسم الدخول أو كلمة المرور غير صحيحة')}if(!await verifyPassword(password,account))fail(401,'اسم الدخول أو كلمة المرور غير صحيحة');await q('DELETE FROM auth_attempts WHERE key=?',limit.key).run();const cookie=await newSession(account.id,request,db);return new Response(JSON.stringify({user:publicAccount(account)}),{headers:{...headers,'Set-Cookie':cookie}})
 }
 const account=await currentAccount(request,db);if(!account)return json({error:'أدخل اسم المستخدم وكلمة المرور لفتح حسابك',code:'sign_in_required'},401);const userId=account.id,user=publicAccount(account);
 if(request.method==='POST'&&route==='logout'){const token=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith('omar_club_session='))?.slice(18);if(token)await q('DELETE FROM sessions WHERE token_hash=?',await sha(token)).run();return new Response(JSON.stringify({ok:true}),{headers:{...headers,'Set-Cookie':sessionCookie('',request,true)}})}
 if(request.method==='GET'&&route==='session'){const memberships=await all('SELECT m.*,c.name as club_name,c.city as club_city FROM members m JOIN clubs c ON c.id=m.club_id WHERE m.user_id=? AND m.status != ? ORDER BY c.created_at',userId,'archived');return json({user,memberships:memberships.map(camel)})}
 if(request.method==='POST'&&route==='password'){
  if(!validPassword(body.oldPassword)||!validPassword(body.newPassword))fail(400,'كلمة المرور الجديدة لا تقل عن ١٠ أحرف');if(!await verifyPassword(body.oldPassword,account))fail(403,'كلمة المرور الحالية غير صحيحة');const record=await passwordRecord(body.newPassword);await db.batch([q('UPDATE accounts SET password_hash=?,password_salt=?,must_change_password=0 WHERE id=?',record.hash,record.salt,userId),q('DELETE FROM sessions WHERE account_id=?',userId)]);const cookie=await newSession(userId,request,db);return new Response(JSON.stringify({ok:true}),{headers:{...headers,'Set-Cookie':cookie}})
 }
 if(request.method==='POST'&&account.must_change_password)fail(403,'غيّر كلمة المرور المؤقتة أولاً من حسابك');
 if(request.method==='POST'&&route==='personal-space'){
  const existing=await one("SELECT c.id FROM clubs c JOIN members m ON m.club_id=c.id WHERE c.owner_id=? AND c.mode='personal' AND m.user_id=? AND m.role='member'",userId,userId);
  if(existing)return json({clubId:existing.id});
  if(!['beginner','advanced'].includes(body.level))fail(400,'اختر مستوى التدريب');
  const clubId=id(),memberId=id(),planId=id(),now=stamp(),level=body.level,title=level==='advanced'?'قوّتي · ٥ أيام':'بدايتي · ٣ أيام',program=level==='advanced'?professionalPlan:foundationPlan;
  await db.batch([
   q('INSERT INTO clubs(id,owner_id,name,mode,city,phone,currency,created_at) VALUES(?,?,?,?,?,?,?,?)',clubId,userId,'برنامجي الخاص','personal','','','IQD',now),
   q('INSERT INTO members(id,club_id,user_id,name,username,role,goal,start_date,end_date,fee,status,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',memberId,clubId,userId,user.name,user.username,'member','تدريب مستقل',today(),'9999-12-31',0,'active',now),
   q('INSERT INTO plans(id,club_id,name,goal,level,program_json,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)',planId,clubId,title,'بناء القوة',level,JSON.stringify(program),now,now),
   q('INSERT INTO assignments(member_id,club_id,plan_id,title,program_json,revision,assigned_by,assigned_at) VALUES(?,?,?,?,?,1,?,?)',memberId,clubId,planId,title,JSON.stringify(program),userId,now),
   q('INSERT INTO training_profiles(member_id,club_id,level,updated_at) VALUES(?,?,?,?)',memberId,clubId,level,now)
  ]);return json({clubId},201);
 }
 if(request.method==='POST'&&route==='clubs'){
  const name=str(body.name,60),city=str(body.city,50);if(name.length<3||!user.username)fail(400,'أدخل اسم النادي');const count=await one('SELECT count(*) n FROM clubs WHERE owner_id=?',userId);if(count.n>=5)fail(400,'يمكنك إدارة خمسة نوادٍ من هذا الحساب');
  const clubId=id(),memberId=id(),planId=id(),now=stamp(),end=new Date();end.setFullYear(end.getFullYear()+5);
  await db.batch([q('INSERT INTO clubs(id,owner_id,name,city,phone,currency,created_at) VALUES(?,?,?,?,?,?,?)',clubId,userId,name,city,str(body.phone,30),'IQD',now),q('INSERT INTO members(id,club_id,user_id,name,username,role,goal,start_date,end_date,fee,status,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',memberId,clubId,userId,str(user.name,60),user.username,'owner','إدارة النادي',today(),end.toISOString().slice(0,10),0,'active',now),q('INSERT INTO plans(id,club_id,name,goal,level,program_json,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)',planId,clubId,'بناء العضلات المتوازن · ٥ أيام','بناء العضلات','متقدم',JSON.stringify(defaultPlan),now,now)]);return json({clubId},201)
 }
 const clubId=str(body.clubId||url.searchParams.get('club'),70);if(!clubId)fail(400,'اختر النادي');const me=await one('SELECT * FROM members WHERE club_id=? AND user_id=? AND status!=?',clubId,userId,'archived');if(!me)fail(403,'ليس لديك صلاحية الدخول لهذا النادي');
 if(me.status==='paused'&&me.role==='trainer')fail(403,'حساب المدرب موقوف. راجع مالك النادي');
 const manages=['owner','trainer'].includes(me.role),owner=me.role==='owner';const target=async(memberId,requireMember=true,allowArchived=false)=>{const m=await one('SELECT * FROM members WHERE id=? AND club_id=?',str(memberId,70),clubId);if(!m||(!allowArchived&&m.status==='archived')||requireMember&&m.role!=='member')fail(404,'المشترك غير موجود');return m};const manager=()=>{if(!manages)fail(403,'هذه العملية للإدارة والمدرب فقط')};const onlyOwner=()=>{if(!owner)fail(403,'هذه العملية لمالك النادي فقط')};
 if(request.method==='GET'&&route==='club'){
  const club=camel(await one('SELECT * FROM clubs WHERE id=?',clubId));delete club.ownerId;const m=manages?await all('SELECT * FROM members WHERE club_id=? ORDER BY created_at DESC LIMIT 1500',clubId):[me];
  const plans=manages?await all('SELECT * FROM plans WHERE club_id=? ORDER BY updated_at DESC LIMIT 250',clubId):[];
  const assigned=manages?await all('SELECT * FROM assignments WHERE club_id=?',clubId):await all('SELECT * FROM assignments WHERE club_id=? AND member_id=?',clubId,me.id);
  const cutoff=new Date(Date.now()-90*86400000).toISOString().slice(0,10),scope=manages?'':' AND member_id=?',args=manages?[clubId,cutoff]:[clubId,cutoff,me.id];
  const logs=await all('SELECT * FROM workout_logs WHERE club_id=? AND week>=?'+scope+' ORDER BY updated_at DESC LIMIT 10000',...args),checkins=await all('SELECT * FROM checkins WHERE club_id=? AND date>=?'+scope+' ORDER BY date DESC LIMIT 5000',...args);
  const payments=owner?await all('SELECT * FROM payments WHERE club_id=? ORDER BY created_at DESC LIMIT 5000',clubId):me.role==='member'?await all('SELECT * FROM payments WHERE club_id=? AND member_id=? ORDER BY date DESC',clubId,me.id):[];
  const trainingProfiles=manages?await all('SELECT * FROM training_profiles WHERE club_id=?',clubId):await all('SELECT * FROM training_profiles WHERE club_id=? AND member_id=?',clubId,me.id);
  return json({user,club,trainingProfiles:trainingProfiles.map(camel),me:camel(me),members:m.map(camel),plans:plans.map(p=>({...camel(p),program:JSON.parse(p.program_json),programJson:undefined})),assignments:assigned.map(p=>({...camel(p),program:JSON.parse(p.program_json),programJson:undefined})),logs:logs.map(camel),checkins:checkins.map(camel),payments:payments.map(camel),windowDays:90})
 }
 if(request.method!=='POST')fail(404,'المسار غير موجود');
 if(route==='training-profile'){
  if(me.role!=='member')fail(403,'اختيار المستوى يخص حساب المشترك');
  if(!['beginner','advanced'].includes(body.level))fail(400,'اختر مبتدئ أو محترف');
  await q('INSERT INTO training_profiles(member_id,club_id,level,updated_at) VALUES(?,?,?,?) ON CONFLICT(member_id) DO UPDATE SET level=excluded.level,updated_at=excluded.updated_at',me.id,clubId,body.level,stamp()).run();return json({ok:true});
 }
 if(route==='members'){
  manager();const name=str(body.name,60),username=normalizeUsername(body.username),role=body.role==='trainer'?'trainer':'member';if(role==='trainer')onlyOwner();if(name.length<2||!validUsername(username)||!validPassword(body.password)||!dateOK(body.startDate)||!dateOK(body.endDate)||body.endDate<body.startDate||!money(body.fee))fail(400,'تحقق من الاسم واسم الدخول وكلمة المرور ومدة الاشتراك والرسوم');if(await one('SELECT id FROM accounts WHERE username=?',username))fail(409,'اسم الدخول مستخدم. اختر اسماً آخر');
  const memberId=id(),accountId=id(),record=await passwordRecord(body.password);await db.batch([q('INSERT INTO accounts(id,username,name,password_hash,password_salt,must_change_password,created_at) VALUES(?,?,?,?,?,1,?)',accountId,username,name,record.hash,record.salt,stamp()),q('INSERT INTO members(id,club_id,user_id,name,username,phone,notes,age,height,start_weight,role,goal,start_date,end_date,fee,status,created_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',memberId,clubId,accountId,name,username,str(body.phone,30),str(body.notes,1000),Number.isInteger(body.age)&&body.age>0&&body.age<120?body.age:null,typeof body.height==='number'&&body.height>0&&body.height<250?body.height:null,typeof body.startWeight==='number'&&body.startWeight>0&&body.startWeight<500?body.startWeight:null,role,str(body.goal,100),body.startDate,body.endDate,body.fee,'active',stamp())]);return json({memberId,username},201)
 }
 if(route==='member/update'){
  manager();const m=await target(body.memberId,false,true);if(m.role!=='member')onlyOwner();if(m.role==='owner')fail(400,'استخدم إعدادات النادي لتعديل ملف الإدارة');if(!dateOK(body.startDate)||!dateOK(body.endDate)||body.endDate<body.startDate||!money(body.fee)||!['active','paused','archived'].includes(body.status))fail(400,'تحقق من بيانات العضوية');await db.batch([q('UPDATE members SET name=?,goal=?,phone=?,notes=?,age=?,height=?,start_weight=?,start_date=?,end_date=?,fee=?,status=? WHERE id=? AND club_id=?',str(body.name,60)||m.name,str(body.goal,100),str(body.phone,30),str(body.notes,1000),Number.isInteger(body.age)&&body.age>0&&body.age<120?body.age:null,typeof body.height==='number'&&body.height>0&&body.height<250?body.height:null,typeof body.startWeight==='number'&&body.startWeight>0&&body.startWeight<500?body.startWeight:null,body.startDate,body.endDate,body.fee,body.status,m.id,clubId),q('UPDATE accounts SET name=? WHERE id=?',str(body.name,60)||m.name,m.user_id)]);return json({ok:true})
 }
 if(route==='reset-password'){
  manager();const m=await target(body.memberId,false);if(m.role==='owner')fail(403,'لا يمكن إعادة تعيين كلمة مرور المالك من هنا');if(m.role==='trainer')onlyOwner();if(!validPassword(body.password))fail(400,'كلمة المرور المؤقتة لا تقل عن ١٠ أحرف');const record=await passwordRecord(body.password);await db.batch([q('UPDATE accounts SET password_hash=?,password_salt=?,must_change_password=1 WHERE id=?',record.hash,record.salt,m.user_id),q('DELETE FROM sessions WHERE account_id=?',m.user_id)]);return json({ok:true})
 }
 if(route==='personal-program'){
  const space=await one("SELECT id FROM clubs WHERE id=? AND owner_id=? AND mode='personal'",clubId,userId);
  if(!space||me.role!=='member')fail(403,'تعديل البرنامج الخاص متاح لصاحب الحساب المستقل فقط');
  if(str(body.name,60).length<2||!validProgram(body.program))fail(400,'تحقق من اسم البرنامج والجولات والتكرارات');
  const assigned=await one('SELECT plan_id FROM assignments WHERE member_id=? AND club_id=?',me.id,clubId);if(!assigned)fail(400,'أنشئ برنامجك أولاً');
  const now=stamp(),program=JSON.stringify(body.program),title=str(body.name,60);
  await db.batch([q('UPDATE plans SET name=?,goal=?,level=?,program_json=?,updated_at=? WHERE id=? AND club_id=?',title,str(body.goal,100),str(body.level,30),program,now,assigned.plan_id,clubId),q('UPDATE assignments SET title=?,program_json=?,revision=revision+1,assigned_at=? WHERE member_id=? AND club_id=?',title,program,now,me.id,clubId),q('INSERT INTO assignment_versions(id,member_id,club_id,title,program_json,assigned_by,assigned_at) VALUES(?,?,?,?,?,?,?)',id(),me.id,clubId,title,program,userId,now)]);return json({ok:true});
 }
 if(route==='plans'){
  manager();if(str(body.name,60).length<2||!validProgram(body.program))fail(400,'تحقق من اسم البرنامج وتمارين الأيام السبعة والجولات والتكرارات');const planId=body.id?str(body.id,70):id(),existing=body.id?await one('SELECT id FROM plans WHERE id=? AND club_id=?',planId,clubId):null;if(body.id&&!existing)fail(404,'البرنامج غير موجود');const now=stamp();if(existing)await q('UPDATE plans SET name=?,goal=?,level=?,program_json=?,updated_at=? WHERE id=? AND club_id=?',str(body.name,60),str(body.goal,100),str(body.level,30),JSON.stringify(body.program),now,planId,clubId).run();else await q('INSERT INTO plans(id,club_id,name,goal,level,program_json,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)',planId,clubId,str(body.name,60),str(body.goal,100),str(body.level,30),JSON.stringify(body.program),now,now).run();return json({planId})
 }
 if(route==='assign'){
  manager();const m=await target(body.memberId),p=await one('SELECT * FROM plans WHERE id=? AND club_id=?',str(body.planId,70),clubId);if(!p)fail(404,'البرنامج غير موجود');const program=body.program||JSON.parse(p.program_json);if(!validProgram(program))fail(400,'البرنامج غير صالح');const title=str(body.title,60)||p.name,now=stamp(),programJson=JSON.stringify(program);await db.batch([q('INSERT INTO assignments(member_id,club_id,plan_id,title,program_json,revision,assigned_by,assigned_at) VALUES(?,?,?,?,?,1,?,?) ON CONFLICT(member_id) DO UPDATE SET plan_id=excluded.plan_id,title=excluded.title,program_json=excluded.program_json,revision=assignments.revision+1,assigned_by=excluded.assigned_by,assigned_at=excluded.assigned_at',m.id,clubId,p.id,title,programJson,userId,now),q('INSERT INTO assignment_versions(id,member_id,club_id,title,program_json,assigned_by,assigned_at) VALUES(?,?,?,?,?,?,?)',id(),m.id,clubId,title,programJson,userId,now)]);return json({ok:true})
 }
 if(route==='log'){
  if(me.role!=='member')fail(403,'سجل التدريب يخص حساب المشترك');if(me.status!=='active'||me.end_date<today())fail(403,'اشتراكك غير نشط. راجع إدارة النادي للتجديد');const a=await one('SELECT * FROM assignments WHERE member_id=? AND club_id=?',me.id,clubId);if(!a)fail(400,'لم يُعيّن برنامج لحسابك بعد');const program=JSON.parse(a.program_json),{week,day,exerciseId,round,weight,reps,done}=body;const start=new Date(week+'T12:00:00Z');const trainingDate=new Date(start);trainingDate.setUTCDate(start.getUTCDate()+day);if(!dateOK(week)||start.getUTCDay()!==6||!Number.isInteger(day)||day<0||day>6||trainingDate.toISOString().slice(0,10)>today()||Date.now()-start.getTime()>91*86400000)fail(400,'اختر يوم تدريب صالحاً خلال آخر ٩٠ يوماً');const r=program[day].items.find(r=>r.id===exerciseId);if(!r||!Number.isInteger(round)||round<0||round>=r.sets||!money(weight)||weight>1000||!Number.isInteger(reps)||reps<1||reps>1000||typeof done!=='boolean')fail(400,'تحقق من الجولة والوزن والتكرارات');await q('INSERT INTO workout_logs(member_id,club_id,week,day,exercise_id,round,weight,reps,done,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(member_id,week,day,exercise_id,round) DO UPDATE SET weight=excluded.weight,reps=excluded.reps,done=excluded.done,updated_at=excluded.updated_at',me.id,clubId,week,day,exerciseId,round,weight,reps,done?1:0,stamp()).run();return json({ok:true})
 }
 if(route==='checkin'){
  const m=me.role==='member'?me:await target(body.memberId);if(me.role!=='member')manager();if(m.status!=='active'||m.end_date<today())fail(403,'الاشتراك غير نشط');await q('INSERT INTO checkins(id,club_id,member_id,date,created_at) VALUES(?,?,?,?,?) ON CONFLICT(member_id,date) DO NOTHING',id(),clubId,m.id,today(),stamp()).run();return json({ok:true})
 }
 if(route==='payments'){
  onlyOwner();const m=await target(body.memberId);if(!money(body.amount)||body.amount<=0||!dateOK(body.date)||body.date>today())fail(400,'أدخل مبلغاً وتاريخاً صالحين');await q('INSERT INTO payments(id,club_id,member_id,amount,period_start,date,note,recorded_by,created_at) VALUES(?,?,?,?,?,?,?,?,?)',id(),clubId,m.id,body.amount,m.start_date,body.date,str(body.note,200),userId,stamp()).run();return json({ok:true})
 }
 if(route==='settings'){
  onlyOwner();const name=str(body.name,60);if(name.length<3)fail(400,'أدخل اسم النادي');await q('UPDATE clubs SET name=?,city=?,phone=? WHERE id=? AND owner_id=?',name,str(body.city,50),str(body.phone,30),clubId,userId).run();return json({ok:true})
 }
 fail(404,'المسار غير موجود');
 }catch(e){if(e instanceof HttpError)return json({error:e.message},e.status);if(String(e?.message).includes('UNIQUE constraint'))return json({error:'السجل موجود بالفعل. حدّث الصفحة وأعد المحاولة.'},409);console.error('club_api_error',route,e?.message);return json({error:'تعذّر إكمال العملية. أعد المحاولة.'},500)}
}
