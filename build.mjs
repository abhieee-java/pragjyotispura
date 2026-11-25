import {mkdir, writeFile, readFile} from 'node:fs/promises'

await mkdir('dist/server', {recursive: true})
const assets = Object.fromEntries(await Promise.all(
  ['public/index.html', '.client-build/waitlist.js', '.client-build/waitlist.css'].map(async (path) => [path.split('/').at(-1), await readFile(path, 'utf8')])
))
assets['planet.webp'] = (await readFile('public/planet.webp')).toString('base64')
const worker = await readFile('worker.js', 'utf8')
await writeFile('dist/server/index.js', 'const assets = ' + JSON.stringify(assets) + '\n' + worker)
