import React, { useEffect, useMemo, useState } from 'react';

type LogEntry = { date:string; type:'workout'|'study'; minutes?:number; payload?:any };
type BodyEntry = { date:string; weight_kg?:number; bf?:number };

const EXAMS = [
  { title:"Biochimica 1", date:"2025-12-10", targetHours: 60 },
  { title:"Semeiotica Med/Chir", date:"2025-12-16", targetHours: 30 },
  { title:"Istologia", date:"2026-01-07", targetHours: 70 },
  { title:"Anatomia", date:"2026-01-08", targetHours: 120 },
  { title:"Biochimica 2", date:"2026-01-15", targetHours: 80 },
  { title:"Immunologia", date:"2026-01-28", targetHours: 70 },
];

function daysLeft(d:string){ const x=new Date(d); const today=new Date(); const diff=Math.ceil((x.getTime()-today.setHours(0,0,0,0))/(1000*60*60*24)); return diff; }
function barColor(days:number){ if(days>21) return '#10b981'; if(days>=10) return '#f59e0b'; return '#ef4444'; }

export default function Dashboard(){
  // Seed iniziale misure una tantum
  useEffect(()=>{ try{ if(!localStorage.getItem('fenice.logs')){ const today=new Date().toISOString().slice(0,10); localStorage.setItem('fenice.logs', JSON.stringify([{date:today, weight_kg:80.35, bf:12.5, waist_cm:87, chest_cm:103, arm_r_cm:34.5, arm_l_cm:34.5, thigh_r_cm:57.5, thigh_l_cm:56.5}])); } }catch{} },[]);

  const [activity] = useState<LogEntry[]>(()=>{ try{ return JSON.parse(localStorage.getItem('fenice.activity')||'[]'); }catch{ return []; } });
  const [body] = useState<BodyEntry[]>(()=>{ try{ return JSON.parse(localStorage.getItem('fenice.logs')||'[]'); }catch{ return []; } });

  const latestBody = useMemo(()=> (body||[]).slice().sort((a,b)=>(a.date<b.date)?1:-1)[0], [body]);
  const workoutsDone = useMemo(()=> (activity||[]).filter(a=> a.type==='workout').length, [activity]);
  const studyHoursByExam = useMemo(()=>{
    // sommo tutte le ore "study" senza separazione per esame — puoi estendere con payload.exam
    const totalMin = (activity||[]).filter(a=> a.type==='study').reduce((s,a)=> s+(a.minutes||0),0);
    return totalMin/60;
  }, [activity]);

  return (
    <section className="grid grid-2">
      <div className="card">
        <h2 style={{fontSize:18,fontWeight:700,marginBottom:8}}>KPI Settimana</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:12}}>
          <div className="card"><div className="muted">Allenamenti completati</div><div style={{fontSize:28,fontWeight:800}}>{workoutsDone}</div></div>
          <div className="card"><div className="muted">Ore di studio loggate</div><div style={{fontSize:28,fontWeight:800}}>{studyHoursByExam.toFixed(1)}</div></div>
          <div className="card"><div className="muted">Peso / BF</div><div style={{fontSize:20,fontWeight:700}}>{latestBody? `${latestBody.weight_kg||'-'} kg · ${latestBody.bf||'-'}%`: '—'}</div></div>
        </div>
        <div className="muted" style={{marginTop:8,fontSize:12}}>Il timer Pomodoro aggiorna le ore di studio se registri le sessioni (aggiunta futura payload per esame).</div>
      </div>

      <div className="card">
        <h2 style={{fontSize:18,fontWeight:700,marginBottom:8}}>Esami — countdown & avanzamento</h2>
        <div style={{display:'grid', gap:10}}>
          {EXAMS.map((ex,i)=>{
            const dl = daysLeft(ex.date);
            const color = barColor(dl);
            // Per ora distribuiamo le ore in modo uniforme; in futuro dividiamo per esame con payload
            const pct = Math.min(100, Math.round((studyHoursByExam / ex.targetHours)*100));
            return (
              <div key={i} className="card" style={{padding:12}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', gap:8, flexWrap:'wrap'}}>
                  <div style={{fontWeight:800}}>{ex.title}</div>
                  <div className="muted">Data: {new Date(ex.date).toLocaleDateString('it-IT')} · Mancano <b style={{color}}>{dl} giorni</b></div>
                </div>
                <div style={{marginTop:8}}>
                  <div className="muted" style={{fontSize:12, marginBottom:4}}>Avanzamento studio (≈ {pct}% ) — target {ex.targetHours}h</div>
                  <div style={{height:12, background:'#e5e7eb', borderRadius:8, overflow:'hidden'}}>
                    <div style={{width:`${pct}%`, height:'100%', background:color}}></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="muted" style={{marginTop:8,fontSize:12}}>Colori dinamici: verde (&gt;21 gg), giallo (10–21), rosso (&lt;10). Le ore studio attuali sono aggregate; presto: log per singolo esame.</div>
      </div>
    </section>
  );
}
