import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, (process as any).cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      // Safely replace process.env.API_KEY. Default to empty string to prevent undefined errors.
      'process.env.API_KEY': JSON.stringify(env.API_KEY || ''),
      // Define global specifically for some older libraries if needed
      'global': 'window',
    },
  };
});