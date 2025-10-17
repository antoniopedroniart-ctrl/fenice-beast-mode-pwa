import React, { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Nutrition from './pages/Nutrition';
import Training from './pages/Training';
import Body from './pages/Body';
import Calendar from './pages/Calendar';
import StudyPlanner from './pages/StudyPlanner';
import Study from './pages/Study'; // <-- AGGIUNTO: logger studio

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>(() => {
    try {
      return (localStorage.getItem('fenice.theme') as any) || 'auto';
    } catch {
      return 'auto';
    }
  });

  // Applica il tema
  useEffect(() => {
    const apply = (t: 'light' | 'dark' | 'auto') => {
      const isDark =
        t === 'auto'
          ? window.matchMedia('(prefers-color-scheme: dark)').matches
          : t === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
      document.body.classList.toggle('dark', isDark);
    };

    apply(theme);
    try {
      localStorage.setItem('fenice.theme', theme);
    } catch {}

    // Aggiorna automaticamente se l’utente cambia preferenza OS
    if (theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handle = () => apply('auto');
      mq.addEventListener('change', handle);
      return () => mq.removeEventListener('change', handle);
    }
  }, [theme]);

  return { theme, setTheme };
}

function TopNav(){
  return (
    <header className="wrap" style={{paddingTop:12}}>
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:12}}>
        <Link to="/" style={{fontWeight:800, fontSize:20, textDecoration:'none', color:'inherit'}}>Fenice — Beast Mode</Link>
        <nav style={{display:'flex', gap:12, flexWrap:'wrap'}}>
          <NavLink to="/" end className={({isActive})=> isActive? 'btn primary' : 'btn'}>Dashboard</NavLink>
          <NavLink to="/nutrition" className={({isActive})=> isActive? 'btn primary' : 'btn'}>Nutrizione</NavLink>
          <NavLink to="/training" className={({isActive})=> isActive? 'btn primary' : 'btn'}>Allenamento</NavLink>
          <NavLink to="/body" className={({isActive})=> isActive? 'btn primary' : 'btn'}>Misure</NavLink>
          <NavLink to="/calendar" className={({isActive})=> isActive? 'btn primary' : 'btn'}>Calendario</NavLink>
          <NavLink to="/study" className={({isActive})=> isActive? 'btn primary' : 'btn'}>Study (Logger)</NavLink>
          <NavLink to="/study-planner" className={({isActive})=> isActive? 'btn primary' : 'btn'}>Study Planner</NavLink>
        </nav>
      </div>
    </header>
  );
}

export default function App(){
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <TopNav />
      <main className="wrap" style={{display:'grid', gap:16}}>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <span className="muted">Tema</span>
          <select className="input" value={theme} onChange={e=>setTheme(e.target.value as any)}>
            <option value="auto">Auto</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <Routes>
          <Route path="/" element={<Dashboard/>} />
          <Route path="/nutrition" element={<Nutrition/>} />
          <Route path="/training" element={<Training/>} />
          <Route path="/body" element={<Body/>} />
          <Route path="/calendar" element={<Calendar/>} />
          <Route path="/study" element={<Study />} /> {/* logger studio */}
          <Route path="/study-planner" element={<StudyPlanner/>} /> {/* planner separato */}
          <Route path="*" element={<Dashboard/>} />
        </Routes>
      </main>
    </div>
  );
}
