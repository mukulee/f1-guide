// ── F1 GUIDE · Vercel Edge Function: circuit-image ──
// 路由：GET /api/circuit-image?title=<Wikipedia_article_title>
// 功能：服务端从 Wikipedia REST API 取赛道图片 URL，绕过中国屏蔽
// 调用方再把 URL 传给 /api/img-proxy 加载实际图片

export const config = {
  runtime: 'edge',
}

// Wikipedia REST API 请求头（遵守 Wikimedia 使用条款）
const WIKI_HEADERS = {
  'User-Agent': 'F1Guide/1.0 (https://f1-guide.vercel.app; contact@example.com)',
  'Accept': 'application/json',
  'Accept-Language': 'en-US,en;q=0.9',
}

export default async function handler(request) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title')

  if (!title) {
    return new Response('Missing title param', { status: 400 })
  }

  // 只接受合理的 Wikipedia 文章标题（字母/数字/空格/连字符/括号等）
  if (!/^[\w\s\-()'.,%&éÉàáíóú]+$/u.test(title)) {
    return new Response('Invalid title', { status: 400 })
  }

  try {
    // Wikipedia REST API：返回页面摘要 + 缩略图 URL
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`
    const wikiRes = await fetch(apiUrl, {
      headers: WIKI_HEADERS,
      signal: AbortSignal.timeout(8000),
    })

    if (!wikiRes.ok) {
      return new Response(JSON.stringify({ src: null, error: `Wikipedia ${wikiRes.status}` }), {
        status: 200,
        headers: corsHeaders('60'),   // 短暂缓存错误响应
      })
    }

    const data = await wikiRes.json()

    // 优先 originalimage（完整图），fallback 到 thumbnail（压缩缩略图）
    const src = data.originalimage?.source || data.thumbnail?.source || null

    return new Response(JSON.stringify({ src, title: data.title }), {
      status: 200,
      headers: corsHeaders('86400'),  // 缓存 24 小时
    })
  } catch (err) {
    console.error('[circuit-image] error:', err.message)
    return new Response(JSON.stringify({ src: null, error: 'timeout' }), {
      status: 200,
      headers: corsHeaders('60'),
    })
  }
}

function corsHeaders(maxAge = '86400') {
  return {
    'Content-Type':                'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control':               `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=3600`,
  }
}
