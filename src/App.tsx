import React, { useEffect, useState } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Nutrition from './pages/Nutrition';
import Training from './pages/Training';
import Body from './pages/Body';

function useTheme() {
  const [theme, setTheme] = useState<'light'|'dark'|'auto'>('light');
  useEffect(()=>{
    const isDark = theme==='auto' ? (matchMedia('(prefers-color-scheme: dark)').matches) : theme==='dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
  },[theme]);
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
        </Routes>
      </main>
    </div>
  );
}