import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'
import 'regenerator-runtime'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    legacy({
      targets: ['ie >= 11'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    })
  ],
})
