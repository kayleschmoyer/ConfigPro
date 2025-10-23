import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const HOST = process.env.HOST || (process.env.PUBLIC ? '0.0.0.0' : 'localhost');
const PORT = Number(process.env.PORT || 5173);
const HMR_HOST = process.env.HMR_HOST;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: HOST,
    port: PORT,
    strictPort: true,
    hmr: HMR_HOST ? { host: HMR_HOST, port: PORT } : true,
  },
  preview: {
    host: HOST,
    port: PORT,
  },
});
