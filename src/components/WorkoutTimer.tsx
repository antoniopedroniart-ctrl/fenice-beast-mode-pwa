import React, { useEffect, useRef, useState } from 'react';

function useInterval(cb:()=>void, delay:number|null){
  const saved = useRef(cb); useEffect(()=>{saved.current=cb;},[cb]);
  useEffect(()=>{ if(delay===null) return; const id=setInterval(()=>saved.current(), delay); return ()=>clearInterval(id); },[delay]);
}

export default function WorkoutTimer(){
  const [mode,setMode]=useState<'REST'|'EMOM'|'AMRAP'>('REST');
  const [rest,setRest]=useState(90); // sec
  const [emomMin,setEmomMin]=useState(10); const [emomTick,setEmomTick]=useState(0);
  const [amrapMin,setAmrapMin]=useState(10); const [amrapLeft,setAmrapLeft]=useState(amrapMin*60);
  const [running,setRunning]=useState(false);

  useInterval(()=>{
    if(!running) return;
    if(mode==='REST') { if(rest>0) setRest(s=>s-1); }
    if(mode==='EMOM') { setEmomTick(s=>s+1); }
    if(mode==='AMRAP'){ setAmrapLeft(s=>Math.max(0,s-1)); }
  }, 1000);

  useEffect(()=>{ setAmrapLeft(amrapMin*60); },[amrapMin]);

  const fmt=(s:number)=>`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;

  return (
    <div style={{display:'grid', gap:12}}>
      <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
        {(['REST','EMOM','AMRAP'] as const).map(m=>
          <button key={m} className={`btn ${mode===m?'primary':''}`} onClick={()=>{setMode(m); setRunning(false);}}>{m}</button>
        )}
      </div>

      {mode==='REST' && (
        <div className="card">
          <div className="muted">Rest timer (sec)</div>
          <input className="input" type="number" value={rest} onChange={e=>setRest(Math.max(0,Number(e.target.value||0)))} />
          <div style={{fontSize:28,fontWeight:900,marginTop:8}}>{fmt(rest)}</div>
          <div style={{display:'flex',gap:8,marginTop:8}}>
            <button className="btn primary" onClick={()=>setRunning(true)}>Start</button>
            <button className="btn" onClick={()=>setRunning(false)}>Stop</button>
            <button className="btn ghost" onClick={()=>setRest(90)}>Reset</button>
          </div>
        </div>
      )}

      {mode==='EMOM' && (
        <div className="card">
          <div className="muted">EMOM minuti</div>
          <input className="input" type="number" value={emomMin} onChange={e=>setEmomMin(Math.max(1,Number(e.target.value||1)))} />
          <div style={{fontSize:28,fontWeight:900,marginTop:8}}>Tick: {emomTick} / {emomMin*60}</div>
          <div className="muted">Esegui il set ogni volta che i secondi tornano a 00.</div>
          <div style={{display:'flex',gap:8,marginTop:8}}>
            <button className="btn primary" onClick={()=>setRunning(true)}>Start</button>
            <button className="btn" onClick={()=>{setRunning(false); setEmomTick(0);}}>Stop</button>
          </div>
        </div>
      )}

      {mode==='AMRAP' && (
        <div className="card">
          <div className="muted">AMRAP minuti</div>
          <input className="input" type="number" value={amrapMin} onChange={e=>setAmrapMin(Math.max(1,Number(e.target.value||1)))} />
          <div style={{fontSize:28,fontWeight:900,marginTop:8}}>{fmt(amrapLeft)}</div>
          <div style={{display:'flex',gap:8,marginTop:8}}>
            <button className="btn primary" onClick={()=>setRunning(true)}>Start</button>
            <button className="btn" onClick={()=>setRunning(false)}>Pause</button>
            <button className="btn ghost" onClick={()=>{setRunning(false); setAmrapLeft(amrapMin*60);}}>Reset</button>
          </div>
        </div>
      )}
    </div>
  );
}
