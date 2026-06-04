import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// ── RSS 来源配置（与 api/rss-proxy.js 保持一致） ──
const RSS_SOURCES = {
  motorsport: { url: 'https://www.motorsport.com/rss/f1/news/',  referer: 'https://www.motorsport.com/' },
  autosport:  { url: 'https://www.autosport.com/rss/f1/news/',   referer: 'https://www.autosport.com/' },
  therace:    { url: 'https://the-race.com/formula-1/feed/',     referer: 'https://the-race.com/' },
}

// ── 本地 API 代理插件（开发环境模拟 Vercel Serverless Functions）──────────
// 生产环境对应：api/img-proxy.js、api/rss-proxy.js
// 路径统一：/api/img-proxy 和 /api/rss-proxy，开发/生产完全一致，无需修改业务代码
const localApiPlugin = {
  name: 'local-api-proxy',
  configureServer(server) {
    const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

    // ── GET /api/img-proxy?url=<encoded> ─────────────────────────────────
    server.middlewares.use('/api/img-proxy', async (req, res) => {
      try {
        const urlParam = new URL('http://localhost' + req.url).searchParams.get('url')
        if (!urlParam) { res.writeHead(400); res.end('Missing url param'); return }

        const imgRes = await fetch(urlParam, {
          headers: {
            'User-Agent':      UA,
            'Accept':          'image/webp,image/avif,image/*,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer':         new URL(urlParam).origin + '/',
          },
          signal: AbortSignal.timeout(8000),
          redirect: 'follow',
        })

        if (!imgRes.ok) { res.writeHead(imgRes.status); res.end(); return }

        const buf = Buffer.from(await imgRes.arrayBuffer())
        const ct  = imgRes.headers.get('content-type') || 'image/jpeg'
        res.writeHead(200, {
          'Content-Type':                ct,
          'Content-Length':              buf.length,
          'Cache-Control':               'public, max-age=86400',
          'Access-Control-Allow-Origin': '*',
        })
        res.end(buf)
      } catch {
        res.writeHead(504); res.end()
      }
    })

    // ── GET /api/rss-proxy?source=motorsport|autosport|therace ──────────
    server.middlewares.use('/api/rss-proxy', async (req, res) => {
      try {
        const source = new URL('http://localhost' + req.url).searchParams.get('source')
        const cfg    = RSS_SOURCES[source]
        if (!cfg) { res.writeHead(400); res.end('Unknown source'); return }

        const rssRes = await fetch(cfg.url, {
          headers: {
            'User-Agent':      UA,
            'Accept':          'application/rss+xml, application/xml, text/xml, */*',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer':         cfg.referer,
            'Cache-Control':   'no-cache',
          },
          signal: AbortSignal.timeout(12000),
          redirect: 'follow',
        })

        if (!rssRes.ok) { res.writeHead(rssRes.status); res.end(`Upstream: ${rssRes.status}`); return }

        const text = await rssRes.text()
        res.writeHead(200, {
          'Content-Type':                'application/xml; charset=utf-8',
          'Cache-Control':               'public, max-age=300',
          'Access-Control-Allow-Origin': '*',
        })
        res.end(text)
      } catch {
        res.writeHead(504); res.end()
      }
    })
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    localApiPlugin,
  ],
  server: {
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https: http:",
        "frame-src https://player.bilibili.com https://www.bilibili.com",
        "connect-src 'self' https://api.jolpi.ca https://ergast.com https://flagcdn.com https://api.bilibili.com https://api.rss2json.com https://api.allorigins.win https://corsproxy.io https://*.supabase.co wss://*.supabase.co",
        "media-src 'self' blob: https://player.bilibili.com",
      ].join('; '),
    },
  },
})
