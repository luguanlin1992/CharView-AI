import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // Stringify the API_KEY so it's inserted as a string literal in the code
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      // Polyfill process.env to avoid "process is not defined" errors in some libs
      'process.env': JSON.stringify({
        NODE_ENV: mode,
      }),
    },
  };
});