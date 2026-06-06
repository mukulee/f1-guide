// TrackMap.jsx — 赛道布局图
//
// 数据来源：本地静态 SVG（public/tracks/*.svg）
//   - 从 Wikimedia Commons 提前下载的真实赛道轮廓 SVG
//   - 不依赖任何外部 API，中国大陆可用，本地开发可用
//   - 白色卡片底色展示，与 F1 赛道图原始设计一致
//
// 文件来源备注（可供维护时核对）：
//   F1 CourseLayout 系列 → Adobe Illustrator 导出，灰色轮廓+黄/蓝 DRS 标注
//   Inkscape 系列（Monaco、Budapest 等）→ 经典灰色线条版

import { useState } from 'react'

// ── 赛道 → 本地 SVG 文件名映射 ────────────────────────
// key：races.json location 字段小写
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
      width: '100%', height: '180px',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '10px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px dashed rgba(255,255,255,0.08)',
      borderRadius: '8px',
    }}>
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.15 }}>
        <rect x="4" y="14" width="40" height="20" rx="10" stroke="#00D2BE" strokeWidth="2.5" fill="none"/>
        <path d="M14 24 Q20 16 28 24 Q34 32 40 24"
          stroke="#00D2BE" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: '10px',
        color: 'rgba(229,226,225,0.18)', letterSpacing: '0.12em',
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
    <div style={{ width: '100%', borderRadius: '10px', overflow: 'hidden', position: 'relative' }}>

      {/* 加载转圈（图片载入前显示） */}
      {!ready && !error && (
        <div style={{
          height: '180px', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.03)',
        }}>
          <div style={{
            width: '22px', height: '22px', borderRadius: '50%',
            border: '2px solid rgba(0,210,190,0.15)',
            borderTopColor: '#00D2BE',
            animation: 'spin 0.9s linear infinite',
          }} />
        </div>
      )}

      {/* 加载失败 */}
      {error && <TrackPlaceholder circuit={circuit} />}

      {/* 白色卡片 + 赛道 SVG */}
      {!error && (
        <div style={{
          background: '#ffffff',
          borderRadius: '10px',
          padding: '14px 18px 10px',
          display: ready ? 'block' : 'none',
          boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
        }}>
          <img
            src={src}
            alt={`${circuit} 赛道布局图`}
            onLoad={() => setReady(true)}
            onError={() => setError(true)}
            style={{
              width: '100%', height: 'auto',
              maxHeight: '240px',
              objectFit: 'contain',
              display: 'block',
            }}
          />
          {/* 底部来源与赛道名 */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '6px',
          }}>
            <span style={{
              fontSize: '10px', color: '#999',
              fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
            }}>
              {circuit}
            </span>
            <span style={{
              fontSize: '9px', color: '#ccc',
              fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
            }}>
              via Wikimedia Commons
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
