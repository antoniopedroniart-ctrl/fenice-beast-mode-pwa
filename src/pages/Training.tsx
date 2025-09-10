import React from 'react';

export default function Training(){
  const blocks:any = {
    day1:{ name:'Giorno 1 — Push', sets:[
      {title:'Chest (scegline 2)', moves:['Panca piana bilanciere 4x6-8','Chest press 3x8-10','Panca inclinata manubri 3x8-12','Dip 3xRPE8']},
      {title:'Shoulder (2)', moves:['Military press 4x6-8','Alzate laterali 4x12-15','Arnold press 3x8-10']},
      {title:'Triceps (2)', moves:['French press 3x8-10','Pushdown 3x10-12','Estensioni manubrio 3x12-15']},
    ]},
    day2:{ name:'Giorno 2 — Pull', sets:[
      {title:'Back (3)', moves:['Stacco rumeno 4x6-8','Rematore bilanciere 4x6-8','Lat machine 3x8-10','Pulley 3x10-12','Pullover cavi 3x12-15']},
      {title:'Biceps (2)', moves:['Curl bilanciere 3x6-8','Curl manubri 3x8-12','Curl a martello 3x10-12']},
    ]},
    day3:{ name:'Giorno 3 — Legs + Abs', sets:[
      {title:'Quads (2)', moves:['Squat 4x5-8','Pressa 3x10-12','Affondi 3x10-12']},
      {title:'Hamstrings (2)', moves:['Romanian deadlift 4x6-8','Leg curl 4x10-12']},
      {title:'Calves (1)', moves:['Calf raise in piedi 4x10-15']},
      {title:'Glutes (1)', moves:['Hip thrust 4x6-8']},
    ]},
    day4:{ name:'Giorno 4 — Chest & Back', sets:[
      {title:'Chest (3)', moves:['Panca piana 4x6-8','Dips 3xRPE8','Croci panca inclinata 3x12-15']},
      {title:'Back (2)', moves:['Trazioni 4xAMRAP','Rematore manubrio 3x8-10']},
    ]},
    day5:{ name:'Giorno 5 — Shoulders & Arms', sets:[
      {title:'Shoulder (2)', moves:['Military press 4x6-8','Alzate laterali 4x12-15']},
      {title:'Biceps (2)', moves:['Curl bilanciere 3x6-8','Curl manubri 3x8-12']},
      {title:'Triceps (2)', moves:['French press 3x8-10','Pushdown 3x10-12']},
    ]},
  };
  const finishers=[
    {name:'ABS Finisher A (base)', items:['Plank 45s','Hollow hold 20s','Crunch 15','Leg raise 10'], note:'3–4 giri, 45–60s rest'},
    {name:'ABS Finisher B (progressivo)', items:['Plank 60s','V-up 12','Hanging knee raise 10','Russian twist 20'], note:'3–4 giri, 60–75s rest'},
    {name:'ABS Finisher C (avanzato)', items:['Dragon flag negativo 5','Hanging leg raise 12','Ab wheel 10','Side plank 30s/lato'], note:'3 giri, 75–90s rest'},
  ];
  return (
    <section className="grid grid-2">
      {Object.values(blocks).map((b:any,idx:number)=> (
        <div key={idx} className="card">
          <h2 style={{fontSize:18,fontWeight:700,marginBottom:8}}>{b.name}</h2>
          {b.sets.map((s:any,i:number)=> (
            <div key={i} style={{marginBottom:10}}>
              <div style={{fontWeight:600}}>{s.title}</div>
              <ul style={{paddingLeft:18}}>
                {s.moves.map((m:string,j:number)=>(<li key={j} style={{fontSize:14}}>{m}</li>))}
              </ul>
            </div>
          ))}
          <div className="card" style={{marginTop:8,padding:12}}>
            <div style={{fontWeight:700,marginBottom:6}}>Finisher ABS (scegline 1)</div>
            {finishers.map((f, i)=> (
              <div key={i} style={{marginBottom:6}}>
                <div style={{fontWeight:600,fontSize:14}}>{f.name}</div>
                <div style={{fontSize:14}}>{f.items.join(' → ')} <span className="muted">({f.note})</span></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}