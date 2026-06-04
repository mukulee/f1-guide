// ── F1 GUIDE · Vercel Serverless Function: rss-proxy ──
// 路由：GET /api/rss-proxy?source=motorsport|autosport|therace
// 功能：服务端取 RSS XML，绕过 WAF/CORS，返回原始 XML
// 生产环境替代 vite.config.js 中的 makeRssProxy

export const config = {
  runtime: 'edge',
}

const RSS_SOURCES = {
  motorsport: {
    url: 'https://www.motorsport.com/rss/f1/news/',
    referer: 'https://www.motorsport.com/',
  },
  autosport: {
    url: 'https://www.autosport.com/rss/f1/news/',
    referer: 'https://www.autosport.com/',
  },
  therace: {
    url: 'https://the-race.com/formula-1/feed/',
    referer: 'https://the-race.com/',
  },
}

export default async function handler(request) {
  const { searchParams } = new URL(request.url)
  const source = searchParams.get('source')

  if (!source || !RSS_SOURCES[source]) {
    return new Response('Unknown source. Use: motorsport | autosport | therace', { status: 400 })
  }

  const { url, referer } = RSS_SOURCES[source]

  try {
    const rssRes = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept':          'application/rss+xml, application/xml, text/xml, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer':         referer,
        'Cache-Control':   'no-cache',
      },
      signal: AbortSignal.timeout(12000),
      redirect: 'follow',
    })

    if (!rssRes.ok) {
      return new Response(`Upstream error: ${rssRes.status}`, { status: rssRes.status })
    }

    const text = await rssRes.text()
    return new Response(text, {
      status: 200,
      headers: {
        'Content-Type':                'application/xml; charset=utf-8',
        'Cache-Control':               'public, max-age=300, s-maxage=600',  // RSS 缓存 5~10 分钟
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    console.error(`[rss-proxy] ${source} error:`, err.message)
    return new Response('Gateway Timeout', { status: 504 })
  }
}
