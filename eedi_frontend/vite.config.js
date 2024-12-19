import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },
  define: {
    'import.meta.env.MODAL_URL': JSON.stringify('https://rashmibanthia--eedi-misconception-analyzer.modal.run')
  }
})
