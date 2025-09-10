import React, { useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

type Phase = 'recomp'|'bulk'|'cut'|'peak';
type PlanType = 'base4'|'inter5'|'fast2'|'fast3';
type Macros = { calories:number; P:number; C:number; F:number };

function useMacros(phase:Phase, weightKg:number, bf:number):Macros{
  const lbm = weightKg * (1 - bf/100);
  const P = phase==='bulk' ? 2.0*lbm : 2.2*lbm;
  const tdee = 34*weightKg;
  let calories=tdee; if(phase==='recomp') calories=tdee-100; if(phase==='cut') calories=tdee-450; if(phase==='bulk') calories=tdee+250; if(phase==='peak') calories=tdee;
  const F=0.8*lbm; const kcalP=P*4, kcalF=F*9; const C=Math.max(0,(calories-kcalP-kcalF)/4);
  return { calories, P, C, F };
}

export default function Nutrition(){
  const [phase, setPhase]=useState<Phase>('recomp');
  const [weight, setWeight]=useState(80.35);
  const [bf, setBf]=useState(12.5);
  const [planType, setPlanType]=useState<PlanType>('base4');
  const [mealsPerDay, setMealsPerDay]=useState(4);
  const macros = useMemo(()=>useMacros(phase,weight,bf),[phase,weight,bf]);

  function splitForPlan(planType:PlanType){
    if (planType === 'base4') return { labels:['Colazione','Pranzo','Snack','Cena'], shares:[0.25,0.35,0.15,0.25] };
    if (planType === 'inter5') return { labels:['Colazione','Spuntino','Pranzo','Pre/Post-wo','Cena'], shares:[0.2,0.1,0.3,0.15,0.25] };
    const mpd = Number(mealsPerDay||3);
    if (planType === 'fast2' && mpd<=2) return { labels:['Pasto 1','Pasto 2'], shares:[0.45,0.55] };
    if (planType === 'fast2' && mpd>=3) return { labels:['Pasto 1','Pasto 2','Pasto 3'], shares:[0.35,0.25,0.40] };
    return { labels:['Pasto 1','Pasto 2','Pasto 3'], shares:[0.35,0.25,0.40] };
  }
  const plan = splitForPlan(planType);

  const targets = plan.labels.map((lab,i)=>({ lab, k: macros.calories*plan.shares[i], p: macros.P*plan.shares[i], c: macros.C*plan.shares[i], f: macros.F*plan.shares[i] }));

  function slotAliases(lab:string, planType:PlanType, idx:number){
    if (planType==='fast2'){
      if(idx===0) return ['Pre/Post-wo','Pranzo','Colazione','Snack'];
      if(idx===1) return ['Cena','Pranzo'];
      if(idx===2) return ['Cena','Pranzo'];
    } else {
      if (lab==='Pasto 1') return ['Colazione','Pre/Post-wo','Spuntino'];
      if (lab==='Pasto 2') return ['Pranzo','Pre/Post-wo'];
      if (lab==='Pasto 3') return ['Cena','Pranzo'];
    }
    return [lab];
  }

  type Rec = { id:string, name:string, slots:string[], time:number, tags:string[], kcal:number, P:number, C:number, F:number, items:string[] };
  const RECIPES:Rec[]=[
    { id:'r1', name:'Skyr + avena + frutta secca', slots:['Colazione','Spuntino','Snack','Pre/Post-wo'], time:5, tags:['⚡','💪'], kcal:380, P:35, C:40, F:9, items:['Skyr 300g','Avena 40g','Frutta secca 10g'] },
    { id:'r2', name:'Omelette albumi + pane', slots:['Colazione','Spuntino'], time:7, tags:['💪'], kcal:360, P:32, C:40, F:6, items:['Albumi 250g','Pane 60g'] },
    { id:'r3', name:'Pollo + riso + zucchine', slots:['Pranzo','Cena'], time:10, tags:['💪','🔥'], kcal:520, P:40, C:70, F:10, items:['Pollo 150g','Riso 120g','Zucchine libere'] },
    { id:'r4', name:'Pasta + tonno', slots:['Pranzo','Cena','Pre/Post-wo'], time:9, tags:['💪','🥔'], kcal:600, P:35, C:85, F:10, items:['Pasta 110g','Tonno 160g'] },
    { id:'r5', name:'Merluzzo + patate + broccoli', slots:['Pranzo','Cena'], time:10, tags:['🔥'], kcal:480, P:45, C:55, F:8, items:['Merluzzo 220g','Patate 250g','Broccoli'] },
    { id:'r6', name:'Whey shake + banana', slots:['Spuntino','Snack','Pre/Post-wo'], time:2, tags:['⚡','💪'], kcal:250, P:30, C:30, F:3, items:['Whey 30g','Banana 1'] },
    { id:'r7', name:'Panino + tacchino', slots:['Pranzo','Spuntino','Snack'], time:5, tags:['⚡'], kcal:420, P:28, C:55, F:8, items:['Pane 120g','Fesa 150g'] },
    { id:'r8', name:'Salmone + riso venere', slots:['Cena','Pranzo'], time:10, tags:['🥗'], kcal:650, P:40, C:70, F:18, items:['Salmone 200g','Riso venere 120g'] },
    { id:'r9', name:'Yogurt greco + miele + frutta', slots:['Colazione','Spuntino','Snack'], time:3, tags:['⚡'], kcal:300, P:20, C:45, F:4, items:['Yogurt greco 250g','Miele 10g','Frutta 150g'] },
    { id:'r10', name:'Riso basmati + uova', slots:['Pranzo','Pre/Post-wo'], time:10, tags:['💪','🥔'], kcal:550, P:28, C:85, F:10, items:['Riso 120g','Uova 2'] },
  ];

  const round5 = (x:number)=> Math.round(x/5)*5;
  function parseItem(s:string){ const m=s.match(/^(.+?)\s(\d+(?:\.\d+)?)\s*(g|ml|pz)?$/i); if(m){ return { name:m[1], qty:Number(m[2]), unit:(m[3]||'g').toLowerCase() }; } const n=s.match(/^(.+?)\s(\d+(?:\.\d+)?)/); if(n){ return { name:n[1], qty:Number(n[2]), unit:'pz' }; } return { name:s, qty:1, unit:'pz' }; }
  function fmtItem(name:string, qty:number, unit:string){ return (unit==='g'||unit==='ml') ? `${name} ${round5(qty)}${unit}` : `${name} ${Math.max(1,Math.round(qty))}`; }
  function scaleRecipe(rec:Rec, a:number){ const comp={ name:rec.name, a, kcal:rec.kcal*a, P:rec.P*a, C:rec.C*a, F:rec.F*a }; const items=rec.items.map(it=>{ const {name,qty,unit}=parseItem(it); return fmtItem(name, qty*a, unit); }); return { comp, items }; }

  const phasePref = (phase:string)=> ({ recomp:(_:Rec)=>true, bulk:(r:Rec)=> r.tags.includes('🥔')||r.kcal>=400, cut:(r:Rec)=> r.tags.includes('🔥')||r.kcal<=500, peak:(r:Rec)=> r.tags.includes('💪') })[phase] || (()=>true);

  type MealOut = { title:string,kcal:number,P:number,C:number,F:number,items:string[] };
  function buildMeal(slotLabel:string, idx:number, tgt:{k:number,p:number,c:number,f:number}):MealOut{
    let aliases = slotAliases(slotLabel, planType as PlanType, idx);
    let pool = RECIPES.filter(r=> r.slots.some(s=> aliases.includes(s))).filter(phasePref(phase));
    if(pool.length===0){ pool = RECIPES.filter(phasePref(phase)); }
    const score=(K:number,PX:number,CX:number,FX:number)=>{ const ek=Math.abs(K-tgt.k)/Math.max(150,tgt.k); const ep=Math.abs(PX-tgt.p)/Math.max(10,tgt.p); const ec=Math.abs(CX-tgt.c)/Math.max(20,tgt.c); const ef=Math.abs(FX-tgt.f)/Math.max(10,tgt.f); return ek*2+ep*2+ec+ef; };
    let best:{ parts:{name:string,a:number,kcal:number,P:number,C:number,F:number,items:string[]}[],err:number}={parts:[],err:Infinity};
    for(const r of pool){ const a=Math.min(1.8, Math.max(0.5, tgt.k/r.kcal)); const s=scaleRecipe(r,a); const err=score(s.comp.kcal,s.comp.P,s.comp.C,s.comp.F); if(err<best.err){ best={parts:[{...s.comp,items:s.items}],err}; } }
    const N=Math.min(pool.length,6);
    for(let i=0;i<N;i++) for(let j=i;j<N;j++){
      const r1=pool[i], r2=pool[j];
      for(let a=0.4;a<=1.6;a+=0.1) for(let b=0.2;b<=1.2;b+=0.1){
        const s1=scaleRecipe(r1,a), s2=scaleRecipe(r2,b);
        const K=s1.comp.kcal+s2.comp.kcal, PX=s1.comp.P+s2.comp.P, CX=s1.comp.C+s2.comp.C, FX=s1.comp.F+s2.comp.F;
        const err=score(K,PX,CX,FX);
        if(err<best.err){ best={ parts:[{...s1.comp,items:s1.items},{...s2.comp,items:s2.items}], err }; }
      }
    }
    const agg=best.parts.reduce((acc,c)=>({kcal:acc.kcal+c.kcal,P:acc.P+c.P,C:acc.C+c.C,F:acc.F+c.F,names:acc.names.concat(c.name),items:acc.items.concat(c.items)}),{kcal:0,P:0,C:0,F:0,names:[] as string[],items:[] as string[]});
    const title=agg.names.join(' + ');
    return { title, kcal:agg.kcal, P:agg.P, C:agg.C, F:agg.F, items:agg.items };
  }

  const rows = targets.map(t=> ({ lab:t.lab, k:Math.round(t.k), p:Math.round(t.p), c:Math.round(t.c), f:Math.round(t.f) }));
  const days=['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];
  function buildWeekPlan(){ return days.map(d=>({ day:d, meals:targets.map((t,idx)=>buildMeal(t.lab, idx, t)) })); }
  const [weekPlan, setWeekPlan]=useState<any[]>([]);

  const sectionRef = useRef<HTMLDivElement|null>(null);

  const generate=()=> setWeekPlan(buildWeekPlan());

  const doExportPDF = async () => {
    try{
      const el=sectionRef.current; if(!el) return;
      const canvas=await html2canvas(el,{scale:2,backgroundColor:'#fff'});
      const pdf=new jsPDF({orientation:'p',unit:'pt',format:'a4'});
      const img=canvas.toDataURL('image/png');
      const W=pdf.internal.pageSize.getWidth();
      const w=W-40; const h=canvas.height*w/canvas.width;
      pdf.setFont('helvetica','bold'); pdf.setFontSize(14);
      pdf.text(`Fenice — Piano nutrizionale (${planType})`,20,24);
      pdf.setFont('helvetica','normal'); pdf.setFontSize(10);
      pdf.text(`Target: ${Math.round(macros.calories)} kcal · P ${Math.round(macros.P)}g · C ${Math.round(macros.C)}g · F ${Math.round(macros.F)}g`,20,38);
      pdf.addImage(img,'PNG',20,52,w,h);
      pdf.save('fenice_piano_nutrizionale.pdf');
    }catch{ alert('Export PDF non disponibile in questo ambiente.'); }
  };
  const exportWeekPDF = async ()=>{
    try{
      const el=document.getElementById('weekPlanner'); if(!el) return;
      const canvas=await html2canvas(el as HTMLElement,{scale:2,backgroundColor:'#fff'});
      const pdf=new jsPDF({orientation:'p',unit:'pt',format:'a4'});
      const img=canvas.toDataURL('image/png');
      const W=pdf.internal.pageSize.getWidth(); const w=W-40; const h=canvas.height*w/canvas.width;
      pdf.setFont('helvetica','bold'); pdf.setFontSize(14);
      pdf.text(`Fenice — Planner ${planType} · ${phase}`,20,24);
      pdf.addImage(img,'PNG',20,40,w,h);
      pdf.save('fenice_planner_settimanale.pdf');
    }catch{ alert('Export PDF non disponibile in questo ambiente.'); }
  };

  return (
    <section className="grid grid-2">
      <div className="card">
        <h2 style={{fontSize:18,fontWeight:700,marginBottom:8}}>Impostazioni nutrizione</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:12}}>
          <label>Fase<select className="input" value={phase} onChange={e=>setPhase(e.target.value as Phase)}>
            <option value="recomp">Recomp</option>
            <option value="bulk">Bulk</option>
            <option value="cut">Cut</option>
            <option value="peak">Peak</option>
          </select></label>
          <label>Piano<select className="input" value={planType} onChange={e=>setPlanType(e.target.value as PlanType)}>
            <option value="base4">Base (4 pasti)</option>
            <option value="inter5">Intermedio (5 pasti)</option>
            <option value="fast2">Fast-Track (2-3 pasti)</option>
          </select></label>
          <label>Pasti/gg<select className="input" value={String(mealsPerDay)} onChange={e=>setMealsPerDay(Number(e.target.value))}>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
          </select></label>
          <label>Peso (kg)<input className="input" type="number" step={0.1} value={weight} onChange={e=>setWeight(Number(e.target.value))}/></label>
          <label>BF (%)<input className="input" type="number" step={0.1} value={bf} onChange={e=>setBf(Number(e.target.value))}/></label>
        </div>
        <div className="muted" style={{fontSize:14,marginTop:8}}>Target: <b>{Math.round(macros.calories)} kcal</b> · P {Math.round(macros.P)}g · C {Math.round(macros.C)}g · F {Math.round(macros.F)}g</div>
      </div>

      <div className="card">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <h2 style={{fontSize:18,fontWeight:700}}>Piano pasti per slot</h2>
          <button className="btn primary" onClick={doExportPDF}>Export PDF</button>
        </div>
        <div ref={sectionRef}>
          <table className="table" style={{fontSize:14}}>
            <thead><tr className="muted"><th>Pasto</th><th>Kcal</th><th>P</th><th>C</th><th>F</th></tr></thead>
            <tbody>
              {targets.map((r,i)=>(<tr key={i}><td>{r.lab}</td><td>{Math.round(r.k)}</td><td>{Math.round(r.p)} g</td><td>{Math.round(r.c)} g</td><td>{Math.round(r.f)} g</td></tr>))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{gridColumn:'1 / -1'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <h2 style={{fontSize:18,fontWeight:700}}>Planner settimanale (macro-accurato)</h2>
          <div style={{display:'flex',gap:8}}>
            <button className="btn" onClick={generate}>Genera</button>
            <button className="btn primary" onClick={exportWeekPDF}>Export PDF</button>
          </div>
        </div>
        <div id='weekPlanner' style={{fontSize:14,overflowX:'auto'}}>
          {weekPlan.length===0? <div className="muted">Premi Genera.</div> : (
            <table className="table" style={{minWidth:1000}}>
              <thead><tr className="muted"><th>Giorno</th>{plan.labels.map((l,i)=>(<th key={i}>{l}</th>))}</tr></thead>
              <tbody>
                {weekPlan.map((d,i)=>(
                  <tr key={i} className="align-top">
                    <td style={{fontWeight:700}}>{d.day}</td>
                    {d.meals.map((m:any,j:number)=>{
                      const t=targets[j];
                      const dK=Math.round(m.kcal - t.k);
                      const dP=Math.round(m.P - t.p);
                      const dC=Math.round(m.C - t.c);
                      const dF=Math.round(m.F - t.f);
                      const sign=(x:number)=> x>0?`+${x}`:`${x}`;
                      return (
                        <td key={j}>
                          <div style={{fontWeight:600}}>{m.title}</div>
                          <div className="muted">≈{Math.round(m.kcal)} kcal · P{Math.round(m.P)} C{Math.round(m.C)} F{Math.round(m.F)}</div>
                          <div style={{fontSize:12,marginTop:4}}>Δ: kcal {sign(dK)}, P {sign(dP)}, C {sign(dC)}, F {sign(dF)}</div>
                          <ul style={{marginTop:6,paddingLeft:16}}>
                            {m.items.slice(0,6).map((it:string,idx:number)=>(<li style={{fontSize:12}} key={idx}>• {it}</li>))}
                          </ul>
                          {m.items.length>6 && <div className="muted" style={{fontSize:11}}>+{m.items.length-6} altri</div>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </section>
  );
}