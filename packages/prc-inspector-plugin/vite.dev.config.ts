import { defineConfig, normalizePath } from 'vite'
import react from '@vitejs/plugin-react-swc'

function internalAliasResolver(this: any, source: string, importer?: string, options?: any) {
  if (!importer) {
    return;
  }
  const _str = normalizePath(importer);
  const index = _str.lastIndexOf('src');
  const newPath = `${_str.slice(0, index)}src${source}`;
  return this.resolve(newPath, importer, { skipSelf: true, ...options });
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      tsDecorators: true
    })
  ],
  server: {
    port: 4444,
  },
  resolve: {
    alias: [
      {
        find: '@/',
        replacement: '/src/',
        // customResolver: internalAliasResolver,
      }
    ]
  }
})
