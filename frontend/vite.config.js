import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // <--- IMPORT THE 'PATH' MODULE HERE

export default defineConfig({
  plugins: [react()],
  resolve: { // <--- ADD THIS RESOLVE OBJECT
    alias: {
      '@': path.resolve(__dirname, './src'), // <--- THIS MAPS '@' TO YOUR 'SRC' DIRECTORY
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
    allowedHosts: ['63c0-2405-201-4021-840-d5b6-f531-ad81-26c3.ngrok-free.app'],
  },
})