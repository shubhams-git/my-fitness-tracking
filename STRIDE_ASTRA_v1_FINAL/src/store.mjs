import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { id, digest, InputError, requireThat } from './domain.mjs';

export class Store {
  constructor(path) {
    if(path!==':memory:')mkdirSync(dirname(path),{recursive:true});
    this.db=new DatabaseSync(path);this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA synchronous=FULL; PRAGMA foreign_keys=ON;
      CREATE TABLE IF NOT EXISTS records(kind TEXT NOT NULL,id TEXT NOT NULL,body TEXT NOT NULL,revision INTEGER NOT NULL,updated TEXT NOT NULL,PRIMARY KEY(kind,id));
      CREATE TABLE IF NOT EXISTS revisions(seq INTEGER PRIMARY KEY,kind TEXT,id TEXT,body TEXT,revision INTEGER,updated TEXT);
      CREATE TABLE IF NOT EXISTS sources(hash TEXT PRIMARY KEY,name TEXT,body TEXT,created TEXT);
      CREATE TABLE IF NOT EXISTS aliases(provider TEXT,externalId TEXT,activityId TEXT,PRIMARY KEY(provider,externalId));
      CREATE TABLE IF NOT EXISTS mutations(id TEXT PRIMARY KEY,result TEXT,created TEXT);
      CREATE TABLE IF NOT EXISTS sessions(hash TEXT PRIMARY KEY,expires INTEGER,csrf TEXT);
      CREATE TABLE IF NOT EXISTS secrets(name TEXT PRIMARY KEY,value TEXT);
      PRAGMA user_version=1;`);
  }
  close(){this.db.close();}
  transaction(fn){this.db.exec('BEGIN IMMEDIATE');try{const r=fn();this.db.exec('COMMIT');return r;}catch(e){this.db.exec('ROLLBACK');throw e;}}
  list(kind){return this.db.prepare('SELECT body,revision,updated FROM records WHERE kind=?').all(kind).map(r=>({...JSON.parse(r.body),revision:r.revision,updated:r.updated}));}
  get(kind,id){const r=this.db.prepare('SELECT body,revision,updated FROM records WHERE kind=? AND id=?').get(kind,id);return r?{...JSON.parse(r.body),revision:r.revision,updated:r.updated}:null;}
  put(kind,value,expected){const old=this.get(kind,value.id);if(expected!==undefined && (old?.revision||0)!==expected)throw new InputError('This record changed on another screen. Your draft is safe; review both versions.',409,{current:old});
    const {revision:_r,updated:_u,...body}=value;const now=new Date().toISOString(),revision=(old?.revision||0)+1;
    if(old)this.db.prepare('INSERT INTO revisions(kind,id,body,revision,updated) VALUES(?,?,?,?,?)').run(kind,old.id,JSON.stringify(old),old.revision,old.updated);
    this.db.prepare('INSERT INTO records VALUES(?,?,?,?,?) ON CONFLICT(kind,id) DO UPDATE SET body=excluded.body,revision=excluded.revision,updated=excluded.updated').run(kind,value.id,JSON.stringify(body),revision,now);
    return {...body,revision,updated:now};
  }
  mutate(mutationId,fn){requireThat(typeof mutationId==='string'&&mutationId.length>=8&&mutationId.length<=100,'A mutation ID is required.');return this.transaction(()=>{const found=this.db.prepare('SELECT result FROM mutations WHERE id=?').get(mutationId);if(found)return JSON.parse(found.result);const r=fn();this.db.prepare('INSERT INTO mutations VALUES(?,?,?)').run(mutationId,JSON.stringify(r),new Date().toISOString());return r;});}
  source(name,raw){const hash=digest(raw);this.db.prepare('INSERT OR IGNORE INTO sources VALUES(?,?,?,?)').run(hash,name,Buffer.isBuffer(raw)?JSON.stringify({encoding:'base64',data:raw.toString('base64')}):JSON.stringify(raw),new Date().toISOString());return hash;}
  alias(provider,externalId,activityId){this.db.prepare('INSERT INTO aliases VALUES(?,?,?) ON CONFLICT(provider,externalId) DO UPDATE SET activityId=excluded.activityId').run(provider,String(externalId),activityId);}
  byAlias(provider,externalId){const row=this.db.prepare('SELECT activityId FROM aliases WHERE provider=? AND externalId=?').get(provider,String(externalId));return row?this.get('activity',row.activityId):null;}
  export(){return {format:'stride-backup',version:1,created:new Date().toISOString(),records:this.db.prepare('SELECT * FROM records').all(),revisions:this.db.prepare('SELECT * FROM revisions').all(),sources:this.db.prepare('SELECT * FROM sources').all(),aliases:this.db.prepare('SELECT * FROM aliases').all()};}
  validateBackup(data){requireThat(data?.format==='stride-backup'&&data.version===1,'This is not a supported STRIDE backup.');for(const k of ['records','sources','aliases','revisions'])requireThat(Array.isArray(data[k])&&data[k].length<=500000,'The backup is incomplete or too large.');
    const kinds=new Set(['activity','weight','feedback','sleep','plan','settings','import','merge','insight-seen','connector']);const keys=new Set();
    for(const row of data.records){requireThat(kinds.has(row.kind)&&typeof row.id==='string'&&row.id.length<=200&&typeof row.body==='string','Invalid backup record.');let b;try{b=JSON.parse(row.body);}catch{throw new InputError('Invalid backup record data.');}requireThat(b.id===row.id&&Number.isInteger(row.revision)&&row.revision>=1,'Invalid backup identity.');requireThat(!keys.has(`${row.kind}:${row.id}`),'Duplicate record in backup.');keys.add(`${row.kind}:${row.id}`);}
    for(const a of data.aliases)requireThat(keys.has(`activity:${a.activityId}`),'A source alias has no activity.');
    return {records:data.records.length,activities:data.records.filter(r=>r.kind==='activity').length,weights:data.records.filter(r=>r.kind==='weight').length,nights:data.records.filter(r=>r.kind==='sleep').length,created:data.created};
  }
  restore(data){this.validateBackup(data);return this.transaction(()=>{this.db.exec('DELETE FROM aliases;DELETE FROM records;DELETE FROM revisions;DELETE FROM sources;DELETE FROM mutations;');
    for(const r of data.records)this.db.prepare('INSERT INTO records VALUES(?,?,?,?,?)').run(r.kind,r.id,r.body,r.revision,r.updated);
    for(const r of data.sources)this.db.prepare('INSERT INTO sources VALUES(?,?,?,?)').run(r.hash,r.name,r.body,r.created);
    for(const r of data.aliases)this.alias(r.provider,r.externalId,r.activityId);
    for(const r of data.revisions)this.db.prepare('INSERT INTO revisions(kind,id,body,revision,updated) VALUES(?,?,?,?,?)').run(r.kind,r.id,r.body,r.revision,r.updated);
    return this.validateBackup(data);
  });}
}
