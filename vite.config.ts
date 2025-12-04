import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env variables
  const loadedEnv = loadEnv(mode, (process as any).cwd(), '');
  
  // Read configuration from environment
  // We prioritize process.env for Vercel/Node environments, fall back to loadedEnv for local .env
  const apiKey = process.env.GOOGLE_API_KEY || loadedEnv.GOOGLE_API_KEY || '';
  // Default to apis.kuai.host as requested if no env var is provided
  const baseUrl = process.env.GOOGLE_BASE_URL || loadedEnv.GOOGLE_BASE_URL || 'https://apis.kuai.host';
  const modelId = process.env.GOOGLE_MODEL_ID || loadedEnv.GOOGLE_MODEL_ID || 'gemini-2.5-flash-image';

  // Log configuration status (masked)
  if (apiKey) {
    console.log('\x1b[32m%s\x1b[0m', '✅ Configuration: GOOGLE_API_KEY found.');
  } else {
    console.log('\x1b[33m%s\x1b[0m', '⚠️  Configuration: GOOGLE_API_KEY missing.');
  }

  if (baseUrl) {
    console.log('\x1b[36m%s\x1b[0m', `ℹ️  Configuration: Base URL: ${baseUrl}`);
  }

  return {
    plugins: [react()],
    define: {
      // Inject configuration into the application
      'process.env.API_KEY': JSON.stringify(apiKey),
      'process.env.GOOGLE_BASE_URL': JSON.stringify(baseUrl),
      'process.env.GOOGLE_MODEL_ID': JSON.stringify(modelId),
      'global': 'window',
      '__BUILD_DATE__': JSON.stringify(new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })),
    },
  };
});