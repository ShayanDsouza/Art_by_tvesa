import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      // Forward /api/* to the deployed Vercel functions so npm run dev
      // can test API routes without needing vercel dev
      '/api': {
        target: 'https://art-by-tvesa.vercel.app',
        changeOrigin: true,
      },
    },
  },
})
