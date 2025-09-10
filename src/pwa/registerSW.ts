export async function registerSW() {
  if ('serviceWorker' in navigator) {
    try {
      const base = import.meta.env.BASE_URL || '/';
      await navigator.serviceWorker.register(`${base}src/pwa/sw.js`, { scope: base });
    } catch (e) {
      console.warn('SW registration failed', e);
    }
  }
}