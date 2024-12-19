import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL_DEV,
        changeOrigin: true
      }
    }
  },
  define: {
    'import.meta.env.MODAL_URL': JSON.stringify('https://rashmibanthia--eedi-misconception-analyzer.modal.run')
  }
})

