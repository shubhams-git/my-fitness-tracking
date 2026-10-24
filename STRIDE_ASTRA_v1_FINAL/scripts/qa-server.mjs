// Isolated, invented records for browser acceptance checks. Never seeds the personal journal.
import {resolve} from 'node:path';
import {createApp} from '../src/server.mjs';
import {normalizeActivity,normalizeSleep,today,shiftDay} from '../src/domain.mjs';
const app=createApp({dataDir:resolve('.test-data','browser'),port:4319});
if(!app.store.list('activity').length){
 app.store.put('activity',normalizeActivity({id:'synthetic-run',title:'TEST · Riverside easy run',provider:'Synthetic fixture',date:today(),distanceKm:5,movingSeconds:1800,splits:[{distanceKm:1,paceSeconds:355},{distanceKm:1,paceSeconds:360},{distanceKm:1,paceSeconds:365},{distanceKm:1,paceSeconds:360},{distanceKm:1,paceSeconds:360}]}));
 app.store.put('activity',normalizeActivity({id:'synthetic-gym',title:'TEST · Strength session',type:'strength',provider:'Synthetic fixture',date:shiftDay(today(),-1),movingSeconds:2400}));
 for(let i=0;i<10;i++){const date=shiftDay(today(),-i);app.store.put('sleep',normalizeSleep({id:`synthetic-night-${i}`,date,startLocal:`${shiftDay(date,-1)}T23:15`,endLocal:`${date}T07:15`,provider:'Synthetic fixture',durationMinutes:440-i*4,score:i===0?62:75,hrv:i===0?null:50,heartRate:55,stageTotals:{light:14000,deep:4000,rem:5000,awake:1500},note:'SYNTHETIC TEST DATA',rest:i===0?'rested':null}));app.store.put('weight',{id:`synthetic-weight-${i}`,date,kg:80+i*.1,provider:'Synthetic fixture'});}
}
app.server.listen(4319,'127.0.0.1',()=>console.log('Synthetic browser test app: http://127.0.0.1:4319'));
