import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

// The dev server proxies /api and /media to the Go backend so the browser sees a
// single origin: the httpOnly refresh cookie then behaves exactly as it will in
// production, and CORS never enters the picture. Без /media загруженные
// аватарки попадали бы в SPA-фолбэк и приезжали как index.html.
// На GitHub Pages сайт обычно живёт в подкаталоге /<имя-репозитория>/, и все
// ссылки на файлы должны его учитывать. Workflow подставляет VITE_BASE сам;
// для своего домена достаточно оставить '/'.
export default defineConfig({
  base: process.env.VITE_BASE ?? '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET ?? 'http://localhost:8080',
        changeOrigin: true,
      },
      '/media': {
        target: process.env.VITE_PROXY_TARGET ?? 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
