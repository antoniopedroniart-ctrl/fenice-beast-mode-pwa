import React from 'react';

export default function Calendar(){
  const base = import.meta.env.BASE_URL;
  return (
    <section className="grid">
      <div className="card">
        <h2 style={{fontSize:18,fontWeight:700,marginBottom:8}}>Calendario</h2>
        <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
          <a className="btn" href={`${base}fenice_calendar_unified.ics`} download>Scarica .ics</a>
          <a className="btn" href={`${base}calendar.html`} target="_blank" rel="noreferrer">Apri Calendario (HTML)</a>
          <a className="btn" href={`${base}study-planner.html`} target="_blank" rel="noreferrer">Study Planner</a>
        </div>
        <div className="muted" style={{marginTop:8,fontSize:12}}>Il .ics contiene lezioni, lavoro, allenamenti, esami. L'HTML è stampabile.</div>
      </div>
    </section>
  );
}