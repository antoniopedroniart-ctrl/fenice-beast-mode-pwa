import React, { useMemo, useState } from 'react';

type SetRow = { ex:string; set:number; reps:number; weight:number };
const KEY='fenice.workout.log';

export default function WorkoutLog(){
  const [rows,setRows]=useState<SetRow[]>(()=>{ try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]} });
  const [ex,setEx]=useState('Esercizio'); const [reps,setReps]=useState(8); const [weight,setWeight]=useState(60);

  const add=()=>{ const r:{ex:string;set:number;reps:number;weight:number}={ex,set: (rows.filter(x=>x.ex===ex).length+1), reps, weight}; const next=[...rows,r]; setRows(next); try{localStorage.setItem(KEY,JSON.stringify(next))}catch{} };
  const del=(i:number)=>{ const next=rows.slice(); next.splice(i,1); setRows(next); try{localStorage.setItem(KEY,JSON.stringify(next))}catch{} };
  const vol=useMemo(()=> rows.reduce((s,r)=>s+r.reps*r.weight,0),[rows]);

  return (
    <div>
      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr auto',gap:8}}>
        <input className="input" value={ex} onChange={e=>setEx(e.target.value)} />
        <input className="input" type="number" value={reps} onChange={e=>setReps(Number(e.target.value||0))} />
        <input className="input" type="number" value={weight} onChange={e=>setWeight(Number(e.target.value||0))} />
        <button className="btn primary" onClick={add}>Aggiungi set</button>
      </div>

      <table className="table" style={{marginTop:10}}>
        <thead><tr><th>Esercizio</th><th>Set</th><th>Reps</th><th>Kg</th><th></th></tr></thead>
        <tbody>{rows.map((r,i)=>(<tr key={i}><td>{r.ex}</td><td>{r.set}</td><td>{r.reps}</td><td>{r.weight}</td><td><button className="btn" onClick={()=>del(i)}>✕</button></td></tr>))}</tbody>
      </table>

      <div className="card" style={{marginTop:10}}>
        <b>Volume sessione:</b> {vol} kg · <span className="muted">somma (reps × kg)</span>
      </div>
    </div>
  );
}
