import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 1. Load env variables from .env files
  const loadedEnv = loadEnv(mode, (process as any).cwd(), '');
  
  // 2. Check for VITE_API_KEY in various sources
  const apiKey = process.env.VITE_API_KEY || loadedEnv.VITE_API_KEY || process.env.API_KEY || loadedEnv.API_KEY || '';

  // 3. Log visibility status during build
  if (apiKey) {
    console.log('\x1b[32m%s\x1b[0m', '✅ SUCCESS: API Key found in build environment.');
  } else {
    console.log('\x1b[33m%s\x1b[0m', '⚠️  NOTE: API Key not found in build environment. Will rely on runtime VITE_API_KEY.');
  }

  // 4. Fallback Strategy:
  // If apiKey exists, JSON.stringify it (hardcode it).
  // If NOT, set process.env.API_KEY to the literal code string "import.meta.env.VITE_API_KEY".
  // This allows the browser to evaluate import.meta.env.VITE_API_KEY at runtime.
  const processEnvDefine = apiKey ? JSON.stringify(apiKey) : 'import.meta.env.VITE_API_KEY';

  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': processEnvDefine,
      'global': 'window',
    },
  };
});