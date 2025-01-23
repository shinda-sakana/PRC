import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dts from 'vite-plugin-dts'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    dts({
      outDir: 'dist/type',
      entryRoot: 'src',
      tsconfigPath: 'tsconfig.app.json'
    }),
    react()
  ],
  build: {
    minify: true,
    rollupOptions: {
      external: [
        'react',
        'react-dom'
      ]
    }
  }
})
