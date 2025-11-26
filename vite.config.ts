import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 1. Load env variables from .env files (if any)
  const loadedEnv = loadEnv(mode, (process as any).cwd(), '');
  
  // 2. Prioritize the actual process.env (Vercel injection) over loadedEnv
  // This ensures we capture system variables injected by the CI/CD platform
  const apiKey = process.env.API_KEY || loadedEnv.API_KEY || '';

  // 3. Log visibility status during build (visible in Vercel Build Logs)
  if (apiKey) {
    console.log('\x1b[32m%s\x1b[0m', '✅ SUCCESS: API_KEY found in build environment. Injecting into client bundle.');
  } else {
    console.log('\x1b[31m%s\x1b[0m', '⚠️  WARNING: API_KEY NOT found in build environment. The app will likely fail at runtime.');
    console.log('Ensure "API_KEY" is set in Vercel Settings > Environment Variables and enabled for the current environment (Production/Preview).');
  }

  return {
    plugins: [react()],
    define: {
      // Safely replace process.env.API_KEY with the string value
      'process.env.API_KEY': JSON.stringify(apiKey),
      // Polyfill global for compatibility
      'global': 'window',
    },
  };
});