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
        // Point to the Shayan branch preview deployment (not main) so the
        // api/ folder exists on the target. Update this URL from:
        // Vercel dashboard → Deployments → Shayan branch → copy the preview URL
        target: 'https://art-by-tvesa-ubnpnqekt-dsouzashayan-9117s-projects.vercel.app',
        changeOrigin: true,
      },
    },
  },
})
