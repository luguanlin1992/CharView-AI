import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env variables from .env files (default Vite behavior)
  const loadedEnv = loadEnv(mode, (process as any).cwd(), '');
  
  // Prioritize GOOGLE_API_KEY from the loaded .env
  // This is much clearer for non-frontend developers than "VITE_API_KEY"
  const apiKey = loadedEnv.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY || '';

  if (apiKey) {
    console.log('\x1b[32m%s\x1b[0m', '✅ Local Dev: GOOGLE_API_KEY loaded successfully.');
  } else {
    console.log('\x1b[33m%s\x1b[0m', '⚠️  Local Dev: GOOGLE_API_KEY NOT found in .env file.');
  }

  return {
    plugins: [react()],
    define: {
      // Inject the key into process.env.API_KEY for the app to use
      'process.env.API_KEY': JSON.stringify(apiKey),
      'global': 'window',
      '__BUILD_DATE__': JSON.stringify(new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })),
    },
  };
});