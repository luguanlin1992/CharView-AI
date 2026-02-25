
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(() => {
  return {
    plugins: [react()],
    server: {
      port: 5175,
      host: true,
    },
    define: {
      'global': 'window',
      '__BUILD_DATE__': JSON.stringify(new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })),
    },
  };
});
