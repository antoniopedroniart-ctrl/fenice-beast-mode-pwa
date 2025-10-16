
import React, { useMemo, useState } from 'react';
const SPLIT: Record<number,string> = {0:'Push',1:'Pull',2:'Legs',3:'Chest & Back',4:'Shoulders & Arms'};
const SUBJECT_WINDOWS = [
  { until: new Date(2025,10,10), pri:'Biochimica 1', sec:'Istologia' },
  { until: new Date(2025,11, 1), pri:'Biochimica 1', sec:'Anatomia' },
  { until: new Date(2025,11,16), pri:'Biochimica 1', sec:'Semeiotica Med/Chir' },
  { until: new Date(2026, 0, 8), pri:'Anatomia',     sec:'Istologia' },
  { until: new Date(2026, 0,15), pri:'Biochimica 2', sec:'Anatomia' },
  { until: new Date(2026, 0,28), pri:'Immunologia',  sec:'Biochimica 2' },
];
const EXAMS: {title:string; date:string}[] = [
  { title:"Biochimica 1", date:"2025-12-10" },
  { title:"Semeiotica Med/Chir", date:"2025-12-16" },
  { title:"Istologia", date:"2026-01-07" },
  { title:"Anatomia", date:"2026-01-08" },
  { title:"Biochimica 2", date:"2026-01-15" },
  { title:"Immunologia", date:"2026-01-28" },
];
const weekStart = (d: Date) => { const x=new Date(d); const wd=x.getDay()===0?6:x.getDay()-1; x.setDate(x.getDate()-wd); x.setHours(0,0,0,0); return x; };
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate()+n);
function subjectFor(date: Date){ for(const w of SUBJECT_WINDOWS){ if(date <= w.until) return { pri:w.pri, sec:w.sec }; } return { pri:'Consolidamento', sec:'Recupero' }; }
function studyBlocks(date: Date){ const wd=(date.getDay()+6)%7; const b:any[]=[]; b.push(['Studio (mattina)','05:00','07:00','pri']); if(wd===0)b.push(['Studio (pomeriggio)','14:00','17:30','pri']); if(wd===5||wd===6)b.push(['Studio (pausa lavoro)','16:00','17:30','sec']); if(wd<=4)b.push(['Studio (notte)','03:30','05:00','pri']); return b; }
function workBlocks(date: Date){ const wd=(date.getDay()+6)%7; const out:any[]=[]; if([1,2,3,4].includes(wd)) out.push(['Lavoro','18:00','00:30']); if([5,6].includes(wd)){ out.push(['Lavoro','10:30','16:00']); out.push(['Lavoro','18:00','00:30']); } return out; }
function workoutBlock(date: Date){ const wd=(date.getDay()+6)%7; if(wd<=4) return ['Training — '+SPLIT[wd]+' (01:45)','01:45','03:15']; return null; }
export default function StudyPlanner(){
  const [weekStartDate, setWeekStartDate] = useState(()=>weekStart(new Date(2025,9,20)));
  const weekDays = useMemo(()=> Array.from({length:7}, (_,i)=> addDays(weekStartDate, i)), [weekStartDate]);
  const buildDay = (d: Date) =>{ const {pri,sec}=subjectFor(d); const items:string[]=[]; for(const [label,s,e,subj] of studyBlocks(d)){ items.push(`${label} ${s}–${e}: ${subj==='pri'? pri:sec}`); } for(const [lab,s,e] of workBlocks(d)){ items.push(`${lab} ${s}–${e}`); } const wo=workoutBlock(d); if(wo){ items.push(`${wo[0]} ~${wo[1]}–${wo[2]}`); } const ymd=d.toISOString().slice(0,10); for(const ex of EXAMS){ if(ex.date===ymd) items.push(`📌 ESAME: ${ex.title}`); } return items; };
  return (<section className="grid"><div className="card"><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}><h2 style={{fontSize:18,fontWeight:700}}>📚 Study Planner</h2><div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center'}}><button className="btn" onClick={()=>setWeekStartDate(prev=> new Date(prev.getFullYear(), prev.getMonth(), prev.getDate()-7))}>← Settimana</button><button className="btn" onClick={()=>setWeekStartDate(weekStart(new Date()))}>Oggi</button><button className="btn" onClick={()=>setWeekStartDate(prev=> new Date(prev.getFullYear(), prev.getMonth(), prev.getDate()+7))}>Settimana →</button><a className="btn primary" href={`${import.meta.env.BASE_URL}study-planner.pdf`} target="_blank" rel="noreferrer">Apri PDF completo</a></div></div><div className="muted" style={{marginBottom:8,fontSize:12}}>Orizzontale, una pagina per settimana. PDF completo: 20 Ott 2025 → 28 Gen 2026 (lezioni incluse).</div><div style={{overflowX:'auto'}}><table className="table" style={{minWidth:1000, fontSize:14}}><thead><tr className="muted">{weekDays.map((d,i)=> <th key={i}>{d.toLocaleDateString('it-IT', {weekday:'short', day:'2-digit', month:'2-digit'})}</th>)}</tr></thead><tbody><tr className="align-top">{weekDays.map((d,i)=>{ const items = buildDay(d); return (<td key={i} style={{verticalAlign:'top'}}><ul style={{margin:0,paddingLeft:16}}>{items.map((t,idx)=> <li key={idx} style={{marginBottom:6}}>{t}</li>)}</ul></td>); })}</tr></tbody></table></div></div></section>); }
