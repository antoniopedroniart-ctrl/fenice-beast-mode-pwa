import React, { useState } from 'react';

type Entry = {
  date: string;
  waist_cm: number;
  chest_cm: number;
  arm_r_cm: number;
  arm_l_cm: number;
  thigh_r_cm: number;
  thigh_l_cm: number;
};

export default function Body(){
  const [entry,setEntry]=useState<Entry>({
    date: new Date().toISOString().slice(0,10),
    waist_cm: 87, chest_cm: 103,
    arm_r_cm: 34.5, arm_l_cm: 34.5,
    thigh_r_cm: 57.5, thigh_l_cm: 56.5,
  });
  const [logs,setLogs]=useState<Entry[]>([]);

  const save=()=>{ setLogs(prev=>[...prev, entry]); };

  return (
    <section className="grid grid-2">
      <div className="card">
        <h2 style={{fontSize:18,fontWeight:700,marginBottom:8}}>Inserisci misure (cm)</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:12}}>
          <label>Data<input className="input" type="date" value={entry.date} onChange={(e)=>setEntry({...entry, date:e.target.value})}/></label>
          <label>Vita<input className="input" type="number" value={entry.waist_cm} onChange={(e)=>setEntry({...entry, waist_cm:Number(e.target.value)})}/></label>
          <label>Petto<input className="input" type="number" value={entry.chest_cm} onChange={(e)=>setEntry({...entry, chest_cm:Number(e.target.value)})}/></label>
          <label>Braccio DX<input className="input" type="number" value={entry.arm_r_cm} onChange={(e)=>setEntry({...entry, arm_r_cm:Number(e.target.value)})}/></label>
          <label>Braccio SX<input className="input" type="number" value={entry.arm_l_cm} onChange={(e)=>setEntry({...entry, arm_l_cm:Number(e.target.value)})}/></label>
          <label>Coscia DX<input className="input" type="number" value={entry.thigh_r_cm} onChange={(e)=>setEntry({...entry, thigh_r_cm:Number(e.target.value)})}/></label>
          <label>Coscia SX<input className="input" type="number" value={entry.thigh_l_cm} onChange={(e)=>setEntry({...entry, thigh_l_cm:Number(e.target.value)})}/></label>
        </div>
        <button className="btn primary" style={{marginTop:12}} onClick={save}>Salva</button>
      </div>

      <div className="card">
        <h2 style={{fontSize:18,fontWeight:700,marginBottom:8}}>Storico</h2>
        {logs.length===0? <div className="muted">Nessun dato</div> : (
          <table className="table" style={{fontSize:14}}>
            <thead><tr className="muted"><th>Data</th><th>Vita</th><th>Petto</th><th>BRC DX</th><th>BRC SX</th><th>Coscia DX</th><th>Coscia SX</th></tr></thead>
            <tbody>
              {logs.slice().reverse().map((l,i)=> (
                <tr key={i}><td>{l.date}</td><td>{l.waist_cm}</td><td>{l.chest_cm}</td><td>{l.arm_r_cm}</td><td>{l.arm_l_cm}</td><td>{l.thigh_r_cm}</td><td>{l.thigh_l_cm}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}