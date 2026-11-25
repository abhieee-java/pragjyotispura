const response = (message, status) => Response.json({message}, {
  status, headers: {'Cache-Control': 'no-store'}
})

let earthVideo
function serveEarthVideo(request, encoded) {
  earthVideo ??= Uint8Array.from(atob(encoded), char => char.charCodeAt(0))
  const length = earthVideo.length
  const headers = {
    'Content-Type': 'video/mp4',
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=3600',
  }
  const match = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get('Range') ?? '')
  if (!match || (!match[1] && !match[2])) {
    return new Response(earthVideo, {headers: {...headers, 'Content-Length': String(length)}})
  }
  const start = match[1] ? Number(match[1]) : Math.max(0, length - Number(match[2]))
  const end = match[1] && match[2] ? Math.min(Number(match[2]), length - 1) : length - 1
  if (start > end) return new Response(null, {status: 416, headers: {...headers, 'Content-Range': `bytes */${length}`}})
  return new Response(earthVideo.slice(start, end + 1), {status: 206, headers: {
    ...headers,
    'Content-Range': `bytes ${start}-${end}/${length}`,
    'Content-Length': String(end - start + 1),
  }})
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (request.method === 'GET' && url.pathname === '/') {
      return new Response(assets['index.html'], {headers: {'Content-Type':'text/html; charset=utf-8'}})
    }
    const asset = url.pathname.slice(1)
    if (request.method === 'GET' && asset === 'earth-rotation.mp4') return serveEarthVideo(request, assets[asset])
    if (request.method === 'GET' && asset === 'planet.webp') {
      return new Response(Uint8Array.from(atob(assets[asset]), char => char.charCodeAt(0)), {
        headers: {'Content-Type': 'image/webp', 'Cache-Control': 'public, max-age=3600'},
      })
    }
    if (request.method === 'GET' && Object.hasOwn(assets, asset) && /\.(js|css)$/.test(asset)) {
      const type = asset.endsWith('.css') ? 'text/css' : 'text/javascript'
      return new Response(assets[asset], {headers: {'Content-Type': type + '; charset=utf-8'}})
    }
    if (request.method !== 'POST' || url.pathname !== '/api/join') {
      return response('Page not found.', 404)
    }
    if (request.headers.get('Origin') !== url.origin) return response('Please use the waitlist page.', 403)
    let data
    try {
      const body = await request.text()
      if (body.length > 1024) return response('Email address is too long.', 413)
      data = JSON.parse(body)
    } catch {
      return response('Enter a valid email address.', 400)
    }
    const email = typeof data?.email === 'string' ? data.email.trim().toLowerCase() : ''
    if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return response('Enter a valid email address.', 400)
    }
    try {
      await env.DB.prepare('INSERT INTO waitlist (email) VALUES (?) ON CONFLICT(email) DO NOTHING').bind(email).run()
      return response('You’re on the waitlist.', 200)
    } catch {
      return response('Could not save your signup. Please try again.', 503)
    }
  }
}
