import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const dir = path.dirname(fileURLToPath(import.meta.url))
export default defineConfig({
  root: dir,
  envDir: dir,
  plugins: [react()],
  server: {
    port: 5173,
    host: '127.0.0.1',
    open: true,
  },
})
