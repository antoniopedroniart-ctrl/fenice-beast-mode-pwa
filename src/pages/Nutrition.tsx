import React from 'react';

export default function Nutrition(){
  // Stub handler: collega ai tuoi metodi reali se già presenti
  const onExport = () => {
    // chiama la tua funzione export PDF se già esiste
    const evt = new CustomEvent('fenice:nutrition:export');
    window.dispatchEvent(evt);
    alert('Export avviato (collega onExport alla tua funzione PDF).');
  };
  const onRegen = () => {
    const evt = new CustomEvent('fenice:nutrition:regen');
    window.dispatchEvent(evt);
    alert('Rigenerazione piano (collega onRegen al tuo builder).');
  };

  return (
    <section className="grid" style={{ gap: 16 }}>
      {/* ======= HERO Premium (Nutrition) ======= */}
      <div className="card" style={{
        padding: 22,
        background: 'linear-gradient(135deg, color-mix(in oklab, var(--accent) 18%, var(--card)), var(--card))',
        borderColor: 'color-mix(in oklab, var(--accent) 20%, var(--border))',
        boxShadow: '0 16px 40px color-mix(in oklab, var(--accent) 22%, transparent)'
      }}>
        <div style={{ display:'grid', gridTemplateColumns:'1.2fr .8fr', gap: 18 }}>
          {/* Colonna sinistra */}
          <div>
            <div style={{display:'inline-flex', alignItems:'center', gap:8, padding:'6px 10px',
              borderRadius:999, background:'color-mix(in oklab, var(--card) 70%, transparent)', border:'1px solid var(--border)'}}>
              <span className="muted" style={{fontWeight:800, letterSpacing:.3}}>NUTRIZIONE</span>
              <span>— grammature dinamiche · week plan</span>
            </div>
            <h1 style={{margin:'10px 0 6px 0', fontSize:26, fontWeight:900, letterSpacing:.3}}>Mangia per vincere.</h1>
            <div className="muted" style={{marginBottom:14}}>
              Recomp / Bulk / Cut con ricette scalate ai macro. Planner settimanale macro-accurato.
            </div>
            <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
              <button className="btn primary" onClick={onExport}>Export PDF</button>
              <button className="btn" onClick={onRegen}>Rigenera settimana</button>
              <a className="btn ghost" href="#schema">Cambia schema</a>
            </div>
          </div>

          {/* Colonna destra: quick tiles (placeholders) */}
          <div className="card" style={{ padding: 14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap: 12 }}>
              <div className="card" style={{ textAlign:'center' }}>
                <div className="muted">Fase</div>
                <div style={{ fontSize: 20, fontWeight: 900 }}>Recomp</div>
              </div>
              <div className="card" style={{ textAlign:'center' }}>
                <div className="muted">Target Kcal</div>
                <div style={{ fontSize: 20, fontWeight: 900 }}>—</div>
              </div>
              <div className="card" style={{ textAlign:'center' }}>
                <div className="muted">P / C / F</div>
                <div style={{ fontSize: 20, fontWeight: 900 }}>—</div>
              </div>
            </div>
            <div style={{ display:'flex', justifyContent:'flex-end', marginTop: 10, gap:8 }}>
              <a className="btn" href="#piano">Vai al piano</a>
            </div>
          </div>
        </div>
      </div>

      {/* ======= CONTENUTO PAGINA ======= */}
      <div id="schema" className="card">
        <h2 style={{fontSize:18,fontWeight:800,marginBottom:8}}>Schema & settaggi</h2>
        {/* …QUI il tuo blocco con select fase (recomp/bulk/cut), schema pasti (2/3/4/5), peso/BF, etc. … */}
      </div>

      <div id="piano" className="card">
        <h2 style={{fontSize:18,fontWeight:800,marginBottom:8}}>Piano & ricette</h2>
        {/* …QUI incolla il tuo componente Planner/Ricette/WeekPlan (macro accurato, Δ, grammature)… */}
      </div>
    </section>
  );
}
