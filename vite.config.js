import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-router') || id.includes('react-dom') || id.includes('/react/')) {
              return 'vendor-react';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            if (id.includes('react-bootstrap') || id.includes('bootstrap')) {
              return 'vendor-ui';
            }
            if (id.includes('@iconify') || id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('i18next')) {
              return 'vendor-i18n';
            }
          }
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
  preview: {
    allowedHosts: true // Cho phép host trên Railway truy cập
  },
  server: {
    allowedHosts: true
  }
})