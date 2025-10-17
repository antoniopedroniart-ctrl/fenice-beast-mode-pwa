import React, { Suspense, useMemo } from 'react';
import { Link } from 'react-router-dom';

/** Auto-resolver: carica dinamicamente componenti se esistono in src/components */
const ALL = import.meta.glob('../components/*.{tsx,jsx}', { eager: false });

function pickLazy(matchers: string[]) {
  const entry = Object.keys(ALL).find(p => matchers.some(m => p.toLowerCase().includes(m.toLowerCase())));
  return entry ? React.lazy(ALL[entry] as any) : null;
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="card">
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{title}</h2>
      {children}
    </div>
  );
}

export default function Training() {
  // Prova a trovare questi componenti se esistono in src/components
  const Today = useMemo(() => pickLazy(['today', 'session', 'workouttoday', 'WorkoutToday']), []);
  const Programs = useMemo(() => pickLazy(['program', 'schede', 'variants', 'Programs']), []);
  const WTimer = useMemo(() => pickLazy(['workouttimer', 'resttimer', 'emom', 'Timer']), []);
  const WLog = useMemo(() => pickLazy(['workoutlog', 'setlog', 'logger']), []);

  return (
    <section className="grid" style={{ gap: 16 }}>
      {/* ======= HERO ======= */}
      <div className="card" style={{
        padding: 22,
        background: 'linear-gradient(135deg, color-mix(in oklab, var(--accent) 18%, var(--card)), var(--card))',
        borderColor: 'color-mix(in oklab, var(--accent) 20%, var(--border))',
        boxShadow: '0 16px 40px color-mix(in oklab, var(--accent) 22%, transparent)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 18 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', borderRadius: 999, background: 'color-mix(in oklab, var(--card) 70%, transparent)', border: '1px solid var(--border)' }}>
              <span className="muted" style={{ fontWeight: 800, letterSpacing: .3 }}>ALLENAMENTO</span>
              <span>— split 5d · finisher abs</span>
            </div>
            <h1 style={{ margin: '10px 0 6px 0', fontSize: 26, fontWeight: 900, letterSpacing: .3 }}>Spingi, tira, costruisci.</h1>
            <div className="muted" style={{ marginBottom: 14 }}>
              Push/Pull/Legs/Chest&Back/Shoulders&Arms, con finisher ABS a circuito e timer dinamico.
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <a className="btn primary" href="#oggi">Inizia sessione</a>
              <a className="btn" href="#schede">Schede complete</a>
              <a className="btn ghost" href="#timer">Timer</a>
            </div>
          </div>
          <div className="card" style={{ padding: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 12 }}>
              <div className="card" style={{ textAlign: 'center' }}><div className="muted">Split</div><div style={{ fontSize: 22, fontWeight: 900 }}>5 giorni</div></div>
              <div className="card" style={{ textAlign: 'center' }}><div className="muted">Sessione</div><div style={{ fontSize: 22, fontWeight: 900 }}>90–120′</div></div>
              <div className="card" style={{ textAlign: 'center' }}><div className="muted">Finisher</div><div style={{ fontSize: 22, fontWeight: 900 }}>ABS</div></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10, gap: 8 }}>
              <a className="btn" href="#log">Log workout</a>
              <Link className="btn" to="/calendar">Calendario</Link>
            </div>
          </div>
        </div>
      </div>

      {/* ======= SEZIONI ======= */}
      <Section id="oggi" title="Sessione di oggi">
        {Today ? (
          <Suspense fallback={<div className="muted">Carico la sessione…</div>}><Today /></Suspense>
        ) : (
          <div className="muted">Nessun componente “Today/Session” trovato in <code>src/components</code>. Incolla qui il contenuto della sessione di oggi.</div>
        )}
      </Section>

      <Section id="schede" title="Schede complete (varianti)">
        {Programs ? (
          <Suspense fallback={<div className="muted">Carico le schede…</div>}><Programs /></Suspense>
        ) : (
          <div className="muted">Nessun componente “Programs/Schede” trovato. Incolla qui le schede (Push/Pull/Legs/C&B/Shoulders&Arms).</div>
        )}
      </Section>

      <Section id="timer" title="Timer allenamento">
        {WTimer ? (
          <Suspense fallback={<div className="muted">Carico il timer…</div>}><WTimer /></Suspense>
        ) : (
          <div className="muted">Nessun “WorkoutTimer/RestTimer” trovato. Inserisci il tuo timer qui.</div>
        )}
      </Section>

      <Section id="log" title="Workout Log">
        {WLog ? (
          <Suspense fallback={<div className="muted">Carico il log…</div>}><WLog /></Suspense>
        ) : (
          <div className="muted">Nessun “WorkoutLog/Logger” trovato. Aggiungi il logger delle serie/pesi.</div>
        )}
      </Section>
    </section>
  );
}
