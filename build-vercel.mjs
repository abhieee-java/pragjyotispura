import { copyFile, mkdir } from 'node:fs/promises'

await mkdir('dist-vercel', { recursive: true })
await Promise.all([
  copyFile('public/planet.webp', 'dist-vercel/planet.webp'),
  copyFile('public/index.html', 'dist-vercel/index.html'),
  copyFile('.client-build/waitlist.js', 'dist-vercel/waitlist.js'),
  copyFile('.client-build/waitlist.css', 'dist-vercel/waitlist.css'),
])
