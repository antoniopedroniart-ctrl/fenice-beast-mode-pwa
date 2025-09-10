import React from 'react';

export default function Dashboard(){
  return (
    <section className="grid grid-2">
      <div className="card">
        <h2 style={{fontSize:18, fontWeight:700, marginBottom:8}}>Benvenuto</h2>
        <p className="muted">Riepilogo rapido: fase corrente, target macro, allenamento del giorno e progresso misure.</p>
      </div>
      <div className="card">
        <h2 style={{fontSize:18, fontWeight:700, marginBottom:8}}>Azioni rapide</h2>
        <ul>
          <li>Vai a <b>Nutrizione</b> per generare il planner e l'export PDF</li>
          <li>Vai ad <b>Allenamento</b> per lo split e i finisher ABS</li>
          <li>Vai a <b>Misure</b> per salvare circonferenze e storico</li>
        </ul>
      </div>
    </section>
  );
}