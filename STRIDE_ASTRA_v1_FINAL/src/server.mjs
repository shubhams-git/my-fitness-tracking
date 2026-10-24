import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Store } from './store.mjs';
import { Security, seal, unseal } from './security.mjs';
import { id, today, day, text, number, normalizeActivity, normalizeFeedback, normalizeSleep, requireThat, InputError, sleepSummary } from './domain.mjs';
import { parseUpload, commitImport, mergeActivities, undoMerge } from './imports.mjs';
import { buildInsights } from './insights.mjs';
import { GarminClient, commitGarmin } from './garmin.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const assets=new Map([['/','index.html'],['/app.js','app.js'],['/styles.css','styles.css'],['/charts.js','charts.js'],['/analytics.js','analytics.js'],['/storage.js','storage.js'],['/sw.js','sw.js'],['/manifest.webmanifest','manifest.webmanifest'],['/icon.svg','icon.svg']]);
const mime={html:'text/html',js:'text/javascript',css:'text/css',svg:'image/svg+xml',webmanifest:'application/manifest+json'};
const live = rows => rows.filter(r=>!r.deleted&&!r.mergedInto);
export function appState(store,security){const activities=live(store.list('activity')).sort((a,b)=>b.date.localeCompare(a.date)),weights=live(store.list('weight')).sort((a,b)=>a.date.localeCompare(b.date)),sleeps=live(store.list('sleep')).sort((a,b)=>b.date.localeCompare(a.date)),feedback=live(store.list('feedback')),plans=live(store.list('plan')).sort((a,b)=>a.date.localeCompare(b.date));const settings=store.get('settings','owner')||{id:'owner',theme:'dark',morningPrompt:false,sleepTargetMinutes:null,timezone:'Australia/Melbourne'};
  const insights=buildInsights({activities,weights,sleeps,feedback,plans,settings,seen:store.list('insight-seen')});
  return {today:today(),activities:activities.map(({streams,...a})=>({...a,streamCount:streams?.length||0})),weights,sleeps,feedback,plans,settings,insights,sleepSummary:sleepSummary(sleeps,today(),7),imports:store.list('import').sort((a,b)=>b.at.localeCompare(a.at)),merges:store.list('merge').map(({before,...m})=>m),garmin:{configured:!!security.secret('garmin'),keyExpires:security.secret('garmin')?.expires||null,...store.get('connector','garmin')},version:'0.2.0'};
}
export function createApp({dataDir=process.env.STRIDE_DATA_DIR||join(root,'.stride-data'),port=Number(process.env.PORT)||4318,origin=process.env.STRIDE_ORIGIN||process.env.RENDER_EXTERNAL_URL,clock=()=>Date.now()}={}){
  requireThat(!origin||/^https:\/\//.test(origin),'STRIDE_ORIGIN must use HTTPS.');
  const store=new Store(join(dataDir,'stride.sqlite')),security=new Security(store,dataDir),pending=new Map();let syncing=false;
  const garmin=new GarminClient({getSecret:n=>security.secret(n),setSecret:(n,v)=>security.secret(n,v)});
  const allowed=new Set([`http://127.0.0.1:${port}`,`http://localhost:${port}`,...origin?[origin]:[]]);
  function json(res,value,status=200){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8'});res.end(JSON.stringify(value));}
  async function body(req){const chunks=[];let size=0;for await(const c of req){size+=c.length;requireThat(size<=50*1024*1024,'The request is too large.',413);chunks.push(c);}try{return JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');}catch{throw new InputError('The request is not valid JSON.');}}
  function preview(kind,value){const key=id();pending.set(key,{kind,value,expires:clock()+10*60000});return key;}
  function take(key,kind){const p=pending.get(key);requireThat(p&&p.kind===kind&&p.expires>clock(),'This preview expired. Select the file again.',409);return p.value;}
  const server=createServer(async(req,res)=>{
    res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Frame-Options','DENY');res.setHeader('Permissions-Policy','camera=(), microphone=(), geolocation=()');
    res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'; worker-src 'self'");
    if(origin)res.setHeader('Strict-Transport-Security','max-age=31536000');
    try{
      const host=req.headers.host;requireThat([...allowed].some(o=>new URL(o).host===host),'Host not allowed.',403);
      requireThat(req.headers['sec-fetch-site']!=='cross-site','Cross-site requests are not allowed.',403);
      if(req.headers.origin)requireThat(allowed.has(req.headers.origin),'Origin not allowed.',403);
      const path=new URL(req.url,'http://localhost').pathname;
      if(path==='/health'&&req.method==='GET'){json(res,{ok:true});return;}
      if(assets.has(path)&&['GET','HEAD'].includes(req.method)){const file=assets.get(path),data=await readFile(join(root,'web',file));res.setHeader('Content-Type',`${mime[file.split('.').at(-1)]}; charset=utf-8`);if(path==='/sw.js')res.setHeader('Service-Worker-Allowed','/');res.end(req.method==='HEAD'?'':data);return;}
      requireThat(path.startsWith('/api/'),'Not found.',404);
      const session=security.session(req.headers.cookie);
      if(path==='/api/auth'&&req.method==='GET'){json(res,{authenticated:!!session,csrf:session?.csrf||null});return;}
      if(path==='/api/login'&&req.method==='POST'){const data=await body(req),result=security.login(data.key,req.socket.remoteAddress);res.setHeader('Set-Cookie',`stride_session=${result.token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=2592000${origin?'; Secure':''}`);json(res,{csrf:result.csrf});return;}
      requireThat(session,'Unlock your private journal to continue.',401);
      if(!['GET','HEAD'].includes(req.method)){requireThat(req.headers['x-stride-csrf']===session.csrf,'Please reload before saving.',403);requireThat(req.headers['content-type']?.startsWith('application/json'),'Use a JSON request.',415);}
      if(path==='/api/state'&&req.method==='GET'){json(res,appState(store,security));return;}
      if(path==='/api/history'&&req.method==='GET'){const q=new URL(req.url,'http://localhost').searchParams;requireThat(['activity','sleep','weight','plan','feedback'].includes(q.get('kind')),'Choose a record type.');json(res,{revisions:store.db.prepare('SELECT body,revision,updated FROM revisions WHERE kind=? AND id=? ORDER BY revision DESC').all(q.get('kind'),q.get('id')).map(r=>({...JSON.parse(r.body),revision:r.revision,updated:r.updated}))});return;}
      if(path==='/api/weight'&&req.method==='POST'){const data=await body(req),old=store.get('weight',data.weight.id);requireThat(old,'Choose an existing weight record.');const w={...old,date:day(data.weight.date),kg:number(data.weight.kg,1,500,'Weight',false),note:text(data.weight.note)};w.overrides={date:w.date,kg:w.kg,note:w.note};json(res,store.mutate(data.mutationId,()=>store.put('weight',w,data.revision)));return;}
      if(path.startsWith('/api/activity/')&&req.method==='GET'){const a=store.get('activity',decodeURIComponent(path.slice(14)));requireThat(a,'Activity not found.',404);json(res,{activity:a,feedback:store.get('feedback',a.id),sources:(a.sources||[]).map(s=>({...s,name:store.db.prepare('SELECT name FROM sources WHERE hash=?').get(s.hash)?.name||'Manual record'}))});return;}
      if(path.startsWith('/api/source/')&&req.method==='GET'){const source=store.db.prepare('SELECT * FROM sources WHERE hash=?').get(path.slice(12));requireThat(source,'Source not found.',404);res.setHeader('Content-Disposition','attachment; filename="stride-source.json"');json(res,{name:source.name,hash:source.hash,raw:JSON.parse(source.body)});return;}
      requireThat(req.method==='POST','Not found.',404);
      const data=await body(req);
      if(path==='/api/logout'){security.logout(req.headers.cookie);res.setHeader('Set-Cookie','stride_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');json(res,{ok:true});return;}
      if(path==='/api/feedback'){const a=store.get('activity',data.activityId);requireThat(a&&!a.deleted,'Choose an existing session.');const f=normalizeFeedback(data.feedback,a.type);const result=store.mutate(data.mutationId,()=>store.put('feedback',{...f,id:a.id,activityId:a.id},data.revision??0));json(res,result);return;}
      if(path==='/api/activity'){const old=data.activity.id?store.get('activity',data.activity.id):null;const a=normalizeActivity({...old,...data.activity,provider:old?.provider||'Manual'});if(old&&old.provider!=='Manual'){const allowedKeys=['type','title','date','start','distanceKm','movingSeconds','reportedPaceSeconds','note','sets','gear'];a.overrides=Object.fromEntries(allowedKeys.filter(k=>k in data.activity).map(k=>[k,a[k]]));a.overrides={...old.overrides,...a.overrides};}json(res,store.mutate(data.mutationId,()=>store.put('activity',a,data.revision??0)));return;}
      if(path==='/api/sleep'){const old=data.sleep.id?store.get('sleep',data.sleep.id):null;const fields=Object.fromEntries(['id','type','date','start','end','startLocal','endLocal','disambiguation','durationMinutes','rest','note'].filter(k=>k in data.sleep).map(k=>[k,data.sleep[k]]));const n=normalizeSleep({...old,...fields,durationOrigin:old&&'durationMinutes'in fields&&Number(fields.durationMinutes)!==old.durationMinutes?'self-reported correction':old?.durationOrigin,provider:old?.provider||'Manual'});if(old?.provider==='Garmin')n.overrides={...old.overrides,...fields};json(res,store.mutate(data.mutationId,()=>store.put('sleep',n,data.revision??0)));return;}
      if(path==='/api/plan'){const p=data.plan;const old=p.id?store.get('plan',p.id):null;const status=p.status||'planned';requireThat(['planned','complete','partial','changed','skipped','moved'].includes(status),'Choose a valid plan status.');if(p.activityId)requireThat(store.get('activity',p.activityId),'Choose an existing activity.');const plan={id:p.id||id(),date:day(p.date),originalDate:old?.originalDate||old?.date||p.date,title:text(p.title,160),type:['run','strength','cardio'].includes(p.type)?p.type:'run',durationMinutes:number(p.durationMinutes,1,1440,'Planned minutes'),note:text(p.note),status,activityId:p.activityId||null,version:(old?.version||0)+1};requireThat(plan.title.trim(),'Give this session a name.');json(res,store.mutate(data.mutationId,()=>store.put('plan',plan,data.revision??0)));return;}
      if(path==='/api/settings'){const old=store.get('settings','owner')||{};const settings={...old,id:'owner',timezone:'Australia/Melbourne',theme:['light','dark','system'].includes(data.settings.theme)?data.settings.theme:old.theme||'dark',morningPrompt:!!data.settings.morningPrompt,sleepTargetMinutes:number(data.settings.sleepTargetMinutes,60,1440,'Sleep target'),showSpo2:!!data.settings.showSpo2};json(res,store.mutate(data.mutationId,()=>store.put('settings',settings,data.revision??0)));return;}
      if(path==='/api/archive'){requireThat(['activity','sleep','weight','plan'].includes(data.kind),'That record cannot be archived.');const old=store.get(data.kind,data.id);requireThat(old,'Record not found.',404);json(res,store.mutate(data.mutationId,()=>store.put(data.kind,{...old,deleted:!data.restore},data.revision)));return;}
      if(path==='/api/trash'){json(res,{records:['activity','sleep','weight','plan'].flatMap(kind=>store.list(kind).filter(r=>r.deleted).map(r=>({kind,...r})))});return;}
      if(path==='/api/seen'){const f=buildInsights(appState(store,security)).find(f=>f.id===data.id);if(f)store.put('insight-seen',{id:f.id,date:today()});json(res,{ok:true});return;}
      if(path==='/api/import/preview'){requireThat(typeof data.base64==='string','Choose a source file.');const raw=Buffer.from(data.base64,'base64'),name=text(data.name,250);const parsed=await parseUpload(name,raw);const key=preview('import',{parsed,name,raw});json(res,{key,kind:parsed.kind,weights:parsed.value?.weights?.filter(w=>!w.deletedAt).length||0,activities:parsed.activities?.length||parsed.value?.sessions?.filter(s=>!s.deletedAt).length||0,ignored:parsed.value?.sessions?.filter(s=>s.deletedAt).length||0,warnings:parsed.warnings||[]});return;}
      if(path==='/api/import/commit'){const p=take(data.key,'import');security.checkpoint('before-import');const result=commitImport(store,p.parsed,p.name,p.raw);pending.delete(data.key);json(res,result);return;}
      if(path==='/api/duplicates/keep'){const a=store.get('activity',data.id);requireThat(a,'Activity not found.');json(res,store.put('activity',{...a,pendingDuplicate:null,reviewedSeparate:true},data.revision));return;}
      if(path==='/api/duplicates/merge'){json(res,mergeActivities(store,data.keepId,data.removeId));return;}
      if(path==='/api/duplicates/undo'){json(res,undoMerge(store,data.id));return;}
      if(path==='/api/backup/export'){const result=seal(store.export(),data.passphrase);security.checkpoint('export');store.put('settings',{...(store.get('settings','owner')||{id:'owner',theme:'dark'}),lastBackup:new Date().toISOString()});json(res,result);return;}
      if(path==='/api/backup/preview'){const backup=unseal(data.backup,data.passphrase),summary=store.validateBackup(backup);json(res,{key:preview('restore',backup),summary});return;}
      if(path==='/api/backup/restore'){requireThat(data.confirm==='RESTORE','Type RESTORE to replace this journal from the backup.');const backup=take(data.key,'restore');security.checkpoint('before-restore');const result=store.restore(backup);pending.delete(data.key);json(res,result);return;}
      if(path==='/api/garmin/configure'){requireThat(typeof data.key==='string'&&data.key.length>=20&&data.key.length<=4096,'Enter a Garmin Personal API key.');let expires=null;if(data.expires){day(data.expires);expires=`${data.expires}T00:00:00Z`;requireThat(Date.parse(expires)>Date.now(),'Choose a future expiry date.');}security.secret('garmin',{key:data.key,expires});security.forget('garmin-token');store.put('connector',{id:'garmin',verified:false,lastSync:null});json(res,{configured:true,verified:false});return;}
      if(path==='/api/garmin/disconnect'){security.forget('garmin');security.forget('garmin-token');store.put('connector',{id:'garmin',verified:false,lastSync:null});json(res,{ok:true});return;}
      if(path==='/api/garmin/sync'){requireThat(!syncing,'A Garmin sync is already in progress.',409);const previous=store.get('connector','garmin');requireThat(!previous?.lastAttempt||Date.now()-Date.parse(previous.lastAttempt)>60000,'Wait a minute before syncing again.',429);syncing=true;try{store.put('connector',{...previous,id:'garmin',lastAttempt:new Date().toISOString()});const raw=await garmin.fetchRange(data.start,data.end);security.checkpoint('before-garmin');json(res,commitGarmin(store,raw,data.start,data.end));}finally{syncing=false;}return;}
      throw new InputError('Not found.',404);
    }catch(error){const status=error instanceof InputError?error.status:500;json(res,{error:status===500?'Something could not be saved. Your existing records are safe.':error.message,...error instanceof InputError?error.extra:{}},status);}
  });
  const cleanup=setInterval(()=>{for(const [k,p] of pending)if(p.expires<clock())pending.delete(k);store.db.prepare('DELETE FROM sessions WHERE expires<?').run(clock());},60000);cleanup.unref();
  server.on('close',()=>{clearInterval(cleanup);store.close();});
  return{server,store,security,dataDir,port};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){const app=createApp();const host=process.env.HOST||'127.0.0.1';app.security.checkpoint('startup');app.server.listen(app.port,host,()=>{console.log(`STRIDE Intelligence listening on ${host}:${app.port}`);console.log('Unlock with owner-key.txt inside the configured STRIDE_DATA_DIR. No credentials are printed.');});for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>app.server.close(()=>process.exit(0)));}
