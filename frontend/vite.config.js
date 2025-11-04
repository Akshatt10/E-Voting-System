// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import path from 'path' // <--- IMPORT THE 'PATH' MODULE HERE

// export default defineConfig({
//   plugins: [react()],
//   resolve: { // <--- ADD THIS RESOLVE OBJECT
//     alias: {
//       '@': path.resolve(__dirname, './src'),
//     },
//   },
//   server: {
//     proxy: {
//       '/api': {
//         target: 'https://a118d7ee0dab.ngrok-free.app ',
//         changeOrigin: true,
//       },
//     },
// }
// })




import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://a118d7ee0dab.ngrok-free.app',
        changeOrigin: true,
        secure: false,        // ✅ Important if using ngrok (self-signed HTTPS)
        },
      },
    },
  },
)
