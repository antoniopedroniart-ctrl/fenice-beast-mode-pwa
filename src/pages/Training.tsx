import React from 'react';
import { Link } from 'react-router-dom';

export default function Training(){
  return (
    <section className="grid" style={{ gap: 16 }}>
      {/* ======= HERO Premium (Training) ======= */}
      <div className="card" style={{
        padding: 22,
        background: 'linear-gradient(135deg, color-mix(in oklab, var(--accent) 18%, var(--card)), var(--card))',
        borderColor: 'color-mix(in oklab, var(--accent) 20%, var(--border))',
        boxShadow: '0 16px 40px color-mix(in oklab, var(--accent) 22%, transparent)'
      }}>
        <div style={{ display:'grid', gridTemplateColumns:'1.2fr .8fr', gap:18 }}>
          {/* Colonna sinistra */}
          <div>
            <div style={{display:'inline-flex', alignItems:'center', gap:8, padding:'6px 10px',
              borderRadius:999, background:'color-mix(in oklab, var(--card) 70%, transparent)', border:'1px solid var(--border)'}}>
              <span className="muted" style={{fontWeight:800, letterSpacing:.3}}>ALLENAMENTO</span>
              <span>— split 5d · finisher abs</span>
            </div>
            <h1 style={{margin:'10px 0 6px 0', fontSize:26, fontWeight:900, letterSpacing:.3}}>Spingi, tira, costruisci.</h1>
            <div className="muted" style={{marginBottom:14}}>
              Push/Pull/Legs/Chest&Back/Shoulders&Arms, con finisher ABS a circuito e timer dinamico.
            </div>
            <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
              <a className="btn primary" href="#oggi">Inizia sessione</a>
              <a className="btn" href="#schede">Schede complete</a>
              <a className="btn ghost" href="#timer">Timer</a>
            </div>
          </div>

          {/* Colonna destra: quick tiles */}
          <div className="card" style={{ padding: 14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap: 12 }}>
              <div className="card" style={{ textAlign:'center' }}>
                <div className="muted">Split</div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>5 giorni</div>
              </div>
              <div className="card" style={{ textAlign:'center' }}>
                <div className="muted">Sessione</div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>90–120′</div>
              </div>
              <div className="card" style={{ textAlign:'center' }}>
                <div className="muted">Finisher</div>
                <div style={{ fontSize: 22, fontWeight: 900 }}>ABS</div>
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', marginTop: 10, gap:8 }}>
              <a className="btn" href="#log">Log workout</a>
              <Link className="btn" to="/calendar">Calendario</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ======= CONTENUTO PAGINA (le tue schede/timer/logger) ======= */}
      <div id="oggi" className="card">
        <h2 style={{fontSize:18,fontWeight:800,marginBottom:8}}>Sessione di oggi</h2>
        {/* …CONTENUTO TRAINING ESISTENTE: selettore giorno, elenco esercizi, serie/rep, RIR, ecc. … */}
      </div>

      <div id="schede" className="card">
        <h2 style={{fontSize:18,fontWeight:800,marginBottom:8}}>Schede complete (varianti)</h2>
        {/* …CONTENUTO: Push/Pull/Legs/C&B/Shoulders&Arms con opzioni multiple per muscolo… */}
      </div>

      <div id="timer" className="card">
        <h2 style={{fontSize:18,fontWeight:800,marginBottom:8}}>Timer allenamento</h2>
        {/* …CONTENUTO: tuoi timer (EMOM, Rest Timer, Finisher ABS), già esistenti… */}
      </div>

      <div id="log" className="card">
        <h2 style={{fontSize:18,fontWeight:800,marginBottom:8}}>Workout Log</h2>
        {/* …CONTENUTO: logger set/rep/peso, salvataggio localStorage, ecc.… */}
      </div>
    </section>
  );
}
