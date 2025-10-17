// src/pages/Dashboard.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

type StudyLog = { date:string; subject:string; minutes:number; note?:string };
type LogEntry = { date:string; type:'workout'|'study'; minutes?:number; payload?:any };
type BodyEntry = { date:string; weight_kg?:number; bf?:number };

type Exam = {
  title: string;
  subjectKey: string;
  date: string;          // YYYY-MM-DD
  targetHours: number;   // ore previste totali
};

const EXAMS: Exam[] = [
  { title: 'Biochimica 1',          subjectKey: 'Biochimica 1',        date: '2025-12-10', targetHours: 60 },
  { title: 'Semeiotica Med/Chir',   subjectKey: 'Semeiotica Med/Chir', date: '2025-12-16', targetHours: 30 },
  { title: 'Istologia',             subjectKey: 'Istologia',           date: '2026-01-07', targetHours: 70 },
  { title: 'Anatomia',              subjectKey: 'Anatomia',            date: '2026-01-08', targetHours: 120 },
  { title: 'Biochimica 2',          subjectKey: 'Biochimica 2',        date: '2026-01-15', targetHours: 80 },
  { title: 'Immunologia',           subjectKey: 'Immunologia',         date: '2026-01-28', targetHours: 70 },
];

function daysLeft(dIso:string){
  const x=new Date(dIso);
  const t=new Date(); t.setHours(0,0,0,0);
  return Math.ceil((x.getTime()-t.getTime())/(1000*60*60*24));
}
function clamp01(x:number){ return Math.max(0, Math.min(1, x)); }

export default function Dashboard(){
  // Seed iniziale misure se mancano
  useEffect(()=>{ try{
    if(!localStorage.getItem('fenice.logs')){
      const today=new Date().toISOString().slice(0,10);
      localStorage.setItem('fenice.logs', JSON.stringify([{date:today, weight_kg:80.35, bf:12.5}]));
    }
  }catch{} },[]);

  // Storage reads
  const [study] = useState<StudyLog[]>(()=>{ try{ return JSON.parse(localStorage.getItem('fenice.study')||'[]'); }catch{ return []; } });
  const [activity] = useState<LogEntry[]>(()=>{ try{ return JSON.parse(localStorage.getItem('fenice.activity')||'[]'); }catch{ return []; } });
  const [body] = useState<BodyEntry[]>(()=>{ try{ return JSON.parse(localStorage.getItem('fenice.logs')||'[]'); }catch{ return []; } });

  const latestBody = useMemo(()=> (body||[]).slice().sort((a,b)=>(a.date<b.date)?1:-1)[0], [body]);

  // KPI settimana
  const workoutsThisWeek = useMemo(()=>{
    const start=new Date(); const wd=(start.getDay()+6)%7; start.setDate(start.getDate()-wd); start.setHours(0,0,0,0);
    const end=new Date(start); end.setDate(end.getDate()+7);
    return (activity||[]).filter(a=> a.type==='workout' && new Date(a.date)>=start && new Date(a.date)<end).length;
  },[activity]);

  const hoursThisWeek = useMemo(()=>{
    const start=new Date(); const wd=(start.getDay()+6)%7; start.setDate(start.getDate()-wd); start.setHours(0,0,0,0);
    const end=new Date(start); end.setDate(end.getDate()+7);
    let min=0;
    for(const l of (study||[])){ const d=new Date(l.date); if(d>=start && d<end) min += (l.minutes||0); }
    return min/60;
  },[study]);

  const totalHoursAll = useMemo(()=>{
    let tot=0; for(const l of (study||[])) tot += (l.minutes||0);
    return tot/60;
  },[study]);

  // Aggregazioni per esame
  const studyBySubject = useMemo(()=>{
    const mapAll = new Map<string, number>();
    const start=new Date(); const wd=(start.getDay()+6)%7; start.setDate(start.getDate()-wd); start.setHours(0,0,0,0);
    const end=new Date(start); end.setDate(end.getDate()+7);
    const weekMap = new Map<string,number>();
    for(const l of (study||[])){
      mapAll.set(l.subject, (mapAll.get(l.subject)||0) + (l.minutes||0));
      const d=new Date(l.date);
      if(d>=start && d<end) weekMap.set(l.subject, (weekMap.get(l.subject)||0) + (l.minutes||0));
    }
    return { all: mapAll, week: weekMap };
  },[study]);

  // Prossimi 3 esami (ordinati)
  const nextExams = useMemo(()=>{
    const list = EXAMS.slice().sort((a,b)=> (a.date < b.date ? -1 : 1));
    const todayISO = new Date().toISOString().slice(0,10);
    return list.filter(e=> e.date >= todayISO).slice(0,3);
  },[]);

  return (
    <section className="grid" style={{gap:16}}>
      {/* ======= HERO Premium ======= */}
      <div className="card" style={{
        padding: 22,
        background: 'linear-gradient(135deg, color-mix(in oklab, var(--accent) 18%, var(--card)), var(--card))',
        borderColor: 'color-mix(in oklab, var(--accent) 20%, var(--border))',
        boxShadow: '0 16px 40px color-mix(in oklab, var(--accent) 22%, transparent)'
      }}>
        <div style={{display:'grid', gridTemplateColumns:'1.2fr .8fr', gap:18}}>
          {/* Colonna sinistra: headline + CTA */}
          <div>
            <div style={{display:'inline-flex', alignItems:'center', gap:8, padding:'6px 10px',
              borderRadius:999, background:'color-mix(in oklab, var(--card) 70%, transparent)', border:'1px solid var(--border)'}}>
              <span className="muted" style={{fontWeight:800, letterSpacing:.3}}>BEAST MODE</span>
              <span>— build · learn · cut</span>
            </div>
            <h1 style={{margin:'10px 0 6px 0', fontSize:28, fontWeight:900, letterSpacing:.3}}>Pronto a dominare la giornata</h1>
            <div className="muted" style={{marginBottom:14}}>
              Allenamento, nutrizione e studio in un’unica plancia. Stat live, prossimi esami e accessi rapidi.
            </div>
            <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
              <Link to="/training" className="btn primary">Vai ad Allenamento</Link>
              <Link to="/nutrition" className="btn">Piano Nutrizione</Link>
              <Link to="/study" className="btn ghost">Logger Studio</Link>
            </div>
          </div>

          {/* Colonna destra: KPI compatti */}
          <div className="card" style={{padding:14}}>
            <div style={{display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:12}}>
              <div className="card" style={{textAlign:'center'}}>
                <div className="muted">Allenamenti (sett.)</div>
                <div style={{fontSize:26, fontWeight:900}}>{workoutsThisWeek}</div>
              </div>
              <div className="card" style={{textAlign:'center'}}>
                <div className="muted">Studio (sett.)</div>
                <div style={{fontSize:26, fontWeight:900}}>{hoursThisWeek.toFixed(1)} h</div>
              </div>
              <div className="card" style={{textAlign:'center'}}>
                <div className="muted">Peso / BF</div>
                <div style={{fontSize:18, fontWeight:800}}>
                  {latestBody? `${latestBody.weight_kg||'-'} kg · ${latestBody.bf||'-'}%`:'—'}
                </div>
              </div>
            </div>

            <div style={{marginTop:12}}>
              <div className="muted" style={{fontSize:12, marginBottom:6}}>Prossimi esami</div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:10}}>
                {nextExams.map((ex,i)=>{
                  const dl = daysLeft(ex.date);
                  const minutesDone = studyBySubject.all.get(ex.subjectKey) || 0;
                  const hoursDone = minutesDone/60;
                  const pct = Math.round(clamp01(hoursDone / ex.targetHours) * 100);
                  return (
                    <div key={i} className="card" style={{padding:10}}>
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:6}}>
                        <div style={{fontWeight:800}}>{ex.title}</div>
                        <div className="muted" style={{fontSize:12}}>in {dl} gg</div>
                      </div>
                      <div className="muted" style={{fontSize:12, marginTop:4}}>
                        {hoursDone.toFixed(1)} / {ex.targetHours} h
                      </div>
                      <div className="progress" style={{marginTop:6}}>
                        <div className="bar" style={{width:`${pct}%`}} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{display:'flex', justifyContent:'flex-end', marginTop:10}}>
                <Link to="/study-planner" className="btn">Apri Study Planner</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======= Sezione esami completa ======= */}
      <div className="card">
        <h2 style={{fontSize:18,fontWeight:800,marginBottom:8}}>Panoramica studi per esame</h2>
        <div style={{display:'grid', gap:10}}>
          {EXAMS.map((ex,i)=>{
            const dl = daysLeft(ex.date);
            const minutesDone = studyBySubject.all.get(ex.subjectKey) || 0;
            const hoursDone = minutesDone/60;
            const pct = Math.round(clamp01(hoursDone / ex.targetHours) * 100);
            const remainingHours = Math.max(0, ex.targetHours - hoursDone);
            const perDay = dl>0 ? (remainingHours/dl) : remainingHours;

            return (
              <div key={i} className="card" style={{padding:12}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', flexWrap:'wrap', gap:8}}>
                  <div style={{fontWeight:800}}>{ex.title}</div>
                  <div className="muted">Data: {new Date(ex.date).toLocaleDateString('it-IT')} · Mancano <b>{dl} giorni</b></div>
                </div>
                <div className="muted" style={{fontSize:13, marginTop:4}}>
                  Materia: <b>{ex.subjectKey}</b> · Target: <b>{ex.targetHours} h</b> · Studiate: <b>{hoursDone.toFixed(1)} h</b>
                  {remainingHours>0 && <> · Necessarie: <b>{perDay.toFixed(1)} h/giorno</b></>}
                </div>
                <div className="progress" style={{marginTop:8}}>
                  <div className="bar" style={{width:`${pct}%`}} />
                </div>
                <div className="muted" style={{fontSize:12, marginTop:6}}>
                  Questa settimana su <b>{ex.subjectKey}</b>: {( (studyBySubject.week.get(ex.subjectKey)||0) /60 ).toFixed(1)} h
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ======= KPI generali/quick tiles ======= */}
      <div className="card">
        <h2 style={{fontSize:18,fontWeight:800,marginBottom:8}}>Panoramica rapida</h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:12}}>
          <div className="card" style={{textAlign:'center'}}>
            <div className="muted">Allenamenti (sett.)</div>
            <div style={{fontSize:28, fontWeight:900}}>{workoutsThisWeek}</div>
          </div>
          <div className="card" style={{textAlign:'center'}}>
            <div className="muted">Ore studio (tot.)</div>
            <div style={{fontSize:28, fontWeight:900}}>{totalHoursAll.toFixed(1)}</div>
          </div>
          <div className="card" style={{textAlign:'center'}}>
            <div className="muted">Peso / BF</div>
            <div style={{fontSize:20, fontWeight:800}}>{latestBody? `${latestBody.weight_kg||'-'} kg · ${latestBody.bf||'-'}%`:'—'}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
