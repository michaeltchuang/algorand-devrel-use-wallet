import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [sveltekit(), nodePolyfills()],
  ssr: {
    noExternal: ['@algorandecosystem/liquid-auth-use-wallet-client'],
    external: ['cbor', 'cbor-x']
  }
})
