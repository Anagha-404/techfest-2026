import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // During development, send /api requests to the Express backend.
    // The browser then sees a single origin, just like on Netlify.
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})
