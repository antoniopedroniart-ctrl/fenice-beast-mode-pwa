import React, { useEffect, useState } from 'react';

type SetEntry = { date:string; day:string; exercise:string; sets:number; reps:number; weight:number; rpe?:number };

export default function Training(){
  const [list,setList]=useState<SetEntry[]>(()=>{ try{ return JSON.parse(localStorage.getItem('fenice.training.sessions')||'[]'); }catch{ return []; } });
  useEffect(()=>{ localStorage.setItem('fenice.training.sessions', JSON.stringify(list)); },[list]);
  const [entry,setEntry]=useState<SetEntry>({ date:new Date().toISOString().slice(0,10), day:'Push', exercise:'Panca piana', sets:4, reps:6, weight:80, rpe:8 });

  const add=()=> setList([entry, ...list]);
  const toCSV=()=>{
    const rows=[['date','day','exercise','sets','reps','weight','rpe'], ...list.map(l=>[l.date,l.day,l.exercise,l.sets,l.reps,l.weight,l.rpe??''])];
    const csv=rows.map(r=>r.join(',')).join('\n');
    const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='fenice_training.csv'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <section className="grid">
      <div className="card">
        <h2 style={{fontSize:18,fontWeight:700,marginBottom:8}}>Logger Allenamenti</h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(6,minmax(0,1fr))', gap:8}}>
          <input className="input" type="date" value={entry.date} onChange={e=>setEntry({...entry, date:e.target.value})}/>
          <select className="input" value={entry.day} onChange={e=>setEntry({...entry, day:e.target.value})}><option>Push</option><option>Pull</option><option>Legs</option><option>Chest & Back</option><option>Shoulders & Arms</option></select>
          <input className="input" placeholder="Esercizio" value={entry.exercise} onChange={e=>setEntry({...entry, exercise:e.target.value})}/>
          <input className="input" type="number" placeholder="Serie" value={entry.sets} onChange={e=>setEntry({...entry, sets:Number(e.target.value)})}/>
          <input className="input" type="number" placeholder="Reps" value={entry.reps} onChange={e=>setEntry({...entry, reps:Number(e.target.value)})}/>
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