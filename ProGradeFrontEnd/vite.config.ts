import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 1112, // Set your custom port here
    strictPort: true, // Optional: fails if port 3000 is already in use instead of choosing a random port
  }
})