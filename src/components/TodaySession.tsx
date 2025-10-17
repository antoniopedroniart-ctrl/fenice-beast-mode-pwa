import React, { useMemo, useState } from 'react';

type Ex = { name:string; sets:number; reps:string; rir:number; note?:string };

const SPLIT: Record<number,{day:string; blocks:Ex[]}> = {
  1:{ day:'Push', blocks:[
    {name:'Panca piana',sets:4,reps:'5–8',rir:2},{name:'Spinta manubri inclinata',sets:3,reps:'8–10',rir:2},
    {name:'Military press',sets:3,reps:'5–8',rir:2},{name:'Alzate laterali cavo',sets:3,reps:'12–15',rir:1},
    {name:'French press',sets:3,reps:'10–12',rir:1},{name:'Pushdown',sets:2,reps:'12–15',rir:1},
  ]},
  2:{ day:'Pull', blocks:[
    {name:'Stacco rumeno',sets:4,reps:'5–8',rir:2},{name:'Rematore bilanciere',sets:3,reps:'6–10',rir:2},
    {name:'Lat machine',sets:3,reps:'8–12',rir:1},{name:'Pulley',sets:2,reps:'10–12',rir:1},
    {name:'Curl bilanciere',sets:3,reps:'8–12',rir:1},{name:'Curl manubri',sets:2,reps:'12–15',rir:1},
  ]},
  3:{ day:'Legs', blocks:[
    {name:'Squat',sets:4,reps:'5–8',rir:2},{name:'Pressa',sets:3,reps:'8–12',rir:2},
    {name:'Leg curl',sets:3,reps:'10–12',rir:1},{name:'Affondi',sets:2,reps:'10–12',rir:1},
    {name:'Calf raise',sets:4,reps:'12–15',rir:1},
  ]},
  4:{ day:'Chest & Back', blocks:[
    {name:'Panca inclinata',sets:4,reps:'6–10',rir:2},{name:'Croci cavo',sets:3,reps:'12–15',rir:1},
    {name:'Trazioni',sets:3,reps:'6–10',rir:2},{name:'Rematore manubrio',sets:3,reps:'8–12',rir:1},
  ]},
  5:{ day:'Shoulders & Arms', blocks:[
    {name:'Lento avanti',sets:3,reps:'6–10',rir:2},{name:'Alzate laterali',sets:4,reps:'12–15',rir:1},
    {name:'Curl alternato',sets:3,reps:'8–12',rir:1},{name:'Pushdown',sets:3,reps:'10–12',rir:1},
  ]},
};

const ABS_FINISHERS = [
  ['Plank 45″','Crunch 15','Leg raise 12','x3'], ['Hollow hold 30″','Mountain climber 40','V-sit 12','x3']
];

export default function TodaySession(){
  const [day,setDay]=useState<number>(()=>Number(localStorage.getItem('fenice.train.day')||'1'));
  const data=useMemo(()=>SPLIT[day], [day]);
  const [notes,setNotes]=useState<string>('');

  return (
    <div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:8}}>
        {[1,2,3,4,5].map(d=>
          <button key={d} className={`btn ${d===day?'primary':''}`} onClick={()=>{setDay(d); localStorage.setItem('fenice.train.day',String(d));}}>
            {SPLIT[d].day}
          </button>
        )}
      </div>

      <table className="table">
        <thead><tr><th>Esercizio</th><th>Serie</th><th>Reps</th><th>RIR</th></tr></thead>
        <tbody>
        {data.blocks.map((b,i)=>(
          <tr key={i}><td>{b.name}</td><td>{b.sets}</td><td>{b.reps}</td><td>{b.rir}</td></tr>
        ))}
        </tbody>
      </table>

      <div className="card" style={{marginTop:10}}>
        <div className="muted" style={{marginBottom:6}}>Abs finisher (scegline uno):</div>
        <ul>{ABS_FINISHERS.map((c,i)=>(<li key={i}>• {c.join(' → ')}</li>))}</ul>
      </div>

      <div className="card" style={{marginTop:10}}>
        <div className="muted" style={{marginBottom:6}}>Note sessione</div>
        <textarea className="input" rows={3} style={{width:'100%'}} value={notes} onChange={e=>setNotes(e.target.value)} />
      </div>
    </div>
  );
}
