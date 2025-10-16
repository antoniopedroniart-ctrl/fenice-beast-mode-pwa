# Aggiornamento Study Planner — Fenice PWA

## File inclusi in questo pacchetto
- `src/pages/StudyPlanner.tsx` — nuova pagina con viewer settimanale + link al PDF completo
- `public/study-planner.pdf` — PDF unico (20 Ott 2025 → 28 Gen 2026)

## Come applicare (patch veloce)
1. Copia `src/pages/StudyPlanner.tsx` dentro la tua repo.
2. Aggiungi al menu in `src/App.tsx`:
   - Import: `import StudyPlanner from './pages/StudyPlanner';`
   - Link header: `<NavLink to="/study" ...>Study Planner</NavLink>`
   - Route: `<Route path="/study" element={<StudyPlanner/>} />`
3. Copia `public/study-planner.pdf` nella cartella `public/` della repo.
4. `npm run build` → deploy (GitHub Pages).

*(Opzionale)*: in `src/pages/Calendar.tsx`, aggiungi un link al PDF:
```tsx
<a className="btn" href={`${base}study-planner.pdf`} target="_blank" rel="noreferrer">Study Planner (PDF)</a>
```

— Fenice — Beast Mode