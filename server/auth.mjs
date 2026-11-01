const encoder=new TextEncoder();
export const normalizeUsername=value=>typeof value==='string'?value.normalize('NFKC').trim().toLowerCase():'';
export const validUsername=value=>/^[a-z0-9\u0621-\u064a0-9._-]{3,40}$/.test(value);
export const validPassword=value=>typeof value==='string'&&value.length>=10&&value.length<=128;
const hex=bytes=>[...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('');
const unhex=value=>Uint8Array.from(value.match(/../g)||[],b=>parseInt(b,16));
const random=()=>hex(crypto.getRandomValues(new Uint8Array(32)));
export const sha=async text=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(text)));
export async function passwordRecord(password,salt=random()){const key=await crypto.subtle.importKey('raw',encoder.encode(password),'PBKDF2',false,['deriveBits']);const hash=hex(await crypto.subtle.deriveBits({name:'PBKDF2',salt:unhex(salt),iterations:100000,hash:'SHA-256'},key,256));return {salt,hash}}
export async function verifyPassword(password,account){const result=await passwordRecord(password,account.password_salt);let difference=0;for(let i=0;i<64;i++)difference|=result.hash.charCodeAt(i)^account.password_hash.charCodeAt(i);return difference===0}
export function sessionCookie(token,request,expired=false){return `omar_club_session=${expired?'':token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${expired?0:604800}${new URL(request.url).protocol==='https:'?'; Secure':''}`}
export async function currentAccount(request,db){const token=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith('omar_club_session='))?.slice(18);if(!token||!/^[a-f0-9]{64}$/.test(token))return null;return db.prepare('SELECT a.* FROM accounts a JOIN sessions s ON s.account_id=a.id WHERE s.token_hash=? AND s.expires_at>?').bind(await sha(token),Date.now()).first()}
export const publicAccount=a=>({id:a.id,username:a.username,name:a.name,mustChangePassword:!!a.must_change_password});
export async function newSession(accountId,request,db){const token=random();await db.prepare('INSERT INTO sessions(token_hash,account_id,expires_at,created_at) VALUES(?,?,?,?)').bind(await sha(token),accountId,Date.now()+604800000,Date.now()).run();return sessionCookie(token,request)}
export async function revokeSessions(accountId,db){await db.prepare('DELETE FROM sessions WHERE account_id=?').bind(accountId).run()}
export async function tooMany(request,db,username,type='login'){
 const ip=request.headers.get('cf-connecting-ip')||'local',key=await sha(type+'|'+ip+'|'+username),entry=await db.prepare('SELECT * FROM auth_attempts WHERE key=?').bind(key).first();const window=type==='register'?3600000:900000,max=type==='register'?5:8;
 return {key,window,blocked:entry&&Date.now()-entry.window_start<window&&entry.attempts>=max};
}
export async function countAttempt(db,limit){await db.prepare('INSERT INTO auth_attempts(key,attempts,window_start) VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=CASE WHEN ?-auth_attempts.window_start>? THEN 1 ELSE auth_attempts.attempts+1 END,window_start=CASE WHEN ?-auth_attempts.window_start>? THEN ? ELSE auth_attempts.window_start END').bind(limit.key,Date.now(),Date.now(),limit.window,Date.now(),limit.window,Date.now()).run()}
