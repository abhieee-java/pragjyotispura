import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  publicDir: false,
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  plugins: [tailwindcss()],
  resolve: {alias: {'@': fileURLToPath(new URL('.',import.meta.url))}},
  build: {
    outDir: '.client-build',
    lib: {entry: 'waitlist.tsx', formats: ['es'], fileName: () => 'waitlist.js', cssFileName: 'waitlist'}
  }
})
