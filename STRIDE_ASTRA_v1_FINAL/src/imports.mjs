import { parse } from 'csv-parse/sync';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { Decoder, Stream } from '@garmin/fitsdk';
import yauzl from 'yauzl';
import { gunzipSync } from 'node:zlib';
import { normalizeActivity, activityMatch, digest, id, day, localDay, localInstant, instant, ZONE, requireThat, InputError, number } from './domain.mjs';

const nonzero = n => Number.isFinite(Number(n)) && Number(n)>0 ? Number(n) : null;
const array = v => v == null ? [] : Array.isArray(v) ? v : [v];
const utc = v => v == null ? null : new Date(v instanceof Date||typeof v==='number'?v:/Z$|[+-]\d\d:\d\d$/.test(String(v))?v:String(v).replace(' ','T')+'Z').toISOString();

export function upsertActivity(store,input,sourceHash) {
  const a=normalizeActivity(input),externalId=String(a.externalId||a.id),provider=a.provider;
  let existing=store.byAlias(provider,externalId);
  let candidate=null;
  if(!existing) {
    for(const other of store.list('activity').filter(x=>!x.deleted&&!x.mergedInto&&!x.pendingDuplicate)) {
      if(other.sources?.some(s=>s.hash===sourceHash && s.externalId===externalId)){existing=other;break;}
      if(other.provider===provider && other.externalId!==externalId)continue;
      const match=activityMatch(a,other);
      if(match==='exact-timing'){existing=other;break;}
      if(match==='review')candidate=other.id;
    }
  }
  const source={provider,externalId,hash:sourceHash};
  const oldSources=existing?.sources||[];
  const sources=[...oldSources.filter(s=>!(s.provider===provider&&s.externalId===externalId)),source];
  let combined=existing?{...existing}:{};
  for(const [key,value] of Object.entries(a)) {
    if(value!==null&&value!==undefined&&value!==''&&(!Array.isArray(value)||value.length))combined[key]=value;
  }
  // Keep user corrections separate from imported source values, and never infer feedback from prose.
  combined={...combined,...existing?.overrides,id:existing?.id||a.id,sources,pendingDuplicate:existing?existing.pendingDuplicate:candidate,sourceHash};
  const changed=!existing||digest({...existing,revision:undefined,updated:undefined})!==digest({...combined,revision:undefined,updated:undefined});
  const result=changed?store.put('activity',combined):existing;
  store.alias(provider,externalId,result.id);
  return {id:result.id,action:!existing?'added':changed?'updated':'matched',pending:!!result.pendingDuplicate};
}
export function importMass(store,mass,hash) {
  requireThat(Array.isArray(mass.weights)&&Array.isArray(mass.sessions),'Choose a MASS JSON export containing weights and sessions.');
  let added=0,updated=0,matched=0,ignored=0;
  for(const w of mass.weights) {
    requireThat(w.id!==undefined,'A weight record has no stable ID.');const record={id:`mass:${w.id}`,sourceId:String(w.id),date:day(w.dateKey),kg:number(w.kg,1,500,'Weight',false),note:typeof w.note==='string'?w.note:'',provider:'MASS',sourceHash:hash,deleted:!!w.deletedAt};
    const old=store.get('weight',record.id);if(old?.overrides)Object.assign(record,old.overrides,{overrides:old.overrides});const changed=!old||digest({...old,revision:undefined,updated:undefined})!==digest(record);if(!old)added++;else if(changed)updated++;else matched++;
    if(changed)store.put('weight',record);
  }
  for(const s of mass.sessions){requireThat(s.id!==undefined,'A session has no stable ID.');if(s.deletedAt){const old=store.byAlias('MASS',String(s.id));if(old)store.put('activity',{...old,deleted:true});ignored++;continue;}
    const title=typeof s.focus==='string'?s.focus:'Gym / cardio';
    const result=upsertActivity(store,{id:`mass:${s.id}`,externalId:String(s.id),provider:'MASS',type:/cardio|walk|cycl/i.test(title)?'cardio':'strength',date:day(s.dateKey),title,movingSeconds:nonzero(s.mins)?Number(s.mins)*60:null,note:typeof s.note==='string'?s.note:'',distanceKm:null},hash);
    if(result.action==='added')added++;else if(result.action==='updated')updated++;else matched++;
  }
  return {added,updated,matched,ignored};
}
function parseDate(value) {
  const d=new Date(/^[A-Za-z]{3} \d/.test(value)?`${value} UTC`:/Z$|[+-]\d\d:?\d\d$/.test(value)?value:String(value).replace(' ','T')+'Z');
  requireThat(!Number.isNaN(+d),'The activity date could not be read.');return d.toISOString();
}
export function parseStravaCSV(content) {
  const rows=parse(content,{columns:false,bom:true,skip_empty_lines:true,relax_column_count:true});
  requireThat(rows.length>0,'The CSV is empty.');const header=rows.shift();requireThat(header.includes('Activity ID')&&header.includes('Activity Date'),'Choose Strava’s activities.csv.');
  return rows.map((r,i)=>{const read=(label,last=false)=>{const k=last?header.lastIndexOf(label):header.indexOf(label);return k<0?null:r[k];};
    // Archive contains a rounded km column and (in newer exports) a second distance in metres.
    const distanceColumns=header.map((v,j)=>v==='Distance'?j:-1).filter(j=>j>=0);
    const metres=distanceColumns.length>1?nonzero(r[distanceColumns.at(-1)]):null;
    const distanceKm=metres?metres/1000:nonzero(read('Distance'));
    const start=parseDate(read('Activity Date'));const kind=read('Activity Type')||'';
    const duration=nonzero(read('Moving Time',true))||nonzero(read('Elapsed Time',true));
    const speed=nonzero(read('Average Speed',true));
    return {id:`strava:${read('Activity ID')}`,externalId:read('Activity ID'),provider:'Strava',type:/run/i.test(kind)?'run':/weight|strength|workout/i.test(kind)?'strength':'cardio',title:read('Activity Name')||kind,start,date:localDay(start),distanceKm,movingSeconds:duration,reportedPaceSeconds:speed?1000/speed:null,heartRate:nonzero(read('Average Heart Rate',true)),elevationGainM:nonzero(read('Elevation Gain',true)),note:read('Activity Description')||'',filename:read('Filename'),csvRow:i+2};
  });
}
export function parseFit(buffer,name) {
  const decoder=new Decoder(Stream.fromByteArray(buffer));requireThat(decoder.isFIT()&&decoder.checkIntegrity(),'The FIT file is incomplete or its checksum is invalid.');const {messages,errors}=decoder.read();requireThat(!errors.length,'The FIT file could not be fully decoded.');
  const sessions=messages.sessionMesgs||[];requireThat(sessions.length>0,'This FIT file contains no activity sessions.');
  return sessions.map((s,i)=>{const start=utc(s.startTime),distanceKm=nonzero(s.totalDistance)?s.totalDistance/1000:null;
    return {id:`fit:${digest(buffer).slice(0,20)}:${i}`,externalId:`${digest(buffer)}:${i}`,provider:'FIT',type:s.sport==='running'?'run':s.sport==='training'?'strength':'cardio',title:`${s.sport||'Activity'} · FIT`,start,date:start?localDay(start):localDay(utc(s.timestamp)),distanceKm,movingSeconds:nonzero(s.totalTimerTime),reportedPaceSeconds:nonzero(s.avgSpeed)?1000/s.avgSpeed:null,heartRate:nonzero(s.avgHeartRate),cadence:null,elevationGainM:s.totalAscent??null,steps:null,filename:name,
      splits:(messages.lapMesgs||[]).filter(l=>!l.startTime||!s.startTime||l.startTime>=s.startTime&&l.startTime<=s.timestamp).filter(l=>nonzero(l.totalDistance)).map(l=>({distanceKm:l.totalDistance/1000,paceSeconds:nonzero(l.avgSpeed)?1000/l.avgSpeed:nonzero(l.totalTimerTime)?l.totalTimerTime/(l.totalDistance/1000):null,durationSeconds:l.totalTimerTime,origin:'FIT lap'})),
      streams:(messages.recordMesgs||[]).filter(r=>r.timestamp&&(!s.startTime||r.timestamp>=s.startTime&&r.timestamp<=s.timestamp)).map(r=>({time:utc(r.timestamp),distanceM:r.distance??null,heartRate:nonzero(r.heartRate),speedMps:r.enhancedSpeed??r.speed??null,cadenceCyclesPerMin:r.cadence??null,elevationM:r.enhancedAltitude??r.altitude??null,powerW:r.power??null,lat:r.positionLat==null?null:r.positionLat*180/2**31,lon:r.positionLong==null?null:r.positionLong*180/2**31})),
    };});
}
function haversine(a,b){const rad=x=>x*Math.PI/180,dlat=rad(b.lat-a.lat),dlon=rad(b.lon-a.lon);return 6371000*2*Math.asin(Math.sqrt(Math.sin(dlat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dlon/2)**2));}
export function parseXML(content,name) {
  requireThat(!/<!DOCTYPE|<!ENTITY/i.test(content),'XML entity declarations are not supported.');requireThat(XMLValidator.validate(content)===true,'The XML file is malformed.');
  const doc=new XMLParser({ignoreAttributes:false,attributeNamePrefix:'@',removeNSPrefix:true}).parse(content);
  if(doc.TrainingCenterDatabase){return array(doc.TrainingCenterDatabase.Activities?.Activity).map((a,i)=>{const laps=array(a.Lap),points=laps.flatMap(l=>array(l.Track).flatMap(t=>array(t.Trackpoint))),start=utc(points.find(p=>p.Time)?.Time||a.Id);const distanceM=laps.reduce((n,l)=>n+(Number(l.DistanceMeters)||0),0),duration=laps.reduce((n,l)=>n+(Number(l.TotalTimeSeconds)||0),0);return{id:`tcx:${digest(content).slice(0,20)}:${i}`,provider:'TCX',type:a['@Sport']==='Running'?'run':'cardio',title:a.Notes||'Imported activity',start,date:localDay(start),distanceKm:distanceM?distanceM/1000:null,movingSeconds:duration||null,filename:name,splits:laps.filter(l=>l.DistanceMeters>0).map(l=>({distanceKm:l.DistanceMeters/1000,paceSeconds:l.TotalTimeSeconds/(l.DistanceMeters/1000),durationSeconds:l.TotalTimeSeconds,origin:'TCX lap'})),streams:points.map(p=>({time:p.Time?utc(p.Time):null,distanceM:p.DistanceMeters??null,heartRate:nonzero(p.HeartRateBpm?.Value),elevationM:p.AltitudeMeters??null,lat:p.Position?.LatitudeDegrees??null,lon:p.Position?.LongitudeDegrees??null}))};});}
  requireThat(doc.gpx,'Choose a GPX or TCX activity file.');const tracks=array(doc.gpx.trk);requireThat(tracks.length,'The GPX contains no tracks.');
  return tracks.map((t,i)=>{const points=array(t.trkseg).flatMap((s,segment)=>array(s.trkpt).map(p=>({...p,segment}))).map(p=>({segment:p.segment,lat:Number(p['@lat']),lon:Number(p['@lon']),time:p.time?utc(p.time):null,elevationM:p.ele??null,heartRate:nonzero(p.extensions?.TrackPointExtension?.hr)}));requireThat(points.length&&points.every(p=>Number.isFinite(p.lat)&&Math.abs(p.lat)<=90&&Number.isFinite(p.lon)&&Math.abs(p.lon)<=180),'The GPX has invalid coordinates.');const start=points.find(p=>p.time)?.time;requireThat(start,'The GPX needs timestamps to identify this activity.');let meters=0;points.forEach((p,j)=>{if(j&&p.segment===points[j-1].segment)meters+=haversine(points[j-1],p);p.distanceM=meters;});return{id:`gpx:${digest(content).slice(0,20)}:${i}`,provider:'GPX',type:'run',title:t.name||'Imported GPS activity',start,date:localDay(start),distanceKm:meters?meters/1000:null,movingSeconds:null,elapsedSeconds:points.at(-1).time?(Date.parse(points.at(-1).time)-Date.parse(start))/1000:null,distanceOrigin:'sum of recorded GPS segment distances',filename:name,streams:points};});
}
async function unzip(buffer) {
  return new Promise((resolve,reject)=>yauzl.fromBuffer(buffer,{lazyEntries:true,validateEntrySizes:true},(error,zip)=>{
    if(error)return reject(new InputError('The ZIP archive could not be opened.'));const files=[];let total=0,count=0;let settled=false;
    const fail=()=>{if(!settled){settled=true;zip.close();reject(new InputError('The archive is too large, encrypted, damaged or contains unsafe paths.'));}};
    zip.on('error',fail);zip.on('entry',e=>{if(++count>30000||e.uncompressedSize>32*1024*1024||(total+=e.uncompressedSize)>256*1024*1024||e.fileName.includes('..')||e.generalPurposeBitFlag&1)return fail();
      if(!/\.(csv|fit|gpx|tcx)(\.gz)?$/i.test(e.fileName)){zip.readEntry();return;}
      zip.openReadStream(e,(err,s)=>{if(err)return fail();const chunks=[];let size=0;s.on('error',fail);s.on('data',c=>{size+=c.length;if(size>32*1024*1024){s.destroy();fail();}else chunks.push(c);});s.on('end',()=>{files.push({name:e.fileName,buffer:Buffer.concat(chunks)});if(!settled)zip.readEntry();});});});
    zip.on('end',()=>{if(!settled){settled=true;resolve(files);}});zip.readEntry();
  }));
}
export async function parseUpload(name,buffer) {
  requireThat(buffer.length<=32*1024*1024,'Import files must be 32 MB or smaller.');
  if(/\.zip$/i.test(name)){const files=await unzip(buffer);let activities=[];const warnings=[];const csv=files.find(f=>/(^|\/)activities\.csv$/i.test(f.name));if(csv)activities=parseStravaCSV(csv.buffer.toString('utf8'));
    for(const f of files.filter(f=>/\.(fit|tcx|gpx)(\.gz)?$/i.test(f.name))){try{const parsed=await parseUpload(f.name,f.buffer),related=activities.find(a=>a.filename&&(f.name===a.filename||f.name.endsWith('/'+a.filename)));for(const a of parsed.activities||[]){if(related)Object.assign(a,{provider:'Strava',externalId:related.externalId,title:related.title,note:related.note});activities.push(a);}}catch{warnings.push(`A ${f.name.split('.').at(-1).toUpperCase()} activity could not be decoded; its original remains in this import.`);}}
    requireThat(activities.length,'No supported activities were found in the archive.');return{kind:'activities',activities,warnings};}
  if(/\.gz$/i.test(name)){let raw;try{raw=gunzipSync(buffer,{maxOutputLength:32*1024*1024});}catch{throw new InputError('The compressed activity could not be read.');}return parseUpload(name.slice(0,-3),raw);}
  if(/\.fit$/i.test(name))return{kind:'activities',activities:parseFit(buffer,name)};
  if(/\.(gpx|tcx)$/i.test(name))return{kind:'activities',activities:parseXML(buffer.toString('utf8'),name)};
  if(/\.csv$/i.test(name))return{kind:'activities',activities:parseStravaCSV(buffer.toString('utf8'))};
  if(/\.json$/i.test(name)){let value;try{value=JSON.parse(buffer.toString('utf8'));}catch{throw new InputError('The JSON file is malformed.');}if(value.weights&&value.sessions)return{kind:'mass',value};if(value.run&&value.historicalRun)return{kind:'activities',activities:[{...value.run,type:'run',provenance:'manually transcribed screenshot',externalId:value.run.id},{...value.historicalRun,type:'run',title:'Sunday night run',provider:'Nike',provenance:'manually transcribed screenshot',externalId:value.historicalRun.id}]};throw new InputError('This JSON is not a MASS export. Use Restore for a STRIDE backup.');}
  throw new InputError('Choose MASS JSON, Strava activities.csv/ZIP, FIT, TCX or GPX.');
}
export function commitImport(store,parsed,name,raw) {
  return store.transaction(()=>{const hash=store.source(name,raw);let result={added:0,updated:0,matched:0,ignored:0,pending:0};
    if(parsed.kind==='mass')result={...result,...importMass(store,parsed.value,hash)};
    else for(const a of parsed.activities){const r=upsertActivity(store,a,hash);result[r.action]++;if(r.pending)result.pending++;}
    const audit=store.put('import',{id:id(),name,sourceHash:hash,...result,updatedCount:result.updated,warnings:parsed.warnings||[],at:new Date().toISOString()});return {...audit,updated:result.updated};
  });
}
export function mergeActivities(store,keepId,removeId) {
  const keep=store.get('activity',keepId),other=store.get('activity',removeId);requireThat(keep&&other&&keepId!==removeId&&!keep.mergedInto&&!other.mergedInto,'Choose two separate activities.');
  requireThat(!store.get('feedback',keepId)||!store.get('feedback',removeId),'Both sessions have check-ins. Keep them separate until their notes have been reconciled.');
  requireThat(!store.list('plan').some(p=>p.activityId===removeId),'Relink the plan to the retained session before merging.');
  return store.transaction(()=>{const before={keep,other,feedback:store.get('feedback',removeId),aliases:store.db.prepare('SELECT * FROM aliases WHERE activityId=? OR activityId=?').all(keepId,removeId)};
    const merged=store.put('activity',{...keep,sources:[...(keep.sources||[]),...(other.sources||[])],streams:keep.streams?.length?keep.streams:other.streams||[],pendingDuplicate:null});store.put('activity',{...other,mergedInto:keepId,pendingDuplicate:null});
    for(const a of before.aliases)store.alias(a.provider,a.externalId,keepId);
    if(before.feedback){store.put('feedback',{...before.feedback,id:keepId,activityId:keepId});store.put('feedback',{...before.feedback,deleted:true});}
    const merge=store.put('merge',{id:id(),keepId,removeId,before,keepRevision:merged.revision,otherRevision:store.get('activity',removeId).revision,feedbackRevision:store.get('feedback',keepId)?.revision||0,undone:false});return merge;
  });
}
export function undoMerge(store,mergeId){const m=store.get('merge',mergeId);requireThat(m&&!m.undone,'This merge is not available.');requireThat(store.get('activity',m.keepId)?.revision===m.keepRevision&&store.get('activity',m.removeId)?.revision===m.otherRevision&&(store.get('feedback',m.keepId)?.revision||0)===m.feedbackRevision,'The merged activity changed. Export a backup before reconciling it manually.',409);return store.transaction(()=>{store.put('activity',m.before.keep);store.put('activity',m.before.other);for(const a of m.before.aliases)store.alias(a.provider,a.externalId,a.activityId);if(m.before.feedback){store.put('feedback',m.before.feedback);store.put('feedback',{...store.get('feedback',m.keepId),deleted:true});}return store.put('merge',{...m,undone:true});});}
