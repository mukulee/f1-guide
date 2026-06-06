// TrackMap.jsx — 赛道轮廓图（静态 SVG，来自 Wikimedia Commons）
// 用法：<TrackMap circuitKey="monaco" />

import { useState } from 'react'

// ── 赛道 SVG 映射表 ─────────────────────────────────
// 使用 Wikimedia Commons 上 F1 赛道的官方 SVG 图，CC BY-SA 协议
// key 与 races JSON 中的 location 字段对应（全小写）
const TRACK_SVG = {
  melbourne:    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Albert_Park_Circuit.svg/800px-Albert_Park_Circuit.svg.png',
  shanghai:     'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Shanghai_circuit.svg/800px-Shanghai_circuit.svg.png',
  suzuka:       'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Suzuka_circuit_2005.svg/800px-Suzuka_circuit_2005.svg.png',
  miami:        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Miami_International_Autodrome_2022.svg/800px-Miami_International_Autodrome_2022.svg.png',
  montreal:     'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Circuit_Gilles_Villeneuve_%28Wikimedia%29.svg/800px-Circuit_Gilles_Villeneuve_%28Wikimedia%29.svg.png',
  'monte carlo':'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Monte_Carlo_Formula_1_track.svg/800px-Monte_Carlo_Formula_1_track.svg.png',
  barcelona:    'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Circuit_de_Barcelona-Catalunya.svg/800px-Circuit_de_Barcelona-Catalunya.svg.png',
  spielberg:    'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Red_Bull_Ring_2016.svg/800px-Red_Bull_Ring_2016.svg.png',
  silverstone:  'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Silverstone_Circuit_2010.svg/800px-Silverstone_Circuit_2010.svg.png',
  spa:          'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Spa-Francorchamps_Circuit.svg/800px-Spa-Francorchamps_Circuit.svg.png',
  budapest:     'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Hungaroring.svg/800px-Hungaroring.svg.png',
  zandvoort:    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Zandvoort_Circuit.svg/800px-Zandvoort_Circuit.svg.png',
  monza:        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Monza_track_map.svg/800px-Monza_track_map.svg.png',
  baku:         'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Baku_Formula_1_City_Circuit.svg/800px-Baku_Formula_1_City_Circuit.svg.png',
  'marina bay': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Singapore_street_circuit_2023.svg/800px-Singapore_street_circuit_2023.svg.png',
  austin:       'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Circuit_of_the_Americas.svg/800px-Circuit_of_the_Americas.svg.png',
  'mexico city':'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Autódromo_Hermanos_Rodríguez_Circuit.svg/800px-Autódromo_Hermanos_Rodríguez_Circuit.svg.png',
  'são paulo':  'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Interlagos_track_map.svg/800px-Interlagos_track_map.svg.png',
  'las vegas':  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Las_Vegas_Street_Circuit.svg/800px-Las_Vegas_Street_Circuit.svg.png',
  lusail:       'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Losail_International_Circuit.svg/800px-Losail_International_Circuit.svg.png',
  'yas island': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Yas_Marina_Circuit_2021.svg/800px-Yas_Marina_Circuit_2021.svg.png',
  sakhir:       'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Bahrain_International_Circuit_2010.svg/800px-Bahrain_International_Circuit_2010.svg.png',
  jeddah:       'https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Jeddah_Corniche_Circuit.svg/800px-Jeddah_Corniche_Circuit.svg.png',
  imola:        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Autodromo_Enzo_e_Dino_Ferrari.svg/800px-Autodromo_Enzo_e_Dino_Ferrari.svg.png',
}

// 根据 location 字符串查找匹配的 SVG URL
function findTrackSvg(location) {
  if (!location) return null
  const key = location.toLowerCase()
  // 精确匹配
  if (TRACK_SVG[key]) return TRACK_SVG[key]
  // 模糊匹配（部分包含）
  for (const [k, url] of Object.entries(TRACK_SVG)) {
    if (key.includes(k) || k.includes(key)) return url
  }
  return null
}

// ── 占位组件（无 SVG 时显示） ────────────────────────
function TrackPlaceholder({ circuit }) {
  return (
    <div style={{
      width: '100%', height: '180px',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      gap: '10px',
      background: 'rgba(255,255,255,0.02)',
      border: '1px dashed rgba(255,255,255,0.08)',
      borderRadius: '8px',
    }}>
      {/* 赛道占位 SVG 图标 */}
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.2 }}>
        <rect x="4" y="16" width="40" height="16" rx="8" stroke="#00D2BE" strokeWidth="2" fill="none"/>
        <circle cx="12" cy="24" r="3" fill="#00D2BE" opacity="0.6"/>
        <circle cx="36" cy="24" r="3" fill="#00D2BE" opacity="0.6"/>
      </svg>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        color: 'rgba(229,226,225,0.25)',
        letterSpacing: '0.12em',
        textAlign: 'center',
        lineHeight: 1.6,
      }}>
        {circuit}
        <br />赛道图待更新
      </div>
    </div>
  )
}

// ── 主组件 ────────────────────────────────────────────
export default function TrackMap({ location, circuit }) {
  const svgUrl = findTrackSvg(location)
  const [imgError, setImgError] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  if (!svgUrl || imgError) {
    return <TrackPlaceholder circuit={circuit} />
  }

  return (
    <div style={{
      width: '100%',
      borderRadius: '8px',
      overflow: 'hidden',
      background: 'rgba(0,210,190,0.03)',
      border: '1px solid rgba(0,210,190,0.1)',
      position: 'relative',
      minHeight: imgLoaded ? 'auto' : '180px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* 加载中占位 */}
      {!imgLoaded && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <div style={{
            width: '20px', height: '20px', borderRadius: '50%',
            border: '2px solid rgba(0,210,190,0.2)',
            borderTopColor: '#00D2BE',
            animation: 'spin 0.8s linear infinite',
          }} />
        </div>
      )}

      <img
        src={svgUrl}
        alt={`${circuit} 赛道图`}
        onLoad={() => setImgLoaded(true)}
        onError={() => setImgError(true)}
        style={{
          width: '100%',
          height: 'auto',
          maxHeight: '220px',
          objectFit: 'contain',
          padding: '12px 16px',
          display: imgLoaded ? 'block' : 'none',
          // 深色主题下让白色赛道图线条变为青色调
          filter: 'invert(1) sepia(1) saturate(2) hue-rotate(140deg) brightness(0.9)',
        }}
      />

      {/* 水印角标 */}
      {imgLoaded && (
        <div style={{
          position: 'absolute', bottom: '6px', right: '8px',
          fontFamily: 'var(--font-mono)', fontSize: '9px',
          color: 'rgba(0,210,190,0.3)', letterSpacing: '0.08em',
        }}>
          © Wikimedia Commons
        </div>
      )}
    </div>
  )
}
