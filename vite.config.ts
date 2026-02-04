import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const dir = path.dirname(fileURLToPath(import.meta.url))
export default defineConfig({
  root: dir,
  envDir: dir,
  define: {
    __BUILD_ID__: JSON.stringify(new Date().toISOString().slice(0, 19).replace('T', ' ')),
  },
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: true,
    strictPort: false,
  },
})
