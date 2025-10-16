# Fenice — Beast Mode (PWA) — FULL

## Setup
```bash
npm ci
npm run dev
```

## Build/Preview
```bash
npm run build
npm run preview
```

## Deploy GitHub Pages
- Repo: `fenice-beast-mode-pwa`
- Settings → Pages → Source: **GitHub Actions**
- `vite.config.ts` base già impostato su `/fenice-beast-mode-pwa/`

## Extra inclusi
- Tema persistente (`fenice.theme`)
- Seed misure iniziali (80.35 kg, 12.5% BF, ecc.)
- Backup/Restore JSON (Dashboard)
- Nutrizione: target per schema pasti + export PDF
- Training: logger + export CSV
- Body: misure e storico
- Calendario: link .ics + HTML
- **Study Planner HTML leggibile** con stampa/PDF

## PWA
- `public/manifest.webmanifest`
- `public/sw.js`
- Aggiungi alla schermata Home da mobile.