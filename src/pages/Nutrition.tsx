import React, { useEffect, useMemo, useRef, useState } from 'react';
type Phase = 'recomp'|'bulk'|'cut'|'peak';
type PlanType = 'base4'|'inter5'|'fast2';
type Macros = { calories:number; P:number; C:number; F:number };

function applyTheme(theme:'light'|'dark'|'auto'){
  const root = document.documentElement;
  const isDark = theme === 'auto' ? window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches : theme === 'dark';
  root.classList.toggle('dark', !!isDark);
}

export default function Nutrition(){
  const [state,setState] = useState<any>({
    goals:{ phase:'recomp' as Phase },
    nutrition:{ planType:'base4' as PlanType, mealsPerDay:4 },
    body:{ weightKg:80.35, bf:12.5 }
  });
  const calcMacros=(phase:Phase, weightKg:number, bf:number):Macros=>{
    const lbm = weightKg * (1 - bf/100);
    const P = phase==='bulk' ? 2.0*lbm : 2.2*lbm;
    const tdee = 34*weightKg;
    let calories = tdee;
    if(phase==='recomp') calories = tdee-100;
    if(phase==='cut') calories = tdee-450;
    if(phase==='bulk') calories = tdee+250;
    const F = 0.8*lbm;
    const C = Math.max(0,(calories - P*4 - F*9)/4);
    return { calories, P, C, F };
  };
  const macros = useMemo(()=> calcMacros(state.goals.phase, state.body.weightKg, state.body.bf), [state]);

  function split(planType:PlanType){
    if (planType==='base4') return { labels:['Colazione','Pranzo','Snack','Cena'], shares:[0.25,0.35,0.15,0.25] };
    if (planType==='inter5') return { labels:['Colazione','Spuntino','Pranzo','Pre/Post-wo','Cena'], shares:[0.2,0.1,0.3,0.15,0.25] };
    const mpd = Number(state.nutrition.mealsPerDay||3);
    if (planType==='fast2' && mpd<=2) return { labels:['Pasto 1','Pasto 2'], shares:[0.45,0.55] };
    return { labels:['Pasto 1','Pasto 2','Pasto 3'], shares:[0.35,0.25,0.40] };
  }
  const plan = split(state.nutrition.planType);
  const rows = plan.labels.map((lab,i)=>({ lab, k:Math.round(macros.calories*plan.shares[i]), p:Math.round(macros.P*plan.shares[i]), c:Math.round(macros.C*plan.shares[i]), f:Math.round(macros.F*plan.shares[i]) }));

  // Export PDF of targets
  const sectionRef = useRef<HTMLDivElement|null>(null);
  const doExportPDF = async ()=>{
    try{
      const el=sectionRef.current; if(!el) return;
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const canvas=await html2canvas(el,{scale:2,backgroundColor:'#fff'});
      const pdf=new jsPDF({orientation:'p',unit:'pt',format:'a4'});
      const img=canvas.toDataURL('image/png');
      const pageWidth=pdf.internal.pageSize.getWidth();
      const imgWidth=pageWidth-40; const imgHeight=canvas.height*imgWidth/canvas.width;
      pdf.setFont('helvetica','bold'); pdf.setFontSize(14);
      pdf.text(`Fenice — Piano nutrizionale (${state.nutrition.planType})`,20,24);
      pdf.setFont('helvetica','normal'); pdf.setFontSize(10);
      pdf.text(`Target: ${Math.round(macros.calories)} kcal · P ${Math.round(macros.P)}g · C ${Math.round(macros.C)}g · F ${Math.round(macros.F)}g`,20,38);
      pdf.addImage(img,'PNG',20,52,imgWidth,imgHeight);
      pdf.save('fenice_piano_nutrizionale.pdf');
    }catch{ alert('Export PDF non disponibile.'); }
  };

  return (
    <section className="grid">
      <div className="card">
        <h2 style={{fontSize:18,fontWeight:700,marginBottom:8}}>Piano pasti</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,minmax(0,1fr))',gap:12}}>
          <div><div className="muted">Fase</div><select className="input" value={state.goals.phase} onChange={e=>setState({...state, goals:{...state.goals, phase:e.target.value}})}><option value="recomp">Recomp</option><option value="bulk">Bulk</option><option value="cut">Cut</option><option value="peak">Peak</option></select></div>
          <div><div className="muted">Schema pasti</div><select className="input" value={state.nutrition.planType} onChange={e=>setState({...state, nutrition:{...state.nutrition, planType:e.target.value}})}><option value="base4">Base (4)</option><option value="inter5">Intermedio (5)</option><option value="fast2">Fast-Track (2-3)</option></select></div>
          <div><div className="muted">Pasti/gg</div><select className="input" value={String(state.nutrition.mealsPerDay)} onChange={e=>setState({...state, nutrition:{...state.nutrition, mealsPerDay:Number(e.target.value)}})}><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select></div>
          <div><div className="muted">Peso / BF</div><div style={{display:'flex',gap:8}}><input className="input" type="number" step="0.1" value={state.body.weightKg} onChange={e=>setState({...state, body:{...state.body, weightKg:Number(e.target.value)}})}/><input className="input" type="number" step="0.1" value={state.body.bf} onChange={e=>setState({...state, body:{...state.body, bf:Number(e.target.value)}})}/></div></div>
        </div>
        <div className="muted" style={{marginTop:8}}>Target: <b>{Math.round(macros.calories)} kcal</b> · P {Math.round(macros.P)}g · C {Math.round(macros.C)}g · F {Math.round(macros.F)}g</div>
        <div ref={sectionRef} style={{marginTop:12}}>
          <table className="table">
            <thead><tr className="muted"><th>Pasto</th><th>Kcal</th><th>P</th><th>C</th><th>F</th></tr></thead>
            <tbody>{rows.map((r,i)=>(<tr key={i}><td>{r.lab}</td><td>{r.k}</td><td>{r.p} g</td><td>{r.c} g</td><td>{r.f} g</td></tr>))}</tbody>
          </table>
        </div>
        <div style={{marginTop:8}}><button className="btn primary" onClick={doExportPDF}>Export PDF</button></div>
      </div>
    </section>
  );
}