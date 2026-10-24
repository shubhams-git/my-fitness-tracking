"""Build the private, screenshot-led operating guide. No credentials are included."""
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image
import subprocess
from pypdf import PdfReader

ROOT=Path(__file__).resolve().parents[1]
SHOTS=ROOT/'.private-preview'
G=SHOTS/'guide'
OUT=ROOT/'output/pdf'
RENDERS=ROOT/'tmp/pdfs/visual-guide'
OUT.mkdir(parents=True,exist_ok=True)
RENDERS.mkdir(parents=True,exist_ok=True)
for name,file in [('Segoe','segoeui.ttf'),('SegoeBold','segoeuib.ttf'),('SegoeLight','segoeuil.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(Path('C:/Windows/Fonts')/file)))
W,H=595.276,841.89
INK=HexColor('#17303d'); MUTED=HexColor('#596f79'); PAPER=HexColor('#f5f4ee')
ACCENT=HexColor('#a44d29'); LINE=HexColor('#d0d8d4'); PEACH=HexColor('#edb28d')
pdf=OUT/'STRIDE-Tempo-Visual-Operating-Guide.pdf'
c=canvas.Canvas(str(pdf),pagesize=(W,H),pageCompression=1)
c.setTitle('STRIDE Intelligence - Tempo Visual Operating Guide')
c.setAuthor('STRIDE Intelligence')
c.setSubject('Screenshot walkthrough of everyday training, sleep and data operations')
pages=[]
def para(text,x,y,width,size=11,color=INK,bold=False,leading=None):
    style=ParagraphStyle('p',fontName='SegoeBold' if bold else 'Segoe',fontSize=size,leading=leading or size*1.48,textColor=color,spaceAfter=0)
    p=Paragraph(text,style);_,height=p.wrap(width,H)
    p.drawOn(c,x,y-height)
    return y-height
def base(section,title,subtitle=None,sample=True):
    c.setFillColor(PAPER);c.rect(0,0,W,H,fill=1,stroke=0)
    c.setFillColor(ACCENT);c.setFont('SegoeBold',9);c.drawString(38,H-38,'STRIDE / INTELLIGENCE')
    c.setFillColor(MUTED);c.setFont('Segoe',8);c.drawRightString(W-38,H-38,section.upper())
    y=para(title,38,H-69,W-76,29,bold=True,leading=32)
    if subtitle:y=para(subtitle,38,y-12,W-76,10.5,MUTED)
    c.setStrokeColor(LINE);c.line(38,47,W-38,47)
    c.setFont('Segoe',7.5);c.setFillColor(MUTED)
    c.drawString(38,31,'TEMPO VISUAL GUIDE  |  24 OCT 2026')
    c.drawRightString(W-38,31,f'{len(pages)+1:02d}')
    if sample:
        c.setFont('SegoeBold',7.3);c.setFillColor(ACCENT);c.drawString(38,57,'SCREENSHOT: SAMPLE DATA / NO LIVE GARMIN CONNECTION')
    return min(y-25,668)
def image(path,x,y,w,h):
    im=Image.open(path);iw,ih=im.size;s=min(w/iw,h/ih);dw,dh=iw*s,ih*s
    c.setFillColor(INK);c.roundRect(x-1,y-dh-1,dw+2,dh+2,7,fill=1,stroke=0)
    c.drawImage(ImageReader(im),x,y-dh,width=dw,height=dh,mask='auto')
    return dh
def finish(title):
    pages.append(title);c.showPage()
def steps(items,x,y,width):
    for i,(head,body) in enumerate(items,1):
        c.setFillColor(PEACH);c.circle(x+10,y-9,10,fill=1,stroke=0)
        c.setFillColor(INK);c.setFont('SegoeBold',9);c.drawCentredString(x+10,y-12,str(i))
        y=para(head,x+29,y,width-29,11.5,bold=True)
        y=para(body,x+29,y-7,width-29,10.5,MUTED)-23
    return y
def screen(section,title,subtitle,path,items,note=None,sample=True):
    y=base(section,title,subtitle,sample)
    image(path,38,y,275,y-78)
    yy=steps(items,340,y-5,217)
    if note:
        yy-=7;c.setStrokeColor(LINE);c.line(340,yy,557,yy)
        para(note,340,yy-15,217,9,MUTED)
    finish(title)

# Cover
c.setFillColor(INK);c.rect(0,0,W,H,fill=1,stroke=0)
c.setFillColor(PEACH);c.setFont('SegoeBold',10);c.drawString(38,H-44,'STRIDE / INTELLIGENCE')
para('Your visual<br/>operating guide.',38,H-102,510,40,HexColor('#f1f1eb'),True,44)
para('Tempo - the main screens, options and everyday workflows.',38,627,500,14,HexColor('#b7c6cb'))
image(SHOTS/'stride-tempo-desktop.jpg',38,565,519,370)
para('Open your private journal',38,165,510,12,PEACH,True)
para('On the computer running STRIDE: <b>http://127.0.0.1:4318</b><br/>This guide contains personal-screen captures and clearly labelled sample workflows. Keep it private.',38,141,505,10.5,HexColor('#c1cdd0'))
c.linkURL('http://127.0.0.1:4318',(38,103,350,140),relative=0)
c.setFillColor(HexColor('#a7b7be'));c.setFont('Segoe',8);c.drawString(38,37,'24 OCTOBER 2026 / CURRENT LOCAL APPLICATION')
finish('Your visual operating guide')

y=base('Start here','A visit can take seconds.','Use this guide as a visual reference. The numbers below are PDF page numbers.',False)
contents=[('03','Unlock your private journal'),('04','Read Today and move around'),('05','Find a session'),('06','Read the session story'),('07','Save a run check-in'),('08','Write or edit a note'),('09','Record a gym check-in'),('10','Start using Sleep without a watch'),('11','Review a recorded night'),('12','Add sleep, a nap or a morning note'),('13','Explore weight and training'),('14','Use and adjust your plan'),('15','Record a historical session'),('16','Import history and review matches'),('17','Inspect the source behind a number'),('18','Export an encrypted backup'),('19','Restore a backup'),('20','Choose appearance and preferences'),('21','Connect Garmin when ready'),('22','Handle pending saves and conflicts'),('23','Quick reference and current limits'),('24','Compare light and dark appearance')]
for n,t in contents:
    c.setFont('SegoeBold',10);c.setFillColor(ACCENT);c.drawString(40,y,n)
    c.setFont('Segoe',10);c.setFillColor(INK);c.drawString(76,y,t);y-=23
para('Personal screens show the supplied history. Screens marked SAMPLE DATA demonstrate operations in a separate test journal. No test answers were added to your real training history.',38,113,519,9,MUTED)
finish('A visit can take seconds')

screen('Start','Unlock your private journal.','Start the local app, then sign in.',G/'unlock.jpg',[
('Open STRIDE','Run <b>npm start</b> from the application folder. Open <b>http://127.0.0.1:4318</b> on that computer.'),
('Find your owner key','Open <b>.stride-data/owner-key.txt</b> inside STRIDE_ASTRA_v1_FINAL. Copy the key privately.'),
('Unlock','Paste it into <b>Owner key</b>, then choose <b>Unlock journal</b>.')],
'The guide does not include your owner key. Localhost on an iPhone points to the phone itself; phone access needs a private HTTPS setup.')

screen('Everyday navigation','Read the daily finding.','Today brings one supported observation to the front.',SHOTS/'stride-tempo-today-mobile.jpg',[
('Read the lead observation','The date identifies the source session or night. The large number is tied to the explanation below it.'),
('Inspect if curious','Use <b>Behind the finding</b> to see inputs and calculations. Split buttons reveal recorded split values.'),
('Move to a task','Use the bottom tabs for <b>Sessions, Sleep, Explore</b> and <b>Plan</b>. The <b>+</b> opens quick logging; the gear opens data and settings.')],
'Missing days are not assumed to be rest days. Your two selected runs are examples from history, not a complete training archive.',False)

screen('Sessions','Find the session you want.','Browse imported history or add an older activity.',G/'sessions.jpg',[
('Choose a filter','Use <b>All, Running, Strength</b> or <b>Cardio</b> to narrow the list.'),
('Search','Enter a name, date or source in <b>Find a session</b>.'),
('Open a row','Tap the session to read its story. Use the <b>+</b> beside the filters to add a historical activity.')],
'Potential duplicates wait for review and stay outside ordinary totals until you decide.')

screen('Session story','Read the numbers in context.','Summary, splits and your own observations stay together.',G/'session.jpg',[
('Check the summary','Review date, source, distance, duration and pace. A date-only record has no invented start time.'),
('Inspect the splits','Tap a split for detail. Partial splits stay partial; summary data do not imply a continuous pace stream.'),
('Add your side','Choose <b>Add how it felt</b> or <b>Edit check-in</b> lower on the page. Source details, edit history, session editing and archiving are also there.')],
'Absent heart rate or cadence is labelled Not recorded, rather than plotted as zero.')

screen('Quick check-in','Four answers, then Save.','No typing is required for the standard run check-in.',G/'run-checkin.jpg',[
('Describe the effort','Choose <b>1-10</b>, then select whether you could talk in full sentences, short phrases or barely at all.'),
('Answer discomfort honestly','Choose <b>None, Mild</b> or <b>Affected run</b>. A location choice appears when relevant and stays optional.'),
('Finish and save','Choose the reserve left at the finish: <b>Plenty, Some</b> or <b>Nothing left</b>. Save becomes available after all four answers.')],
'Answers begin blank. You can correct them later; supported observations are recalculated. Actual iPhone timing remains to be verified.')

screen('Notes','Keep the detail only you know.','Notes are optional, editable and kept with the session.',G/'notes.jpg',[
('Jump straight to notes','Tap <b>Add a note</b> near the check-in heading, or scroll below the questions.'),
('Write naturally','Multiline text and emoji are supported. Your phone keyboard can provide dictation. Extra leg context is under <b>A little more context</b>.'),
('Save or return later','Finish the required answers and choose <b>Save check-in</b>. Unfinished drafts remain on this device; reopen the same session to continue.')],
'After saving, reopen the session and choose Edit check-in. Pending/offline status means the server has not yet confirmed the save.')

screen('Strength','Use the shorter gym check-in.','Strength feedback follows the work you actually did.',G/'gym-checkin.jpg',[
('Open the gym session','Find it under <b>Sessions > Strength</b>, then choose <b>Add how it felt</b>.'),
('Give three answers','Choose effort, completion (<b>All of it, Part of it, Changed it</b>) and discomfort. Add a note if useful.'),
('Save the context','Choose <b>Save check-in</b>. To record exercises, use <b>Edit session</b> or <b>Add sets & reps</b> from the story.')],
'Sets, reps and load are optional. The exercise format is described on page 15.')

screen('Sleep before a watch','Start with what you remember.','Sleep is available before Garmin is connected.',SHOTS/'stride-tempo-sleep-mobile.jpg',[
('Open Sleep','Choose the moon tab. The empty state means no nights have been recorded.'),
('Add a useful fragment','Scroll to <b>Add a night</b>. A duration, time interval, restedness or short note is enough.'),
('Keep it optional','There is no compulsory morning task. A gentle one-tap prompt can be enabled in preferences.')],
'No sleep score, HRV or stage chart is invented. The Garmin information link explains what may become available later.',False)

screen('Recorded sleep','Review a night and its timing.','This populated example uses invented test records.',G/'sleep-recorded.jpg',[
('Read the duration and schedule','A night is labelled by its local wake date. Start and wake times can cross midnight.'),
('Change the view','Use <b>7d, 14d</b> or <b>28d</b> for duration history. Use <b>Recorded mornings</b> to select another night.'),
('Add your interpretation','Choose <b>Edit this night</b> to add notes or restedness. Device estimates remain alongside what you felt.')],
'Stage totals are aggregates, not a stage-by-stage timeline. Naps stay separate. Missing nights do not mean zero sleep.')

screen('Sleep entry','Add a night, nap or note.','Fill only what you know; date is required.',G/'sleep-entry.jpg',[
('Choose date and type','Use the <b>wake date</b>. Select <b>Main sleep</b> or <b>Nap</b>.'),
('Enter known detail','Times use Melbourne time. If entering times, give both start and wake. Duration, restedness and notes are optional.'),
('Save','For a repeating daylight-saving time, choose the earlier or later occurrence. Choose <b>Save</b>; edit the record later if needed.')],
'Restedness alone is valid and leaves duration absent. A nap does not become an extra primary night.')

y=base('Explore','See the longer view.','Weight and training are shown from actual recorded observations.',True)
image(G/'explore-desktop.jpg',38,y,519,430)
yy=y-452
steps([('Set the range','Choose 30d, 90d or All for weight history. Weekly volume counts the records you supplied.'),('Inspect rather than guess','Tap a weight point for its date/value. Dots are measurements; squares are seven-day means where at least three records exist.')],38,yy,519)
finish('See the longer view')

screen('Plan','Keep the intention. Adjust the day.','Your plan can move without losing its original date.',G/'plan-edit.jpg',[
('Open or create an occurrence','In <b>Plan</b>, tap a session to edit it, or <b>+</b> to create a planned session.'),
('Adjust the prescription','Set the name, date, activity and optional minutes/notes. Mark planned, moved, complete, partial, changed or skipped.'),
('Link what happened','Select the actual recorded session under <b>Link an actual session</b>, then Save. Later edits create another version.')],
'The original hosted workout plan opens from the Plan page. Its exact structured prescriptions have not been imported or verified.')

screen('Manual history','Record a session from the past.','Useful when a source file is unavailable.',G/'activity-entry.jpg',[
('Open the form','Use <b>+ > A session</b> or the add button in Sessions.'),
('Enter available facts','Give a date, type and name. Distance, duration, precise start time and notes can be supplied when known.'),
('Add gym detail if useful','Expand <b>Sets & reps</b>. One line per exercise: <b>name, sets, reps, kg</b>. Leave kg blank for bodyweight, then Save.')],
'Do not guess a missing sensor value. Imported sessions can also be corrected through Edit session; the source is retained separately.')

screen('Imports','Bring your history together.','Preview the file before committing its records.',G/'import.jpg',[
('Choose a supported source','Open <b>Data & privacy > Import a file</b>. Select MASS JSON, Strava ZIP/CSV, FIT, TCX, GPX or supported compressed activity.'),
('Review the preview','Choose <b>Preview import</b>. Check file name, record counts and warnings before <b>Import these records</b>.'),
('Review uncertain matches','Use <b>Review possible duplicates</b>. Merge into the existing session or keep it separate. Uncertain candidates stay out of totals.')],
'The individual file limit is 32 MB. Reimporting stable source IDs updates/matches existing records. Original files and an import audit are retained.')

screen('Evidence','Inspect where a number came from.','Source detail is available when you want it.',G/'source.jpg',[
('Open the source view','From Session Story choose <b>Source & calculations</b>. From Today choose <b>Behind the finding</b>.'),
('Check measurement or calculation','The source view identifies reported versus calculated pace, time precision and available samples. Findings expose their inputs.'),
('Inspect originals and edits','When an imported source is attached, download it from the source view. <b>Edit history</b> shows earlier saved versions.')],
'This test session is manual and has no attached raw import, so no original-file download appears in this example.')

screen('Backup','Keep an encrypted copy.','Store the backup and its passphrase separately.',G/'backup-export.jpg',[
('Open export','Choose <b>Data & privacy > Export encrypted backup</b>.'),
('Choose a passphrase','Use at least 12 characters and repeat it. Keep it somewhere you can recover it.'),
('Download and keep a second copy','Choose <b>Encrypt & download</b>. Move the .stride file to another private storage location and test recovery in a separate installation.')],
'Exports contain records, notes, original imports and revision history. They exclude owner-login sessions and Garmin credentials. The passphrase cannot be recovered.')

screen('Recovery','Preview before restoring.','Restore replaces the current journal with the backup.',G/'backup-restore.jpg',[
('Resolve pending work','Finish or resolve queued saves before restoring.'),
('Open the encrypted file','Choose <b>Restore a backup</b>, select the .stride file and enter its passphrase. Choose <b>Preview backup</b>.'),
('Check, then confirm','Review the date and counts. Type <b>RESTORE</b> only when they are correct, then choose <b>Restore this backup</b>.')],
'A local recovery checkpoint is made first. Server login and connector credentials stay on that server; a fresh installation needs its own setup.')

screen('Preferences','Make the journal yours.','Appearance and optional prompts live in Data & privacy.',G/'preferences.jpg',[
('Choose an appearance','Select <b>dark, light</b> or <b>system</b>. The system option follows the device appearance.'),
('Set only useful extras','An optional sleep target is entered in minutes. Morning note prompts and available overnight SpO2 display are opt-in.'),
('Save preferences','Choose <b>Save preferences</b>. Use <b>Lock this journal</b> lower on the page when you want to clear the local view.')],
'Lock asks you to resolve unfinished drafts or pending saves first. Light and dark alternatives are included in the current app.')

screen('Optional connection','Connect Garmin when ready.','No live Garmin key or watch data was supplied for this build.',G/'garmin.jpg',[
('Create a Personal API key','Use the official portal linked in the form. Enter the key and expiry date if known.'),
('Save, then verify','Choose <b>Save key securely</b>. The connection remains unverified until a successful sync.'),
('Start with a short range','Use <b>Sync a date range</b> for a known run and night. Compare the results with Garmin Connect before expanding, up to 31 days.')],
'Your key stays on the server. Field availability depends on the real account and watch. Live connectivity and actual device coverage remain unverified.')

screen('Offline and conflicts','Know when a save is pending.','The small status button opens work kept on this device.',G/'sync-queue.jpg',[
('Watch the status','A save can be kept locally when the server is unavailable. <b>Waiting to sync</b> means it has not been confirmed there.'),
('Reconnect and retry','Open the status button or <b>Saved drafts & sync queue</b>. Choose <b>Try syncing now</b> after reconnecting.'),
('Choose between conflicting edits','When two versions changed, compare them. Explicitly keep your draft over the server version or discard the queued save.')],
'This screenshot has no pending saves. The outage/reload/reconnect and conflict flows were tested with sample records. Do not clear browser storage while work is pending.')

y=base('Quick reference','What to do next time.','A short checklist for routine use and the current build.',False)
for head,body in [
('After a run','Sessions > open run > Add how it felt > four answers > Save check-in.'),
('After gym','Sessions > Strength > open session > effort, completion, discomfort > Save.'),
('In the morning','Sleep > Add a night, or use the optional one-tap prompt. Skip means no observation.'),
('When history arrives','Data & privacy > Import a file > Preview > Import > review possible duplicates.'),
('Before a server move','Export an encrypted backup, keep the passphrase separately and test isolated restore.'),
('If something is wrong','Edit the session/night, inspect its source/history, or archive it. Archived records can be restored in Data & privacy.'),
('Still to verify','Actual iPhone Safari, VoiceOver, installed PWA and real keyboard use; live Garmin payloads; exact hosted-plan structure.'),
('Private deployment','The current app runs on this computer. Phone access needs an approved private HTTPS setup. No public deployment was made.')]:
    y=para(head,38,y,519,12,INK,True)
    y=para(body,38,y-7,519,10.5,MUTED)-22
para('This PDF is an operating guide, not a record of real watch measurements. Sample screenshots illustrate controls and workflows. Keep personal-screen captures private.',38,108,519,9,MUTED)
finish('What to do next time')
y=base('Appearance options','Light or dark. Still Tempo.','The same Plan screen in the two available appearances.',True)
image(G/'appearance-light.jpg',38,y,246,535)
image(G/'appearance-dark.jpg',311,y,246,535)
para('LIGHT',38,y-551,246,10,ACCENT,True)
para('DARK',311,y-551,246,10,ACCENT,True)
para('Choose Data & privacy > Appearance > light, dark or system, then Save preferences. System follows your device preference.',38,89,519,9,MUTED)
finish('Light or dark. Still Tempo')
c.save()
doc=PdfReader(pdf)
assert len(doc.pages)==24,len(doc.pages)
subprocess.run(['C:/Users/ASUS/.cache/codex-runtimes/codex-primary-runtime/dependencies/native/poppler/Library/bin/pdftoppm.exe','-r','90','-png',str(pdf),str(RENDERS/'page')],check=True)
thumbs=[]
for i in range(len(doc.pages)):
    im=Image.open(RENDERS/f'page-{i+1:02d}.png').convert('RGB');im.thumbnail((178,252))
    tile=Image.new('RGB',(198,280),'#dde2df');tile.paste(im,((198-im.width)//2,7));thumbs.append(tile)
sheet=Image.new('RGB',(198*5,280*5),'#dde2df')
for i,im in enumerate(thumbs):sheet.paste(im,((i%5)*198,(i//5)*280))
sheet.save(RENDERS/'contact-sheet.jpg',quality=90)
print(f'Created {pdf} | {len(doc.pages)} pages | {pdf.stat().st_size:,} bytes')
print(f'Rendered pages and contact sheet: {RENDERS}')
