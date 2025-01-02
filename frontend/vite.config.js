import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: '/sync-cinema/',
  server: {
    proxy: {
      '/ws': {
        target: 'ws://localhost:3001',
        ws: true
      }
    }
  },
  define: {
    // 确保环境变量在客户端可用
    'process.env.NODE_ENV': JSON.stringify(mode)
  }
}))
