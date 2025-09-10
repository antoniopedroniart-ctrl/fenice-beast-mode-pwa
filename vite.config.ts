import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Set REPO_BASE in CI for GitHub Pages, or edit here manually.
// For user/org pages use '/'; for repo pages use '/REPO_NAME/'.
const base = (process.env.REPO_BASE && process.env.REPO_BASE.trim()) || '/REPO_NAME/';

export default defineConfig({
  plugins: [react()],
  base,
});