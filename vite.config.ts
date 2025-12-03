import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env variables
  const loadedEnv = loadEnv(mode, (process as any).cwd(), '');
  
  // Read configuration from environment
  const apiKey = loadedEnv.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY || '';
  const baseUrl = loadedEnv.GOOGLE_BASE_URL || process.env.GOOGLE_BASE_URL || '';
  const modelId = loadedEnv.GOOGLE_MODEL_ID || process.env.GOOGLE_MODEL_ID || '';

  // Log configuration status (masked)
  if (apiKey) {
    console.log('\x1b[32m%s\x1b[0m', '✅ Configuration: GOOGLE_API_KEY loaded.');
  } else {
    console.log('\x1b[33m%s\x1b[0m', '⚠️  Configuration: GOOGLE_API_KEY missing in .env file.');
  }

  if (baseUrl) {
    console.log('\x1b[36m%s\x1b[0m', `ℹ️  Configuration: Custom Base URL set to ${baseUrl}`);
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