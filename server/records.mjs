const collections = new Set(['profile','template','weeks','logs','sessions','archives','settings']);
const headers = {'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'};
const json = (value,status=200)=>new Response(JSON.stringify(value),{status,headers});
export async function handleRecords(request,db) {
  const userId=request.headers.get('oai-authenticated-user-id');
  if(!userId) return json({error:'sign_in_required'},401);
  if(!db) return json({error:'storage_unavailable'},503);
  const url=new URL(request.url);
  try {
    if(request.method==='GET') {
      const cursor=Number(url.searchParams.get('cursor')||0);
      if(!Number.isInteger(cursor)||cursor<0||cursor>100000) return json({error:'invalid_cursor'},400);
      const result=await db.prepare('SELECT collection, record_key, value_json, updated_at, version FROM fitness_records WHERE user_id = ? ORDER BY collection, record_key LIMIT 501 OFFSET ?').bind(userId,cursor).all();
      const rows=result.results||[];
      return json({user:{id:userId},records:rows.slice(0,500).map(r=>({collection:r.collection,key:r.record_key,value:JSON.parse(r.value_json),updatedAt:r.updated_at,version:r.version})),nextCursor:rows.length>500?cursor+500:null});
    }
    if(request.method!=='POST') return json({error:'method_not_allowed'},405);
    if(request.headers.get('origin')!==url.origin) return json({error:'invalid_origin'},403);
    if(!request.headers.get('content-type')?.includes('application/json')) return json({error:'json_required'},415);
    if(Number(request.headers.get('content-length')||0)>1048576) return json({error:'too_large'},413);
    const raw=await request.text();if(raw.length>1048576)return json({error:'too_large'},413);
    let body;try{body=JSON.parse(raw)}catch{return json({error:'invalid_json'},400)}
    if(!Array.isArray(body.operations)||body.operations.length<1||body.operations.length>20)return json({error:'invalid_operations'},400);
    const now=new Date().toISOString();const statements=[];
    for(const op of body.operations){
      if(typeof op.id!=='string'||! /^[a-zA-Z0-9-]{16,80}$/.test(op.id)||!collections.has(op.collection)||typeof op.key!=='string'||! /^[a-zA-Z0-9_/.:~-]{1,180}$/.test(op.key)||['__proto__','prototype','constructor'].includes(op.key)||op.value===undefined||op.value===null)return json({error:'invalid_operation'},400);
      const value=JSON.stringify(op.value);if(value.length>262144)return json({error:'record_too_large'},413);
      statements.push(db.prepare('INSERT INTO fitness_changes (user_id,operation_id,collection,record_key,value_json,created_at,applied) VALUES (?,?,?,?,?,?,0) ON CONFLICT(user_id,operation_id) DO NOTHING').bind(userId,op.id,op.collection,op.key,value,now));
      statements.push(db.prepare('INSERT INTO fitness_records (user_id,collection,record_key,value_json,updated_at,version,last_operation) SELECT ?,?,?,?,?,1,? WHERE EXISTS (SELECT 1 FROM fitness_changes WHERE user_id=? AND operation_id=? AND applied=0) ON CONFLICT(user_id,collection,record_key) DO UPDATE SET value_json=excluded.value_json, updated_at=excluded.updated_at, version=fitness_records.version+1, last_operation=excluded.last_operation').bind(userId,op.collection,op.key,value,now,op.id,userId,op.id));
      statements.push(db.prepare('UPDATE fitness_changes SET applied=1 WHERE user_id=? AND operation_id=?').bind(userId,op.id));
    }
    await db.batch(statements);
    return json({saved:body.operations.map(op=>op.id),savedAt:now});
  } catch {return json({error:'storage_error'},503)}
}
