import React, { useEffect, useState } from 'react';

type LogEntry = { date:string; type:'workout'|'study'; minutes?:number; payload?:any };
type BodyEntry = { date:string; weight_kg?:number; bf?:number };

function useLocal<T>(key:string, def:T){
  const [val,setVal]=useState<T>(()=>{ try{ const s=localStorage.getItem(key); return s? JSON.parse(s): def; }catch{ return def; } });
  useEffect(()=>{ localStorage.setItem(key, JSON.stringify(val)); },[key,val]);
  return [val,setVal] as const;
}
function startOfWeek(d:Date){ const t=new Date(d); const day=(t.getDay()+6)%7; t.setDate(t.getDate()-day); t.setHours(0,0,0,0); return t; }

export default function Dashboard(){
  // Seed iniziale misure se assenti
  useEffect(()=>{
    try{
      const raw = localStorage.getItem('fenice.logs');
      if(!raw){
        const today = new Date().toISOString().slice(0,10);
        const seed = [{
          date: today,
          weight_kg: 80.35, bf: 12.5,
          waist_cm: 87, chest_cm: 103,
          arm_r_cm: 34.5, arm_l_cm: 34.5,
          thigh_r_cm: 57.5, thigh_l_cm: 56.5
        }];
        localStorage.setItem('fenice.logs', JSON.stringify(seed));
      }
    }catch{}
  }, []);

  // Backup/Restore JSON
  const doBackup = ()=>{
    const keys = ['fenice.logs','fenice.training.sessions','fenice.activity','fenice.theme'];
    const obj:any = {};
    keys.forEach(k=>{ try{ obj[k]=JSON.parse(localStorage.getItem(k)||'null'); }catch{ obj[k]=null; } });
    const blob = new Blob([JSON.stringify(obj,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='fenice_backup.json'; a.click(); URL.revokeObjectURL(url);
  };
  const doRestore = (file:File)=>{
    const reader = new FileReader();
    reader.onload = ()=>{
      try{
        const data = JSON.parse(String(reader.result||'{}'));
        Object.keys(data||{}).forEach(k=>{ if(k.startsWith('fenice.')) localStorage.setItem(k, JSON.stringify(data[k])); });
        alert('Ripristino completato. Ricarica la pagina.');
      }catch{ alert('File non valido'); }
    };
    reader.readAsText(file);
  };

  const [activity] = useLocal<LogEntry[]>('fenice.activity', []);
  const [body] = useLocal<BodyEntry[]>('fenice.logs', [] as any);
  const now = new Date(), sow = startOfWeek(now);
  const weekActivity = activity.filter(a=> new Date(a.date) >= sow);
  const workoutsDone = weekActivity.filter(a=> a.type==='workout').length;
  const studyMinutes = weekActivity.filter(a=> a.type==='study').reduce((s,a)=> s+(a.minutes||0),0);
  const latestBody = (body||[]).slice().sort((a,b)=> (a.date as any) < (b.date as any)?1:-1)[0];

  return (
    <section className="grid grid-2">
      <div className="card">
        <h2 style={{fontSize:18,fontWeight:700,marginBottom:8}}>KPI Settimana</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:12}}>
          <div className="card"><div className="muted">Allenamenti completati</div><div style={{fontSize:28,fontWeight:800}}>{workoutsDone}</div></div>
          <div className="card"><div className="muted">Ore di studio</div><div style={{fontSize:28,fontWeight:800}}>{(studyMinutes/60).toFixed(1)}</div></div>
          <div className="card"><div className="muted">Peso / BF</div><div style={{fontSize:20,fontWeight:700}}>{latestBody? `${latestBody.weight_kg||'-'} kg · ${latestBody.bf||'-'}%`: '—'}</div></div>
        </div>
        <div className="card" style={{marginTop:12}}>
          <div style={{display:'flex', alignItems:'center', gap:12, flexWrap:'wrap'}}>
            <button className="btn" onClick={doBackup}>Backup dati (JSON)</button>
            <label className="btn">
              Ripristina
              <input type="file" accept="application/json" style={{display:'none'}} onChange={(e)=>{ const f=e.target.files?.[0]; if(f) doRestore(f); }}/>
            </label>
          </div>
          <div className="muted" style={{marginTop:8,fontSize:12}}>Backup e ripristino di misure, training, attività e tema.</div>
        </div>
        <div className="muted" style={{marginTop:8,fontSize:12}}>Si aggiorna automaticamente da Misure & Training.</div>
      </div>
    </section>
  );
}