import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Binds to all network interfaces
    host: "0.0.0.0",
    // Allows any host to access the server
    allowedHosts: true
  }
})
