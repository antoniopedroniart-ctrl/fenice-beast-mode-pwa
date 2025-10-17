import React, { useEffect, useMemo, useRef, useState } from 'react';

/* Pomodoro inline che LOGGA le sessioni di focus completate su localStorage 'fenice.activity' */
function PomodoroLogger({ onLog }:{ onLog:(minutes:number)=>void }){
  const [focusMin,setFocusMin]=useState(50);
  const [shortMin,setShortMin]=useState(10);
  const [longMin,setLongMin]=useState(25);
  const [cycles,setCycles]=useState(3);

  const [state,setState]=useState<'idle'|'focus'|'short'|'long'>('idle');
  const [left,setLeft]=useState(0);
  const [done,setDone]=useState(0);
  const ref=useRef<number|undefined>(undefined);

  const start=()=>{ setState('focus'); setLeft(focusMin*60); setDone(0); };
  const stop =()=>{ setState('idle'); setLeft(0); if(ref.current) clearInterval(ref.current); };

  useEffect(()=>{
    if(state==='idle') return;
    ref.current = window.setInterval(()=>{
      setLeft(s=>{
        if(s>1) return s-1;
        if(state==='focus'){
          // Focus completato → loggo minuti
          onLog(focusMin);
          const next=done+1; setDone(next);
          if(next % cycles === 0){ setState('long'); return longMin*60; }
          setState('short'); return shortMin*60;
        } else if(state==='short'){ setState('focus'); return focusMin*60; }
        else { setState('focus'); return focusMin*60; }
      });
    },1000);
    return ()=>{ if(ref.current) clearInterval(ref.current); };
  },[state,focusMin,shortMin,longMin,cycles,done,onLog]);

  const mmss = (s:number)=> `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return (
    <div className="card" style={{padding:12}}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:8}}>
        <label className="input">Focus (min)<input className="input" type="number" value={focusMin} onChange={e=>setFocusMin(Number(e.target.value))}/></label>
        <label className="input">Break corto<input className="input" type="number" value={shortMin} onChange={e=>setShortMin(Number(e.target.value))}/></label>
        <label className="input">Break lungo<input className="input" type="number" value={longMin} onChange={e=>setLongMin(Number(e.target.value))}/></label>
        <label className="input">Cicli per lungo<input className="input" type="number" value={cycles} onChange={e=>setCycles(Number(e.target.value))}/></label>
      </div>
      <div style={{marginTop:8, display:'flex', gap:8}}>
        {state==='idle' ? <button className="btn primary" onClick={start}>Start</button> : <button className="btn" onClick={stop}>Stop</button>}
      </div>
      <div style={{marginTop:8, fontSize:22, fontWeight:800}}>
        {state==='idle' ? 'Pronto' : `${state==='focus'?'FOCUS':state==='short'?'BREAK CORTO':'BREAK LUNGO'} · ${mmss(left)} · Focus completati: ${done}`}
      </div>
      <div className="muted" style={{marginTop:6,fontSize:12}}>Ogni ciclo FOCUS completato aggiunge automaticamente minuti al registro studio.</div>
    </div>
  );
}

type StudyLog = { date:string; subject:string; minutes:number; note?:string };

export default function Study(){
  const [logs,setLogs]=useState<StudyLog[]>(()=>{
    try{ return JSON.parse(localStorage.getItem('fenice.study')||'[]'); }catch{ return []; }
  });
  useEffect(()=>{ localStorage.setItem('fenice.study', JSON.stringify(logs)); },[logs]);

  const subjects=['Biochimica 1','Istologia','Anatomia','Biochimica 2','Semeiotica Med/Chir','Immunologia','Altro'];

  const [row,setRow]=useState<StudyLog>({ date:new Date().toISOString().slice(0,10), subject:subjects[0], minutes:50, note:'' });

  const add = (r:StudyLog)=> setLogs([r, ...logs]);
  const addManual = ()=> add(row);
  const onPomodoroLog = (minutes:number)=> add({ date:new Date().toISOString().slice(0,10), subject:row.subject, minutes, note:'Pomodoro auto' });

  const totalWeek = useMemo(()=>{
    const start=new Date(); const wd=(start.getDay()+6)%7; start.setDate(start.getDate()-wd); start.setHours(0,0,0,0);
    const end=new Date(start); end.setDate(end.getDate()+7);
    const inRange = logs.filter(l=> { const d=new Date(l.date); return d>=start && d<end; });
    const map = new Map<string, number>();
    for(const l of inRange){ map.set(l.subject, (map.get(l.subject)||0) + l.minutes); }
    return Array.from(map.entries()).map(([s,m])=>({subject:s, minutes:m}));
  },[logs]);

  const exportCSV = ()=>{
    const rows=[['date','subject','minutes','note'], ...logs.map(l=>[l.date,l.subject,String(l.minutes),l.note||''])];
    const csv=rows.map(r=>r.join(',')).join('\n');
    const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='fenice_study_log.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <section className="grid" style={{gap:16}}>
      <div className="card">
        <h2 style={{fontSize:18,fontWeight:700,marginBottom:8}}>Logger Studio — manuale + Pomodoro</h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:8}}>
          <input className="input" type="date" value={row.date} onChange={e=>setRow({...row, date:e.target.value})}/>
          <select className="input" value={row.subject} onChange={e=>setRow({...row, subject:e.target.value})}>
            {subjects.map(s=>(<option key={s}>{s}</option>))}
          </select>
          <input className="input" type="number" min={5} step={5} value={row.minutes} onChange={e=>setRow({...row, minutes:Number(e.target.value)})}/>
          <input className="input" placeholder="Note (opzionale)" value={row.note} onChange={e=>setRow({...row, note:e.target.value})}/>
        </div>
        <div style={{display:'flex', gap:8, marginTop:8}}>
          <button className="btn primary" onClick={addManual}>Aggiungi</button>
          <button className="btn" onClick={exportCSV}>Export CSV</button>
        </div>
      </div>

      <PomodoroLogger onLog={onPomodoroLog} />

      <div className="card">
        <h2 style={{fontSize:18,fontWeight:700,marginBottom:8}}>Riepilogo settimanale (minuti per materia)</h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:10}}>
          {totalWeek.length===0 && <div className="muted">Nessuna sessione registrata questa settimana.</div>}
          {totalWeek.map((r,i)=>(
            <div key={i} className="card" style={{padding:10}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                <div style={{fontWeight:800}}>{r.subject}</div>
                <div className="muted">{Math.round(r.minutes/60*10)/10} h</div>
              </div>
              <div style={{height:12, background:'#e5e7eb', borderRadius:8, overflow:'hidden', marginTop:6}}>
                <div style={{width:`${Math.min(100, r.minutes/300*100)}%`, height:'100%', background:'#60a5fa'}}></div>
              </div>
            </div>
          ))}
        </div>

        <table className="table" style={{marginTop:12}}>
          <thead><tr className="muted"><th>Data</th><th>Materia</th><th>Min</th><th>Note</th></tr></thead>
          <tbody>
            {logs.map((l,i)=> (<tr key={i}><td>{l.date}</td><td>{l.subject}</td><td>{l.minutes}</td><td>{l.note||''}</td></tr>))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
