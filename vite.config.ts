import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 1. Load env variables from .env files (if any)
  const loadedEnv = loadEnv(mode, (process as any).cwd(), '');
  
  // 2. Check for VITE_API_KEY (what the user configured)
  const apiKey = process.env.VITE_API_KEY || loadedEnv.VITE_API_KEY || process.env.API_KEY || loadedEnv.API_KEY || '';

  // 3. Log visibility status during build (visible in Vercel Build Logs)
  if (apiKey) {
    console.log('\x1b[32m%s\x1b[0m', '✅ SUCCESS: API Key found in build environment (VITE_API_KEY or API_KEY).');
  } else {
    console.log('\x1b[31m%s\x1b[0m', '⚠️  WARNING: VITE_API_KEY NOT found in build environment.');
    console.log('Ensure "VITE_API_KEY" is set in Vercel Settings > Environment Variables.');
  }

  return {
    plugins: [react()],
    define: {
      // Compatibility shim for legacy code, though application now primarily uses import.meta.env
      'process.env.API_KEY': JSON.stringify(apiKey),
      'global': 'window',
    },
  };
});