import React, { useEffect, useState, useRef } from 'react';

/* =========================================
   ⏱️ WorkoutTimer (inline)
========================================= */
function WorkoutTimer(){
  const [work, setWork] = useState(45);
  const [rest, setRest] = useState(90);
  const [rounds, setRounds] = useState(6);
  const [phase, setPhase] = useState<'work'|'rest'|'idle'>('idle');
  const [left, setLeft] = useState(0);
  const [round, setRound] = useState(0);
  const ref = useRef<number|undefined>(undefined);

  const start = ()=>{ setPhase('work'); setRound(1); setLeft(work); };
  const stop  = ()=>{ setPhase('idle'); setLeft(0); setRound(0); if(ref.current) clearInterval(ref.current); };

  useEffect(()=>{
    if(phase==='idle') return;
    ref.current = window.setInterval(()=>{
      setLeft((s)=>{
        if(s>1) return s-1;
        if(phase==='work'){ setPhase('rest'); return rest; }
        if(round>=rounds){ stop(); return 0; }
        setPhase('work'); setRound(r=>r+1); return work;
      });
    },1000);
    return ()=>{ if(ref.current) clearInterval(ref.current); };
  },[phase, work, rest, rounds, round]);

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:8}}>
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
        {phase==='idle' ? <button className="btn primary" onClick={start}>Start</button> : <button className="btn" onClick={stop}>Stop</button>}
      </div>
      <div style={{marginTop:8, fontSize:22, fontWeight:800}}>
        {phase==='idle' ? 'Pronto' : `${phase==='work'?'WORK':'REST'} · ${left}s · Round ${round}/${rounds}`}
      </div>
    </div>
  );
}

/* =========================================
   🍅 Pomodoro (inline)
========================================= */
function Pomodoro(){
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

/* =========================================
   Programma + Logger
========================================= */
type SetEntry = { date:string; day:string; exercise:string; sets:number; reps:string; weight:number; rpe?:number };
type Ex = { name:string; scheme:string; note?:string };
type Split = { title:string; blocks:{label:string; options:Ex[]}[] };

const PLANS: Split[] = [
  {
    title: 'Push (Chest · Shoulders · Triceps)',
    blocks: [
      { label:'Chest', options:[
        { name:'Panca piana bilanciere', scheme:'4×5–8', note:'2–3 reps in riserva' },
        { name:'Spinta manubri su inclinata 30°', scheme:'3×8–12' },
        { name:'Chest press', scheme:'3×8–12 (rest-pause 1x)' },
      ]},
      { label:'Shoulders', options:[
        { name:'Military press', scheme:'3×5–8' },
        { name:'Alzate laterali manubri', scheme:'4×12–15', note:'ultimo set drop set' },
      ]},
      { label:'Triceps', options:[
        { name:'French press EZ', scheme:'3×8–12' },
        { name:'Pushdown cavo', scheme:'3×12–15' },
      ]},
    ]
  },
  { title: 'Pull (Back · Biceps)', blocks: [
      { label:'Back', options:[
        { name:'Stacchi rumeni', scheme:'4×6–8' },
        { name:'Trazioni prone', scheme:'3×6–10' },
        { name:'Rematore manubrio', scheme:'3×8–12' },
      ]},
      { label:'Biceps', options:[
        { name:'Curl bilanciere', scheme:'3×6–10' },
        { name:'Curl manubri su inclinata', scheme:'3×10–12' },
      ]},
    ]
  },
  { title: 'Legs (Quads · Hamstrings · Calves · Glutes)', blocks: [
      { label:'Quads', options:[
        { name:'Back squat', scheme:'4×5–8' },
        { name:'Leg press', scheme:'3×10–12' },
      ]},
      { label:'Hamstrings', options:[
        { name:'Leg curl sdraiato', scheme:'3×10–15' },
        { name:'Stacco RDL', scheme:'3×6–8' },
      ]},
      { label:'Calves', options:[ { name:'Calf raise in piedi', scheme:'4×10–15 (2\" hold in alto)' } ]},
      { label:'Glutes', options:[ { name:'Hip thrust', scheme:'4×6–10' } ]},
    ]
  },
  { title: 'Chest & Back', blocks: [
      { label:'Chest', options:[
        { name:'Panca inclinata bilanciere', scheme:'4×6–8' },
        { name:'Croci ai cavi alti', scheme:'3×12–15' },
      ]},
      { label:'Back', options:[
        { name:'Lat machine largo', scheme:'4×8–12' },
        { name:'Rematore bilanciere', scheme:'3×6–10' },
      ]},
    ]
  },
  { title: 'Shoulders & Arms', blocks: [
      { label:'Shoulders', options:[
        { name:'Overhead press manubri', scheme:'4×6–10' },
        { name:'Alzate laterali cavo', scheme:'3×12–15' },
      ]},
      { label:'Biceps', options:[ { name:'Curl EZ stretto', scheme:'3×8–12' } ]},
      { label:'Triceps', options:[ { name:'Estensioni sopra testa cavo', scheme:'3×10–12' } ]},
    ]
  },
];

const ABS_FINISHERS: { level:'Base'|'Progressivo'; items:string[] }[] = [
  { level:'Base', items:[ '3 giri: Hollow hold 20" · Crunch 15 · Plank 30" · Mountain climbers 20 rep' ]},
  { level:'Progressivo', items:[ '3–4 giri: V-sit 12 · Hanging knee raises 12 · Plank con tocco spalla 20 · Dragon flag eccentriche 5' ]},
];

export default function Training(){
  const [list,setList]=useState<SetEntry[]>(()=>{ try{ return JSON.parse(localStorage.getItem('fenice.training.sessions')||'[]'); }catch{ return []; } });
  useEffect(()=>{ localStorage.setItem('fenice.training.sessions', JSON.stringify(list)); },[list]);
  const [entry,setEntry]=useState<SetEntry>({ date:new Date().toISOString().slice(0,10), day:'Push', exercise:'Panca piana bilanciere', sets:4, reps:'6–8', weight:80, rpe:8 });

  const add=()=> setList([entry, ...list]);
  const toCSV=()=>{ const rows=[['date','day','exercise','sets','reps','weight','rpe'], ...list.map(l=>[l.date,l.day,l.exercise,l.sets,l.reps,l.weight,l.rpe??''])]; const csv=rows.map(r=>r.join(',')).join('\n'); const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='fenice_training.csv'; a.click(); URL.revokeObjectURL(url); };

  return (
    <section className="grid" style={{gap:16}}>
      <div className="card">
        <h2 style={{fontSize:18,fontWeight:700,marginBottom:8}}>Programma dettagliato (5 giorni)</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(1,minmax(0,1fr))',gap:12}}>
          {PLANS.map((p,idx)=>(
            <div key={idx} className="card" style={{padding:12}}>
              <div style={{fontWeight:800, marginBottom:6}}>{p.title}</div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap:12}}>
                {p.blocks.map((b,i)=>(
                  <div key={i}>
                    <div style={{fontWeight:700, marginBottom:4}}>{b.label}</div>
                    <ul style={{paddingLeft:16, margin:0}}>
                      {b.options.map((o,j)=>(
                        <li key={j}><b>{o.name}</b> — {o.scheme}{o.note? ` · ${o.note}`:''}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div style={{marginTop:8, fontSize:13}}>
                <b>Abs finisher</b>: {ABS_FINISHERS[0].items[0]}  ·  <i>Opzione</i>: {ABS_FINISHERS[1].items[0]}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 style={{fontSize:18,fontWeight:700,marginBottom:8}}>Timer Allenamento & Pomodoro Studio</h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(2,minmax(0,1fr))', gap:12}}>
          <div className="card" style={{padding:12}}>
            <div style={{fontWeight:700, marginBottom:6}}>⏱️ Workout Timer (serie/recupero)</div>
            <WorkoutTimer />
          </div>
          <div className="card" style={{padding:12}}>
            <div style={{fontWeight:700, marginBottom:6}}>🍅 Pomodoro (studio)</div>
            <Pomodoro />
          </div>
        </div>
      </div>

      <div className="card">
        <h2 style={{fontSize:18,fontWeight:700,marginBottom:8}}>Logger Allenamenti</h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(6,minmax(0,1fr))', gap:8}}>
          <input className="input" type="date" value={entry.date} onChange={e=>setEntry({...entry, date:e.target.value})}/>
          <select className="input" value={entry.day} onChange={e=>setEntry({...entry, day:e.target.value})}><option>Push</option><option>Pull</option><option>Legs</option><option>Chest & Back</option><option>Shoulders & Arms</option></select>
          <input className="input" placeholder="Esercizio" value={entry.exercise} onChange={e=>setEntry({...entry, exercise:e.target.value})}/>
          <input className="input" type="number" placeholder="Serie" value={entry.sets} onChange={e=>setEntry({...entry, sets:Number(e.target.value)})}/>
          <input className="input" placeholder="Reps" value={entry.reps} onChange={e=>setEntry({...entry, reps:e.target.value})}/>
          <input className="input" type="number" placeholder="Kg" value={entry.weight} onChange={e=>setEntry({...entry, weight:Number(e.target.value)})}/>
        </div>
        <div style={{display:'flex', gap:8, marginTop:8}}>
          <button className="btn primary" onClick={add}>Aggiungi</button>
          <button className="btn" onClick={toCSV}>Export CSV</button>
        </div>
        <table className="table" style={{marginTop:12}}>
          <thead><tr className="muted"><th>Data</th><th>Day</th><th>Esercizio</th><th>Serie</th><th>Reps</th><th>Kg</th></tr></thead>
          <tbody>{list.map((l,i)=>(<tr key={i}><td>{l.date}</td><td>{l.day}</td><td>{l.exercise}</td><td>{l.sets}</td><td>{l.reps}</td><td>{l.weight}</td></tr>))}</tbody>
        </table>
      </div>
    </section>
  );
}
