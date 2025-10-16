import React, { useEffect, useRef, useState } from 'react';

export default function Pomodoro(){
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
          const next=done+1; setDone(next);
          if(next % cycles === 0){ setState('long'); return longMin*60; }
          setState('short'); return shortMin*60;
        } else if(state==='short'){ setState('focus'); return focusMin*60; }
        else { setState('focus'); return focusMin*60; }
      });
    },1000);
    return ()=>{ if(ref.current) clearInterval(ref.current); };
  },[state,focusMin,shortMin,longMin,cycles,done]);

  const mmss = (s:number)=> `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  return (
    <div>
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
    </div>
  );
}
