import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    open: false,
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})