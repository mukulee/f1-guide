// ── F1 GUIDE · LearnCard ────────────────────────────
// 科普模块卡片：左侧 3px 竖条 + 视频缩略图 + 卡片主体
// Props:
//   module: { num, embedUrl, title, desc, level, duration, advanced }
//   index: 入场动效延迟计算
//   onClick: 打开视频弹窗回调

import { useState } from 'react'
import { motion } from 'framer-motion'

// ── 播放按钮 ──────────────────────────────────────
// 注意：不使用 motion.div animate 控制 scale，避免覆盖 CSS transform(translate)
// 使用 inset:0 + flex 居中，transition 控制缩放
function PlayButton({ advanced, hovered }) {
  const color = advanced ? '#0090FF' : '#00D2BE'
  return (
    // 全覆盖透明容器，flex 居中子元素
    <div style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      pointerEvents: 'none',
    }}>
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: hovered ? color : `${color}E6`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: hovered ? 'scale(1.12)' : 'scale(1)',
        boxShadow: hovered ? `0 0 28px ${color}80` : `0 0 0px ${color}00`,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
      }}>
        <svg width="20" height="20" viewBox="0 0 24 24"
          fill={advanced ? '#FFFFFF' : '#0D0D0D'}
        >
          <polygon points="5,3 19,12 5,21" />
        </svg>
      </div>
    </div>
  )
}

// ── 箭头图标 ──────────────────────────────────────
function ArrowIcon({ hovered, advanced }) {
  const color = hovered ? (advanced ? '#0090FF' : '#00D2BE') : '#9BA8A5'
  return (
    <motion.svg
      animate={{ x: hovered ? 4 : 0, color }}
      transition={{ duration: 0.2 }}
      width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth="2"
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </motion.svg>
  )
}

export default function LearnCard({ module, index, onClick }) {
  const [hovered, setHovered] = useState(false)

  const accentColor = module.advanced ? '#0090FF' : '#00D2BE'
  const numStr = String(module.num).padStart(2, '0')

  // Bilibili 封面图（直接使用 MODULES 数据中的 thumbUrl 字段）
  const thumbUrl = module.thumbUrl || ''
  const fallbackUrl = `https://placehold.co/480x270/111111/${accentColor.replace('#', '')}?text=MODULE+${numStr}`

  return (
    <motion.div
      data-no-dots
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      style={{
        position: 'relative',
        background: hovered ? '#141414' : '#111111',
        border: `1px solid ${hovered ? `${accentColor}8C` : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 8,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'background 0.2s, border-color 0.25s',
        boxShadow: hovered
          ? `0 0 0 1px ${accentColor}1F, 0 8px 32px rgba(0,0,0,0.5), 0 0 28px ${accentColor}24`
          : '0 2px 8px rgba(0,0,0,0.3)',
      }}
    >
      {/* ── 左侧 3px 主题竖条 ── */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: accentColor, zIndex: 2,
      }} />

      {/* ── 视频缩略图区 ── */}
      <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden', background: '#0A0A0A' }}>
        <motion.img
          src={thumbUrl}
          alt={module.title}
          referrerPolicy="no-referrer"
          onError={(e) => { e.currentTarget.src = fallbackUrl }}
          animate={{ scale: hovered ? 1.05 : 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        {/* 缩略图渐变遮罩 */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.5) 100%)',
          pointerEvents: 'none',
        }} />
        <PlayButton advanced={module.advanced} hovered={hovered} />
      </div>

      {/* ── 卡片主体 ── */}
      <div style={{ padding: '16px 18px 16px 24px', position: 'relative', zIndex: 1 }}>

        {/* 水印大序号 */}
        <div style={{
          position: 'absolute', right: -4, bottom: -8,
          fontFamily: 'var(--font-title)', fontSize: 96, fontWeight: 900,
          color: 'rgba(255,255,255,0.04)', lineHeight: 1,
          pointerEvents: 'none', letterSpacing: '-0.04em',
        }}>
          {numStr}
        </div>

        {/* 分类 Tag */}
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 9,
          letterSpacing: '0.2em', color: accentColor, opacity: 0.7,
          marginBottom: 6, textTransform: 'uppercase',
        }}>
          {module.advanced ? '进阶课堂' : '新手必读'}
        </div>

        {/* 标题 */}
        <h3 style={{
          fontFamily: 'var(--font-title)', fontSize: 18,
          fontWeight: 700, color: '#FFFFFF',
          lineHeight: 1.2, marginBottom: 8,
        }}>
          {module.title}
        </h3>

        {/* 描述 */}
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 13,
          color: '#9BA8A5', lineHeight: 1.6,
        }}>
          {module.desc}
        </p>

        {/* 分隔线 */}
        <div style={{
          height: 1, background: 'rgba(255,255,255,0.05)',
          margin: '12px 0 10px',
        }} />

        {/* 底部元信息 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 9,
            letterSpacing: '0.15em', color: '#9BA8A5',
          }}>
            {module.level} · 约 {module.duration} 分钟
          </span>
          <ArrowIcon hovered={hovered} advanced={module.advanced} />
        </div>
      </div>
    </motion.div>
  )
}
