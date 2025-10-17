import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ⚠️ Sostituisci il nome della repo se diverso
export default defineConfig({
  base: '/fenice-beast-mode-pwa/',
  plugins: [react()],
  build: { outDir: 'dist' },
})
