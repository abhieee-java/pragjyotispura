import {mkdir, writeFile, readFile} from 'node:fs/promises'

await mkdir('dist/server', {recursive: true})
const assets = Object.fromEntries(await Promise.all(
  ['public/index.html', 'public/clouds.js'].map(async (path) => [path.split('/').at(-1), await readFile(path, 'utf8')])
))
const worker = await readFile('worker.js', 'utf8')
await writeFile('dist/server/index.js', 'const assets = ' + JSON.stringify(assets) + '\n' + worker)
