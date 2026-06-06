// TrackMap.jsx — 赛道布局图
//
// 数据链路（生产环境，中国可访问）：
//   浏览器 → GET /api/circuit-image?circuit=Montreal
//     → Vercel Edge Function（境外服务器）
//     → commons.wikimedia.org/wiki/Special:FilePath/Circuit_Gilles_Villeneuve.svg?width=800
//     → 自动 301 重定向 → upload.wikimedia.org/...
//     → 返回 PNG 图片二进制给浏览器
//
// 本地开发：/api/circuit-image 不存在 → img onError → 显示占位符

import { useState } from 'react'

// 占位符组件
function TrackPlaceholder({ circuit }) {
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
      <svg width="44" height="44" viewBox="0 0 48 48" fill="none" style={{ opacity: 0.18 }}>
        <rect x="4" y="14" width="40" height="20" rx="10" stroke="#00D2BE" strokeWidth="2.5" fill="none"/>
        <path d="M14 24 Q20 16 28 24 Q34 32 40 24"
          stroke="#00D2BE" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
      <div style={{
        fontFamily: 'var(--font-mono)', fontSize: '11px',
        color: 'rgba(229,226,225,0.22)', letterSpacing: '0.1em',
        textAlign: 'center', lineHeight: 1.6,
      }}>
        {circuit}<br/>赛道图暂无
      </div>
    </div>
  )
}

// 主组件
export default function TrackMap({ location, circuit }) {
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)

  if (!location) return <TrackPlaceholder circuit={circuit} />

  // 直接把 location 传给 Vercel Function，由服务端做映射和代理
  const src = `/api/circuit-image?circuit=${encodeURIComponent(location)}`

  return (
    <div style={{
      width: '100%', borderRadius: '8px', overflow: 'hidden',
      background: 'rgba(0,210,190,0.025)',
      border: '1px solid rgba(0,210,190,0.1)',
      position: 'relative', minHeight: error ? 'auto' : '200px',
    }}>

      {/* 加载中转圈 */}
      {!ready && !error && (
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

      {/* 占位符（加载失败） */}
      {error && <TrackPlaceholder circuit={circuit} />}

      {/* 赛道图 */}
      {!error && (
        <img
          src={src}
          alt={`${circuit} 赛道布局图`}
          onLoad={() => setReady(true)}
          onError={() => setError(true)}
          style={{
            width: '100%', height: 'auto',
            maxHeight: '260px', objectFit: 'contain',
            padding: '16px 24px',
            display: ready ? 'block' : 'none',
          }}
        />
      )}

      {/* 来源水印 */}
      {ready && (
        <div style={{
          position: 'absolute', bottom: '6px', right: '10px',
          fontFamily: 'var(--font-mono)', fontSize: '9px',
          color: 'rgba(0,210,190,0.3)', letterSpacing: '0.08em',
          pointerEvents: 'none',
        }}>
          via Wikimedia Commons
        </div>
      )}
    </div>
  )
}
