import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// Allow importing mock API from ../knowledge-base without copying it.
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [
        // project root
        path.resolve(__dirname),
        // workspace root + knowledge-base sibling
        path.resolve(__dirname, '..'),
      ],
    },
  },
})
