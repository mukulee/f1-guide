// TrackMap.jsx — 赛道布局图
//
// SVG 来源：public/tracks/*.svg（本地静态文件，无外部依赖）
// 风格处理：CSS filter 将原始 SVG 转为网站深色青色调
//   grayscale(1) → 去除原色，仅保留明度信息
//   invert(1)    → 深底变浅，浅底变深（适配暗色主题）
//   sepia(1) hue-rotate(155deg) saturate(3.5) → 染成网站青色 #00D2BE 系

import { useState } from 'react'

const TRACK_FILES = {
  'melbourne':   '/tracks/melbourne.svg',
  'shanghai':    '/tracks/shanghai.svg',
  'suzuka':      '/tracks/suzuka.svg',
  'miami':       '/tracks/miami.svg',
  'montreal':    '/tracks/montreal.svg',
  'monte carlo': '/tracks/monaco.svg',
  'barcelona':   '/tracks/barcelona.svg',
  'spielberg':   '/tracks/spielberg.svg',
  'silverstone': '/tracks/silverstone.svg',
  'spa':         '/tracks/spa.svg',
  'budapest':    '/tracks/budapest.svg',
  'zandvoort':   '/tracks/zandvoort.svg',
  'monza':       '/tracks/monza.svg',
  'baku':        '/tracks/baku.svg',
  'marina bay':  '/tracks/singapore.svg',
  'austin':      '/tracks/austin.svg',
  'mexico city': '/tracks/mexico.svg',
  'são paulo':   '/tracks/saopaulo.svg',
  'las vegas':   '/tracks/lasvegas.svg',
  'lusail':      '/tracks/lusail.svg',
  'yas island':  '/tracks/abudhabi.svg',
  'abu dhabi':   '/tracks/abudhabi.svg',
  'sakhir':      '/tracks/bahrain.svg',
  'jeddah':      '/tracks/jeddah.svg',
  'imola':       '/tracks/imola.svg',
}

// CSS filter：将任意 SVG 赛道图统一转为深底+青色调
// grayscale → 去色  →  invert → 深底  →  sepia+hue-rotate → 染色为网站的 #00D2BE
const TRACK_FILTER =
  'grayscale(1) invert(1) sepia(1) hue-rotate(155deg) saturate(3.5) brightness(0.8)'

function findTrackSrc(location) {
  if (!location) return null
  const key = location.toLowerCase().trim()
  if (TRACK_FILES[key]) return TRACK_FILES[key]
  for (const [k, src] of Object.entries(TRACK_FILES)) {
    if (key.includes(k) || k.includes(key)) return src
  }
  return null
}

// ── 占位符 ────────────────────────────────────────────
function TrackPlaceholder({ circuit }) {
  return (
    <div style={{
      width: '100%', height: '160px',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '10px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px dashed rgba(0,210,190,0.12)',
      borderRadius: '8px',
    }}>
      <svg width="38" height="38" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.15 }}>
        <rect x="4" y="14" width="40" height="20" rx="10"
          stroke="#00D2BE" strokeWidth="2.5" fill="none"/>
        <path d="M14 24 Q20 16 28 24 Q34 32 40 24"
          stroke="#00D2BE" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '10px',
        color: 'rgba(229,226,225,0.18)', letterSpacing: '0.1em',
      }}>
        {circuit} · 赛道图暂无
      </span>
    </div>
  )
}

// ── 主组件 ────────────────────────────────────────────
export default function TrackMap({ location, circuit }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)

  const src = findTrackSrc(location)
  if (!src) return <TrackPlaceholder circuit={circuit} />

  return (
    <div style={{
      width: '100%',
      borderRadius: '8px',
      overflow: 'hidden',
      // 与网站一致的深色底+青色边框
      background: 'rgba(0, 16, 14, 0.6)',
      border: '1px solid rgba(0,210,190,0.15)',
      position: 'relative',
    }}>

      {/* 加载转圈 */}
      {!ready && !error && (
        <div style={{
          height: '160px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            width: '20px', height: '20px', borderRadius: '50%',
            border: '2px solid rgba(0,210,190,0.12)',
            borderTopColor: '#00D2BE',
            animation: 'spin 0.9s linear infinite',
          }} />
        </div>
      )}

      {/* 加载失败 */}
      {error && <TrackPlaceholder circuit={circuit} />}

      {/* 赛道 SVG — 应用 CSS filter 转为深底青色调 */}
      {!error && (
        <img
          src={src}
          alt={`${circuit} 赛道布局图`}
          onLoad={() => setReady(true)}
          onError={() => setError(true)}
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '220px',
            objectFit: 'contain',
            padding: '14px 20px 10px',
            display: ready ? 'block' : 'none',
            // 核心：将白底/彩色底 SVG 统一转为深底青色线条
            filter: TRACK_FILTER,
          }}
        />
      )}

      {/* 赛道名 + 来源（右下角，极小） */}
      {ready && (
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          padding: '0 14px 8px',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '9px',
            color: 'rgba(0,210,190,0.4)', letterSpacing: '0.1em',
          }}>
            {circuit.toUpperCase()}
          </span>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '9px',
            color: 'rgba(255,255,255,0.15)', letterSpacing: '0.06em',
          }}>
            Wikimedia Commons
          </span>
        </div>
      )}
    </div>
  )
}
