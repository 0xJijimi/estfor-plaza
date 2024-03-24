import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'url'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: `assets/[name]-[hash]-${Date.now()}.[ext]`,
        chunkFileNames: `chunks/[name]-[hash]-${Date.now()}.js`,
        entryFileNames: `entry-[name]-[hash]-${Date.now()}.js`,
      }
    }
  }
})
