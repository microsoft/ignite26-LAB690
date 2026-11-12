import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { rayfinLocalDev } from '@microsoft/rayfin-local-dev/experimental/vite';
import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';

const projectRoot = process.env.PROJECT_ROOT || import.meta.dirname;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, 'VITE_');
  const port = Number(env.VITE_PORT || 5173);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('VITE_PORT must be an integer between 1 and 65535.');
  }
  return {
    plugins: [react(), tailwindcss(), rayfinLocalDev({ autoLogin: true })],
    server: { host: 'localhost', port, strictPort: true },
    resolve: {
      alias: {
        '@': resolve(projectRoot, 'src'),
      },
      dedupe: ['react', 'react-dom'],
    },
    build: {
      target: 'es2022',
    },
  };
});
