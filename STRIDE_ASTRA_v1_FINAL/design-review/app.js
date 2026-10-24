const params = new URLSearchParams(location.search);
const direction = params.get('direction') === 'tempo' ? 'tempo' : 'fieldnotes';
const isTempo = direction === 'tempo';
let screen = ['today', 'session', 'sleep', 'checkin'].includes(params.get('screen')) ? params.get('screen') : 'today';
let theme = params.get('theme') || (isTempo ? 'dark' : 'light');
document.body.dataset.direction = direction;
document.body.dataset.theme = theme;
document.body.classList.toggle('embedded', params.has('embed'));
let data;
let step = 0;
let feedback = { effort: null, talk: null, discomfort: null, reserve: null, location: null, note: '', legs: '' };
let saved = false;
let sleepEntry = null;
const root = document.getElementById('app');
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
const pace = seconds => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
const date = value => new Intl.DateTimeFormat('en-AU', {day:'numeric',month:'short',timeZone:'UTC'}).format(new Date(`${value}T12:00:00Z`));
const paths = {
  today: '<path d="M4 10 12 3l8 7v10h-6v-6h-4v6H4Z"/>',
  session: '<path d="m3 15 5-7 4 8 4-12 5 9"/>',
  sleep: '<path d="M20 15.2A8.4 8.4 0 0 1 8.8 4a8.5 8.5 0 1 0 11.2 11.2Z"/>',
  checkin: '<path d="M12 5v14M5 12h14"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  back: '<path d="m14 5-7 7 7 7"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  source: '<path d="M8 4H4v16h16v-4M12 4h8v8m0-8L10 14"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
const nav = () => `<nav class="app-nav" aria-label="Main navigation">${[['today','Today'],['session','Sessions'],['sleep','Sleep'],['checkin','Check-in']].map(([s,l]) => `<button data-nav="${s}" ${s === screen ? 'aria-current="page"' : ''}>${icon(s)}<span>${l}</span></button>`).join('')}</nav>`;
const heading = (label, back = false) => `<header class="app-header">${back ? `<button class="icon-button" data-nav="today" aria-label="Back to Today">${icon('back')}</button><span class="section-label">${label}</span>` : `<a class="app-brand" href="/app?direction=${direction}">STRIDE<span>${isTempo ? ' / INTELLIGENCE' : 'INTELLIGENCE'}</span></a>`}<button class="icon-button theme-toggle" aria-label="Switch to ${theme === 'dark' ? 'light' : 'dark'} mode">${icon(theme === 'dark' ? 'sun' : 'sleep')}</button></header>`;
const eyebrow = text => `<p class="eyebrow">${text}</p>`;
function splitChart(compact = false) {
  const r = data.run;
  if (isTempo) {
    const left = 35, right = 315, top = 26, bottom = 117;
    const y = p => top + (p - 420) / 60 * (bottom - top);
    let cumulative = 0;
    return `<div class="split-chart tempo-chart ${compact ? 'compact' : ''}"><div class="chart-topline"><span>Split pace</span><span>min / km</span></div><svg viewBox="0 0 340 157" role="img" aria-label="Split pace by distance. ${r.splits.map(s => `${s.distanceKm} kilometre at ${pace(s.paceSeconds)} per kilometre`).join('; ')}. Last split is partial.">${[420,450,480].map(p => `<line x1="${left}" y1="${y(p)}" x2="${right}" y2="${y(p)}" class="grid-line"/><text x="0" y="${y(p)+4}" class="chart-axis">${pace(p)}</text>`).join('')}${r.splits.map((s,i) => { const x1 = left + cumulative / r.distanceKm * (right-left); cumulative += s.distanceKm; const x2 = left + cumulative / r.distanceKm * (right-left); return `<rect x="${x1+4}" y="${y(s.paceSeconds)-3}" width="${x2-x1-8}" height="6" rx="3" class="pace-segment ${i===2?'partial':''}"/><text x="${(x1+x2)/2}" y="${y(s.paceSeconds)-12}" text-anchor="middle" class="chart-value">${pace(s.paceSeconds)}</text>`; }).join('')}${[0,1,2,2.86].map(d => `<text x="${left+d/r.distanceKm*(right-left)}" y="143" text-anchor="middle" class="chart-axis">${d}${d===2.86?' km':''}</text>`).join('')}</svg><div class="split-select">${r.splits.map((s,i)=>`<button data-split="${i}" aria-label="Inspect ${i===2?'final partial split':`kilometre ${i+1}`}">${i===2?'Final 0.86 km*':`Km ${i+1}`} ${icon('arrow')}</button>`).join('')}</div><p class="micro">* Partial distance, estimated from the total.</p><p class="chart-inspection" aria-live="polite"></p></div>`;
  }
  return `<div class="split-chart ${compact?'compact':''}"><div class="chart-topline"><span>Split pace</span><span>min / km</span></div><div class="pace-scale"><span>7:00</span><span>7:30</span><span>8:00</span></div>${r.splits.map((s,i)=>`<button class="dot-row" data-split="${i}" aria-label="${i===2?'Final partial 0.86 kilometre':`Kilometre ${i+1}`}, ${pace(s.paceSeconds)} per kilometre; inspect source"><span class="split-label">${i===2?'0.86*':`${i+1} km`}</span><span class="pace-track"><span class="pace-dot ${i===2?'hollow':''}" style="left:${(s.paceSeconds-420)/60*100}%"></span></span><b>${pace(s.paceSeconds)}</b></button>`).join('')}<p class="micro">* Final partial split · tap a row to inspect.</p><p class="chart-inspection" aria-live="polite"></p></div>`;
}
function runSummary() {
  const r = data.run;
  return `<div class="run-summary"><div><strong>${r.distanceKm.toFixed(2)}<small>km</small></strong><span>Distance</span></div><div><strong>${pace(r.movingSeconds)}<small>min</small></strong><span>Moving time</span></div><div><strong>${pace(r.reportedPaceSeconds)}<small>/km</small></strong><span>Reported pace</span></div></div>`;
}
function weightSpark() {
  const weights=data.mass.weights, min=Math.floor(Math.min(...weights.map(w=>w.kg))), max=Math.ceil(Math.max(...weights.map(w=>w.kg)));
  const start=Date.parse(weights[0].date), end=Date.parse(weights.at(-1).date);
  return `<svg class="weight-spark" viewBox="0 0 110 44" role="img" aria-label="${weights.length} recorded weight observations, shown as individual points; vertical range ${min} to ${max} kilograms">${weights.map(w=>`<circle cx="${4+(Date.parse(w.date)-start)/(end-start)*102}" cy="${4+(max-w.kg)/(max-min)*34}" r="1.7"/>`).join('')}</svg>`;
}
function today() {
  const r = data.run, n = data.pacing.differenceSeconds;
  return `${heading()}<main id="content" class="today-content"><div class="date-line"><span>Saturday, 24 October</span><span class="status-dot">Your daily read</span></div><section class="lead-story">${eyebrow(isTempo ? 'THE FIND / 23 OCT RUN' : 'TODAY’S FIND')}${isTempo ? `<div class="tempo-number"><span>${n}</span><span>sec<small>between your first<br>two kilometres</small></span></div><h1>A steady rhythm.<br>Room to keep going.</h1>` : `<h1>You kept it<br><em>beautifully</em><br>steady.</h1>`}<p class="lead-copy">${isTempo ? 'You held your pace, then finished with more to give.' : `Just ${n} seconds between your first two kilometres. And you finished with plenty left.`}</p>${splitChart(true)}<button class="text-button evidence-button">The evidence ${icon('arrow')}</button></section><button class="session-link" data-nav="session"><span class="small-icon">${icon('session')}</span><span><b>${escape(r.title)}</b><small>${date(r.date)} · ${r.distanceKm} km · ${pace(r.reportedPaceSeconds)} /km</small></span>${icon('arrow')}</button><section class="quiet-context"><button class="sleep-link" data-nav="sleep">${icon('sleep')}<span><b>Make room for rest.</b><small>Your sleep story can start without a watch.</small></span>${icon('arrow')}</button><button class="weight-link" id="weight-details"><span><span class="eyebrow">WEIGHT · ${data.mass.weights.length} ENTRIES</span><b>${data.mass.latest.kg.toFixed(1)} <small>kg</small></b><small>Latest · ${date(data.mass.latest.date)}</small></span>${weightSpark()}</button></section><p class="endnote">A small collection of records. A useful place to begin.</p></main>${nav()}`;
}
function session() {
  const r = data.run;
  return `${heading('SESSION STORY',true)}<main id="content" class="session-content">${eyebrow(`${date(r.date).toUpperCase()} 2026 · ${r.provider.toUpperCase()} REFERENCE`)}<h1>${isTempo?'Afternoon<br>run.':'An easy finish.<br><em>A steady middle.</em>'}</h1>${runSummary()}<section class="session-chart"><div class="section-heading"><h2>${isTempo?'Your rhythm, kilometre by kilometre.':'There’s a rhythm here.'}</h2><span class="tag">3 SPLITS</span></div>${splitChart()}<p class="body-copy">Your first two kilometres differed by ${data.pacing.differenceSeconds} seconds. The last ${r.splits.at(-1).distanceKm} km held the opening pace.</p></section><section class="source-note">${eyebrow('IN YOUR WORDS')}<blockquote>“${escape(r.note)}”</blockquote><p class="micro">Your original Strava note · ${date(r.date)}</p></section><div class="secondary-metrics"><span><b>${r.elevationGainM} m</b> ascent</span><span><b>${r.steps.toLocaleString('en-AU')}</b> steps</span><span>Heart rate <b>not recorded</b></span></div><button class="primary-button" data-nav="checkin">${saved?'Edit your check-in':'Add how it felt'} ${icon('arrow')}</button><button class="text-button evidence-button">View source & calculation ${icon('source')}</button><p class="micro">Selected history, not your complete run archive.</p></main>${nav()}`;
}
function sleep() {
  return `${heading()}<main id="content" class="sleep-content"><div class="date-line"><span>Sleep</span><span class="connection-label">Watch not connected</span></div>${isTempo?'<div class="night-art"><div class="moon"></div><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><span class="star star-one">✦</span><span class="star star-two">·</span><span class="night-word">REST</span></div>':'<div class="night-art"><div class="moon"></div><div class="horizon"></div><span class="star star-one">✦</span><span class="star star-two">·</span></div>'}${eyebrow(sleepEntry?'YOUR OWN OBSERVATION':'A QUIETER KIND OF PROGRESS')}<h1>${sleepEntry?'A little more<br><em>of the picture.</em>':isTempo?'Every day starts<br>the night before.':'The other half<br><em>of your story.</em>'}</h1><p class="lead-copy">${sleepEntry?'Your morning note is here for this preview.': 'Your nights belong alongside your training. Start with what you remember; a watch can fill in more later.'}</p><section class="sleep-empty">${sleepEntry?`<div class="empty-title"><span class="small-icon">${icon('check')}</span><div><b>${escape(sleepEntry.rest || 'Morning note added')}</b><small>${escape(sleepEntry.duration ? `${sleepEntry.duration} hours · self-reported` : 'Duration not entered')}</small></div></div>${sleepEntry.note?`<p>${escape(sleepEntry.note)}</p>`:''}`:`<div class="empty-title"><span class="small-icon">${icon('sleep')}</span><div><b>No nights recorded yet</b><small>Duration and timing will appear here.</small></div></div><div class="empty-week" aria-label="No sleep records for any of the seven displayed days">${['S','M','T','W','T','F','S'].map((d,i)=>`<div><span>${d}</span><i ${i===6?'class="current"':''}></i></div>`).join('')}</div>`}<button class="primary-button" id="add-sleep">${sleepEntry?'Edit morning note':'Add a night'} ${icon('checkin')}</button><p class="micro centered">Optional. A few taps, whenever you feel like it.</p></section><details class="future-sleep"><summary>When your Garmin arrives ${icon('arrow')}</summary><p>Duration, sleep timing and available watch estimates can join your history. Actual fields depend on your device and its data connection.</p><p>No live connection has been tested. Setup will be a step you control.</p></details></main>${nav()}`;
}
const fields = [
  {key:'effort', title:'How hard did it feel?', hint:'1 · Very easy', end:'10 · All out', values:Array.from({length:10},(_,i)=>[String(i+1),String(i+1)])},
  {key:'talk', title:'Could you talk?', values:[['full','Full sentences'],['short','Short phrases'],['barely','Barely']]},
  {key:'discomfort', title:'Any discomfort?', values:[['none','None'],['mild','Mild'],['affected','Affected run']]},
  {key:'reserve', title:'Anything left at the finish?', values:[['plenty','Plenty'],['some','Some'],['none','Nothing left']]},
];
function group(field, index) {
  return `<fieldset class="answer-group ${field.key==='effort'?'effort-group':''}"><legend><span class="field-number">0${index+1}</span>${field.title}</legend><div class="choices ${field.key==='effort'?'effort-choices':''}">${field.values.map(([value,label])=>`<button type="button" data-field="${field.key}" data-value="${value}" aria-pressed="${feedback[field.key]===value}">${label}</button>`).join('')}</div>${field.hint?`<div class="range-hints"><span>${field.hint}</span><span>${field.end}</span></div>`:''}${field.key==='discomfort' && feedback.discomfort && feedback.discomfort!=='none'?`<div class="location-choices"><span>Where? <small>Optional</small></span><div class="choices">${['Shin','Knee','Foot','Other'].map(l=>`<button type="button" data-field="location" data-value="${l}" aria-pressed="${feedback.location===l}">${l}</button>`).join('')}</div></div>`:''}</fieldset>`;
}
function checkin() {
  const answered=fields.filter(f=>feedback[f.key]!==null).length;
  return `${heading('QUICK CHECK-IN',true)}<main id="content" class="checkin-content">${eyebrow(`${date(data.run.date).toUpperCase()} · ${data.run.distanceKm} KM · ${escape(data.run.title.toUpperCase())}`)}<div class="checkin-title"><h1>${isTempo?'Your side<br>of the story.':'How did<br><em>that feel?</em>'}</h1><span class="time-badge">30–45<br><small>seconds</small></span></div><div class="checkin-intro"><p class="checkin-caption">The numbers don’t tell us everything.</p><a class="jump-note" href="#note">Add a note ↗</a></div>${isTempo?`<div class="step-progress" aria-label="Question ${Math.min(step+1,4)} of 4">${fields.map((f,i)=>`<button data-step="${i}" aria-label="Question ${i+1}: ${f.title}" class="${i===step?'current':''} ${feedback[f.key]?'complete':''}">${feedback[f.key]?icon('check'):`0${i+1}`}</button>`).join('')}</div><div class="step-body">${group(fields[Math.min(step,3)],Math.min(step,3))}</div><div class="step-navigation"><button class="text-button" id="previous-step" ${step===0?'disabled':''}>Previous</button><span>${Math.min(step+1,4)} of 4</span><button class="text-button" id="next-step" ${step>=3?'disabled':''}>Next ${icon('arrow')}</button></div>`:fields.map(group).join('')}<label class="note-label" for="note">Anything to add? <span>Optional</span></label><textarea id="note" rows="2" placeholder="A thought, a niggle, a small win…">${escape(feedback.note)}</textarea><details class="extra-context"><summary>A little more context <span>+</span></summary><label for="legs">Legs before starting</label><select id="legs"><option value="">Not answered</option>${['Normal','Heavy from gym','Heavy from work','Other'].map(v=>`<option ${feedback.legs===v?'selected':''}>${v}</option>`).join('')}</select></details><div class="save-area"><button class="primary-button" id="save-checkin" ${answered<4?'disabled':''}>${saved?'Update check-in':'Save check-in'} ${icon('check')}</button><p class="save-status" role="status">${saved?'Saved for this preview · reload clears changes':`${answered} of 4 answered · nothing assumed`}</p></div></main>${nav()}`;
}
function showDialog(title, body, className='') {
  const el=document.createElement('dialog');
  el.className=`detail-dialog ${className}`;
  el.setAttribute('aria-label',title);
  el.innerHTML=`<div class="dialog-heading"><h2>${title}</h2><button class="icon-button close-dialog" aria-label="Close dialog">${icon('close')}</button></div>${body}`;
  document.body.append(el);
  el.querySelector('.close-dialog').onclick=()=>el.close();
  el.addEventListener('close',()=>el.remove());
  el.addEventListener('click',e=>{if(e.target===el){ const rect=el.getBoundingClientRect(); if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)el.close(); }});
  el.showModal();
  return el;
}
function showEvidence() {
  showDialog('Behind the finding', `${eyebrow('TWO SOURCES. ONE SMALL OBSERVATION.')}<dl class="evidence-list"><div><dt>First full kilometre</dt><dd>${pace(data.run.splits[0].paceSeconds)} /km</dd></div><div><dt>Second full kilometre</dt><dd>${pace(data.run.splits[1].paceSeconds)} /km</dd></div><div><dt>Absolute difference</dt><dd>${data.pacing.differenceSeconds} seconds</dd></div></dl><p>“Plenty left” comes from your own note, not a calculated recovery score.</p><blockquote>“${escape(data.run.note)}”</blockquote><details><summary>Source detail & limitations</summary><p>Manually transcribed from your supplied Strava screenshots: ${escape(data.run.source)} and ${escape(data.run.splits[0].source)}.</p><p>The final 0.86 km is the remainder of the rounded total distance. The screenshot labels that row 0.8 km. Its 7:24/km pace is reported, not a duration.</p><p>The summary’s fastest-split value differs from the split rows by one second. This observation compares the rows and makes no fastest-split claim.</p><p>Heart rate and raw GPS samples are absent. No continuous pace waveform has been reconstructed.</p></details>`);
}
function showWeights() {
  const m=data.mass;
  showDialog('A longer view of weight',`${eyebrow('MASS · RECORDED OBSERVATIONS')}<p class="weight-headline">${Math.abs(m.change).toFixed(1)} <small>kg ${m.change<0?'lower':'higher'}</small></p><p>From the first recorded measurement on ${date(m.first.date)} to ${date(m.latest.date)}. This is an endpoint comparison, not a smoothed trend or a change in body fat.</p><div class="weight-chart-large">${weightSpark()}</div><p class="micro">${m.weights.length} real points · ${date(m.first.date)} to ${date(m.latest.date)} · no interpolated readings</p><details><summary>Inspect all ${m.weights.length} records</summary><table><thead><tr><th>Date</th><th>Weight (kg)</th></tr></thead><tbody>${m.weights.map(w=>`<tr><td>${date(w.date)}</td><td>${w.kg.toFixed(1)}</td></tr>`).join('')}</tbody></table></details><p class="micro">The configured MASS start marker is separate from the first observed weight.</p>`);
}
function addSleep() {
  const d=showDialog('A note about last night',`${eyebrow('MORNING OF 24 OCTOBER · OPTIONAL')}<p>Just what you remember. Leave anything blank.</p><form id="sleep-form"><label for="sleep-duration">Estimated sleep <span>hours · optional</span></label><input id="sleep-duration" type="number" min="0.1" max="24" step="0.1" inputmode="decimal" placeholder="e.g. 7.5" value="${escape(sleepEntry?.duration||'')}"><fieldset class="answer-group"><legend>How rested do you feel?</legend><div class="choices">${['Rested','Okay','Drained'].map(v=>`<button type="button" data-rest="${v}" aria-pressed="${sleepEntry?.rest===v}">${v}</button>`).join('')}</div></fieldset><label for="sleep-note">A thought <span>optional</span></label><textarea id="sleep-note" rows="2" placeholder="Anything you want to remember">${escape(sleepEntry?.note||'')}</textarea><button class="primary-button" type="submit">Keep morning note ${icon('check')}</button><p class="micro">Design preview only · clears on reload</p><p class="sleep-validation" role="status"></p></form>`);
  let rest=sleepEntry?.rest||null;
  d.querySelectorAll('[data-rest]').forEach(b=>b.onclick=()=>{rest=b.dataset.rest; d.querySelectorAll('[data-rest]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));});
  d.querySelector('form').onsubmit=e=>{e.preventDefault(); const duration=d.querySelector('#sleep-duration').value,note=d.querySelector('#sleep-note').value.trim();if(!duration&&!rest&&!note){d.querySelector('.sleep-validation').textContent='Add one observation, or close to skip.';return;}sleepEntry={duration,rest,note};d.close();render();};
}
function render() {
  const scrollY=window.scrollY;
  root.innerHTML=({today,session,sleep,checkin})[screen]();
  document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{screen=b.dataset.nav;history.replaceState(null,'',`/app?direction=${direction}&screen=${screen}&theme=${theme}${params.has('embed')?'&embed=1':''}`);render();window.scrollTo(0,0);document.getElementById('content').setAttribute('tabindex','-1');document.getElementById('content').focus({preventScroll:true});});
  document.querySelector('.theme-toggle').onclick=()=>{theme=theme==='dark'?'light':'dark';document.body.dataset.theme=theme;render();};
  document.querySelectorAll('.evidence-button').forEach(b=>b.onclick=showEvidence);
  document.querySelectorAll('[data-split]').forEach(b=>b.onclick=()=>{const i=Number(b.dataset.split),s=data.run.splits[i];document.querySelector('.chart-inspection').textContent=`${i===2?'Final partial split':`Kilometre ${i+1}`}: ${pace(s.paceSeconds)} /km · ${s.elevationChangeM>0?'+':''}${s.elevationChangeM} m net elevation.`;document.querySelectorAll('[data-split]').forEach(x=>x.classList.toggle('inspected',x===b));});
  document.getElementById('weight-details')?.addEventListener('click',showWeights);
  document.getElementById('add-sleep')?.addEventListener('click',addSleep);
  document.querySelectorAll('[data-field]').forEach(b=>b.onclick=()=>{feedback[b.dataset.field]=b.dataset.value;if(b.dataset.field==='discomfort'&&b.dataset.value==='none')feedback.location=null;saved=false;render();document.querySelector(`[data-field="${b.dataset.field}"][data-value="${b.dataset.value}"]`)?.focus({preventScroll:true});});
  document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{step=Number(b.dataset.step);render();});
  document.getElementById('next-step')?.addEventListener('click',()=>{step=Math.min(3,step+1);render();});
  document.getElementById('previous-step')?.addEventListener('click',()=>{step=Math.max(0,step-1);render();});
  document.querySelector('.jump-note')?.addEventListener('click',e=>{e.preventDefault();document.getElementById('note').focus();document.getElementById('note').scrollIntoView({block:'center'});});
  document.getElementById('note')?.addEventListener('input',e=>{feedback.note=e.target.value;saved=false;document.querySelector('.save-status').textContent='Edited · save when you’re ready';});
  document.getElementById('legs')?.addEventListener('change',e=>{feedback.legs=e.target.value;saved=false;});
  document.getElementById('save-checkin')?.addEventListener('click',()=>{saved=true;render();document.querySelector('.save-status').textContent='Saved for this preview · reload clears changes';});
  window.scrollTo(0,scrollY);
}
async function init() {
  try { const response=await fetch('/api/evidence'); if(!response.ok)throw new Error('No data');data=await response.json();render(); }
  catch { root.innerHTML=`<main id="content" class="error-state">${eyebrow('LOCAL REFERENCE DATA')}<h1>Your records<br>aren’t here yet.</h1><p>Restore the supplied reference files in private-inputs, then try again. No sample measurements have been substituted.</p><button class="primary-button" id="retry">Try again ${icon('arrow')}</button></main>`;document.getElementById('retry').onclick=init; }
}
init();
