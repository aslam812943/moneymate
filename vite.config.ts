import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({ plugins: [react(), tailwindcss()], server: { port: 8000, proxy: { '/api': 'http://127.0.0.1:4000' } }, build:{rollupOptions:{output:{manualChunks(id){if(id.includes('node_modules')){if(/recharts|d3-|victory-vendor|react-smooth|decimal.js/.test(id))return 'charts';if(/zod|react-hook-form|hookform/.test(id))return 'forms';return 'vendor';}}}}} });
