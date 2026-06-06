// TrackMap.jsx — 赛道轮廓图
// 链路：浏览器 → /api/circuit-image（Vercel服务端）→ Wikipedia API
//        浏览器 → /api/img-proxy（Vercel服务端）→ upload.wikimedia.org
// 优点：全程不经过被墙域名，中国用户可正常访问

import { useState, useEffect } from 'react'

// ── 赛道 Wikipedia 文章标题映射 ──────────────────────
// key 是 races.json 中 location 字段的小写
// value 是对应赛道的 Wikipedia 英文文章标题
const WIKI_ARTICLE = {
  'melbourne':   'Albert_Park_Circuit',
  'shanghai':    'Shanghai_International_Circuit',
  'suzuka':      'Suzuka_International_Racing_Course',
  'miami':       'Miami_International_Autodrome',
  'montreal':    'Circuit_Gilles_Villeneuve',
  'monte carlo': 'Circuit_de_Monaco',
  'barcelona':   'Circuit_de_Barcelona-Catalunya',
  'spielberg':   'Red_Bull_Ring',
  'silverstone': 'Silverstone_Circuit',
  'spa':         'Circuit_de_Spa-Francorchamps',
  'budapest':    'Hungaroring',
  'zandvoort':   'Circuit_Zandvoort',
  'monza':       'Autodromo_Nazionale_Monza',
  'madrid':      'Madring',
  'baku':        'Baku_City_Circuit',
  'marina bay':  'Marina_Bay_Street_Circuit',
  'austin':      'Circuit_of_the_Americas',
  'mexico city': 'Autódromo_Hermanos_Rodríguez',
  'são paulo':   'Autódromo_José_Carlos_Pace',
  'las vegas':   'Las_Vegas_Street_Circuit',
  'lusail':      'Lusail_International_Circuit',
  'yas island':  'Yas_Marina_Circuit',
  'sakhir':      'Bahrain_International_Circuit',
  'jeddah':      'Jeddah_Street_Circuit',
  'imola':       'Autodromo_Enzo_e_Dino_Ferrari',
}

// location 字段 → WIKI_ARTICLE key 的匹配（精确优先，再模糊）
function findWikiTitle(location) {
  if (!location) return null
  const key = location.toLowerCase()
  if (WIKI_ARTICLE[key]) return WIKI_ARTICLE[key]
  for (const [k, title] of Object.entries(WIKI_ARTICLE)) {
    if (key.includes(k) || k.includes(key)) return title
  }
  return null
}

// ── 占位组件 ──────────────────────────────────────────
function TrackPlaceholder({ circuit, loading }) {
  return (
    <div style={{
      width: '100%', height: '200px',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '12px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px dashed rgba(255,255,255,0.08)',
      borderRadius: '8px',
    }}>
      {loading ? (
        <div style={{
          width: '24px', height: '24px', borderRadius: '50%',
          border: '2px solid rgba(0,210,190,0.15)',
          borderTopColor: '#00D2BE',
          animation: 'spin 0.9s linear infinite',
        }} />
      ) : (
        <>
          <svg width="44" height="44" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.18 }}>
            <rect x="4" y="14" width="40" height="20" rx="10" stroke="#00D2BE" strokeWidth="2.5" fill="none"/>
            <path d="M14 24 Q20 16 28 24 Q34 32 40 24" stroke="#00D2BE" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          </svg>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            color: 'rgba(229,226,225,0.22)', letterSpacing: '0.1em',
            textAlign: 'center', lineHeight: 1.6,
          }}>
            {circuit}
            <br/>赛道图暂无
          </div>
        </>
      )}
    </div>
  )
}

// ── 主组件 ────────────────────────────────────────────
export default function TrackMap({ location, circuit }) {
  const [imgUrl,   setImgUrl]   = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [imgReady, setImgReady] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    const wikiTitle = findWikiTitle(location)
    if (!wikiTitle) {
      setLoading(false)
      return
    }

    let cancelled = false

    async function fetchCircuitImage() {
      // ── 策略一：走服务端代理（生产环境，绕过中国封锁）────────
      // /api/circuit-image 在 Vercel 服务器运行，可以访问 Wikipedia
      // 然后用 /api/img-proxy 代理实际图片，浏览器全程只访问 Vercel 域名
      try {
        const res = await fetch(
          `/api/circuit-image?title=${encodeURIComponent(wikiTitle)}`,
          { signal: AbortSignal.timeout(5000) }
        )
        if (res.ok) {
          const { src } = await res.json()
          if (src && !cancelled) {
            // 图片也通过 img-proxy 代理，避免 upload.wikimedia.org 被墙
            const proxied = `/api/img-proxy?url=${encodeURIComponent(src)}`
            setImgUrl(proxied)
            setLoading(false)
            return
          }
        }
      } catch {
        // 策略一失败（本地开发无 Vercel 函数），继续尝试策略二
      }

      // ── 策略二：直连 Wikipedia（本地开发 + 有梯子 / 海外用户）──
      try {
        const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(wikiTitle)}`
        const res = await fetch(apiUrl, { signal: AbortSignal.timeout(6000) })
        if (res.ok) {
          const data = await res.json()
          const src = data.originalimage?.source || data.thumbnail?.source
          if (src && !cancelled) {
            setImgUrl(src)
            setLoading(false)
            return
          }
        }
      } catch {
        // 策略二也失败（国内无梯子），显示占位符
      }

      if (!cancelled) {
        setImgError(true)
        setLoading(false)
      }
    }

    fetchCircuitImage()
    return () => { cancelled = true }
  }, [location]) // eslint-disable-line react-hooks/exhaustive-deps

  // 无 URL 或出错 → 占位
  if (!loading && (imgError || !imgUrl)) {
    return <TrackPlaceholder circuit={circuit} loading={false} />
  }

  // 正在请求 → 加载中占位
  if (loading) {
    return <TrackPlaceholder circuit={circuit} loading={true} />
  }

  return (
    <div style={{
      width: '100%',
      borderRadius: '8px',
      overflow: 'hidden',
      background: 'rgba(0,210,190,0.025)',
      border: '1px solid rgba(0,210,190,0.1)',
      position: 'relative',
    }}>
      {/* 图片本身加载中继续显示转圈 */}
      {!imgReady && (
        <div style={{
          height: '200px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: '24px', height: '24px', borderRadius: '50%',
            border: '2px solid rgba(0,210,190,0.15)',
            borderTopColor: '#00D2BE',
            animation: 'spin 0.9s linear infinite',
          }} />
        </div>
      )}

      <img
        src={imgUrl}
        alt={`${circuit} 赛道图`}
        onLoad={() => setImgReady(true)}
        onError={() => { setImgError(true); setImgReady(false) }}
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '260px',
          objectFit: 'contain',
          padding: '16px 20px',
          display: imgReady ? 'block' : 'none',
        }}
      />

      {imgReady && (
        <div style={{
          position: 'absolute', bottom: '6px', right: '10px',
          fontFamily: 'var(--font-mono)', fontSize: '9px',
          color: 'rgba(0,210,190,0.28)', letterSpacing: '0.08em',
        }}>
          via Wikipedia
        </div>
      )}
    </div>
  )
}
