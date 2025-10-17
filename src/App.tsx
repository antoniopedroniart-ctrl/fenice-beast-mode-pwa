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
    try { return (localStorage.getItem('fenice.theme') as any) || 'auto'; } catch { return 'auto'; }
  });

  useEffect(() => {
    const apply = (t: 'light'|'dark'|'auto') => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = t === 'auto' ? prefersDark : t === 'dark';
      document.documentElement.classList.toggle('dark', isDark);
      document.body.classList.toggle('dark', isDark);
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    };

    apply(theme);
    try { localStorage.setItem('fenice.theme', theme); } catch {}

    if (theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handle = () => apply('auto');
      mq.addEventListener('change', handle);
      return () => mq.removeEventListener('change', handle);
    }
  }, [theme]);

  return { theme, setTheme };
}


function TopNav({ theme, setTheme }:{ theme:'light'|'dark'|'auto'; setTheme:(t:'light'|'dark'|'auto')=>void }){
  const Item = ({to, children}:{to:string; children:React.ReactNode}) => (
    <NavLink to={to} end
      className={({isActive})=> isActive ? 'navlink active' : 'navlink'}>
      {children}
    </NavLink>
  );

  return (
    <header className="topnav">
      <div className="wrap navwrap">
        {/* Brand */}
        <Link to="/" className="brand">
          <span className="brand-mark">🜂</span>
          <span className="brand-name">Fenice</span>
          <span className="brand-sub">Beast Mode</span>
        </Link>

        {/* Nav */}
        <nav className="navlist">
          <Item to="/">Dashboard</Item>
          <Item to="/nutrition">Nutrizione</Item>
          <Item to="/training">Allenamento</Item>
          <Item to="/body">Misure</Item>
          <Item to="/calendar">Calendario</Item>
          <Item to="/study">Study</Item>
          <Item to="/study-planner">Planner</Item>
        </nav>

        {/* Theme switch (Auto / Light / Dark) */}
        <div className="theme-switch">
          <button
            className={`seg-btn ${theme==='auto'?'seg-active':''}`}
            title="Tema: auto"
            onClick={()=>setTheme('auto')}
            aria-pressed={theme==='auto'}
          >
            {/* Auto = sistema */}
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path fill="currentColor" d="M12 3a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1Zm7.07 3.93a1 1 0 0 1 0 1.41l-1.41 1.42a1 1 0 0 1-1.42-1.42l1.42-1.41a1 1 0 0 1 1.41 0ZM21 13a1 1 0 1 1 0-2h-2a1 1 0 1 1 0 2h2ZM7.76 7.76a1 1 0 0 1 0 1.41L6.34 10.3a1 1 0 0 1-1.41-1.42l1.41-1.41a1 1 0 0 1 1.42 0ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10ZM4 13a1 1 0 1 1 0-2H2a1 1 0 1 1 0 2h2Zm1.66 4.7 1.41-1.41a1 1 0 0 1 1.42 1.41L7.5 19.1a1 1 0 0 1-1.41-1.41ZM12 17a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Zm7.66.7a1 1 0 0 1-1.41 1.41l-1.42-1.41a1 1 0 1 1 1.42-1.42l1.41 1.42Z"/>
            </svg>
          </button>
          <button
            className={`seg-btn ${theme==='light'?'seg-active':''}`}
            title="Tema: chiaro"
            onClick={()=>setTheme('light')}
            aria-pressed={theme==='light'}
          >
            {/* Sole */}
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path fill="currentColor" d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.8 1.8-1.8zM1 13h3v-2H1v2zm10 10h2v-3h-2v3zm7.03-2.34l1.79-1.8-1.79-1.79-1.79 1.8 1.79 1.79zM20 11v2h3v-2h-3zm-8-7h2V1h-2v3zm-7.03 14.66l1.79 1.79 1.8-1.79-1.8-1.8-1.79 1.8zM12 6a6 6 0 100 12A6 6 0 0012 6z"/>
            </svg>
          </button>
          <button
            className={`seg-btn ${theme==='dark'?'seg-active':''}`}
            title="Tema: scuro"
            onClick={()=>setTheme('dark')}
            aria-pressed={theme==='dark'}
          >
            {/* Luna */}
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path fill="currentColor" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
          </button>
        </div>
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
