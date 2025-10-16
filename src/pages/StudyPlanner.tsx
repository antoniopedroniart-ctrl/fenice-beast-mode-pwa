import React, { useEffect, useMemo, useState } from 'react';

const SPLIT: Record<number,string> = {0:'Push',1:'Pull',2:'Legs',3:'Chest & Back',4:'Shoulders & Arms'};

const EXAMS: {title:string; date:string}[] = [
  { title:"Biochimica 1", date:"2025-12-10" },
  { title:"Semeiotica Med/Chir", date:"2025-12-16" },
  { title:"Istologia", date:"2026-01-07" },
  { title:"Anatomia", date:"2026-01-08" },
  { title:"Biochimica 2", date:"2026-01-15" },
  { title:"Immunologia", date:"2026-01-28" },
];

const SUBJECT_WINDOWS = [
  { until: new Date(2025,10,10), pri:'Biochimica 1', sec:'Istologia' },
  { until: new Date(2025,11, 1), pri:'Biochimica 1', sec:'Anatomia' },
  { until: new Date(2025,11,16), pri:'Biochimica 1', sec:'Semeiotica Med/Chir' },
  { until: new Date(2026, 0, 8), pri:'Anatomia',     sec:'Istologia' },
  { until: new Date(2026, 0,15), pri:'Biochimica 2', sec:'Anatomia' },
  { until: new Date(2026, 0,28), pri:'Immunologia',  sec:'Biochimica 2' },
];

const START = new Date(2025,9,20);
const END   = new Date(2026,0,28);

function weekStart(d: Date) { const x=new Date(d); const wd=(x.getDay()+6)%7; x.setDate(x.getDate()-wd); x.setHours(0,0,0,0); return x; }
function addDays(d: Date, n: number) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()+n); }
function ymd(d: Date) { return d.toISOString().slice(0,10); }
function subjectFor(date: Date){ for(const w of SUBJECT_WINDOWS){ if(date <= w.until) return { pri:w.pri, sec:w.sec }; } return { pri:'Consolidamento', sec:'Recupero' }; }

type IcsEvent = { DTSTART: Date; DTEND: Date; SUMMARY: string };
function unfoldICS(text:string){ const out:string[]=[]; let buf:string|null=null; for(const raw of text.split(/\r?\n/)){ if(raw.startsWith(' ')||raw.startsWith('\t')){ if(buf!==null) buf += raw.slice(1); } else { if(buf!==null) out.push(buf); buf=raw; } } if(buf!==null) out.push(buf); return out; }
function parseIcsDate(s:string){ const y=+s.slice(0,4), m=+s.slice(4,6)-1, d=+s.slice(6,8), hh=+s.slice(9,11), mm=+s.slice(11,13); return new Date(y,m,d,hh,mm,0,0); }
function parseICS(text:string):IcsEvent[]{ const lines=unfoldICS(text); const evs:IcsEvent[]=[]; let cur:any=null, inEv=false; for(const ln of lines){ if(ln==='BEGIN:VEVENT'){ inEv=true; cur={}; continue;} if(ln==='END:VEVENT'){ inEv=false; if(cur.DTSTART&&cur.DTEND&&cur.SUMMARY) evs.push(cur as IcsEvent); cur=null; continue;} if(!inEv) continue; if(ln.startsWith('DTSTART')){ const m=ln.match(/:(\d{8}T\d{6})/); if(m) cur.DTSTART=parseIcsDate(m[1]); } else if(ln.startsWith('DTEND')){ const m=ln.match(/:(\d{8}T\d{6})/); if(m) cur.DTEND=parseIcsDate(m[1]); } else if(ln.startsWith('SUMMARY:')) cur.SUMMARY=ln.split(':',2)[1]; } return evs; }
function overlapDay(e:IcsEvent, d:Date){ const ds=new Date(d.getFullYear(),d.getMonth(),d.getDate(),0,0,0,0); const de=new Date(ds.getTime()+24*60*60*1000); const S=e.DTSTART<ds? ds:e.DTSTART; const E=e.DTEND>de? de:e.DTEND; return S<E ? {s:S,e:E}: null; }
function formatHHMM(dt:Date){ return dt.toTimeString().slice(0,5); }

function lessonsOn(events:IcsEvent[], d:Date){
  const out:{t:string; title:string}[]=[];
  for(const ev of events){ const seg=overlapDay(ev,d); if(!seg) continue; out.push({t:`${formatHHMM(seg.s)}–${formatHHMM(seg.e)}`, title: ev.SUMMARY}); }
  out.sort((a,b)=> a.t.localeCompare(b.t));
  return out;
}

function buildDay(events:IcsEvent[], d:Date){
  const wd=(d.getDay()+6)%7;
  const {pri,sec} = subjectFor(d);
  const items:{cls:string; text:string}[]=[];

  // Sveglia/transfer (se potenziale lezione mattina)
  items.push({cls:'sys', text:'Sveglia 06:00'});
  items.push({cls:'sys', text:'Transfer 07:00–08:00'});

  // Lezioni ICS
  for(const le of lessonsOn(events, d)){ items.push({cls:'les', text:`Lezione ${le.t}: ${le.title}`}); }

  // Studio
  items.push({cls:'stu', text:`Studio (mattina) 05:00–07:00: ${pri}`});
  if(wd===0) items.push({cls:'stu', text:`Studio (pomeriggio) 14:00–17:30: ${pri}`});
  if(wd===5||wd===6) items.push({cls:'stu', text:`Studio (pausa lavoro) 16:00–17:30: ${sec}`});
  if(wd<=4) items.push({cls:'stu', text:`Studio (notte) 03:30–05:00: ${pri}`});

  // Lavoro
  if([1,2,3,4].includes(wd)) items.push({cls:'wrk', text:'Lavoro 18:00–00:30 (rientro ~01:30)'});
  if([5,6].includes(wd)){ items.push({cls:'wrk', text:'Lavoro 10:30–16:00'}); items.push({cls:'wrk', text:'Lavoro 18:00–00:30 (rientro ~01:30)'}); }

  // Allenamento notte
  if(wd<=4) items.push({cls:'gym', text:`Training — ${SPLIT[wd]} (01:45) ~01:45–03:15 + Abs finisher`});

  // Esami
  const hit = EXAMS.find(e=> e.date===ymd(d));
  if(hit) items.push({cls:'exm', text:`📌 ESAME: ${hit.title}`});

  return items;
}

export default function StudyPlanner(){
  const [weekStartDate, setWeekStartDate] = useState(()=>weekStart(START));
  const [events,setEvents]=useState<IcsEvent[]>([]);
  const weekDays = useMemo(()=> Array.from({length:7}, (_,i)=> addDays(weekStartDate, i)), [weekStartDate]);

  useEffect(()=>{
    (async ()=>{
      try{
        const base = import.meta.env.BASE_URL || '/';
        const res = await fetch(`${base}fenice_calendar_unified.ics`, {cache:'no-store'});
        if(!res.ok) return setEvents([]);
        setEvents(parseICS(await res.text()));
      }catch{ setEvents([]); }
    })();
  },[]);

  return (
    <section className="grid" style={{gap:16}}>
      <div className="card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <h2 style={{fontSize:18,fontWeight:700}}>📚 Study Planner — Agenda giornaliera (settimanale)</h2>
          <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
            <button className="btn" onClick={()=>setWeekStartDate(w=> new Date(w.getFullYear(), w.getMonth(), w.getDate()-7))}>← Settimana</button>
            <button className="btn" onClick={()=>setWeekStartDate(weekStart(new Date()))}>Oggi</button>
            <button className="btn" onClick={()=>setWeekStartDate(w=> new Date(w.getFullYear(), w.getMonth(), w.getDate()+7))}>Settimana →</button>
            <button className="btn primary" onClick={()=>window.print()}>Stampa / PDF</button>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(7, minmax(0,1fr))', gap:10}}>
          {weekDays.map((d,i)=>(
            <div key={i} className="card" style={{padding:10}}>
              <div style={{fontWeight:800, marginBottom:6}}>
                {d.toLocaleDateString('it-IT', {weekday:'short', day:'2-digit', month:'2-digit'})}
              </div>
              {buildDay(events, d).map((it,idx)=>(
                <div key={idx} style={{
                  border:'1px solid var(--border,#e5e7eb)', borderLeftWidth:4, borderRadius:8, padding:'6px 8px', marginBottom:6,
                  borderLeftColor: it.cls==='les' ? '#60a5fa' : it.cls==='stu' ? '#34d399' : it.cls==='wrk' ? '#f59e0b' : it.cls==='gym' ? '#a78bfa' : it.cls==='exm' ? '#ef4444' : '#9ca3af'
                }}>
                  <div style={{fontSize:13, lineHeight:1.35}}>{it.text}</div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="muted" style={{marginTop:8, fontSize:12}}>
          Include: Sveglia 06:00, Transfer 07:00–08:00 (quando serve), Lezioni (ICS), Studio (05–07; lun 14–17:30; sab/dom 16–17:30; notte 03:30–05 lun–ven),
          Lavoro (secondo schema), Allenamento notturno (lun–ven).
        </div>
      </div>
    </section>
  );
}
