# Fenice — Beast Mode (PWA)

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
- Settings → Pages → Source: **GitHub Actions** (workflow già incluso)
- `vite.config.ts` usa `base: '/fenice-beast-mode-pwa/'`

## Funzioni extra
- **Tema persistente** su `localStorage` (`fenice.theme`)
- **Seed iniziale misure** (prima apertura): peso 80.35, BF 12.5, vita 87, petto 103, braccia 34.5, cosce 57.5/56.5
- **Backup/Restore JSON** (Dashboard): esporta/ripristina `fenice.logs`, `fenice.training.sessions`, `fenice.activity`, `fenice.theme`
- **Calendario**: `public/calendar.html` + `fenice_calendar_unified.ics`
- **Nutrizione**: Export PDF; **Training**: Export CSV