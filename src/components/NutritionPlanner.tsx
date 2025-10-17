import React, { useEffect, useMemo, useRef, useState } from 'react';

type Phase='recomp'|'bulk'|'cut'|'peak';
type Plan='base4'|'inter5'|'fast2';
type Macros={calories:number;P:number;C:number;F:number};

const KEY='fenice.nutri.settings';

type Rec = { id:string, name:string, slots:string[], time:number, kcal:number, P:number, C:number, F:number, items:string[] };
const RECIPES:Rec[]=[
  { id:'r1', name:'Skyr+avena+frutta secca', slots:['Colazione','Spuntino','Snack','Pre/Post-wo'], time:5, kcal:380, P:35, C:40, F:9, items:['Skyr 300g','Avena 40g','Frutta secca 10g'] },
  { id:'r2', name:'Pollo+riso+zucchine', slots:['Pranzo','Cena'], time:10, kcal:520, P:40, C:70, F:10, items:['Pollo 150g','Riso 120g','Zucchine libere'] },
  { id:'r3', name:'Pasta+tonno', slots:['Pranzo','Cena','Pre/Post-wo'], time:9, kcal:600, P:35, C:85, F:10, items:['Pasta 110g','Tonno 160g'] },
  { id:'r4', name:'Merluzzo+patate+broccoli', slots:['Pranzo','Cena'], time:10, kcal:480, P:45, C:55, F:8, items:['Merluzzo 220g','Patate 250g','Broccoli'] },
  { id:'r5', name:'Whey shake+banana', slots:['Spuntino','Snack','Pre/Post-wo'], time:2, kcal:250, P:30, C:30, F:3, items:['Whey 30g','Banana 1'] },
  { id:'r6', name:'Panino+tacchino', slots:['Pranzo','Spuntino','Snack'], time:5, kcal:420, P:28, C:55, F:8, items:['Pane 120g','Fesa 150g'] },
];

const round5=(x:number)=>Math.round(x/5)*5;
function parseItem(s:string){ const m=s.match(/^(.+?)\s(\d+(?:\.\d+)?)\s*(g|ml|pz)?$/i); if(m){ return { name:m[1], qty:Number(m[2]), unit:(m[3]||'g').toLowerCase() }; } return { name:s, qty:1, unit:'pz' }; }
function fmtItem(name:string, qty:number, unit:string){ return (unit==='g'||unit==='ml') ? `${name} ${round5(qty)}${unit}` : `${name} ${Math.max(1,Math.round(qty))}`; }

function calcMacros(phase:Phase, weight:number, bf:number):Macros{
  const lbm=weight*(1-bf/100); const P=(phase==='bulk'?2.0:2.2)*lbm; const F=0.8*lbm;
  const tdee=34*weight; let calories=tdee; if(phase==='recomp') calories=tdee-100; if(phase==='cut') calories=tdee-450; if(phase==='bulk') calories=tdee+250;
  const C=Math.max(0,(calories-P*4-F*9)/4); return {calories,P,C,F};
}

export default function NutritionPlanner(){
  const sectionRef=useRef<HTMLDivElement|null>(null);
  const settings=useMemo(()=>{ try{return JSON.parse(localStorage.getItem(KEY)||'')}catch{return null} }||{phase:'recomp',plan:'base4',meals:4,weight:80.35,bf:12.5});
  const macros=useMemo(()=>calcMacros(settings.phase, settings.weight, settings.bf),[settings.phase,settings.weight,settings.bf]);

  const split=useMemo(()=>{
    const plan=settings.plan as Plan;
    if (plan==='base4') return { labels:['Colazione','Pranzo','Snack','Cena'], shares:[0.25,0.35,0.15,0.25] };
    if (plan==='inter5') return { labels:['Colazione','Spuntino','Pranzo','Pre/Post-wo','Cena'], shares:[0.2,0.1,0.3,0.15,0.25] };
    // fast
    const mpd=Number(settings.meals||3);
    if(mpd<=2) return { labels:['Pasto 1','Pasto 2'], shares:[0.45,0.55] };
    return { labels:['Pasto 1','Pasto 2','Pasto 3'], shares:[0.35,0.25,0.40] };
  },[settings]);

  const targets=useMemo(()=> split.labels.map((lab,i)=>({
    lab, k:macros.calories*split.shares[i], p:macros.P*split.shares[i], c:macros.C*split.shares[i], f:macros.F*split.shares[i]
  })),[split,macros]);

  function scale(rec:Rec, a:number){ const items=rec.items.map(it=>{ const {name,qty,unit}=parseItem(it); return fmtItem(name, qty*a, unit); }); return { kcal:rec.kcal*a, P:rec.P*a, C:rec.C*a, F:rec.F*a, items, name:rec.name }; }
  function bestFor(t:any){
    let best:any=null, bestErr=1e9;
    const score=(K:number,P:number,C:number,F:number)=> Math.abs(K-t.k)/Math.max(150,t.k)*2 + Math.abs(P-t.p)/Math.max(10,t.p)*2 + Math.abs(C-t.c)/Math.max(20,t.c) + Math.abs(F-t.f)/Math.max(10,t.f);
    for(const r of RECIPES){
      const a=Math.min(1.8, Math.max(0.5, t.k/r.kcal)); const s=scale(r,a); const e=score(s.kcal,s.P,s.C,s.F); if(e<bestErr){bestErr=e; best=s;}
    }
    return best;
  }

  const meals = targets.map((t:any)=>bestFor(t));

  // Export & Rigenera (hookati ai bottoni della pagina tramite CustomEvent)
  useEffect(()=>{
    const onExport=async ()=>{
      try{
        const el=sectionRef.current; if(!el) return;
        const html2canvas=(await import('html2canvas')).default; const { jsPDF } = await import('jspdf');
        const canvas=await html2canvas(el,{scale:2,backgroundColor:'#fff'});
        const pdf=new jsPDF({orientation:'p',unit:'pt',format:'a4'});
        const img=canvas.toDataURL('image/png'); const pageWidth=pdf.internal.pageSize.getWidth();
        const w=pageWidth-40; const h=canvas.height*w/canvas.width;
        pdf.setFont('helvetica','bold'); pdf.setFontSize(14);
        pdf.text(`Fenice — Piano nutrizionale (${settings.plan})`,20,24);
        pdf.setFont('helvetica','normal'); pdf.setFontSize(10);
        pdf.text(`Target: ${Math.round(macros.calories)} kcal · P ${Math.round(macros.P)}g · C ${Math.round(macros.C)}g · F ${Math.round(macros.F)}g`,20,38);
        pdf.addImage(img,'PNG',20,52,w,h); pdf.save('fenice_piano_nutrizionale.pdf');
      }catch{ alert('Export PDF non disponibile qui'); }
    };
    const onRegen=()=>{ window.location.reload(); };
    window.addEventListener('fenice:nutrition:export', onExport);
    window.addEventListener('fenice:nutrition:regen', onRegen);
    return ()=>{ window.removeEventListener('fenice:nutrition:export', onExport); window.removeEventListener('fenice:nutrition:regen', onRegen); };
  },[settings,macros]);

  return (
    <div ref={sectionRef}>
      <div className="muted" style={{marginBottom:8}}>
        Target: <b>{Math.round(macros.calories)} kcal</b> · P {Math.round(macros.P)}g · C {Math.round(macros.C)}g · F {Math.round(macros.F)}g
      </div>
      <table className="table">
        <thead><tr><th>Pasto</th><th>Kcal</th><th>P</th><th>C</th><th>F</th><th>Ricetta</th><th>Grammature</th></tr></thead>
        <tbody>
          {meals.map((m,i)=>(
            <tr key={i}>
              <td>{targets[i].lab}</td>
              <td>{Math.round(m.kcal)}</td><td>{Math.round(m.P)}g</td><td>{Math.round(m.C)}g</td><td>{Math.round(m.F)}g</td>
              <td>{m.name}</td>
              <td><ul>{m.items.map((x:string,idx:number)=>(<li key={idx}>• {x}</li>))}</ul></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
