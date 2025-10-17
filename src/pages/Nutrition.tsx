import React, { Suspense, useMemo } from 'react';

/** Auto-resolver per componenti del planner */
const ALL = import.meta.glob('../components/*.{tsx,jsx}', { eager: false });
function pickLazy(matchers: string[]) {
  const entry = Object.keys(ALL).find(p => matchers.some(m => p.toLowerCase().includes(m.toLowerCase())));
  return entry ? React.lazy(ALL[entry] as any) : null;
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="card">
      <h2 style={{fontSize:18,fontWeight:800,marginBottom:8}}>{title}</h2>
      {children}
    </div>
  );
}

export default function Nutrition(){
  const Settings = useMemo(() => pickLazy(['nutritionsettings','nutritionsettings','schema','settings']), []);
  const Planner  = useMemo(() => pickLazy(['nutrition','planner','weekplan','mealplan']), []);

  const onExport = () => window.dispatchEvent(new CustomEvent('fenice:nutrition:export'));
  const onRegen  = () => window.dispatchEvent(new CustomEvent('fenice:nutrition:regen'));

  return (
    <section className="grid" style={{ gap: 16 }}>
      {/* ======= HERO ======= */}
      <div className="card" style={{
        padding: 22,
        background: 'linear-gradient(135deg, color-mix(in oklab, var(--accent) 18%, var(--card)), var(--card))',
        borderColor: 'color-mix(in oklab, var(--accent) 20%, var(--border))',
        boxShadow: '0 16px 40px color-mix(in oklab, var(--accent) 22%, transparent)'
      }}>
        <div style={{ display:'grid', gridTemplateColumns:'1.2fr .8fr', gap: 18 }}>
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
              <a className="btn ghost" href="#piano">Vai al piano</a>
            </div>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,minmax(0,1fr))', gap: 12 }}>
              <div className="card" style={{ textAlign:'center' }}>
                <div className="muted">Fase</div>
                <div style={{ fontSize: 20, fontWeight: 900 }}>—</div>
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
              <a className="btn" href="#schema">Cambia schema</a>
            </div>
          </div>
        </div>
      </div>

      {/* ======= SEZIONI ======= */}
      <Section id="schema" title="Schema & settaggi">
        {Settings ? (
          <Suspense fallback={<div className="muted">Carico settaggi…</div>}><Settings /></Suspense>
        ) : (
          <div className="muted">Non ho trovato un componente “NutritionSettings/Schema”. Incolla qui la sezione con fase, schema pasti, peso/BF e obiettivi.</div>
        )}
      </Section>

      <Section id="piano" title="Piano & ricette">
        {Planner ? (
          <Suspense fallback={<div className="muted">Carico il planner…</div>}><Planner /></Suspense>
        ) : (
          <div className="muted">Non ho trovato un componente “Nutrition/Planner/WeekPlan”. Incolla qui il tuo planner con grammature dinamiche, Δ macro e ricette.</div>
        )}
      </Section>
    </section>
  );
}
