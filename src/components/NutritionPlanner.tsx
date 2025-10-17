// src/components/NutritionPlanner.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';

type Phase = 'recomp' | 'bulk' | 'cut' | 'peak';
type Plan  = 'base4'  | 'inter5' | 'fast2';
type Settings = { phase:Phase; plan:Plan; meals:number; weight:number; bf:number };
type Macros = { calories:number; P:number; C:number; F:number };

const KEY = 'fenice.nutri.settings';

type Rec = {
  id:string; name:string; slots:string[]; time:number;
  kcal:number; P:number; C:number; F:number;
  items:string[]; tags?:string[]; // '🔥' cut, '🥔' bulk, '💪' protein
};

/** --- Ricette con slot specifici e tag fase --- */
const RECIPES: Rec[] = [
  { id:'r1', name:'Skyr + avena + frutta secca', slots:['Colazione','Spuntino','Snack','Pre/Post-wo'], time:5,  kcal:380, P:35, C:40, F:9,  tags:['💪'], items:['Skyr 300g','Avena 40g','Frutta secca 10g'] },
  { id:'r2', name:'Omelette albumi + pane',      slots:['Colazione','Spuntino'],                       time:7,  kcal:360, P:32, C:40, F:6,  tags:['💪'], items:['Albumi 250g','Pane 60g'] },
  { id:'r3', name:'Pollo + riso + zucchine',     slots:['Pranzo','Cena'],                              time:10, kcal:520, P:40, C:70, F:10, tags:['💪','🔥'], items:['Pollo 150g','Riso 120g','Zucchine libere'] },
  { id:'r4', name:'Pasta + tonno',               slots:['Pranzo','Cena','Pre/Post-wo'],                time:9,  kcal:600, P:35, C:85, F:10, tags:['🥔','💪'], items:['Pasta 110g','Tonno 160g'] },
  { id:'r5', name:'Merluzzo + patate + broccoli',slots:['Pranzo','Cena'],                              time:10, kcal:480, P:45, C:55, F:8,  tags:['🔥'], items:['Merluzzo 220g','Patate 250g','Broccoli'] },
  { id:'r6', name:'Whey shake + banana',         slots:['Spuntino','Snack','Pre/Post-wo'],             time:2,  kcal:250, P:30, C:30, F:3,  tags:['💪'], items:['Whey 30g','Banana 1'] },
  { id:'r7', name:'Panino + tacchino',           slots:['Pranzo','Spuntino','Snack'],                  time:5,  kcal:420, P:28, C:55, F:8,  tags:['⚡'], items:['Pane 120g','Fesa 150g'] },
  { id:'r8', name:'Salmone + riso venere',       slots:['Cena','Pranzo'],                              time:10, kcal:650, P:40, C:70, F:18, tags:['🥗'], items:['Salmone 200g','Riso venere 120g'] },
  { id:'r9', name:'Yogurt greco + miele + frutta', slots:['Colazione','Spuntino','Snack'],             time:3,  kcal:300, P:20, C:45, F:4,  tags:['⚡'], items:['Yogurt greco 250g','Miele 10g','Frutta 150g'] },
  { id:'r10',name:'Riso basmati + uova',         slots:['Pranzo','Pre/Post-wo'],                       time:10, kcal:550, P:28, C:85, F:10, tags:['🥔','💪'], items:['Riso 120g','Uova 2'] },
];

/** --- Utils --- */
const round5=(x:number)=>Math.round(x/5)*5;
function parseItem(s:string){
  const m=s.match(/^(.+?)\s(\d+(?:\.\d+)?)\s*(g|ml|pz)?$/i);
  if(m){ return { name:m[1], qty:Number(m[2]), unit:(m[3]||'g').toLowerCase() }; }
  const n=s.match(/^(.+?)\s(\d+(?:\.\d+)?)/);
  if(n){ return { name:n[1], qty:Number(n[2]), unit:'pz' }; }
  return { name:s, qty:1, unit:'pz' };
}
function fmtItem(name:string, qty:number, unit:string){
  return (unit==='g'||unit==='ml') ? `${name} ${round5(qty)}${unit}` : `${name} ${Math.max(1,Math.round(qty))}`;
}

function seededRng(seed:number){ let x=seed||1; return ()=> (x = (x*1664525 + 1013904223) % 4294967296) / 4294967296; }
function safeLoad<T>(key:string, fallback:T):T{ try{ const raw=localStorage.getItem(key); return raw? (JSON.parse(raw) as T) : fallback; }catch{ return fallback; } }

/** --- Macros --- */
function calcMacros(phase:Phase, weight:number, bf:number):Macros{
  const lbm=weight*(1-bf/100);
  const P=(phase==='bulk'?2.0:2.2)*lbm;
  const F=0.8*lbm;
  const tdee=34*weight;
  let calories=tdee;
  if(phase==='recomp') calories=tdee-100;
  if(phase==='cut')    calories=tdee-450;
  if(phase==='bulk')   calories=tdee+250;
  const C=Math.max(0,(calories-P*4-F*9)/4);
  return {calories,P,C,F};
}

/** --- Split per schema --- */
function splitForPlan(plan:Plan, meals:number){
  if(plan==='base4')  return { labels:['Colazione','Pranzo','Snack','Cena'], shares:[0.25,0.35,0.15,0.25] };
  if(plan==='inter5') return { labels:['Colazione','Spuntino','Pranzo','Pre/Post-wo','Cena'], shares:[0.20,0.10,0.30,0.15,0.25] };
  if(meals<=2) return { labels:['Pasto 1','Pasto 2'], shares:[0.45,0.55] };
  return { labels:['Pasto 1','Pasto 2','Pasto 3'], shares:[0.35,0.25,0.40] };
}

/** --- Alias per slot --- */
function slotAliases(lab:string, plan:Plan, idx:number){
  if(plan==='fast2'){
    if(idx===0) return ['Pre/Post-wo','Colazione','Spuntino','Snack'];
    if(idx===1) return ['Pranzo','Cena'];
    if(idx===2) return ['Cena','Pranzo'];
  } else {
    if(lab==='Colazione') return ['Colazione','Spuntino','Snack','Pre/Post-wo'];
    if(lab==='Spuntino' || lab==='Snack') return ['Spuntino','Snack','Pre/Post-wo'];
    if(lab==='Pranzo') return ['Pranzo','Pre/Post-wo'];
    if(lab==='Cena') return ['Cena','Pranzo'];
  }
  return [lab];
}

/** --- Filtri preferenze per fase --- */
function phasePref(phase:Phase){ 
  if(phase==='bulk') return (r:Rec)=> (r.tags?.includes('🥔') || r.kcal>=400);
  if(phase==='cut')  return (r:Rec)=> (r.tags?.includes('🔥') || r.kcal<=500);
  if(phase==='peak') return (r:Rec)=> (r.tags?.includes('💪'));
  return (_:Rec)=>true; // recomp/general
}

export default function NutritionPlanner(){
  // stato / settings
  const sectionRef=useRef<HTMLDivElement|null>(null);
  const weekRef=useRef<HTMLDivElement|null>(null);

  const defaults:Settings={ phase:'recomp', plan:'base4', meals:4, weight:80.35, bf:12.5 };
  const settings=useMemo(()=> safeLoad<Settings>(KEY, defaults), []);
  const macros=useMemo(()=> calcMacros(settings.phase, settings.weight, settings.bf), [settings.phase, settings.weight, settings.bf]);
  const split=useMemo(()=> splitForPlan(settings.plan, settings.meals), [settings.plan, settings.meals]);

  // target per slot (giorno corrente)
  const targets = useMemo(()=> split.labels.map((lab,i)=>({
    lab,
    k: macros.calories*split.shares[i],
    p: macros.P*split.shares[i],
    c: macros.C*split.shares[i],
    f: macros.F*split.shares[i],
    idx: i
  })), [split, macros]);

  const poolFor = (lab:string, idx:number)=>{
    const aliases=slotAliases(lab, settings.plan, idx);
    let pool = RECIPES.filter(r=> r.slots.some(s=>aliases.includes(s))).filter(phasePref(settings.phase));
    if(pool.length===0) pool = RECIPES.filter(phasePref(settings.phase));
    return pool;
  };

  function scale(rec:Rec, a:number){
    const items = rec.items.map(it=>{ const {name,qty,unit}=parseItem(it); return fmtItem(name, qty*a, unit); });
    return { name:rec.name, kcal:rec.kcal*a, P:rec.P*a, C:rec.C*a, F:rec.F*a, items };
  }

  const score=(t:{k:number;p:number;c:number;f:number}, K:number,P:number,C:number,F:number)=>{
    const ek=Math.abs(K-t.k)/Math.max(150,t.k);
    const ep=Math.abs(P-t.p)/Math.max(10,t.p);
    const ec=Math.abs(C-t.c)/Math.max(20,t.c);
    const ef=Math.abs(F-t.f)/Math.max(10,t.f);
    return ek*2 + ep*2 + ec + ef;
  };

  // seed daily
  const [seedBase] = useState(()=> {
    const d=new Date();
    return Number(`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`);
  });

  // ==== GIORNO CORRENTE ====
  const mealsDay = useMemo(()=>{
    const rng = seededRng(seedBase);
    return targets.map(t=>{
      const pool=poolFor(t.lab, t.idx);
      let best:any=null, bestErr=Number.POSITIVE_INFINITY;
      const shuffled = pool.slice().sort(()=> rng()-0.5).slice(0,6);
      for(const r of shuffled){
        const a = Math.min(1.8, Math.max(0.5, t.k / r.kcal));
        const s = scale(r, a);
        const e = score(t, s.kcal, s.P, s.C, s.F);
        if(e<bestErr){ bestErr=e; best={ slot:t.lab, title:r.name, ...s }; }
      }
      return best;
    });
  }, [targets, settings.plan, settings.phase, seedBase]);

  // ==== PLANNER SETTIMANALE ====
  const days = ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'];

  function buildWeek(seed:number){
    const out:any[]=[];
    for(let d=0; d<7; d++){
      const rng = seededRng(seed + d*97);
      const dayMeals = targets.map(t=>{
        const pool=poolFor(t.lab, t.idx);
        let best:any=null, bestErr=Number.POSITIVE_INFINITY;
        const shuffled = pool.slice().sort(()=> rng()-0.5).slice(0,6);
        for(const r of shuffled){
          const jitter = (rng()-0.5)*0.12; // ±6% per variare leggermente
          const a = Math.min(1.85, Math.max(0.5, (t.k / r.kcal) * (1+jitter)));
          const s = scale(r, a);
          const e = score(t, s.kcal, s.P, s.C, s.F);
          if(e<bestErr){ bestErr=e; best={ slot:t.lab, title:r.name, ...s }; }
        }
        return best;
      });
      out.push({ day: days[d], meals: dayMeals });
    }
    return out;
  }

  const [weekSeed, setWeekSeed] = useState(()=> seedBase);
  const weekPlan = useMemo(()=> buildWeek(weekSeed), [weekSeed, targets, settings.plan, settings.phase]);

  // ==== EXPORTS ====
  useEffect(()=>{
    async function onExport(){
      try{
        const el=sectionRef.current; if(!el) return;
        const html2canvas=(await import('html2canvas')).default;
        const { jsPDF } = await import('jspdf');
        const canvas=await html2canvas(el,{scale:2,backgroundColor:'#fff'});
        const pdf=new jsPDF({orientation:'p',unit:'pt',format:'a4'});
        const img=canvas.toDataURL('image/png');
        const pageW=pdf.internal.pageSize.getWidth();
        const w=pageW-40, h=canvas.height*w/canvas.width;
        pdf.setFont('helvetica','bold'); pdf.setFontSize(14);
        pdf.text(`Fenice — Piano nutrizionale (${settings.plan})`,20,24);
        pdf.setFont('helvetica','normal'); pdf.setFontSize(10);
        pdf.text(`Target: ${Math.round(macros.calories)} kcal · P ${Math.round(macros.P)}g · C ${Math.round(macros.C)}g · F ${Math.round(macros.F)}g`,20,38);
        pdf.addImage(img,'PNG',20,52,w,h);
        pdf.save('fenice_piano_nutrizionale.pdf');
      }catch{ alert('Export PDF non disponibile in questo ambiente.'); }
    }

    async function onExportWeek(){
      try{
        const el=weekRef.current; if(!el) return;
        const html2canvas=(await import('html2canvas')).default;
        const { jsPDF } = await import('jspdf');
        const canvas=await html2canvas(el,{scale:2,backgroundColor:'#fff'});
        const pdf=new jsPDF({orientation:'p',unit:'pt',format:'a4'});
        const img=canvas.toDataURL('image/png');
        const pageW=pdf.internal.pageSize.getWidth();
        const w=pageW-40, h=canvas.height*w/canvas.width;
        pdf.setFont('helvetica','bold'); pdf.setFontSize(14);
        pdf.text(`Fenice — Planner settimanale (${settings.plan} · ${settings.phase})`,20,24);
        pdf.addImage(img,'PNG',20,40,w,h);
        pdf.save('fenice_planner_settimanale.pdf');
      }catch{ alert('Export PDF non disponibile in questo ambiente.'); }
    }

    const onRegen = ()=> window.location.reload();
    const onRegenWeek = ()=> setWeekSeed(s=> s+1);

    window.addEventListener('fenice:nutrition:export', onExport);
    window.addEventListener('fenice:nutrition:export-week', onExportWeek);
    window.addEventListener('fenice:nutrition:regen', onRegen);
    window.addEventListener('fenice:nutrition:regen-week', onRegenWeek);
    return ()=>{
      window.removeEventListener('fenice:nutrition:export', onExport);
      window.removeEventListener('fenice:nutrition:export-week', onExportWeek);
      window.removeEventListener('fenice:nutrition:regen', onRegen);
      window.removeEventListener('fenice:nutrition:regen-week', onRegenWeek);
    };
  }, [settings.plan, settings.phase, macros.calories, macros.P, macros.C, macros.F]);

  // ==== RENDER ====
  return (
    <div>
      {/* ======= GIORNO ======= */}
      <div ref={sectionRef}>
        <div className="muted" style={{marginBottom:8}}>
          Target: <b>{Math.round(macros.calories)} kcal</b> · P {Math.round(macros.P)}g · C {Math.round(macros.C)}g · F {Math.round(macros.F)}g
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Pasto</th><th>Kcal</th><th>P</th><th>C</th><th>F</th><th>Ricetta</th><th>Grammature</th>
            </tr>
          </thead>
          <tbody>
            {mealsDay.map((m:any,i:number)=>(
              <tr key={i}>
                <td>{m.slot}</td>
                <td>{Math.round(m.kcal)}</td>
                <td>{Math.round(m.P)}g</td>
                <td>{Math.round(m.C)}g</td>
                <td>{Math.round(m.F)}g</td>
                <td>{m.title}</td>
                <td>
                  <ul style={{margin:0,paddingLeft:18}}>
                    {m.items.map((x:string,idx:number)=>(<li key={idx}>• {x}</li>))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ======= SETTIMANA ======= */}
      <div className="card" style={{marginTop:12}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8, gap:8, flexWrap:'wrap'}}>
          <h3 style={{fontWeight:800}}>Planner settimanale</h3>
          <div style={{display:'flex',gap:8}}>
            <button className="btn" onClick={()=>setWeekSeed(s=>s+1)}>Rigenera settimana</button>
            <button className="btn primary" onClick={()=>window.dispatchEvent(new CustomEvent('fenice:nutrition:export-week'))}>Export PDF settimana</button>
          </div>
        </div>
        <div ref={weekRef} className="text-sm" style={{overflowX:'auto'}}>
          <table className="table" style={{minWidth:1080}}>
            <thead>
              <tr>
                <th>Giorno</th>
                {split.labels.map((l,i)=>(<th key={i}>{l}</th>))}
              </tr>
            </thead>
            <tbody>
              {weekPlan.map((d:any,di:number)=>(
                <tr key={di} className="align-top">
                  <td><b>{d.day}</b></td>
                  {d.meals.map((m:any,mi:number)=>{
                    return (
                      <td key={mi}>
                        <div style={{fontWeight:600}}>{m.title}</div>
                        <div className="muted">≈{Math.round(m.kcal)} kcal · P{Math.round(m.P)} C{Math.round(m.C)} F{Math.round(m.F)}</div>
                        <ul style={{margin:'4px 0 0 0',paddingLeft:18}}>
                          {m.items.slice(0,6).map((x:string,idx:number)=>(<li key={idx} style={{fontSize:12}}>• {x}</li>))}
                        </ul>
                        {m.items.length>6 && <div className="muted" style={{fontSize:11}}>+{m.items.length-6} altri</div>}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="muted" style={{marginTop:6,fontSize:12}}>Le grammature sono scalate per ogni slot in base ai target; la settimana è variata con seed.</div>
        </div>
      </div>
    </div>
  );
}
