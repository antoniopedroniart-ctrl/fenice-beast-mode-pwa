import React, { useEffect, useMemo, useState } from 'react';

type StudyLog = { date:string; subject:string; minutes:number; note?:string };
type LogEntry = { date:string; type:'workout'|'study'; minutes?:number; payload?:any };
type BodyEntry = { date:string; weight_kg?:number; bf?:number };

type Exam = {
  title: string;
  subjectKey: string;        // deve combaciare con Study.tsx (es. "Biochimica 1")
  date: string;              // YYYY-MM-DD
  targetHours: number;       // ore previste totali
};

const EXAMS: Exam[] = [
  { title: 'Biochimica 1',          subjectKey: 'Biochimica 1',        date: '2025-12-10', targetHours: 60 },
  { title: 'Semeiotica Med/Chir',   subjectKey: 'Semeiotica Med/Chir', date: '2025-12-16', targetHours: 30 },
  { title: 'Istologia',             subjectKey: 'Istologia',            date: '2026-01-07', targetHours: 70 },
  { title: 'Anatomia',              subjectKey: 'Anatomia',             date: '2026-01-08', targetHours: 120 },
  { title: 'Biochimica 2',          subjectKey: 'Biochimica 2',        date: '2026-01-15', targetHours: 80 },
  { title: 'Immunologia',           subjectKey: 'Immunologia',          date: '2026-01-28', targetHours: 70 },
];

function daysLeft(dIso:string){
  const x=new Date(dIso);
  const t=new Date();
  t.setHours(0,0,0,0);
  const diffMs = x.getTime() - t.getTime();
  return Math.ceil(diffMs/(1000*60*60*24));
}
function barColor(days:number){ if(days>21) return '#10b981'; if(days>=10) return '#f59e0b'; return '#ef4444'; }
function clamp01(x:number){ return Math.max(0, Math.min(1, x)); }

export default function Dashboard(){
  // seed iniziale misure se mancano (una sola volta)
  useEffect(()=>{ try{
    if(!localStorage.getItem('fenice.logs')){
      const today=new Date().toISOString().slice(0,10);
      localStorage.setItem('fenice.logs', JSON.stringify([{date:today, weight_kg:80.35, bf:12.5}]));
    }
  }catch{} },[]);

  // letture storage
  const [study] = useState<StudyLog[]>(()=>{ try{ return JSON.parse(localStorage.getItem('fenice.study')||'[]'); }catch{ return []; } });
  const [activity] = useState<LogEntry[]>(()=>{ try{ return JSON.parse(localStorage.getItem('fenice.activity')||'[]'); }catch{ return []; } });
  const [body] = useState<BodyEntry[]>(()=>{ try{ return JSON.parse(localStorage.getItem('fenice.logs')||'[]'); }catch{ return []; } });

  const latestBody = useMemo(()=> (body||[]).slice().sort((a,b)=>(a.date<b.date)?1:-1)[0], [body]);
  const workoutsThisWeek = useMemo(()=>{
    const start=new Date(); const wd=(start.getDay()+6)%7; start.setDate(start.getDate()-wd); start.setHours(0,0,0,0);
    const end=new Date(start); end.setDate(end.getDate()+7);
    return (activity||[]).filter(a=> a.type==='workout' && new Date(a.date)>=start && new Date(a.date)<end).length;
  },[activity]);

  // minuti di studio per materia (lifetime e settimana)
  const studyBySubject = useMemo(()=>{
    const mapAll = new Map<string, number>();
    const start=new Date(); const wd=(start.getDay()+6)%7; start.setDate(start.getDate()-wd); start.setHours(0,0,0,0);
    const end=new Date(start); end.setDate(end.getDate()+7);
    let weekMap = new Map<string,number>();
    for(const l of (study||[])){
      mapAll.set(l.subject, (mapAll.get(l.subject)||0) + (l.minutes||0));
      const d=new Date(l.date);
      if(d>=start && d<end) weekMap.set(l.subject, (weekMap.get(l.subject)||0) + (l.minutes||0));
    }
    return { all: mapAll, week: weekMap };
  },[study]);

  // tot ore studiate (tutte materie) — utile come KPI generale
  const totalHoursAll = useMemo(()=>{
    let tot=0; for(const l of (study||[])) tot += (l.minutes||0);
    return tot/60;
  },[study]);

  return (
    <section className="grid" style={{gap:16}}>
      {/* KPI */}
      <div className="card">
        <h2 style={{fontSize:18,fontWeight:700,marginBottom:8}}>KPI Settimana</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:12}}>
          <div className="card">
            <div className="muted">Allenamenti (sett.)</div>
            <div style={{fontSize:28,fontWeight:800}}>{workoutsThisWeek}</div>
          </div>
          <div className="card">
            <div className="muted">Ore di studio (tot.)</div>
            <div style={{fontSize:28,fontWeight:800}}>{totalHoursAll.toFixed(1)}</div>
          </div>
          <div className="card">
            <div className="muted">Peso / BF</div>
            <div style={{fontSize:20,fontWeight:700}}>{latestBody? `${latestBody.weight_kg||'-'} kg · ${latestBody.bf||'-'}%`:'—'}</div>
          </div>
        </div>
        <div className="muted" style={{marginTop:8,fontSize:12}}>
          Le ore di studio per **esame** qui sotto derivano dal logger in <b>Study</b> (localStorage <code>fenice.study</code>).
        </div>
      </div>

      {/* Esami collegati alle ore reali loggate per materia */}
      <div className="card">
        <h2 style={{fontSize:18,fontWeight:700,marginBottom:8}}>Esami — countdown & avanzamento per materia</h2>
        <div style={{display:'grid', gap:10}}>
          {EXAMS.map((ex,i)=>{
            const dl = daysLeft(ex.date);
            const needColor = barColor(dl);
            const minutesDone = studyBySubject.all.get(ex.subjectKey) || 0;
            const hoursDone = minutesDone/60;
            const pct = Math.round(clamp01(hoursDone / ex.targetHours)*100);

            // Quota giornaliera necessaria per arrivare a target
            const remainingHours = Math.max(0, ex.targetHours - hoursDone);
            const perDay = dl>0 ? (remainingHours/dl) : remainingHours;

            return (
              <div key={i} className="card" style={{padding:12}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', flexWrap:'wrap', gap:8}}>
                  <div style={{fontWeight:800}}>{ex.title}</div>
                  <div className="muted">Data: {new Date(ex.date).toLocaleDateString('it-IT')} · Mancano <b style={{color:needColor}}>{dl} giorni</b></div>
                </div>

                <div style={{marginTop:6, fontSize:13}} className="muted">
                  Materia: <b>{ex.subjectKey}</b> · Target: <b>{ex.targetHours} h</b> · Studiate: <b>{hoursDone.toFixed(1)} h</b> {remainingHours>0 && <>· Necessarie: <b>{perDay.toFixed(1)} h/giorno</b></>}
                </div>

                <div style={{marginTop:8}}>
                  <div className="muted" style={{fontSize:12, marginBottom:4}}>Avanzamento ( {pct}% )</div>
                  <div style={{height:12, background:'#e5e7eb', borderRadius:8, overflow:'hidden'}}>
                    <div style={{width:`${pct}%`, height:'100%', background:needColor}} />
                  </div>
                </div>

                {/* mini breakdown settimanale */}
                <div style={{marginTop:8, fontSize:12}} className="muted">
                  Questa settimana su <b>{ex.subjectKey}</b>: {( (studyBySubject.week.get(ex.subjectKey)||0) /60 ).toFixed(1)} h
                </div>
              </div>
            );
          })}
        </div>

        <div className="muted" style={{marginTop:8,fontSize:12}}>
          Colori barra: verde (&gt;21 gg), giallo (10–21), rosso (&lt;10).<br/>
          Per associare lo studio a un esame, nel logger **Study** seleziona la materia corrispondente (i nomi combaciano con “subjectKey”).
        </div>
      </div>
    </section>
  );
}
