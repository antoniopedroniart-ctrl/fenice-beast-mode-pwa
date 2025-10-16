import React from 'react';
export default function StudyPlanner(){
  const base = import.meta.env.BASE_URL;
  return (
    <section className="grid">
      <div className="card">
        <h2 style={{fontSize:18,fontWeight:700,marginBottom:8}}>📚 Study Planner</h2>
        <div style={{display:'flex', gap:8, flexWrap:'wrap', marginBottom:8}}>
          <a className="btn primary" href={`${base}study-planner.html`} target="_blank" rel="noreferrer">Apri versione a pieno schermo</a>
          <a className="btn" href={`${base}study-planner.html`} download>Scarica HTML</a>
        </div>
        <iframe title="Study Planner" src={`${base}study-planner.html`} style={{width:'100%', height:'75vh', border:'1px solid #e5e7eb', borderRadius:12}}/>
      </div>
    </section>
  );
}