import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/leetcode': {
        target: 'https://corsproxy.io/?https://leetcode.com/graphql',
        changeOrigin: true,
        rewrite: () => '',
      },
    },
  },
})