// ── F1 GUIDE · Vercel Edge Function: circuit-image ──────────────────
// 路由：GET /api/circuit-image?circuit=<location_name>
//
// 数据源：Wikimedia Commons Special:FilePath
//   - 直接指定赛道布局 SVG 文件名，不依赖文章主图（避免拿到照片/Logo）
//   - Special:FilePath 会自动重定向到 upload.wikimedia.org 的 PNG 渲染
//   - 服务端运行在 Vercel（境外），绕过中国对 Wikimedia 的屏蔽
//
// 响应：直接返回图片二进制，浏览器当作普通 <img> 加载

export const config = { runtime: 'edge' }

// ── 赛道 SVG 文件名映射 ──────────────────────────────────────────────
// 来源：Wikimedia Commons 赛道布局图分类（F1 circuit diagrams category）
// key：races.json 中 location 字段的小写，value：Commons 上 SVG 文件名
const CIRCUIT_FILES = {
  'melbourne':    'Albert_Park_Circuit.svg',
  'shanghai':     'Shanghai_International_Circuit.svg',
  'suzuka':       'Suzuka_circuit_2009.svg',
  'miami':        'Miami_International_Autodrome.svg',
  'montreal':     'Circuit_Gilles_Villeneuve.svg',
  'monte carlo':  'Circuit_de_Monaco.svg',
  'barcelona':    'Circuit_de_Barcelona-Catalunya.svg',
  'spielberg':    'Red_Bull_Ring.svg',
  'silverstone':  'Silverstone_Circuit_2010.svg',
  'spa':          'Circuit_de_Spa-Francorchamps.svg',
  'budapest':     'Hungaroring.svg',
  'zandvoort':    'Circuit_Zandvoort.svg',
  'monza':        'Autodromo_Nazionale_Monza.svg',
  'baku':         'Baku_City_Circuit.svg',
  'marina bay':   'Marina_Bay_Street_Circuit.svg',
  'austin':       'Circuit_of_the_Americas.svg',
  'mexico city':  'Autodromo_Hermanos_Rodriguez.svg',
  'são paulo':    'Interlagos_track_map.svg',
  'las vegas':    'Las_Vegas_Street_Circuit.svg',
  'lusail':       'Losail_Circuit.svg',
  'yas island':   'Yas_Marina_circuit.svg',
  'sakhir':       'Bahrain_International_Circuit.svg',
  'jeddah':       'Jeddah_Street_Circuit.svg',
  'imola':        'Autodromo_Dino_Ferrari.svg',
  'madrid':       'Madring.svg',
}

// location → 文件名（精确优先，再模糊匹配）
function resolveFile(circuit) {
  if (!circuit) return null
  const key = circuit.toLowerCase().trim()
  if (CIRCUIT_FILES[key]) return CIRCUIT_FILES[key]
  for (const [k, file] of Object.entries(CIRCUIT_FILES)) {
    if (key.includes(k) || k.includes(key)) return file
  }
  return null
}

export default async function handler(request) {
  const { searchParams } = new URL(request.url)
  const circuit = searchParams.get('circuit') || ''

  const filename = resolveFile(circuit)
  if (!filename) {
    return new Response('Circuit not found', { status: 404 })
  }

  // Wikimedia Commons Special:FilePath 接口
  // ?width=800 → 自动重定向到 upload.wikimedia.org 的 800px PNG 渲染
  const wikimediaUrl =
    `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=800`

  try {
    const res = await fetch(wikimediaUrl, {
      headers: {
        // 遵守 Wikimedia User-Agent 策略
        'User-Agent': 'F1Guide/1.0 (https://f1-guide.vercel.app; educational project)',
        'Accept': 'image/png,image/webp,image/*,*/*;q=0.8',
      },
      redirect: 'follow',       // 自动跟随 Special:FilePath 的 301 重定向
      signal: AbortSignal.timeout(10_000),
    })

    if (!res.ok) {
      return new Response(null, { status: res.status })
    }

    // 确认返回的确实是图片（防止拿到 HTML 错误页）
    const ct = res.headers.get('content-type') || ''
    if (!ct.startsWith('image/')) {
      return new Response('Not an image', { status: 502 })
    }

    const buf = await res.arrayBuffer()

    return new Response(buf, {
      status: 200,
      headers: {
        'Content-Type': ct,
        // CDN 缓存 7 天，浏览器缓存 1 天
        'Cache-Control': 'public, max-age=86400, s-maxage=604800, stale-while-revalidate=3600',
        'Access-Control-Allow-Origin': '*',
        'X-Circuit': filename,   // 调试用，方便查看匹配到了哪个文件
      },
    })
  } catch (err) {
    console.error(`[circuit-image] ${circuit} →`, err.message)
    return new Response('Upstream timeout', { status: 504 })
  }
}
