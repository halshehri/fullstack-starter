import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_APP_ENV),
      __API_BASE_URL__: JSON.stringify(env.VITE_API_BASE_URL),
    },
    server: {
      proxy: {
        '/api': 'http://localhost:3000',
      },
    },
  };
});
