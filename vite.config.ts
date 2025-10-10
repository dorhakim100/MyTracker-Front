import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

// https://vite.dev/config/
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ mode }) => {
  const isCapacitor = mode === 'capacitor'

  return {
    plugins: [react()],
    base: isCapacitor ? './' : '/',
    build: {
      outDir: isCapacitor
        ? 'dist'
        : path.resolve(__dirname, '../Back Starter/public'),
      emptyOutDir: true,
    },
  }
})
