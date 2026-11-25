import worker from '../worker.js'

const DB = {
  prepare(sql) {
    return {
      bind(...params) {
        return {
          async run() {
            const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_D1_DATABASE_ID, CLOUDFLARE_D1_API_TOKEN } = process.env
            if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_D1_DATABASE_ID || !CLOUDFLARE_D1_API_TOKEN) {
              throw new Error('Missing D1 configuration')
            }
            const account = encodeURIComponent(CLOUDFLARE_ACCOUNT_ID)
            const database = encodeURIComponent(CLOUDFLARE_D1_DATABASE_ID)
            const response = await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/d1/database/${database}/query`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${CLOUDFLARE_D1_API_TOKEN}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ sql, params }),
              signal: AbortSignal.timeout(8000),
            })
            const body = await response.json()
            if (!response.ok || !body.success || !body.result?.[0]?.success) {
              throw new Error('D1 query failed')
            }
          },
        }
      },
    }
  },
}

export function POST(request) {
  return worker.fetch(request, { DB })
}
