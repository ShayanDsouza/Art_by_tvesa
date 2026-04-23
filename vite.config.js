import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'https://art-by-tvesa-ubnpnqekt-dsouzashayan-9117s-projects.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
