// ── F1 GUIDE · Vercel Serverless Function: img-proxy ──
// 路由：GET /api/img-proxy?url=<encoded-url>
// 功能：服务端取外部图片，解决 CORS + hotlink 问题
// 生产环境替代 vite.config.js 中的 imgProxyPlugin

export const config = {
  runtime: 'edge',        // Edge Runtime：更低延迟，全球 CDN
}

// 允许代理的来源白名单（防止被滥用为任意代理）
const ALLOWED_ORIGINS = [
  'motorsport.com',
  'cdn.motorsport.com',
  'autosport.com',
  'the-race.com',
  'hdslb.com',           // B站 CDN
  'flagcdn.com',
  'upload.wikimedia.org',
  'www.formula1.com',
  'media.formula1.com',
  'f1i.com',
  'racingnews365.com',
  'grandprix247.com',
]

function isAllowed(urlStr) {
  try {
    const u = new URL(urlStr)
    return ALLOWED_ORIGINS.some(origin => u.hostname.endsWith(origin))
  } catch {
    return false
  }
}

export default async function handler(request) {
  const { searchParams } = new URL(request.url)
  const urlParam = searchParams.get('url')

  if (!urlParam) {
    return new Response('Missing url param', { status: 400 })
  }

  // 白名单检查
  if (!isAllowed(urlParam)) {
    return new Response('URL not allowed', { status: 403 })
  }

  try {
    const imgRes = await fetch(urlParam, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/avif,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': new URL(urlParam).origin + '/',
      },
      signal: AbortSignal.timeout(8000),
      redirect: 'follow',
    })

    if (!imgRes.ok) {
      return new Response(null, { status: imgRes.status })
    }

    const contentType = imgRes.headers.get('content-type') || 'image/jpeg'
    const buf = await imgRes.arrayBuffer()

    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type':                contentType,
        'Cache-Control':               'public, max-age=86400, s-maxage=86400',
        'Access-Control-Allow-Origin': '*',
        'X-Robots-Tag':                'noindex',
      },
    })
  } catch (err) {
    console.error('[img-proxy] error:', err.message)
    return new Response('Gateway Timeout', { status: 504 })
  }
}
