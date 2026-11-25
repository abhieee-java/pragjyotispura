const response = (message, status) => Response.json({message}, {
  status, headers: {'Cache-Control': 'no-store'}
})

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (request.method === 'GET' && url.pathname === '/') {
      return new Response(assets['index.html'], {headers: {'Content-Type':'text/html; charset=utf-8'}})
    }
    const asset = url.pathname.slice(1)
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
