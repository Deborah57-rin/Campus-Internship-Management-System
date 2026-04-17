import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Read PORT from server/.env so the dev proxy matches where nodemon listens */
function getApiProxyTarget() {
  const envFile = path.join(__dirname, '../server/.env');
  try {
    const text = fs.readFileSync(envFile, 'utf8');
    const m = text.match(/^\s*PORT\s*=\s*(\d+)\s*$/m);
    if (m) return `http://127.0.0.1:${m[1]}`;
  } catch {
    /* ignore */
  }
  return 'http://127.0.0.1:5001';
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: getApiProxyTarget(),
        changeOrigin: true,
      },
      // Plain /health lives only on Express (not under /api) — proxy it too for convenience
      '/health': {
        target: getApiProxyTarget(),
        changeOrigin: true,
      },
    },
  },
});
