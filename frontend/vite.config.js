import react from '@vitejs/plugin-react';
import { cwd } from 'node:process';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, cwd(), '');
  const backendUrl = env.VITE_BACKEND_URL || 'http://localhost:4000';
  const devHost = env.VITE_DEV_HOST || '0.0.0.0';
  const devPort = Number.parseInt(env.VITE_DEV_PORT || '5173', 10);

  return {
    plugins: [react()],
    server: {
      host: devHost,
      port: devPort,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
        },
        '/uploads': {
          target: backendUrl,
          changeOrigin: true,
        },
      },
    },
  };
})
