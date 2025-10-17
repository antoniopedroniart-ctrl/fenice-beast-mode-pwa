import React, { useEffect, useState } from 'react';
const KEY = 'fenice.nutri.settings';

type Phase = 'recomp' | 'bulk' | 'cut' | 'peak';
type Plan  = 'base4'  | 'inter5'| 'fast2';

function safeLoad<T>(key:string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch { return null; }
}

export default function NutritionSettings(){
  const defaults = { phase:'recomp' as Phase, plan:'base4' as Plan, meals:4, weight:80.35, bf:12.5 };

  // ✅ Chiudi la callback e ritorna direttamente il valore di fallback all'interno
  const [state, setState] = useState(() => {
    const saved = safeLoad<typeof defaults>(KEY);
    return saved ?? defaults;
  });

  useEffect(()=>{ try{ localStorage.setItem(KEY, JSON.stringify(state)); }catch{} },[state]);

  return (
    <div style={{display:'grid', gap:10, gridTemplateColumns:'repeat(4,minmax(0,1fr))'}}>
      <div>
        <div className="muted">Fase</div>
        <select className="input" value={state.phase} onChange={e=>setState({...state, phase:e.target.value as Phase})}>
          <option value="recomp">Recomp</option>
          <option value="bulk">Bulk</option>
          <option value="cut">Cut</option>
          <option value="peak">Peak</option>
        </select>
      </div>

      <div>
        <div className="muted">Schema pasti</div>
        <select className="input" value={state.plan} onChange={e=>setState({...state, plan:e.target.value as Plan})}>
          <option value="base4">4 pasti</option>
          <option value="inter5">5 pasti</option>
          <option value="fast2">Fast-Track (2–3)</option>
        </select>
      </div>

      <div>
        <div className="muted">Pasti/gg</div>
        <select className="input" value={String(state.meals)} onChange={e=>setState({...state, meals:Number(e.target.value)})}>
          <option value="2">2</option><option value="3">3</option>
          <option value="4">4</option><option value="5">5</option>
        </select>
      </div>

      <div>
        <div className="muted">Peso / BF</div>
        <div style={{display:'flex', gap:6}}>
          <input className="input" type="number" value={state.weight} onChange={e=>setState({...state, weight:Number(e.target.value)})}/>
          <input className="input" type="number" value={state.bf} onChange={e=>setState({...state, bf:Number(e.target.value)})}/>
        </div>
      </div>
    </div>
  );
}
