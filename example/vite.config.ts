import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
      generateScopedName: '[local]-[hash:base64:5]'
    }
  },
  server: {
    host: '0.0.0.0'
    // proxy: {
    //   '^/dist/': {
    //   }
    // }
  },
})
