import React, { useEffect, useRef, useState } from 'react';

export default function WorkoutTimer(){
  const [work, setWork] = useState(45);   // secondi lavoro
  const [rest, setRest] = useState(90);   // secondi recupero
  const [rounds, setRounds] = useState(6);
  const [phase, setPhase] = useState<'work'|'rest'|'idle'>('idle');
  const [left, setLeft] = useState(0);
  const [round, setRound] = useState(0);
  const ref = useRef<number|undefined>(undefined);

  const start = ()=>{
    setPhase('work');
    setRound(1);
    setLeft(work);
  };
  const stop = ()=>{
    setPhase('idle');
    setLeft(0);
    setRound(0);
    if(ref.current) window.clearInterval(ref.current);
  };

  useEffect(()=>{
    if(phase==='idle') return;
    ref.current = window.setInterval(()=>{
      setLeft((s)=>{
        if(s>1) return s-1;
        // cambio fase
        if(phase==='work'){
          setPhase('rest'); return rest;
        }else{
          if(round>=rounds){ stop(); return 0; }
          setPhase('work'); setRound(r=>r+1); return work;
        }
      });
    },1000);
    return ()=>{ if(ref.current) window.clearInterval(ref.current); };
  },[phase, work, rest, rounds, round]);

  return (
    <div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:8}}>
        <label className="input" style={{display:'flex',alignItems:'center',gap:6}}>Work (s)
          <input className="input" type="number" value={work} onChange={e=>setWork(Number(e.target.value))} style={{width:90}}/>
        </label>
        <label className="input" style={{display:'flex',alignItems:'center',gap:6}}>Rest (s)
          <input className="input" type="number" value={rest} onChange={e=>setRest(Number(e.target.value))} style={{width:90}}/>
        </label>
        <label className="input" style={{display:'flex',alignItems:'center',gap:6}}>Rounds
          <input className="input" type="number" value={rounds} onChange={e=>setRounds(Number(e.target.value))} style={{width:90}}/>
        </label>
      </div>
      <div style={{marginTop:8, display:'flex', gap:8}}>
        {phase==='idle'
          ? <button className="btn primary" onClick={start}>Start</button>
          : <button className="btn" onClick={stop}>Stop</button>}
      </div>
      <div style={{marginTop:8, fontSize:22, fontWeight:800}}>
        {phase==='idle' ? 'Pronto' : `${phase==='work'?'WORK':'REST'} · ${left}s · Round ${round}/${rounds}`}
      </div>
    </div>
  );
}
