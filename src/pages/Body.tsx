import React, { useEffect, useState } from 'react';

type BodyRow = {
  date: string;
  weight_kg?: number; bf?: number;
  waist_cm?: number; chest_cm?: number;
  arm_r_cm?: number; arm_l_cm?: number;
  thigh_r_cm?: number; thigh_l_cm?: number;
};

export default function Body(){
  const [rows,setRows]=useState<BodyRow[]>(()=>{ try{ return JSON.parse(localStorage.getItem('fenice.logs')||'[]'); }catch{ return []; } });
  useEffect(()=>{ localStorage.setItem('fenice.logs', JSON.stringify(rows)); },[rows]);
  const [entry,setEntry]=useState<BodyRow>({ date:new Date().toISOString().slice(0,10) });

  const add=()=>{ setRows([entry, ...rows]); setEntry({ date:new Date().toISOString().slice(0,10) }); };

  return (
    <section className="grid">
      <div className="card">
        <h2 style={{fontSize:18,fontWeight:700,marginBottom:8}}>Misure corpo</h2>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4,minmax(0,1fr))', gap:8}}>
          <input className="input" type="date" value={entry.date} onChange={e=>setEntry({...entry, date:e.target.value})}/>
          <input className="input" type="number" step="0.1" placeholder="Peso kg" value={entry.weight_kg??''} onChange={e=>setEntry({...entry, weight_kg:Number(e.target.value)})}/>
          <input className="input" type="number" step="0.1" placeholder="BF %" value={entry.bf??''} onChange={e=>setEntry({...entry, bf:Number(e.target.value)})}/>
          <input className="input" type="number" step="0.1" placeholder="Vita cm" value={entry.waist_cm??''} onChange={e=>setEntry({...entry, waist_cm:Number(e.target.value)})}/>
          <input className="input" type="number" step="0.1" placeholder="Petto cm" value={entry.chest_cm??''} onChange={e=>setEntry({...entry, chest_cm:Number(e.target.value)})}/>
          <input className="input" type="number" step="0.1" placeholder="Braccio DX cm" value={entry.arm_r_cm??''} onChange={e=>setEntry({...entry, arm_r_cm:Number(e.target.value)})}/>
          <input className="input" type="number" step="0.1" placeholder="Braccio SX cm" value={entry.arm_l_cm??''} onChange={e=>setEntry({...entry, arm_l_cm:Number(e.target.value)})}/>
          <input className="input" type="number" step="0.1" placeholder="Coscia DX cm" value={entry.thigh_r_cm??''} onChange={e=>setEntry({...entry, thigh_r_cm:Number(e.target.value)})}/>
          <input className="input" type="number" step="0.1" placeholder="Coscia SX cm" value={entry.thigh_l_cm??''} onChange={e=>setEntry({...entry, thigh_l_cm:Number(e.target.value)})}/>
        </div>
        <div style={{marginTop:8}}><button className="btn primary" onClick={add}>Aggiungi</button></div>
        <table className="table" style={{marginTop:12}}>
          <thead><tr className="muted"><th>Data</th><th>Peso</th><th>BF%</th><th>Vita</th><th>Petto</th><th>Br DX</th><th>Br SX</th><th>Cos DX</th><th>Cos SX</th></tr></thead>
          <tbody>{rows.map((r,i)=>(<tr key={i}><td>{r.date}</td><td>{r.weight_kg??''}</td><td>{r.bf??''}</td><td>{r.waist_cm??''}</td><td>{r.chest_cm??''}</td><td>{r.arm_r_cm??''}</td><td>{r.arm_l_cm??''}</td><td>{r.thigh_r_cm??''}</td><td>{r.thigh_l_cm??''}</td></tr>))}</tbody>
        </table>
      </div>
    </section>
  );
}